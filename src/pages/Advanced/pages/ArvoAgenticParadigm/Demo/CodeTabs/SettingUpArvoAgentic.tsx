import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const SettingUpArvoAgentic: DemoCodePanel = {
  heading: 'AI Agent Factory with ArvoResumable',
  description: cleanString(`
    As shown above, \`ArvoResumable\` is a solid base for building AI-enabled agents. 
    This section outlines a **reusable scaffolding pattern** that **standardizes** how **agents** are created 
    and operated across the Arvo system. This reusable **factory** pattern, for building AI agents, builds 
    on top of Arvo's event-driven foundation. It abstracts away 
    common operational concerns—such as validation, context management, and 
    observability—so developers can focus on defining each agent’s unique 
    responsibilities.

    The \`createAgenticResumable\` factory acts as a bridge between any LLM provider 
    and Arvo's event-driven architecture. It constructs a correctly configured 
    \`ArvoResumable\` handler with common logic for all agents, while letting **you define 
    each agent's scope via \`ArvoContract\`, prompts, and the LLM integrations**. Those contracts are exposed to 
    your LLM integration as callable tools—creating a clean interface between LLM reasoning and structured system capabilities. 
    The factory also wires LLM calls into OpenTelemetry and enriches spans with OpenInference attributes, enabling 
    deep, end-to-end LLM observability.

    Furthermore, this factory establishes an \`ArvoContract\` for the AI Agent
    itself, enabling users to interact with the generated agents through a well
    defined interface. The factory returns both the contract and the event-handler builder, making it easy 
    to plug agents into existing Arvo services and participate in the broader event 
    ecosystem with minimal ceremony.

    **Best Practice Demonstration:** This implementation highlights a critical best practice 
    in Arvo by **anticipating the challenges of distributed system deployment**. In such environments, \`ArvoResumable\` 
    acquires an **optimistic lock** on the execution to ensure events are processed with consistent state, 
    thereby **preventing corruption**. However, large language models **(LLMs) introduce high and variable latency**, 
    which can result in prolonged and unpredictable lock durations and failed event processing due to 
    lock contention, **leading to complex retries**. To mitigate this, Arvo recommends collecting 
    all tool responses before initiating LLM inference, ensuring that no other events are expected 
    during execution. Because registering tool responses takes only milliseconds, the lock is held 
    briefly, **significantly reducing operational complexity while preserving consistency and reliability**.


    > **A Quick Note:** Arvo is fundamentally an event-driven systems toolkit, **not an AI agent framework**. 
    > The implementation shown here demonstrates advanced capabilities but is built entirely from Arvo 
    > primitives and intentionally kept outside the core package. Embedding agent-specific logic would 
    > tie Arvo to constant version churn and unnecessarily expand its scope. Instead, Arvo embraces the 
    > **shadcn philosophy** for agentic patterns by providing production-ready example code that you can 
    > copy, adapt, and integrate to fit your specific context. This approach gives you full control over 
    > your agent implementations while benefiting from proven patterns and robust, battle-tested foundations.
  `),
  tabs: [
    {
      title: 'createArvoResumable/index.ts',
      lang: 'ts',
      code: `
// This code and all the files associated with it are supposed to be directly copy-pasted into your project.
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
 * - All orchestrator contracts include the required \`parentSubject$$\` field
 * - All service contracts include \`toolUseId$$\` in both accepts and emits schemas. This
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
        \`The orchestrator contract '\${contract.uri}' keyed as '\${contractKey}' must have field 'parentSubject$$'\`,
      );
    }
    const zodObjects: z.AnyZodObject[] = [contract.accepts.schema, ...Object.values(contract.emits)];
    for (const item of zodObjects) {
      if (!('toolUseId$$' in (item as z.AnyZodObject).shape)) {
        throw new ConfigViolation(
          \`All the service contract of an agentic resumable must have toolUseId$$. The service contract '\${contract.uri}' keyed at '\${contractKey}' must have 'toolUseId$$' in accept and emit events\`,
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
 * - \`toolUseId$$\`: Required for correlating LLM tool calls with service responses
 * - \`parentSubject$$\`: Required for orchestrator contracts to enable nested orchestration
 *
 * @returns Object containing the generated Arvo contract and handler factory for deployment
 *
 * @throws {ConfigViolation} When service contracts don't meet agentic resumable requirements
 *
 * @example
 * \`\`\`typescript
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
 *       return basePrompt + "\\nProcess the tool results and provide a comprehensive response.";
 *     }
 *     return basePrompt;
 *   },
 *   serviceDomains: {
 *     'com.human.review': ['human-review-domain'] // Route sensitive operations to human review
 *   },
 *   enableMessageHistoryInResponse: true // Include full conversation in response
 * });
 * \`\`\`
 *
 * @example
 * \`\`\`typescript
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
 * \`\`\`
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
    uri: \`#/demo/resumable/agent/\${name.replaceAll('.', '/')}\`,
    name: \`agent.\${name}\` as \`agent.\${TName}\`,
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
              \`Something went wrong in an invoked service. Error -> \${(service.data as any)?.errorMessage}\`,
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
                      ...(systemPrompt ? [\`# Instructions:\\n\${systemPrompt}\`] : []),
                      ...(outputFormat
                        ? [\`# JSON Response Requirements:\\n\${jsonUsageIntentPrompt(zodToJsonSchema(outputFormat))}\`]
                        : []),
                    ]
                      .join('\\n\\n')
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

      `,
    },
    {
      title: 'createAgenticResumable/schemas.ts',
      lang: 'ts',
      code: `
import { z } from 'zod';

/**
 * Schema for tool result message content.
 *
 * Represents the response data from a completed tool execution that gets
 * sent back to the LLM. This allows the LLM to process tool outputs and
 * continue the conversation flow.
 */
export const AgenticToolResultMessageContentSchema = z.object({
  type: z.literal('tool_result'),
  /** Unique identifier linking this result back to the original tool request */
  tool_use_id: z.string(),
  /** JSON-serialized output data returned by the executed tool */
  content: z.string(),
});

/**
 * Schema for tool call message content.
 *
 * Represents a request from the LLM to execute a specific tool or service.
 * Contains all necessary information for the orchestrator to invoke the
 * appropriate Arvo service contract.
 */
export const AgenticToolCallMessageContentSchema = z.object({
  type: z.literal('tool_use'),
  /** Unique identifier for tracking this specific tool request */
  id: z.string(),
  /** Name/type of the tool to execute (maps to Arvo service contract types) */
  name: z.string(),
  /** Parameters to pass to the tool, structured according to the tool's contract */
  input: z.object({}).passthrough(), // Allows any object structure
});

/**
 * Schema for text message content.
 *
 * Represents standard conversational text content without any tool interactions.
 * Used for both user messages and direct LLM text responses that don't require
 * tool execution.
 */
export const AgenticTextMessageContentSchema = z.object({
  type: z.literal('text'),
  /** The actual text content of the message */
  content: z.string(),
});

/**
 * Union schema for all possible message content types in agentic conversations.
 *
 * Uses discriminated union on the 'type' field to enable type-safe handling
 * of different message content formats throughout the conversation flow.
 * Supports text messages, tool calls, and tool results.
 */
export const AgenticMessageContentSchema = z.discriminatedUnion('type', [
  AgenticToolResultMessageContentSchema,
  AgenticToolCallMessageContentSchema,
  AgenticTextMessageContentSchema,
]);

      `,
    },
    {
      title: 'createAgenticResumable/types.ts',
      lang: 'ts',
      code: `
import type { InferVersionedArvoContract } from 'arvo-core';
import type { Span } from '@opentelemetry/api';
import type { VersionedArvoContract } from 'arvo-core';
import type { z } from 'zod';
import type {
  AgenticMessageContentSchema,
  AgenticTextMessageContentSchema,
  AgenticToolCallMessageContentSchema,
  AgenticToolResultMessageContentSchema,
} from './schemas';

/**
 * Generic type alias for any versioned Arvo contract.
 * Used as a constraint for service contract type parameters.
 */
// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
export type AnyVersionedContract = VersionedArvoContract<any, any>;

/**
 * Message content representing the result of a completed tool execution.
 *
 * Contains the output data from a tool that was previously invoked by the LLM.
 * The content is JSON-serialized and linked back to the original request via tool_use_id.
 */
export type AgenticToolResultMessageContent = z.infer<typeof AgenticToolResultMessageContentSchema>;

/**
 * Message content representing a request to execute a specific tool.
 *
 * Generated by LLMs when they determine that external tool execution is required
 * to fulfill a user request. Contains the tool name and all necessary parameters
 * for execution according to the tool's Arvo contract schema.
 */
export type AgenticToolCallMessageContent = z.infer<typeof AgenticToolCallMessageContentSchema>;

/**
 * Message content containing plain text communication.
 *
 * Represents standard conversational text without any tool interactions.
 * Used for both user messages and direct LLM responses that don't require tools.
 */
export type AgenticTextMessageContent = z.infer<typeof AgenticTextMessageContentSchema>;

/**
 * Union type for all possible message content formats in agentic conversations.
 * Supports text messages, tool execution requests, and tool result responses.
 */
export type AgenticMessageContent = z.infer<typeof AgenticMessageContentSchema>;

/**
 * Tool definition format expected by LLM services.
 *
 * Simplified representation of an Arvo service contract that provides
 * the LLM with the necessary information to understand and invoke tools.
 */
export type AgenticToolDefinition = {
  /** The name/identifier of the tool (maps to Arvo contract event type) */
  name: string;
  /** Human-readable description of what the tool does and when to use it */
  description: string;
  /** JSON schema defining the expected input parameters for the tool */
  input_schema: object;
};

/**
 * Input parameters for calling an agentic LLM service.
 *
 * Provides the LLM with conversation context, available tools, and configuration
 * needed to generate appropriate responses or tool execution requests. Supports
 * both conversation initialization and processing of tool execution results.
 */
export type CallAgenticLLMParam<
  TServices extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  TOutput extends z.AnyZodObject = z.AnyZodObject,
> = {
  /**
   * Indicates the conversation phase and expected LLM behavior.
   * - 'init': Starting a new conversation or processing a user message
   * - 'tool_results': Processing the results of previously requested tool executions
   */
  type: 'init' | 'tool_results';

  /**
   * Complete conversation history in chronological order.
   */
  messages: {
    role: 'user' | 'assistant';
    content: AgenticMessageContent[];
  }[];

  /**
   * Formatted tool definitions available to the LLM.
   *
   * These are derived from the service contracts and pre-formatted for
   * LLM consumption. Use the 'services' field to access original contracts
   * for type-safe tool parameter validation.
   */
  toolDefinitions: AgenticToolDefinition[];

  /**
   * Available Arvo service contracts that the LLM can invoke as tools.
   */
  services: TServices;

  /** OpenTelemetry span for logging and tracing LLM operations */
  span: Span;

  /**
   * [Optional] Structured output format constraint.
   *
   * When provided, the LLM must return a JSON object matching this schema
   * instead of a plain text response. Useful for extracting structured data.
   */
  outputFormat: TOutput | null;

  /** System prompt to guide the LLM's behavior and tool usage patterns */
  systemPrompt: string | null;
};

/**
 * Response from an agentic LLM service call.
 *
 * The LLM can either provide a direct response or request tool executions,
 * but not both simultaneously. Tool requests are fully typed according to
 * their corresponding Arvo contracts for type-safe execution.
 */
export type CallAgenticLLMOutput<
  TServices extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
> = {
  /**
   * Tool execution requests generated by the LLM.
   *
   * Each request is typed according to its Arvo contract, ensuring the
   * request data matches the expected service input schema. Null when
   * the LLM provides a direct response instead of requesting tools.
   */
  toolRequests: Array<
    {
      [K in keyof TServices]: {
        type: InferVersionedArvoContract<TServices[K]>['accepts']['type'];
        data: InferVersionedArvoContract<TServices[K]>['accepts']['data'];
        id: string;
      };
    }[keyof TServices]
  > | null;

  /**
   * Direct response from the LLM.
   *
   * Can be a string for text responses or an object when outputFormat
   * is specified. Must be null when toolRequests are present.
   */
  response: string | object | null;

  /**
   * Aggregated count of tool requests by type.
   */
  toolTypeCount: Record<string, number>;

  /**
   * Optional token usage statistics from the LLM provider.
   * Helps with cost tracking and performance monitoring.
   */
  usage?: {
    tokens: {
      prompt: number;
      completion: number;
    };
  };
};

/**
 * Function signature for calling an agentic LLM service.
 *
 * Implementations should process the conversation context and tool definitions
 * to generate either direct responses or structured tool execution requests.
 * Must handle both conversation initialization and tool result processing.
 */
export type CallAgenticLLM<
  TServices extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  TOutput extends z.AnyZodObject = z.AnyZodObject,
> = (param: CallAgenticLLMParam<TServices, TOutput>) => Promise<CallAgenticLLMOutput<TServices>>;

/**
 * Configuration parameters for creating an agentic resumable orchestrator.
 *
 * Defines all components needed to create an AI agent that can maintain
 * conversations, make intelligent tool decisions, and execute complex workflows
 * through Arvo's event-driven architecture. Supports both simple chat and
 * structured data extraction scenarios.
 */
export type CreateAgenticResumableParams<
  TName extends string,
  TServices extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  TOutput extends z.AnyZodObject = z.AnyZodObject,
> = {
  /**
   * Unique identifier for this agent instance.
   *
   * Used in Arvo contract URIs, event type, and agent identification
   * across the system system.
   */
  name: TName;

  /**
   * LLM service integration function.
   *
   * Handles the actual communication with the LLM provider (OpenAI, Anthropic, etc.)
   * and implements the conversation and tool request logic.
   */
  agenticLLMCaller: CallAgenticLLM<TServices, TOutput>;

  /**
   * Optional structured output format specification.
   *
   * When provided, constrains the agent to return data matching this Zod schema
   * instead of free-form text responses. Useful for data extraction workflows.
   */
  outputFormat?: TOutput;

  /**
   * Available Arvo service contracts for tool execution.
   *
   * Each contract defines a service the LLM can invoke, providing full
   * type safety and automatic schema validation for tool parameters and responses.
   */
  services?: TServices;

  /**
   * Optional domain routing configuration for service execution.
   */
  serviceDomains?: Record<{ [K in keyof TServices]: TServices[K]['accepts']['type'] }[keyof TServices], string[]>;

  /**
   * Dynamic system prompt generation function.
   *
   * Receives conversation context and available tools to generate contextually
   * appropriate system prompts for different conversation phases (init vs tool_results).
   */
  systemPrompt?: (
    param: Pick<CallAgenticLLMParam<TServices, TOutput>, 'messages' | 'services' | 'toolDefinitions' | 'type'>,
  ) => string;

  /**
   * Whether to include conversation history in orchestrator responses.
   *
   * When enabled, the orchestrator will return the complete message history
   * along with the final response, useful for debugging and conversation tracking.
   */
  enableMessageHistoryInResponse?: boolean;
};

      `,
    },
    {
      title: 'createAgenticResumable/helpers.prompt.ts',
      lang: 'ts',
      code: `
// Generates a structured JSON output instruction prompt for LLM services.
export const jsonUsageIntentPrompt = (jsonRequirement: object) => \`
Adhere strictly to the following JSON output guidelines:
  1. Ensure the entire response is a single, valid JSON object.
  2. Use double quotes for all keys and string values.
  3. Do not include any text outside the JSON object.
  4. Escape special characters in strings properly (e.g., \\n for newlines, \\" for quotes).
  5. Use true, false, and null as literals (not strings).
  6. Format numbers without quotes.
  7. If a schema is not provided, infer an appropriate schema based on the query context otherwise strictly adhere to the provided schema.
  8. Nest objects and arrays as needed for complex data structures.
  9. Use consistent naming conventions for keys (e.g., camelCase or snake_case).
  10. Do not use comments within the JSON.
The output will be parsed using 'json.loads()' in Python, so strict JSON compliance is crucial.
Return the final response in the following format:
\${JSON.stringify(jsonRequirement)}
\`;


      `,
    },
    {
      title: 'createAgenticResumable/helpers.otel.ts',
      lang: 'ts',
      code: `
import type { Span } from '@opentelemetry/api';
import {
  SemanticConventions as OpenInferenceSemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import type { AgenticMessageContent, AgenticToolDefinition, CallAgenticLLMOutput, CallAgenticLLMParam } from './types';

/**
 * Sets OpenInference-compliant attributes on an OpenTelemetry span for LLM input tracking.
 *
 * Configures detailed observability attributes following the OpenInference specification
 * for monitoring LLM operations. This function captures all input parameters sent to
 * the LLM including conversation history, available tools, and system prompts, enabling
 * comprehensive tracing and debugging of agentic workflows.
 */
export const openInferenceSpanInitAttributesSetter = (param: {
  span: Span;
  tools: AgenticToolDefinition[];
  messages: CallAgenticLLMParam['messages'];
  systemPrompt: string | null;
}) => {
  param.span.setAttributes({
    [OpenInferenceSemanticConventions.OPENINFERENCE_SPAN_KIND]: OpenInferenceSpanKind.LLM,
  });

  const toolDef = param.tools;

  param.span.setAttributes(
    Object.fromEntries(
      toolDef.flatMap((item, index) => [
        [
          \`\${OpenInferenceSemanticConventions.LLM_TOOLS}.\${index}.\${OpenInferenceSemanticConventions.TOOL_JSON_SCHEMA}\`,
          JSON.stringify(item),
        ],
      ]),
    ),
  );

  param.span.setAttributes(
    Object.fromEntries(
      [
        ...(param.systemPrompt
          ? [
              {
                role: 'system',
                content: [{ type: 'text', content: param.systemPrompt ?? '' }] as AgenticMessageContent[],
              },
            ]
          : []),
        ...param.messages,
      ].flatMap((item, index) => {
        const attrs = [
          [
            \`\${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.\${index}.\${OpenInferenceSemanticConventions.MESSAGE_ROLE}\`,
            item.role,
          ],
        ];
        for (let i = 0; i < item.content.length; i++) {
          const c = item.content[i];
          if (c.type === 'text') {
            attrs.push([
              \`\${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.\${index}.\${OpenInferenceSemanticConventions.MESSAGE_CONTENTS}.\${i}.\${OpenInferenceSemanticConventions.MESSAGE_CONTENT_TYPE}\`,
              c.type,
            ]);
            attrs.push([
              \`\${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.\${index}.\${OpenInferenceSemanticConventions.MESSAGE_CONTENTS}.\${i}.\${OpenInferenceSemanticConventions.MESSAGE_CONTENT_TEXT}\`,
              c.content,
            ]);
          }
          if (c.type === 'tool_use') {
            attrs.push([
              \`\${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.\${index}.\${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.\${i}.\${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_NAME}\`,
              c.name,
            ]);
            attrs.push([
              \`\${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.\${index}.\${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.\${i}.\${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_ARGUMENTS_JSON}\`,
              JSON.stringify({
                ...c.input,
                toolUseId$$: c.id,
              }),
            ]);
          }
          if (c.type === 'tool_result') {
            attrs.push([
              \`\${OpenInferenceSemanticConventions.LLM_INPUT_MESSAGES}.\${index}.\${OpenInferenceSemanticConventions.MESSAGE_CONTENTS}.\${i}.\${OpenInferenceSemanticConventions.MESSAGE_CONTENT_TEXT}\`,
              JSON.stringify({ result: c.content, toolUseId$$: c.tool_use_id }),
            ]);
          }
        }
        return attrs;
      }),
    ),
  );
};

/**
 * Sets OpenInference-compliant attributes on an OpenTelemetry span for LLM output tracking.
 *
 * Configures observability attributes for LLM response data following the OpenInference
 * specification. This function captures the complete LLM output including direct responses,
 * tool execution requests, and usage statistics, providing comprehensive visibility into
 * LLM decision-making and resource consumption.
 */
export const openInferenceSpanOutputAttributesSetter = ({
  span,
  response,
  toolRequests,
  usage,
}: CallAgenticLLMOutput & { span: Span }) => {
  span.setAttributes({
    [\`\${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.\${OpenInferenceSemanticConventions.MESSAGE_ROLE}\`]:
      'assistant',
  });
  if (response) {
    span.setAttributes({
      [\`\${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.\${OpenInferenceSemanticConventions.MESSAGE_CONTENT}\`]:
        typeof response === 'string' ? response : JSON.stringify(response),
    });
  }

  if (toolRequests?.length) {
    span.setAttributes(
      Object.fromEntries(
        toolRequests.flatMap((item, index) => [
          [
            \`\${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.\${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.\${index}.\${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_NAME}\`,
            item.type,
          ],
          [
            \`\${OpenInferenceSemanticConventions.LLM_OUTPUT_MESSAGES}.0.\${OpenInferenceSemanticConventions.MESSAGE_TOOL_CALLS}.\${index}.\${OpenInferenceSemanticConventions.TOOL_CALL_FUNCTION_ARGUMENTS_JSON}\`,
            JSON.stringify(item.data),
          ],
        ]),
      ),
    );
  }

  if (usage) {
    span.setAttributes({
      [OpenInferenceSemanticConventions.LLM_TOKEN_COUNT_PROMPT]: usage.tokens.prompt,
      [OpenInferenceSemanticConventions.LLM_TOKEN_COUNT_COMPLETION]: usage.tokens.completion,
      [OpenInferenceSemanticConventions.LLM_TOKEN_COUNT_TOTAL]: usage.tokens.completion + usage.tokens.prompt,
    });
  }
};



      `,
    },
  ],
};
