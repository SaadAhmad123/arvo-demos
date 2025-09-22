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
import type { CallAgenticLLMOutput, CallAgenticLLMParam, CreateAgenticResumableParams } from './types';
import type { AnyVersionedContract } from '../types';
import { openInferenceSpanInitAttributesSetter, openInferenceSpanOutputAttributesSetter } from './otel.helpers';
import {
  SemanticConventions as OpenInferenceSemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Validates that service contracts for agentic resumables meet required structure.
 *
 * Ensures that:
 * - All orchestrator contracts include the required `parentSubject$$` field
 * - All service contracts include `toolUseId$$` in both accepts and emits schemas
 *
 * @param contracts - Record of service contracts to validate
 * @throws {ConfigViolation} When contracts don't meet agentic resumable requirements
 *
 * @example
 * ```typescript
 * const contracts = {
 *   userService: userContract.version('1.0.0'),
 *   paymentService: paymentContract.version('1.0.0')
 * };
 * validateServiceContract(contracts); // Throws if validation fails
 * ```
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
 * Compares expected event counts with actual collected event counts.
 *
 * Used to determine if all expected service responses have been received
 * before proceeding with the next step in the agentic workflow.
 *
 * @param target - Expected count of events by type
 * @param current - Actual count of collected events by type
 * @returns True if all expected events have been collected
 *
 * @example
 * ```typescript
 * const expected = { 'user.created': 1, 'payment.processed': 2 };
 * const actual = { 'user.created': 1, 'payment.processed': 2 };
 * const complete = compareCollectedEventCounts(expected, actual); // true
 * ```
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
 * @template TName - String literal type for the agent name
 * @template TService - Record of available service contracts the agent can invoke
 * @template TPrompts - Record of prompt functions for different scenarios
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
 * ```typescript
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
 * ```
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
    uri: `#/demo/resumable/agent/${name}`,
    name: `agent.${name}` as `agent.${TName}`,
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
              `Something went wrong in an invoked service. Error -> ${(service.data as any)?.errorMessage}`,
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
                  toolRequests[i].data.toolUseId$$ = toolRequests[i].id;
                  toolRequests[i].data.parentSubject$$ = input.subject;
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
