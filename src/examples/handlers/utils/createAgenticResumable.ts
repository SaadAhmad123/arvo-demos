import {
  type VersionedArvoContract,
  type ArvoOrchestratorContract,
  createArvoOrchestratorContract,
  type ArvoSemanticVersion,
} from 'arvo-core';
import {
  ConfigViolation,
  createArvoResumable,
  type EventHandlerFactory,
  type IMachineMemory,
} from 'arvo-event-handler';
import { z } from 'zod';
import type { CallAgenticLLMParam, CreateAgenticResumableParams } from './types';
import type { AnyVersionedContract } from '../types';

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

const compareCollectedEventCounts = (target: Record<string, number>, current: Record<string, number>) => {
  const sumTarget = Object.values(target).reduce((acc, cur) => acc + cur, 0);
  const sumCurrent = Object.values(current).reduce((acc, cur) => acc + cur, 0);
  return sumCurrent === sumTarget;
};

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
        '1.0.0': async ({ contracts, service, input, context, collectedEvents, metadata }) => {
          if (
            service?.type &&
            Object.values(contracts.services).some((item) => item.systemError.type === service.type)
          ) {
            throw new Error(
              // biome-ignore lint/suspicious/noExplicitAny: This any is needed here
              `Something went wrong in an invoked service. Error -> ${(service.data as any)?.errorMessage}`,
            );
          }

          if (input) {
            const messages: CallAgenticLLMParam['messages'] = [
              {
                role: 'user',
                content: [{ type: 'text', content: input.data.message }],
              },
            ];

            const { toolRequests, toolTypeCount, response } = await agenticLLMCaller({
              type: 'init',
              messages,
              tools: contracts.services,
              prompts,
            });

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

            if (toolRequests) {
              for (let i = 0; i < toolRequests.length; i++) {
                if (toolRequests[i].data && typeof toolRequests[i].data === 'object') {
                  toolRequests[i].data.toolUseId$$ = toolRequests[i].id;
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

          const haveAllEventsBeenCollected = compareCollectedEventCounts(
            context.toolTypeCount,
            Object.fromEntries(
              Object.entries(collectedEvents).map(([key, evts]) => [key, (evts as Array<unknown>).length]),
            ),
          );

          if (!haveAllEventsBeenCollected) {
            return;
          }

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

          const { response, toolRequests, toolTypeCount } = await agenticLLMCaller({
            type: 'tool_results',
            messages,
            tools: contracts.services,
            prompts,
          });

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

          if (toolRequests) {
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
