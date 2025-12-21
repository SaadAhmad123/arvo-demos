import { ArvoResumableLearn } from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const ResumableTab: DemoCodePanel = {
  heading: 'Imperative Orchestration & Human In The Loop',
  description: cleanString(`
    State machines excel when workflows have well-defined states and predictable transitions. But some orchestration 
    scenarios resist declarative modeling. Workflows where the next step fundamentally depends on runtime data, 
    decisions driven by AI responses that can't be predetermined, complex conditional logic that would explode into 
    dozens of states, or dynamic parallelism where you emit N events based on input length rather than a fixed count. 
    These patterns create unwieldy state machines that obscure rather than clarify workflow logic.

    [\`ArvoResumable\`](${ArvoResumableLearn.link}) provides imperative orchestration for these scenarios. You write regular TypeScript with conditionals, 
    loops, and async/await instead of declaring states and transitions. The orchestrator executes your code, emits 
    events you return, persists the context you provide, and terminates. When response events arrive, it loads your 
    context and executes your code again. The same start-stop execution model as state machines, but with complete 
    programmatic control over coordination logic.

    ### Dynamic Parallelism

    This example demonstrates dynamic parallelism, the key scenario requiring ArvoResumable. The workflow must emit 
    product calculation events based on runtime input array length. With 3 input items, it emits 3 events. With 100 
    items, it emits 100 events. State machines cannot express this variability because they require predetermined event 
    emissions. The imperative handler simply maps over the input array and returns that many service events, adapting 
    naturally to runtime data.

    ### The Human-in-the-Loop Pattern

    The example also introduces human-in-the-loop coordination. The workflow requests human approval before processing calculations.
    This demonstrates the pattern where external systems like humans can be involved mid-process without much customization. Arvo 
    treats such interaction as event handlers, even though they may not be implemented as such. This pattern works identically in 
    both state machines and resumables. The handler emits an approval request event with \`domain: [ArvoDomain.FROM_EVENT_CONTRACT]\`, 
    which tells the orchestrator to inherit the domain from the human approval contract definition. **Events marked with 
    domains should be route outside the standard event broker flow.**

    ### Choosing Between State Machines and Resumables

    Use state machines when workflows have clear states, predictable transitions, and benefit from visualization. The 
    declarative nature makes complex coordination explicit and accessible to non-technical stakeholders. Use resumables 
    when workflow paths depend on runtime conditions you cannot predetermine, when you need dynamic parallelism adapting 
    to input data, when AI drives decisions that emerge during execution, or when complex iteration logic resists state 
    modeling.

    Both orchestration approaches share identical foundations, contracts, memory backends, testing patterns, and 
    operational characteristics. State machines and resumables are interchangeable from the system's perspective. Choose 
    based on how naturally your workflow expresses as declarative states versus imperative logic.
  `),
  tabs: [
    {
      title: 'handlers/weighted.average.resumable.ts',
      lang: 'ts',
      code: `
import {
  createArvoOrchestratorContract,
  InferVersionedArvoContract,
  VersionedArvoContract,
} from 'arvo-core';
import z from 'zod';
import { cleanString } from 'arvo-core';
import {
  ArvoDomain,
  createArvoResumable,
  EventHandlerFactory,
  IMachineMemory,
} from 'arvo-event-handler';
import { addContract } from './add.service.ts';
import { productContract } from './product.service.ts';
import { humanApprovalContract } from './human.approval.contract.ts';

export const weightedAverageContract = createArvoOrchestratorContract({
  uri: '#/org/amas/resumable/weighted_average',
  name: 'weighted.average',
  description: "A service which calculates the weighted average of the input",
  versions: {
    '1.0.0': {
      init: z.object({
        input: z.object({
          value: z.number(),
          weight: z.number().min(0).max(1),
        }).array().min(2),
      }),
      complete: z.object({
        output: z.number().nullable(),
      }),
    },
  },
});

export const weightedAverageResumable: EventHandlerFactory<
  { memory: IMachineMemory<Record<string, unknown>> }
> = ({ memory }) =>
  createArvoResumable({
    contracts: {
      self: weightedAverageContract,
      services: {
        add: addContract.version('1.0.0'),
        product: productContract.version('1.0.0'),
        humanApproval: humanApprovalContract.version('1.0.0'),
      },
    },
    memory,
    executionunits: 0,

    types: {
      context: {} as {
        currentSubject: string;
        inputItems: InferVersionedArvoContract<
          VersionedArvoContract<typeof weightedAverageContract, '1.0.0'>
        >['accepts']['data']['input'];
        humanApproval: boolean | null;
        isWaitingAllProducts: boolean;
      },
    },

    handler: {
      '1.0.0': async ({
        input,
        context,
        service,
        collectedEvents,
      }) => {
        if (input) {
          return {
            // Build the durable context
            context: {
              currentSubject: input.subject,
              inputItems: input.data.input,
              humanApproval: null,
              isWaitingAllProducts: false,
            },
            // Emit events
            services: [
              {
                type: 'com.human.approval' as const,
                domain: [ArvoDomain.FROM_EVENT_CONTRACT],
                data: {
                  prompt: cleanString(\`
                    To calculate the weighted average we will
                    emit \${input.data.input.length} events to generate
                    the products and then emit add event to add them all
                    and then emit a final product event to calculate 
                    average and then emit the final output event. 
                    
                    Do you approve?
                  \`),
                },
              },
            ],
          };
        }

        if (!context) {
          throw new Error('Context not set. Something went wrong...');
        }

        // Circut breaker pattern for system errors
        if (
          service?.type === 'sys.com.calculator.add.error' ||
          service?.type === 'sys.com.calculator.product.error' ||
          service?.type === 'sys.com.human.approval.error'
        ) {
          throw new Error(\`Something went wrong. \${service.data.errorMessage}\`);
        }

        if (service?.type === 'evt.human.approval.success') {
          if (!service.data.approval) {
            throw new Error('Unable to obtain human approval');
          }

          return {
            context: {
              ...context,
              humanApproval: service.data.approval,
              isWaitingAllProducts: true,
            },

            // Emit events based on input
            services: context.inputItems.map(({ value, weight }) => ({
              type: 'com.calculator.product' as const,
              data: {
                numbers: [value, weight],
              },
            })),
          };
        }

        if (context.isWaitingAllProducts) {
          // The resumable automatically collects events
          if (
            (collectedEvents['evt.calculator.product.success']?.length ?? 0) !==
              context.inputItems.length
          ) {
            return;
          }

          return {
            context: {
              ...context,
              isWaitingAllProducts: false,
            },
            services: [{
              type: 'com.calculator.add' as const,
              data: {
                numbers:
                  (collectedEvents['evt.calculator.product.success'] ?? []).map(
                    (item) => item.data.result,
                  ),
              },
            }],
          };
        }

        if (service?.type === 'evt.calculator.add.success') {
          return {
            services: [{
              type: 'com.calculator.product' as const,
              data: {
                numbers: [service.data.result, 1 / context.inputItems.length],
              },
            }],
          };
        }

        if (service?.type === 'evt.calculator.product.success') {
          return {
            output: {
              output: service.data.result,
            },
          };
        }
      },
    },
  });


  
`,
    },
    {
      title: 'handlers/human.approval.contract.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import z from 'zod';

export const humanApprovalContract = createSimpleArvoContract({
  uri: '#/org/amas/external/human_approval',
  type: 'human.approval',
  domain: 'human.interaction',
  description:
    'This is a service which gets approval from the human based on the provided prompt',
  versions: {
    '1.0.0': {
      accepts: z.object({
        prompt: z.string(),
      }),
      emits: z.object({
        approval: z.boolean(),
      }),
    },
  },
});

      `,
    },
  ],
};
