import { z } from 'zod';
import type { CreateAgenticResumableParams } from '../types';
import {
  ArvoOpenTelemetry,
  createSimpleArvoContract,
  exceptionToSpan,
  ViolationError,
  type OpenTelemetryHeaders,
} from 'arvo-core';
import { AgenticMessageContentSchema } from '../schemas';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { McpClient } from './MCPClient';
import type { LLMIntergration, LLMIntegrationParam, LLMIntegrationOutput } from '../integrations/types';
import { jsonUsageIntentPrompt } from '../helpers.prompt';
import zodToJsonSchema from 'zod-to-json-schema';
import { openInferenceSpanInitAttributesSetter, openInferenceSpanOutputAttributesSetter } from '../helpers.otel';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Default output format for agents that don't specify a custom output schema.
 * Provides a simple string response format for basic conversational agents.
 */
const DEFAULT_AGENT_OUTPUT_FORMAT = z.object({ response: z.string() });

export type McpServerConnectionParam = {
  url: string;
  // undefined means NOOP
  connectionErrorType?: 'violation' | 'error';
};

const connectToMcp = async (
  { url, connectionErrorType }: McpServerConnectionParam,
  parentOtelHeaders: OpenTelemetryHeaders,
) => {
  const mcpClient = new McpClient(url, parentOtelHeaders);
  await mcpClient.connect();

  if (mcpClient.status === 'disconnected' && connectionErrorType === 'error') {
    // This will result in a system error event when
    // executed in an Arvo event handler
    throw new Error(`Unable to connect to the MCP Server (${url})`);
  }
  if (mcpClient.status === 'disconnected' && connectionErrorType === 'violation') {
    // In Arvo event handlers, a violation error is not caught by the handler rather it bubbles
    // up in the execution so that the developer can control the exception handling
    throw new ViolationError({
      type: 'MCP_CONNECTION',
      message: `Unable to connect to the MCP Server (${url})`,
    });
  }
  return mcpClient;
};

export const createMcpAgent = <TName extends string, TOutput extends z.AnyZodObject>({
  name,
  outputFormat,
  enableMessageHistoryInResponse,
  mcpSseServer,
  agenticLLMCaller,
  systemPrompt,
  description,
}: Omit<CreateAgenticResumableParams<TName, never, TOutput>, 'services' | 'agenticLLMCaller' | 'serviceDomains'> & {
  mcpSseServer: McpServerConnectionParam;
  agenticLLMCaller: LLMIntergration;
}) => {
  const contract = createSimpleArvoContract({
    uri: `#/demo/handler/agent/mcp/${name.replaceAll('.', '/')}`,
    description: description,
    type: `agent.mcp.${name}` as `agent.mcp.${TName}`,
    versions: {
      '1.0.0': {
        accepts: z.object({
          message: z.string(),
          toolUseId$$: z.string().optional(),
        }),
        emits: z.object({
          ...(enableMessageHistoryInResponse
            ? {
                messages: z
                  .object({
                    role: z.enum(['user', 'assistant']),
                    content: AgenticMessageContentSchema.array(),
                  })
                  .array(),
              }
            : {}),
          output: (outputFormat ?? DEFAULT_AGENT_OUTPUT_FORMAT) as TOutput,
          toolUseId$$: z.string().optional(),
        }),
      },
    },
    metadata: {
      contractSpecificType: 'MCPAgent',
    },
  });

  const handlerFactory: EventHandlerFactory = () =>
    createArvoEventHandler({
      contract: contract,
      executionunits: 0,
      handler: {
        '1.0.0': async ({ event, span }) => {
          // Manually crafting parent otel header to prevent potential span corruption
          const parentSpanOtelHeaders: OpenTelemetryHeaders = {
            traceparent: `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`,
            tracestate: null,
          };

          /**
           * Wraps the LLM caller with OpenTelemetry observability and system prompt generation.
           *
           * Creates a new OTEL span for each LLM call, handles prompt composition,
           * and ensures proper error tracking. The wrapper combines user-provided
           * system prompts with structured output instructions when applicable.
           */
          const otelAgenticLLMCaller = async (
            params: Omit<LLMIntegrationParam, 'span' | 'systemPrompt'> & {
              systemPrompt: string | null;
            },
          ): Promise<LLMIntegrationOutput> => {
            // This function automatically inherits from the parent span
            return await ArvoOpenTelemetry.getInstance().startActiveSpan({
              name: 'Agentic LLM Call',
              disableSpanManagement: true,
              context: {
                inheritFrom: 'TRACE_HEADERS',
                traceHeaders: parentSpanOtelHeaders,
              },
              fn: async (_span) => {
                try {
                  const finalSystemPrompt =
                    [
                      ...(params.systemPrompt ? [`# Instructions:\n${params.systemPrompt}`] : []),
                      ...(params.outputFormat
                        ? [
                            `# JSON Response Requirements:\n${jsonUsageIntentPrompt(zodToJsonSchema(params.outputFormat))}`,
                          ]
                        : []),
                    ]
                      .join('\n\n')
                      .trim() || null; // This is not null-coelese because I want it to become undefined on empty string

                  openInferenceSpanInitAttributesSetter({
                    messages: params.messages,
                    systemPrompt: finalSystemPrompt,
                    tools: params.toolDefinitions,
                    span: _span,
                  });
                  const result = await agenticLLMCaller({
                    ...params,
                    systemPrompt: finalSystemPrompt ?? null,
                    span: _span,
                  });
                  openInferenceSpanOutputAttributesSetter({
                    ...result,
                    span: _span,
                  });
                  return result;
                } catch (e) {
                  exceptionToSpan(e as Error, _span);
                  _span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: (e as Error)?.message ?? 'Something went wrong',
                  });
                  throw e;
                } finally {
                  _span.end();
                }
              },
            });
          };

          const mcpClient = await connectToMcp(mcpSseServer, parentSpanOtelHeaders);

          try {
            const messages: LLMIntegrationParam['messages'] = [
              {
                role: 'user',
                content: [{ type: 'text', content: event.data.message }],
              },
            ];
            const MAX_CYCLE_COUNT = 100;
            for (let i = 0; i < MAX_CYCLE_COUNT; i++) {
              const { response, toolRequests } = await otelAgenticLLMCaller({
                type: i === 0 ? 'init' : 'tool_results',
                messages,
                toolDefinitions: mcpClient.toolDefinitions,
                systemPrompt:
                  systemPrompt?.({
                    messages,
                    services: {} as never,
                    toolDefinitions: mcpClient.toolDefinitions,
                    type: i === 0 ? 'init' : 'tool_results',
                  }) ?? null,
                outputFormat: outputFormat ?? null,
              });

              // LLM provided direct response without needing tools - complete immediately
              if (response) {
                messages.push({
                  role: 'assistant',
                  content: [
                    { type: 'text', content: typeof response === 'string' ? response : JSON.stringify(response) },
                  ],
                });

                const output = {
                  type: contract.version('1.0.0').emitList[0].type as `evt.agent.mcp.${TName}.success`,
                  data: {
                    messages,
                    output: typeof response === 'string' ? { response } : response,
                    toolUseId$$: event.data.toolUseId$$,
                    // biome-ignore lint/suspicious/noExplicitAny: Need to by-pass typescript compiler as it is having a hard time evaluating the types
                  } as any,
                };
                await mcpClient.disconnect();
                return output;
              }

              if (toolRequests) {
                const toolCalls: Array<Promise<{ id: string; data: string }>> = [];
                for (const { type, id, data } of toolRequests) {
                  messages.push({
                    role: 'assistant',
                    content: [
                      {
                        type: 'tool_use',
                        id: id,
                        name: type,
                        input: data as Record<string, unknown>,
                      },
                    ],
                  });
                  toolCalls.push(
                    (async () => {
                      return {
                        id: id,
                        data: await mcpClient.invokeTool(type, data as Record<string, unknown>),
                      };
                    })(),
                  );
                }
                const results = await Promise.all(toolCalls);
                for (const item of results) {
                  messages.push({
                    role: 'user',
                    content: [
                      {
                        type: 'tool_result',
                        tool_use_id: item.id,
                        content: item.data,
                      },
                    ],
                  });
                }
              }
            }
            await mcpClient.disconnect();
            throw new Error(
              `The agentic interaction cycle count reached limit of ${MAX_CYCLE_COUNT} without any resolution.`,
            );
          } catch (e) {
            await mcpClient.disconnect();
            throw e;
          }
        },
      },
    });

  return { contract, handlerFactory };
};
