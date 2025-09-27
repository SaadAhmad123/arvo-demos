import {
  type VersionedArvoContract,
  type ArvoOrchestratorContract,
  createArvoOrchestratorContract,
  type ArvoSemanticVersion,
  ArvoOpenTelemetry,
  exceptionToSpan,
} from 'arvo-core';
import {
  ConfigViolation,
  createArvoResumable,
  type EventHandlerFactory,
  type IMachineMemory,
} from 'arvo-event-handler';
import { z } from 'zod';
import type {
  CallAgenticLLMOutput,
  CallAgenticLLMParam,
  CreateAgenticResumableParams,
  AnyVersionedContract,
  AgenticToolDefinition,
} from './types';
import { openInferenceSpanInitAttributesSetter, openInferenceSpanOutputAttributesSetter } from './helpers.otel';
import {
  SemanticConventions as OpenInferenceSemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import { SpanStatusCode } from '@opentelemetry/api';
import { AgenticMessageContentSchema } from './schemas';
import { jsonUsageIntentPrompt } from './helpers.prompt';
import zodToJsonSchema from 'zod-to-json-schema';

/**
 * [Utility] Validates that service contracts for agentic resumables meet required structure.
 *
 * Ensures that:
 * - All orchestrator contracts include the required `parentSubject$$` field
 * - All service contracts include `toolUseId$$` in both accepts and emits schemas. This
 * is because all LLMs require tool call coorelation id and these ids need to be propagated.
 *
 * @param contracts - Record of service contracts to validate
 * @throws {ConfigViolation} When contracts don't meet agentic resumable requirements
 */
const validateServiceContract = (contracts: Record<string, AnyVersionedContract>) => {
  for (const [contractKey, contract] of Object.entries(contracts)) {
    if (
      (contract as VersionedArvoContract<ArvoOrchestratorContract, ArvoSemanticVersion>)?.metadata?.contractType ===
        'ArvoOrchestratorContract' &&
      !('parentSubject$$' in (contract.accepts.schema as z.AnyZodObject).shape)
    ) {
      throw new ConfigViolation(
        `The orchestrator contract '${contract.uri}' keyed as '${contractKey}' must have field 'parentSubject$$'`,
      );
    }
    const zodObjects: z.AnyZodObject[] = [contract.accepts.schema, ...Object.values(contract.emits)];
    for (const item of zodObjects) {
      if (!('toolUseId$$' in (item as z.AnyZodObject).shape)) {
        throw new ConfigViolation(
          `All the service contract of an agentic resumable must have toolUseId$$. The service contract '${contract.uri}' keyed at '${contractKey}' must have 'toolUseId$$' in accept and emit events`,
        );
      }
    }
  }
};

/**
 * [Utility] Compares expected event counts with actual collected event counts.
 *
 * Used to determine if all expected service responses have been received
 * before proceeding with the next step in the agentic workflow.
 */
const compareCollectedEventCounts = (target: Record<string, number>, current: Record<string, number>) => {
  const sumTarget = Object.values(target).reduce((acc, cur) => acc + cur, 0);
  const sumCurrent = Object.values(current).reduce((acc, cur) => acc + cur, 0);
  return sumCurrent === sumTarget;
};

/**
 * Default output format for agents that don't specify a custom output schema.
 * Provides a simple string response format for basic conversational agents.
 */
const DEFAULT_AGENT_OUTPUT_FORMAT = z.object({ response: z.string() });

/**
 * Creates an agentic resumable orchestrator that integrates LLM capabilities with Arvo's event-driven architecture.
 *
 * This factory function creates a resumable orchestrator specifically designed for AI agent workflows.
 * The resulting agent can engage in multi-turn conversations, intelligently select and execute tools
 * based on context, and maintain conversation state across tool executions.
 *
 * ## Core Capabilities
 * - **Natural Language Processing**: Accepts user messages and generates contextually appropriate responses
 * - **Intelligent Tool Selection**: Uses LLM reasoning to determine which tools to invoke and when
 * - **Parallel Tool Execution**: Can execute multiple tools concurrently (it is event driven) and wait for all results
 * - **Conversation Management**: Maintains full conversation history and context across interactions
 * - **Type-Safe Tool Integration**: Leverages Arvo contracts for compile-time type safety
 * - **Structured Output Support**: Can return structured data instead of just text responses
 * - **Observability Integration**: Full OpenTelemetry tracing for debugging and monitoring
 *
 * ## Service Contract Requirements
 * All service contracts must include:
 * - `toolUseId$$`: Required for correlating LLM tool calls with service responses
 * - `parentSubject$$`: Required for orchestrator contracts to enable nested orchestration
 *
 * @returns Object containing the generated Arvo contract and handler factory for deployment
 *
 * @throws {ConfigViolation} When service contracts don't meet agentic resumable requirements
 *
 * @example
 * ```typescript
 * // Create a customer support agent with tool access
 * const supportAgent = createAgenticResumable({
 *   name: 'customer.support', // The name must be a-z, A-Z, .
 *   services: {
 *     userLookup: userContract.version('1.0.0'),
 *     ticketCreation: ticketContract.version('1.0.0'),
 *     knowledgeBase: kbContract.version('1.0.0')
 *   },
 *   agenticLLMCaller: async (params) => {
 *     // TODO - Integrate with your preferred LLM provider
 *   },
 *   systemPrompt: ({ type, messages }) => {
 *     const basePrompt = "You are a helpful customer support agent...";
 *     if (type === 'tool_results') {
 *       return basePrompt + "\nProcess the tool results and provide a comprehensive response.";
 *     }
 *     return basePrompt;
 *   },
 *   serviceDomains: {
 *     'com.human.review': ['human-review-domain'] // Route sensitive operations to human review
 *   },
 *   enableMessageHistoryInResponse: true // Include full conversation in response
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Create a data extraction agent with structured output
 * const extractorAgent = createAgenticResumable({
 *   name: 'data.extractor',
 *   outputFormat: z.object({
 *     entities: z.array(z.object({
 *       name: z.string(),
 *       type: z.enum(['person', 'organization', 'location']),
 *       confidence: z.number()
 *     })),
 *     summary: z.string()
 *   }),
 *   agenticLLMCaller: async (params) => {
 *     // TODO - Integrate with your preferred LLM provider
 *     // TODO - LLM must return structured JSON matching the outputFormat schema
 *   }
 * });
 * ```
 */
export const createAgenticResumable = <
  TName extends string,
  TService extends Record<string, AnyVersionedContract>,
  TOutput extends z.AnyZodObject = typeof DEFAULT_AGENT_OUTPUT_FORMAT,
>({
  name,
  services,
  agenticLLMCaller,
  serviceDomains,
  systemPrompt,
  outputFormat,
  enableMessageHistoryInResponse,
}: CreateAgenticResumableParams<TName, TService, TOutput>) => {
  validateServiceContract(services ?? {});

  /**
   * Auto-generated orchestrator contract for the agentic resumable.
   *
   * Defines the interface for starting conversations (init) and completing them (complete).
   * The init event accepts a message string, and completion returns the full conversation
   * history (optionally) along with the final response.
   */
  const contract = createArvoOrchestratorContract({
    uri: `#/demo/resumable/agent/${name.replaceAll('.', '/')}`,
    name: `agent.${name}` as `agent.${TName}`,
    versions: {
      '1.0.0': {
        init: z.object({
          message: z.string(),
          toolUseId$$: z.string().optional(),
        }),
        complete: z.object({
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
      contractSpecificType: 'AgenticResumable',
    },
  });

  /**
   * Internal context type for managing conversation state across resumptions.
   *
   * Tracks the conversation history, tool execution counts, and coordination
   * identifiers needed for proper agent operation in the Arvo ecosystem.
   */
  type Context = {
    currentSubject: string;
    messages: CallAgenticLLMParam['messages'];
    toolTypeCount: Record<string, number>;
    toolUseId$$: string | null;
  };

  /**
   * Event handler factory that creates the agentic resumable instance.
   *
   * ## Conversation Flow Management
   * 1. **Initialization Phase**: Process initial user message and determine response strategy
   * 2. **Tool Execution Phase**: Execute requested tools as Arvo service events
   * 3. **Result Processing Phase**: Collect tool responses and feed back to LLM
   * 4. **Response Generation**: Generate final response or continue tool execution cycle
   *
   * ## State Management
   * - Maintains conversation context across resumptions using the provided memory system
   * - Tracks tool execution counts to ensure all parallel operations complete
   * - Preserves tool correlation IDs for proper request/response mapping
   *
   * ## Error Handling
   * - Service errors are propagated as system errors to maintain conversation integrity
   * - LLM errors are traced and reported through OpenTelemetry spans
   * - ViolationErrors result in immediate failure with descriptive messages
   *
   * @param dependencies - Required dependencies including memory provider for state persistence
   * @returns Configured ArvoResumable instance ready for deployment in the event system
   */
  const handlerFactory: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({ memory }) =>
    createArvoResumable({
      contracts: {
        self: contract,
        services: (services ?? {}) as TService,
      },
      types: {
        context: {} as Context,
      },
      executionunits: 0,
      memory: memory,
      handler: {
        '1.0.0': async ({ contracts, service, input, context, collectedEvents, metadata, span }) => {
          span.setAttribute(OpenInferenceSemanticConventions.OPENINFERENCE_SPAN_KIND, OpenInferenceSpanKind.AGENT);
          // Handle service errors by throwing error (which will result in the system error event)
          if (
            service?.type &&
            Object.values(contracts.services).some((item) => item.systemError.type === service.type)
          ) {
            throw new Error(
              // biome-ignore lint/suspicious/noExplicitAny: This any is needed here
              `Something went wrong in an invoked service. Error -> ${(service.data as any)?.errorMessage}`,
            );
          }

          /**
           * Converts Arvo service contracts to LLM-compatible tool definitions.
           *
           * Transforms contract schemas by:
           * - Extracting JSON schema representations from Arvo contracts
           * - Removing Arvo-specific coordination fields (toolUseId$$, parentSubject$$)
           * - Preserving contract descriptions and input validation schemas
           */
          const toolDef: AgenticToolDefinition[] = Object.values(contracts.services).map((item) => {
            const inputSchema = item.toJsonSchema().accepts.schema;
            // @ts-ignore - The 'properties' field exists in there but is not pick up by typescript compiler
            const { toolUseId$$, parentSubject$$, ...cleanedProperties } = inputSchema?.properties ?? {};
            // @ts-ignore - The 'required' field exists in there but is not pick up by typescript compiler
            const cleanedRequired = (inputSchema?.required ?? []).filter(
              (item: string) => item !== 'toolUseId$$' && item !== 'parentSubject$$',
            );
            return {
              name: item.accepts.type,
              description: item.description,
              input_schema: {
                ...inputSchema,
                properties: cleanedProperties,
                required: cleanedRequired,
              },
            };
          });

          /**
           * Wraps the LLM caller with OpenTelemetry observability and system prompt generation.
           *
           * Creates a new OTEL span for each LLM call, handles prompt composition,
           * and ensures proper error tracking. The wrapper combines user-provided
           * system prompts with structured output instructions when applicable.
           */
          const otelAgenticLLMCaller: (
            param: Omit<CallAgenticLLMParam<TService, TOutput>, 'span' | 'systemPrompt'> & {
              systemPrompt: string | null;
            },
          ) => Promise<CallAgenticLLMOutput<TService>> = async (params) => {
            // This function automatically inherits from the parent span
            return await ArvoOpenTelemetry.getInstance().startActiveSpan({
              name: 'Agentic LLM Call',
              disableSpanManagement: true,
              fn: async (span) => {
                try {
                  const finalSystemPrompt =
                    [
                      ...(systemPrompt ? [`# Instructions:\n${systemPrompt}`] : []),
                      ...(outputFormat
                        ? [`# JSON Response Requirements:\n${jsonUsageIntentPrompt(zodToJsonSchema(outputFormat))}`]
                        : []),
                    ]
                      .join('\n\n')
                      .trim() || null; // This is not null-coelese because I want it to become undefined on empty string

                  openInferenceSpanInitAttributesSetter({
                    messages: params.messages,
                    systemPrompt: finalSystemPrompt,
                    tools: toolDef,
                    span,
                  });
                  const result = await agenticLLMCaller({
                    ...params,
                    systemPrompt: finalSystemPrompt ?? null,
                    span,
                  });
                  openInferenceSpanOutputAttributesSetter({
                    ...result,
                    span,
                  });
                  return result;
                } catch (e) {
                  exceptionToSpan(e as Error, span);
                  span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: (e as Error)?.message ?? 'Something went wrong',
                  });
                  throw e;
                } finally {
                  span.end();
                }
              },
            });
          };

          // Handle conversation initialization with the user's initial message
          if (input) {
            const messages: CallAgenticLLMParam['messages'] = [
              {
                role: 'user',
                content: [{ type: 'text', content: input.data.message }],
              },
            ];

            const { toolRequests, toolTypeCount, response } = await otelAgenticLLMCaller({
              type: 'init',
              messages,
              services: contracts.services,
              toolDefinitions: toolDef,
              systemPrompt:
                systemPrompt?.({
                  messages,
                  services: contracts.services,
                  toolDefinitions: toolDef,
                  type: 'init',
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

              return {
                context: {
                  messages,
                  toolTypeCount: {},
                  currentSubject: input.subject,
                  toolUseId$$: input.data.toolUseId$$ ?? null,
                },
                output: {
                  messages,
                  output: typeof response === 'string' ? { response } : response,
                  toolUseId$$: input.data.toolUseId$$,
                },
              };
            }

            // LLM requested tools - prepare tool calls and update conversation
            if (toolRequests) {
              for (let i = 0; i < toolRequests.length; i++) {
                if (toolRequests[i].data && typeof toolRequests[i].data === 'object') {
                  toolRequests[i].data.toolUseId$$ = toolRequests[i].id; // To coordination tool calls for the LLM
                  toolRequests[i].data.parentSubject$$ = input.subject; // To coordination nested orchestration/agentic invocations
                }
                const { type, id, data } = toolRequests[i];
                const { toolUseId$$, ...toolInputData } = data;
                messages.push({
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool_use',
                      id: id,
                      name: type,
                      input: toolInputData,
                    },
                  ],
                });
              }

              return {
                context: {
                  messages,
                  toolTypeCount,
                  currentSubject: input.subject,
                  toolUseId$$: input.data.toolUseId$$ ?? null,
                },
                services: toolRequests.map((item) =>
                  item.type in (serviceDomains ?? {}) ? { ...item, domain: serviceDomains?.[item.type] } : item,
                ),
              };
            }
          }

          if (!context) throw new Error('The context is not properly set. Faulty initialization');

          // Check if all expected tool responses have been collected before proceeding [Arvo Best Practice]
          const haveAllEventsBeenCollected = compareCollectedEventCounts(
            context.toolTypeCount,
            Object.fromEntries(
              Object.entries(collectedEvents).map(([key, evts]) => [key, (evts as Array<unknown>).length]),
            ),
          );

          // Wait for more tool responses if not all have arrived
          // Event collection is done automatically by the ArvoResumable
          if (!haveAllEventsBeenCollected) {
            return;
          }

          // All tool responses received - integrate them into conversation and call LLM
          const messages = [...context.messages];

          for (const eventList of Object.values(metadata?.events?.expected ?? {})) {
            for (const event of eventList) {
              messages.push({
                role: 'user' as const,
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: event.data?.toolUseId$$ ?? '',
                    content: JSON.stringify(event.data),
                  },
                ],
              });
            }
          }

          const { response, toolRequests, toolTypeCount } = await otelAgenticLLMCaller({
            type: 'tool_results',
            messages,
            services: contracts.services,
            toolDefinitions: toolDef,
            systemPrompt:
              systemPrompt?.({
                messages,
                services: contracts.services,
                toolDefinitions: toolDef,
                type: 'tool_results',
              }) ?? null,
            outputFormat: outputFormat ?? null,
          });

          // LLM provided final response - complete the conversation
          if (response) {
            messages.push({
              role: 'assistant',
              content: [{ type: 'text', content: typeof response === 'string' ? response : JSON.stringify(response) }],
            });

            return {
              context: {
                ...context,
                messages,
                toolTypeCount: {},
              },
              output: {
                messages,
                output: typeof response === 'string' ? { response } : response,
                toolUseId$$: context.toolUseId$$ ?? undefined,
              },
            };
          }

          // LLM requested more tools - continue the processing cycle additional tool execution
          if (toolRequests) {
            for (let i = 0; i < toolRequests.length; i++) {
              if (toolRequests[i].data && typeof toolRequests[i].data === 'object') {
                toolRequests[i].data.toolUseId$$ = toolRequests[i].id;
                toolRequests[i].data.parentSubject$$ = context.currentSubject;
              }
              const { type, id, data } = toolRequests[i];
              const { toolUseId$$, ...toolInputData } = data;
              messages.push({
                role: 'assistant',
                content: [
                  {
                    type: 'tool_use',
                    id: id,
                    name: type,
                    input: toolInputData,
                  },
                ],
              });
            }
            return {
              context: {
                ...context,
                messages,
                toolTypeCount,
              },
              services: toolRequests.map((item) =>
                item.type in (serviceDomains ?? {}) ? { ...item, domain: serviceDomains?.[item.type] } : item,
              ),
            };
          }
        },
      },
    });

  return {
    contract,
    handlerFactory,
  };
};
