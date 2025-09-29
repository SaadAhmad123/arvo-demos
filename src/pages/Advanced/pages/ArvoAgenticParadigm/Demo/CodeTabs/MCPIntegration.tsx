import { cleanString } from '../../../../../../utils';
import {} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const MCPIntegration: DemoCodePanel = {
  heading: 'Factory for Event-driven MCP Agents',
  description: cleanString(`
    A powerful way to expand LLM-enabled agents is by connecting them to **external tools
    and knowledge bases**. The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) 
    is emerging as a standard for linking large language models with external APIs and systems. 
    Arvo's event-driven architecture integrates seamlessly with MCP, enabling agents that bridge
    the internal Arvo ecosystem with the wider universe of MCP-powered tools.

    In Arvo's event-driven agentic fabric, **MCP Agents** complement **ArvoResumable Agents** by extending
    intelligence beyond the boundaries of the system. While Agentic Resumables orchestrate internal 
    services and workflows through \`ArvoEvent\`, MCP Agents act as specialized connectors to 
    **external MCP servers**—invoking tools, processing results, and feeding structured outputs 
    back into the Arvo ecosystem with the same reliability guarantees.

    ## Division of Responsibilities    

    - **ArvoResumable Agents** function as event-driven orchestrators. They coordinate 
    Arvo event handlers, orchestrators, and other agents to manage complex workflows across
    multiple internal services.

    - **MCP Agents** serve as bridges to external tool ecosystems. When triggered by an \`ArvoEvent\`, 
    they connect with LLM integration for intelligent decision making, connect to an MCP server, 
    allow the integrated LLM to invoke the required MCP tools, collect and process responses, 
    and return results back to Arvo's event-driven fabric.

    This clear separation ensures that external integrations inherit the same consistency, 
    scalability, and observability as native Arvo components, without blurring responsibilities.


    ## The \`createMcpAgent\` Factory

    To make MCP integration production-ready, provided is the \`createMcpAgent\` factory. This 
    utility builds on top of \`ArvoEventHandler\` and is designed to abstract away the complexities 
    of external integration. The factory takes in an \`MCPClient\` implementation, which manages the 
    connection to MCP servers and coordinates tool calls, along with an **LLM integration** (which is 
    exact the same the LLM integration for Agentic Resumables) that supplies the reasoning and 
    decision-making layer. In return, it produces both a handler contract and a handler factory, 
    enabling MCP Agents to participate in the Arvo ecosystem exactly like any other event handler.
    
    > This pattern offers an additional advantage by cleanly separating LLM integration from 
    > MCP client integration. Any LLM can leverage MCP tools, greatly expanding the system's 
    > potential, while the MCP client itself can be implemented in whatever way best suits 
    > your needs—giving you complete control over how external tools are accessed and managed.

    
    ## Why MCP Agents Matter?

    Unlike the Agentic Resumables that orchestrate internal services, MCP Agents specialize 
    in external tool access. They listen for specific event types, leverage LLM reasoning to determine 
    actions, interact with MCP servers, and publish results back into the event fabric. This 
    preserves a clean separation of concerns, while enabling integration with the rapidly expanding
    MCP ecosystem.

    The result is a dual-agent architecture that balances power and flexibility:
	  
    - Full participation in Arvo's event-driven eco-system
	  -  Seamless access to external eco-system of MCP-based tools and APIs
	  - Consistent reliability, observability, and type-safety across internal and external integrations

    With this pattern, developers can extend Arvo-powered systems into new domains 
    effortlessly, while maintaining a uniform agentic architecture that scales gracefully.
    
  `),
  tabs: [
    {
      title: 'agentFactory/createMcpAgent.ts',
      lang: 'ts',
      code: `
// This code is designed to be copy and pasted into you code
import { z } from 'zod';
import type { AgenticToolDefinition, CreateAgenticResumableParams } from './types.js';
import { ArvoOpenTelemetry, createSimpleArvoContract, exceptionToSpan, type OpenTelemetryHeaders } from 'arvo-core';
import { AgenticMessageContentSchema } from './schemas.js';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import type { LLMIntergration, LLMIntegrationParam, LLMIntegrationOutput } from './integrations/types.js';
import { jsonUsageIntentPrompt, toolInteractionLimitPrompt } from './helpers.prompts.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { openInferenceSpanInitAttributesSetter, openInferenceSpanOutputAttributesSetter } from './helpers.otel.js';
import { SpanStatusCode } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';

/**
 * Default output format for agents that don't specify a custom output schema.
 * Provides a simple string response format for basic conversational agents.
 */
const DEFAULT_AGENT_OUTPUT_FORMAT = z.object({ response: z.string() });

/**
 * Interface for Model Context Protocol (MCP) client implementations.
 * Provides methods for managing MCP server connections and invoking tools.
 */
export interface IAgenticMCPClient {
  /**
   * Establishes a connection to the MCP server.
   * Must be called before any tool invocations.
   * @returns Promise that resolves when connection is established
   * @throws {Error} If connection to MCP server fails and you want to emit a system error event
   * @throws {ViolationError} If connection to MCP server fails and you want to throw an error you want to customer handle
   */
  connect: (parentOtelSpan: Span) => Promise<void>;

  /**
   * Invokes a specific tool through the MCP protocol.
   *
   * @param param - Tool invocation parameters
   * @param parentOtelSpan - OpenTelemetry span for tracing the tool invocation
   * @returns Promise resolving to the tool's response as a string
   */
  invokeTool: (
    param: { toolName: string; toolArguments?: Record<string, unknown> | null },
    parentOtelSpan: Span,
  ) => Promise<string>;

  /**
   * Gracefully disconnects from the MCP server.
   * Should be called before agent shutsdown.
   *
   * @param parentOtelSpan - OpenTelemetry span for tracing the disconnection operation
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect: (parentOtelSpan: Span) => Promise<void>;

  /**
   * Retrieves all available tool definitions from the MCP server.
   * Used to discover what tools are available for the agent to use.
   *
   * @param parentOtelSpan - OpenTelemetry span for tracing the discovery operation
   */
  getToolDefinitions: (parentOtelSpan: Span) => Promise<AgenticToolDefinition[]>;
}

/**
 * Creates an MCP-enabled agent that can interact with tools via the Model Context Protocol.
 *
 * This factory function creates an Arvo event handler that integrates an LLM with MCP tools,
 * allowing the agent to perform actions and retrieve information through a standardized protocol.
 * The agent maintains conversation context, handles tool invocations, and returns structured responses.
 *
 * @returns Object containing the generated Arvo contract and handler factory
 *
 * @example
 * \`\`\`typescript
 * // Create a weather assistant with MCP tools
 * const weatherAgent = createMcpAgent({
 *   name: 'weather.assistant',
 *   description: 'An intelligent weather assistant with access to weather data tools',
 *   mcpClient: new WeatherMCPClient(),
 *   agenticLLMCaller: async (params) => {
 *     // Integrate with OpenAI, Anthropic, etc.
 *     const response = await llm.complete(params);
 *     return response;
 *   },
 *   systemPrompt: ({ messages, toolDefinitions }) => {
 *     return \`You are a helpful weather assistant. Available tools: \${toolDefinitions.map(t => t.name).join(', ')}\`;
 *   },
 *   enableMessageHistoryInResponse: true
 * });
 * \`\`\`
 *
 * The generated handler on Error:
 * - Throws [ViolationError] If MCP client connection fails and the MCP Client emits a ViolationError
 * - Return System Error Event If MCP client connection fails and the MCP client emit a normal Error (not a ViolationError)
 * - Return System Error Evetn If maximum tool invocation cycles (maxToolInteractions or 5) is exceeded
 */
export const createMcpAgent = <TName extends string, TOutput extends z.AnyZodObject>({
  name,
  outputFormat,
  enableMessageHistoryInResponse,
  mcpClient,
  agenticLLMCaller,
  systemPrompt,
  description,
  maxToolInteractions,
}: Omit<CreateAgenticResumableParams<TName, never, TOutput>, 'services' | 'agenticLLMCaller' | 'serviceDomains'> & {
  mcpClient: IAgenticMCPClient;
  agenticLLMCaller: LLMIntergration;
}) => {
  /**
   * Creates the Arvo contract that defines the agent's interface.
   * The contract specifies accepted input types and expected output formats.
   */
  const contract = createSimpleArvoContract({
    uri: \`#/demo/handler/agent/mcp/\${name.replaceAll('.', '/')}\`,
    description: description,
    type: \`agent.mcp.\${name}\` as \`agent.mcp.\${TName}\`,
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

  /**
   * Factory function that creates the event handler for processing agent requests.
   * This handler manages the conversation flow, tool invocations, and response generation.
   *
   * @returns Configured Arvo event handler instance
   */
  const handlerFactory: EventHandlerFactory = () =>
    createArvoEventHandler({
      contract: contract,
      executionunits: 0,
      handler: {
        '1.0.0': async ({ event, span }) => {
          /**
           * Manually crafted parent OpenTelemetry headers to ensure proper span linkage
           * and prevent potential span corruption in distributed tracing.
           */
          const parentSpanOtelHeaders: OpenTelemetryHeaders = {
            traceparent: \`00-\${span.spanContext().traceId}-\${span.spanContext().spanId}-01\`,
            tracestate: null,
          };

          /**
           * Wraps the LLM caller with comprehensive OpenTelemetry observability.
           *
           * This wrapper:
           * - Creates dedicated spans for each LLM invocation
           * - Combines system prompts with structured output instructions
           * - Captures request/response attributes for debugging
           * - Ensures proper error tracking and span status codes
           */
          const otelAgenticLLMCaller = async (
            params: Omit<LLMIntegrationParam, 'span' | 'systemPrompt'> & {
              systemPrompt: string | null;
              description: string | null;
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
                      ...(params.description ? [\`# Your Agentic Description\\n\${params.description}\`] : []),
                      ...(params.systemPrompt ? [\`# Instructions:\\n\${params.systemPrompt}\`] : []),
                      ...(params.outputFormat
                        ? [
                            \`# JSON Response Requirements:\\n\${jsonUsageIntentPrompt(zodToJsonSchema(params.outputFormat))}\`,
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

          // Establish MCP connection before processing
          await mcpClient.connect(span);

          // Retrieve available tool definitions from the MCP server
          const mcpClientToolDefinitions = await mcpClient.getToolDefinitions(span);

          try {
            /**
             * Initialize the conversation with the user's message.
             * Messages array maintains the full conversation context.
             */
            const messages: LLMIntegrationParam['messages'] = [
              {
                role: 'user',
                content: [{ type: 'text', content: event.data.message }],
              },
            ];

            /**
             * Maximum number of tool invocation cycles to prevent infinite loops.
             * Each cycle represents one round of LLM reasoning and tool execution.
             *
             * Zero also defaults to 5
             */
            const MAX_CYCLE_COUNT = maxToolInteractions || 5;

            /**
             * Main conversation loop that alternates between:
             * 1. LLM reasoning (determining next action)
             * 2. Tool execution (if tools are requested)
             * 3. Result processing (feeding tool results back to LLM)
             *
             * Loop continues until LLM provides a final response or max cycles reached.
             */
            for (let i = 0; i < MAX_CYCLE_COUNT; i++) {
              if (i >= MAX_CYCLE_COUNT - 1) {
                messages.push({
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      content: toolInteractionLimitPrompt(),
                    },
                  ],
                });
              }

              const { response, toolRequests } = await otelAgenticLLMCaller({
                type: i === 0 ? 'init' : 'tool_results',
                messages,
                toolDefinitions: mcpClientToolDefinitions,
                description: description ?? null,
                systemPrompt:
                  systemPrompt?.({
                    messages,
                    services: {} as never,
                    toolDefinitions: mcpClientToolDefinitions,
                    type: i === 0 ? 'init' : 'tool_results',
                  }) ?? null,
                outputFormat: outputFormat ?? null,
              });

              /**
               * LLM provided direct response without needing tools.
               * This indicates the conversation is complete.
               */
              if (response) {
                messages.push({
                  role: 'assistant',
                  content: [
                    { type: 'text', content: typeof response === 'string' ? response : JSON.stringify(response) },
                  ],
                });

                const output = {
                  // biome-ignore lint/style/noNonNullAssertion: Typescript compiler is being silly here. This can not be undefined
                  type: contract.version('1.0.0').emitList[0]!.type as \`evt.agent.mcp.\${TName}.success\`,
                  data: {
                    messages,
                    output: typeof response === 'string' ? { response } : response,
                    toolUseId$$: event.data.toolUseId$$,
                    // biome-ignore lint/suspicious/noExplicitAny: Need to by-pass typescript compiler as it is having a hard time evaluating the types
                  } as any,
                };
                return output;
              }

              // Throw error if LLM violates the tool use limit - Circuit breaker pattern
              if (i >= MAX_CYCLE_COUNT - 1) break;

              /**
               * LLM requested tool invocations.
               * Execute all requested tools in parallel and collect results.
               */
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
                        data: await mcpClient.invokeTool(
                          {
                            toolName: type,
                            toolArguments: data as Record<string, unknown>,
                          },
                          span,
                        ),
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
            throw new Error(
              \`The agentic interaction cycle count reached limit of \${MAX_CYCLE_COUNT} without any resolution.\`,
            );
          } catch (e) {
            throw e as Error;
          } finally {
            // Always disconnect from MCP server, even if an error occurred
            await mcpClient.disconnect(span);
          }
        },
      },
    });

  return { contract, handlerFactory };
};


    `,
    },
    {
      title: 'agentFactory/integrations/MCPClient.ts',
      lang: 'ts',
      code: `
import type { IAgenticMCPClient } from '../createMcpAgent.js';
import { Client } from '@modelcontextprotocol/sdk/client';
import type { Tool, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import { SpanStatusCode, type Span } from '@opentelemetry/api';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { exceptionToSpan, logToSpan } from 'arvo-core';
import type { AgenticToolDefinition } from '../types.js';

/**
 * Model Context Protocol (MCP) client implementation for connecting to and interacting with MCP servers.
 *
 * This client provides a robust interface for establishing connections to MCP servers,
 * discovering available tools, invoking those tools with arguments, and managing the
 * connection lifecycle. It supports both Server-Sent Events (SSE) and streamable HTTP
 * transport protocols, automatically selecting the appropriate transport based on the URL.
 */
export class MCPClient implements IAgenticMCPClient {
  private client: Client | null;
  private isConnected: boolean;
  private availableTools: Tool[];

  constructor(private readonly url: string) {
    this.client = null;
    this.isConnected = false;
    this.availableTools = [];
  }

  /**
   * Establishes a connection to the MCP server and discovers available tools.
   *
   * This method performs the following operations:
   * 1. Selects the appropriate transport (SSE or HTTP streaming) based on URL
   * 2. Creates and configures the MCP client with capabilities
   * 3. Establishes the connection to the server
   * 4. Retrieves and caches the list of available tools
   * 5. Logs all operations to the provided OpenTelemetry span
   *
   * @returns Promise that resolves when connection is established and tools are discovered
   * @throws {Error} Throws an error if connection fails, with details logged to the span
   */
  async connect(parentOtelSpan: Span) {
    try {
      const transport = this.url.includes('/mcp')
        ? new StreamableHTTPClientTransport(new URL(this.url))
        : new SSEClientTransport(new URL(this.url));
      this.client = new Client(
        {
          name: 'arvo-mcp-client',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        },
      );
      await this.client.connect(transport);
      logToSpan(
        {
          level: 'INFO',
          message: \`Connected to MCP Server@\${this.url}\`,
        },
        parentOtelSpan,
      );
      const tools: ListToolsResult = await this.client.listTools();
      this.availableTools = tools.tools;
      this.isConnected = true;
      logToSpan(
        {
          level: 'INFO',
          message: 'Available MCP tools:',
          tools: JSON.stringify(this.availableTools.map((t: Tool) => ({ name: t.name, description: t.description }))),
        },
        parentOtelSpan,
      );
    } catch (error) {
      exceptionToSpan(error as Error, parentOtelSpan);
      parentOtelSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error)?.message,
      });
      this.isConnected = false;
      throw new Error(\`Unable to conntect to the MCP Server@\${this.url}\`);
    }
  }

  /**
   * Retrieves the list of available tool definitions from the connected MCP server.
   *
   * Transforms the cached MCP tools into the AgenticToolDefinition format required
   * by the agent system. This method returns an empty array if not connected.
   */
  async getToolDefinitions(parentOtelSpan: Span) {
    const toolDef: AgenticToolDefinition[] = [];
    if (!this.isConnected) return toolDef;
    for (const item of this.availableTools) {
      toolDef.push({
        name: item.name,
        description: item.description ?? '',
        input_schema: item.inputSchema,
      });
    }
    return toolDef;
  }

  /**
   * Invokes a specific tool on the MCP server with the provided arguments.
   *
   * This method sends a tool invocation request to the connected MCP server and
   * returns the result. All operations are logged to the OpenTelemetry span for
   * observability. If an error occurs during invocation, it returns an error message
   * rather than throwing, allowing the agent to handle tool failures gracefully.
   */
  async invokeTool(param: { toolName: string; toolArguments?: Record<string, unknown> | null }, parentOtelSpan: Span) {
    try {
      logToSpan(
        {
          level: 'INFO',
          message: \`Invoking tool<\${param.toolName}> with arguments on MCP Server@\${this.url}\`,
          param: JSON.stringify(param),
        },
        parentOtelSpan,
      );
      if (!this.isConnected || !this.client) {
        throw new Error(\`MCP Server@\${this.url} not connected\`);
      }
      const result = await this.client.callTool({
        name: param.toolName,
        arguments: param.toolArguments ?? undefined,
      });
      return JSON.stringify(result);
    } catch (error) {
      const err = new Error(
        \`Error occured while invoking MCP tool <\${param.toolName}@\${this.url}> -> \${(error as Error)?.message ?? 'Something went wrong'}\`,
      );
      exceptionToSpan(err, parentOtelSpan);
      return err.message;
    }
  }

  /**
   * Gracefully disconnects from the MCP server and cleans up resources.
   *
   * This method safely closes the connection to the MCP server if one exists,
   * resets the connection state, and clears cached data. It's safe to call
   * multiple times - subsequent calls will be no-ops if already disconnected.
   */
  async disconnect(parentOtelSpan: Span) {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      this.client = null;
      logToSpan(
        {
          level: 'INFO',
          message: \`Disconnected from MCP Server@\${this.url}\`,
        },
        parentOtelSpan,
      );
    } else {
      logToSpan(
        {
          level: 'INFO',
          message: \`MCP Server@\${this.url} already disconnected\`,
        },
        parentOtelSpan,
      );
    }
  }
}



      `,
    },
  ],
};
