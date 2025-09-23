import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const SettingUpArvoAgentic: DemoCodePanel = {
  heading: 'Building AI Agents with ArvoResumable',
  description: cleanString(`
    As demonstrated above, \`ArvoResumable\` provides the ideal foundation for 
    developing AI-enabled agents. Let's explore how to build such agents by first 
    establishing reusable scaffolding that streamlines agent development across 
    your entire system.

    The \`createAgenticResumable\` factory function, built here, serves as a bridge between 
    any LLM provider and Arvo's event-driven architecture. It internally constructs 
    a properly configured \`ArvoResumable\` event handler with shared logic common 
    to all agents, while allowing you to define each agent's operational scope through 
    \`ArvoContract\` definitions. These contract specifications become available to 
    your LLM integration as callable tools, creating a seamless interface between 
    natural language processing and structured system interactions. Furthermore, it integrates
    the LLM calls with OpenTelemetry and also integrates OpenInference data to the OTEL
    span which enable indepth LLM observability.

    This factory establishes a natural language \`ArvoContract\` for the agentic 
    system itself, enabling human users to interact with agents through conversational 
    interfaces. The pattern returns both the contract definition and the event handler 
    factory, allowing seamless integration with existing Arvo services and natural 
    participation in your broader event-driven ecosystem.

    > **A Quick Note:** Arvo is fundamentally an event-driven systems toolkit, 
    > not an AI agent framework. While the implementation demonstrated here showcases 
    > sophisticated capabilities, it's built entirely from Arvo primitives and 
    > intentionally remains outside the core package. The AI landscape evolves at 
    > breakneck speed, and embedding agent-specific logic would lock Arvo into 
    > constant version churn. 
    >
    > Instead, Arvo embraces the **shadcn philosophy** for agentic patterns: it provides
    > production-ready example code that you can copy, adapt, and integrate in ways 
    > that best serve your specific context and requirements. This approach gives you 
    > complete control over your agent implementations while benefiting from proven 
    > patterns and battle-tested foundations.
  `),
  tabs: [
    {
      title: 'createArvoResumable/index.ts',
      lang: 'ts',
      code: `import {
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
      } from './types';
      import { openInferenceSpanInitAttributesSetter, openInferenceSpanOutputAttributesSetter } from './otel.helpers';
      import {
        SemanticConventions as OpenInferenceSemanticConventions,
        OpenInferenceSpanKind,
      } from '@arizeai/openinference-semantic-conventions';
      import { SpanStatusCode } from '@opentelemetry/api';
      
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
       * Creates an agentic resumable orchestrator that integrates LLM capabilities with ArvoResumable event handler.
       *
       * This factory creates a resumable imperative orchestrator that can:
       * - Accept natural language input messages
       * - Call LLM services for reasoning and tool selection
       * - Execute tool calls as Arvo service events
       * - Manage conversation context and tool responses
       * - Return structured conversation history and final responses
       *
       * The resulting orchestrator follows the standard Arvo resumable pattern but is specifically
       * designed for AI agent workflows where LLMs make decisions about which tools to use based
       * on conversation context.
       *
       * @param params - Configuration object for the agentic resumable
       * @param params.name - Unique name for this agent (used in contract URI)
       * @param params.services - Service contracts available as tools for the LLM
       * @param params.serviceDomains - Optional domain routing for specific services
       * @param params.prompts - Prompt functions for different conversation scenarios
       * @param params.agenticLLMCaller - Function to call LLM with conversation context and available tools
       *
       * @returns Object containing the generated contract and handler factory
       *
       * @throws {ConfigViolation} When service contracts don't meet agentic requirements
       *
       * @example
       * \`\`\`typescript
       * const agent = createAgenticResumable({
       *   name: 'customer-support',
       *   services: {
       *     userLookup: userContract.version('1.0.0'),
       *     ticketCreation: ticketContract.version('1.0.0')
       *   },
       *   agenticLLMCaller: async (params) => {
       *     // Call your LLM service (OpenAI, Anthropic, etc.)
       *     return await callLLM(params);
       *   },
       *   serviceDomains: {
       *     'com.human.review': ['human.in.loop']
       *   },
       *   prompts: {
       *     systemPrompt: () => "You are a helpful customer support agent..."
       *   }
       * });
       *
       * // Use the agent in your event system
       * const handler = agent.handlerFactory({ memory });
       * const result = await handler.execute(userMessageEvent);
       * \`\`\`
       */
      export const createAgenticResumable = <
        TName extends string,
        TService extends Record<string, AnyVersionedContract>,
        // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
        TPrompts extends Record<string, (...args: any[]) => string>,
      >({
        name,
        services,
        agenticLLMCaller,
        serviceDomains,
        prompts,
      }: CreateAgenticResumableParams<TName, TService, TPrompts>) => {
        validateServiceContract(services);
      
        /**
         * Auto-generated orchestrator contract for the agentic resumable.
         *
         * Defines the interface for starting conversations (init) and completing them (complete).
         * The init event accepts a message string, and completion returns the full conversation
         * history along with the final response.
         */
        const contract = createArvoOrchestratorContract({
          uri: \`#/demo/resumable/agent/\${name}\`,
          name: \`agent.\${name}\` as \`agent.\${TName}\`,
          versions: {
            '1.0.0': {
              init: z.object({
                message: z.string(),
              }),
              complete: z.object({
                messages: z
                  .object({
                    role: z.enum(['user', 'assistant']),
                    content: z.object({}).array(),
                  })
                  .array(),
                response: z.string(),
              }),
            },
          },
        });
      
        type Context = {
          currentSubject: string;
          messages: CallAgenticLLMParam['messages'];
          toolTypeCount: Record<string, number>;
        };
      
        /**
         * Event handler factory that creates the agentic resumable instance.
         *
         * The handler manages the conversation flow:
         * 1. On init: Call LLM with user message, either respond directly or request tools
         * 2. On tool responses: Collect responses, call LLM again with results
         * 3. Continue until LLM provides final response without tool requests
         *
         * @param dependencies - Required dependencies including memory for state persistence
         * @returns Configured ArvoResumable instance for handling agentic conversations
         */
        const handlerFactory: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({ memory }) =>
          createArvoResumable({
            contracts: {
              self: contract,
              services: services ?? {},
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
      
                // Wrap the agentic llm caller in a function which can create a new
                // OTEL span for enhanced observability. It can only happen here in
                // the handler function as it only has the most recent OTEL span
                const otelAgenticLLMCaller: (
                  param: Omit<CallAgenticLLMParam<TService, TPrompts>, 'span'>,
                ) => Promise<CallAgenticLLMOutput<TService>> = async (params) => {
                  // This function automatically inherits from the parent span
                  return await ArvoOpenTelemetry.getInstance().startActiveSpan({
                    name: 'Agentic LLM Call',
                    disableSpanManagement: true,
                    fn: async (span) => {
                      try {
                        openInferenceSpanInitAttributesSetter({
                          ...params,
                          span,
                        });
                        const result = await agenticLLMCaller({
                          ...params,
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
      
                // Handle initialization: Handler the original message
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
                    tools: contracts.services,
                    prompts,
                  });
      
                  // LLM provided direct response without needing tools
                  if (response) {
                    messages.push({
                      role: 'assistant',
                      content: [{ type: 'text', content: response }],
                    });
      
                    return {
                      output: {
                        messages,
                        response: response,
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
                      },
                      services: toolRequests.map((item) =>
                        item.type in (serviceDomains ?? {}) ? { ...item, domain: serviceDomains?.[item.type] } : item,
                      ),
                    };
                  }
                }
      
                if (!context) throw new Error('The context is not properly set. Faulty initialization');
      
                // Check if all expected tool responses have been collected
                const haveAllEventsBeenCollected = compareCollectedEventCounts(
                  context.toolTypeCount,
                  Object.fromEntries(
                    Object.entries(collectedEvents).map(([key, evts]) => [key, (evts as Array<unknown>).length]),
                  ),
                );
      
                // Wait for more tool responses if not all have arrived
                if (!haveAllEventsBeenCollected) {
                  return;
                }
      
                // All tool responses received - add them to conversation and call LLM
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
                  tools: contracts.services,
                  prompts,
                });
      
                // LLM provided final response - complete the conversation
                if (response) {
                  messages.push({
                    role: 'assistant',
                    content: [{ type: 'text', content: response }],
                  });
      
                  return {
                    context: {
                      ...context,
                      messages,
                      toolTypeCount: {},
                    },
                    output: {
                      messages,
                      response: response,
                    },
                  };
                }
      
                // LLM requested more tools - continue the conversation cycle
                if (toolRequests) {
                  for (let i = 0; i < toolRequests.length; i++) {
                    if (toolRequests[i].data && typeof toolRequests[i].data === 'object') {
                      toolRequests[i].data.toolUseId$$ = toolRequests[i].id;  // To coordinate tool calls for the LLM
                      toolRequests[i].data.parentSubject$$ = context.currentSubject; // To coordinate nested orchestration/agentic calls
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
      
      

      `
        .split('\n')
        .map((item) => item.replace('      ', ''))
        .join('\n'),
    },
    {
      title: 'createAgenticResumable/types.ts',
      lang: 'ts',
      code: `
// Lets start by defining the required types for the factory.

import type { InferVersionedArvoContract } from 'arvo-core';
import type { Span } from '@opentelemetry/api';
import type { VersionedArvoContract } from 'arvo-core';

// biome-ignore lint/suspicious/noExplicitAny: Needs to be general
export type AnyVersionedContract = VersionedArvoContract<any, any>;

/**
 * Message content representing the result of a completed tool execution.
 *
 * Used when an LLM receives the output from a previously requested tool call.
 * The content is typically JSON-serialized data from the tool's execution.
 */
export type AgenticToolResultMessageContent = {
  type: 'tool_result';
  /** Unique identifier linking this result back to the original tool request */
  tool_use_id: string;
  /** JSON-serialized output data returned by the executed tool */
  content: string;
};

/**
 * Message content representing a request to execute a specific tool.
 *
 * Generated by LLMs when they determine a tool call is needed to fulfill
 * a user request. Contains all necessary parameters for tool execution.
 */
export type AgenticToolCallMessageContent = {
  type: 'tool_use';
  /** Unique identifier for tracking this specific tool request */
  id: string;
  /** Name/type of the tool to execute (maps to Arvo service contract types) */
  name: string;
  /** Parameters to pass to the tool, structured according to the tool's contract */
  input: object;
};

/**
 * Message content containing plain text communication.
 *
 * Represents standard conversational content without any tool interaction.
 * Used for both user input and LLM text responses.
 */
export type AgenticTextMessageContent = {
  type: 'text';
  /** The actual text content of the message */
  content: string;
};

/**
 * Union of all possible message content types in agentic conversations.
 *
 * Supports the three fundamental message patterns:
 * - Text for natural language communication
 * - Tool calls for LLM-initiated service requests
 * - Tool results for service response data
 */
export type AgenticMessageContent =
  | AgenticTextMessageContent
  | AgenticToolCallMessageContent
  | AgenticToolResultMessageContent;

/**
 * Input parameters for calling an agentic LLM service.
 *
 * Provides the LLM with conversation context, available tools, and prompt templates
 * to generate appropriate responses or tool requests.
 *
 * @template TTools - Mapping of tool names to their Arvo contract definitions
 * @template TPrompts - Collection of prompt template functions for different scenarios
 */
export type CallAgenticLLMParam<
  TTools extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to general
  TPrompts extends Record<string, (...args: any[]) => string> = Record<string, (...args: any[]) => string>,
> = {
  /**
   * Indicates whether this is conversation initialization or processing tool results.
   * - 'init': Start of conversation with user message
   * - 'tool_results': Continuation after receiving tool execution results
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
   * Available tools/services the LLM can invoke.
   *
   * Each tool is defined by its Arvo contract, providing schema validation
   * and type safety for tool parameter generation.
   */
  tools: TTools;

  /** Collection of prompt template functions for different conversation scenarios */
  prompts: TPrompts;

  /** The current OTEL span to record logs to. */
  span: Span;
};

/**
 * Response from an agentic LLM service call.
 *
 * The LLM can either provide a direct text response or request tool executions.
 * These are mutually exclusive - if tool requests are present, response must be null.
 *
 * @template TTools - Mapping of tool names to their Arvo contract definitions
 */
export type CallAgenticLLMOutput<
  TTools extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
> = {
  /**
   * Tool execution requests generated by the LLM.
   *
   * Each request is fully typed according to its corresponding Arvo contract,
   * ensuring type safety between LLM tool selection and service execution.
   * Null when the LLM provides a direct text response instead.
   */
  toolRequests: Array<
    {
      [K in keyof TTools]: {
        type: InferVersionedArvoContract<TTools[K]>['accepts']['type'];
        data: InferVersionedArvoContract<TTools[K]>['accepts']['data'];
        id: string;
      };
    }[keyof TTools]
  > | null;

  /**
   * Direct text response from the LLM.
   *
   * Present when the LLM can fulfill the request without tool usage.
   * Must be null when toolRequests are present.
   */
  response: string | null;

  /**
   * Count of each tool type requested in this call.
   *
   * Used for tracking tool usage patterns, debugging, and ensuring
   * all expected tool responses are collected before proceeding.
   */
  toolTypeCount: Record<string, number>;

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
 * Implementations should handle the conversation context, tool definitions,
 * and return either a text response or structured tool requests.
 *
 * @template TTools - Available tools/services for the LLM to invoke
 * @template TPrompts - Prompt template functions for conversation scenarios
 */
export type CallAgenticLLM<
  TTools extends Record<string, AnyVersionedContract> = Record<string, AnyVersionedContract>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to be general
  TPrompts extends Record<string, (...args: any[]) => string> = Record<string, (...args: any[]) => string>,
> = (param: CallAgenticLLMParam<TTools, TPrompts>) => Promise<CallAgenticLLMOutput<TTools>>;

/**
 * Configuration parameters for creating an agentic resumable orchestrator.
 *
 * Defines all components needed to create an AI agent that can engage in
 * conversations, make tool decisions, and execute workflows through Arvo's
 * event-driven architecture.
 *
 * @template TName - String literal type for the agent's unique identifier
 * @template TServices - Record of Arvo service contracts available as tools
 * @template TPrompts - Collection of prompt template functions
 */
export type CreateAgenticResumableParams<
  TName extends string,
  TServices extends Record<string, AnyVersionedContract>,
  // biome-ignore lint/suspicious/noExplicitAny: Needs to general
  TPrompts extends Record<string, (...args: any[]) => string>,
> = {
  /**
   * Unique name for this agent instance.
   * Used in generated contract URIs and for agent identification.
   */
  name: TName;

  /**
   * Function implementing the LLM service integration.
   */
  agenticLLMCaller: CallAgenticLLM<TServices, TPrompts>;

  /**
   * Arvo service contracts available as tools for the agent.
   *
   * Each contract defines a service the LLM can invoke, with full
   * type safety and schema validation enforced by Arvo.
   */
  services: TServices;

  /**
   * Optional domain routing configuration for services.
   *
   * Maps service event types to specific processing domains,
   * enabling advanced routing patterns
   */
  serviceDomains?: Record<{ [K in keyof TServices]: TServices[K]['accepts']['type'] }[keyof TServices], string[]>;

  /**
   * Prompt template functions for different conversation scenarios.
   *
   * Provides reusable prompt generation for system messages,
   * tool descriptions, and context-specific instructions.
   */
  prompts: TPrompts;
};



`,
    },
    {
      title: 'createAgenticResumable/otel.helpers.ts',
      lang: 'ts',
      code: `
// Let's define some helper functions which enable agentic integration with OpenTelemetry and
// OpenInference standards
  
import type { Span } from '@opentelemetry/api';
import type { AnyVersionedContract } from '../types';
import {
  SemanticConventions as OpenInferenceSemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import type { CallAgenticLLMOutput, CallAgenticLLMParam } from './types';

/**
 * Sets OpenInference-compliant span attributes for LLM initialization and input tracking.
 * 
 * This function enriches OpenTelemetry spans with structured attributes that follow
 * the OpenInference semantic conventions for LLM observability. It captures tool
 * definitions, conversation history, and message content in a standardized format
 * that enables comprehensive monitoring and analysis of agentic LLM interactions.
 * 
 * All tool schemas are extracted from Arvo contracts and stored as JSON,
 * enabling downstream analysis of tool usage patterns and capabilities.
 */
export const openInferenceSpanInitAttributesSetter = (param: {
  span: Span;
  tools: Record<string, AnyVersionedContract>;
  messages: CallAgenticLLMParam['messages'];
}) => {
  param.span.setAttributes({
    [OpenInferenceSemanticConventions.OPENINFERENCE_SPAN_KIND]: OpenInferenceSpanKind.LLM,
  });

  const toolDef = Object.values(param.tools).map((item) => ({
    name: item.accepts.type,
    description: item.description,
    input_schema: item.toJsonSchema().accepts.schema,
  }));

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
      param.messages.flatMap((item, index) => {
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
 * Sets OpenInference-compliant span attributes for LLM output and response tracking.
 * 
 * This function captures LLM response data in OpenInference format, including
 * text responses, tool requests, and usage metrics. It provides comprehensive
 * observability for LLM outputs, enabling analysis of response patterns,
 * tool usage, and resource consumption.
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
        response ?? '',
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
