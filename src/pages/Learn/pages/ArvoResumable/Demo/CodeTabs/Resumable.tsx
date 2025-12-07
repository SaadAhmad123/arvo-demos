import { ArvoMachineLearn, ArvoOrchestratorLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const Resumable: DemoCodePanel = {
  heading: 'The Resumable',
  description: cleanString(`
    \`ArvoResumable\` is the imperative alternative to state machine orchestration in Arvo. While 
    \`ArvoMachine\` and \`ArvoOrchestrator\` use the same start-stop execution model internally, their 
    declarative nature abstracts it away. With \`ArvoResumable\`, you work directly with this model, 
    trading declarative simplicity for complete control over workflow logic. You experience the 
    resumption pattern firsthand, which is exactly why it's called \`ArvoResumable\`. This makes it the 
    most powerful orchestration tool in Arvo, and with that power comes the responsibility to 
    use it judiciously.

    ## Start-Stop Differs from Checkpointing

    The existing workflow engines like [Temporal](https://temporal.io) and [LangGraph](https://www.langchain.com/langgraph) use 
    implicit checkpointing. You write code that appears synchronous, and the framework automatically 
    saves execution state at specific points. This provides excellent developer ergonomics but 
    couples your orchestration to their specific infrastructure.

    Arvo takes a different approach. Your handler is a pure function that receives the current event 
    and context, then returns the new context and events to emit. Between executions, the orchestrator 
    persists only this context, the absolute minimum state needed to logically resume when the next 
    event arrives. You're not saving execution snapshots. You're saving logical data that answers 
    "where was I and what do I need to continue?" This could be as simple as a step counter or as 
    complex as accumulated results from dozens of parallel operations. **The key is you decide what 
    matters for resumption, not the framework**. This minimal state approach keeps Arvo completely 
    infrastructure agnostic. Your context serializes to JSON and gets stored wherever you configure
    the \`memory\` of the resumable to be.

    ## Working with the Resumable

    The contracts and memory setup work exactly like \`ArvoMachine\` from the 
    [${ArvoMachineLearn.name}](${ArvoMachineLearn.link}) 
    and \`ArvoOrchestrator\` from the [${ArvoOrchestratorLearn.name}](${ArvoOrchestratorLearn.link}) 
    sections. The handler versioning pattern should feel familiar from \`ArvoEventHandler\`, you define version-specific 
    handler functions.

    **What your handler receives on each execution?**

    - **input** appears only when initializing a new workflow instance
    - **context** holds your persisted workflow state between executions
    - **service** contains the service response event that triggered this resume
    - **collectedEvents** is a map organizing all received events by type, perfect for tracking parallel operations
    - **span** gives you OpenTelemetry integration for logging and distributed tracing

    **What your handler can return?**

    Your handler returns an object with up to three optional properties. 
    
    - The \`context\` property updates your workflow state for the next execution. 
    - The \`services\` property is an array of events to emit that will trigger other handlers or services. 
    - The \`output\` property validates against the resumable's self contract and completes the workflow, marking 
      it as done. 
    
    You can return any combination of these three properties depending on what your workflow needs at 
    that moment. You can also return nothing at all to preserve the current state and wait for the 
    next event, this is the implicit wait pattern to use when coordinating parallel 
    operations.

    Here's where it gets interesting. Your handler is essentially a state machine, but instead of 
    declaring states upfront, you write the transitions as conditional logic. Each execution asks 
    "what event just arrived?" and "what state am I in?", then decides what happens next. When you 
    emit service events and suspend, the orchestrator terminates completely. Zero resources consumed. 
    Hours or days could pass. When responses arrive, any available instance loads your context and 
    picks up exactly where you left off.

    ## About this example

    This example coordinates five distinct phases. First, it requests human approval and 
    goes dormant. When approval arrives, it dynamically emits parallel calculations based on the input 
    array length (3 items means 3 events, 100 items means 100 events). Then it waits, checking the 
    collected events map until all results arrive. Finally, it aggregates, calculates the average, 
    and completes. Notice there's no state machine definition, no graph configuration, just imperative
    coding patterns with explicit state management. This is imperative orchestration.
  `),
  tabs: [
    {
      title: 'resumable.demo/index.ts',
      lang: 'ts',
      code: `
import {
  InferVersionedArvoContract,
  VersionedArvoContract,
} from 'arvo-core';
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
import { weightedAverageContract } from './contract.ts'

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
        inputItems: InferVersionedArvoContract
          VersionedArvoContract<typeof weightedAverageContract, '1.0.0'>
        >['accepts']['data']['input'];
        humanApproval: boolean | null;
        isWaitingAllProducts: boolean;
      },
    },
    handler: {
      '1.0.0': async ({ input, context, service, collectedEvents, span }) => {
        // PHASE 1: Initialization - request human approval
        if (input) {
          return {
            context: {
              currentSubject: input.subject,
              inputItems: input.data.input,
              humanApproval: null,
              isWaitingAllProducts: false,
            },
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

        // PHASE 2: Error Handling - circuit break on service failures
        if (
          service?.type === 'sys.com.calculator.add.error' ||
          service?.type === 'sys.com.calculator.product.error' ||
          service?.type === 'sys.com.human.approval.error'
        ) {
          throw new Error(\`Something went wrong. \${service.data.errorMessage}\`);
        }

        // PHASE 3: Approval Response - emit parallel product calculations
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
            services: context.inputItems.map(({ value, weight }) => ({
              type: 'com.calculator.product' as const,
              data: { numbers: [value, weight] },
            })),
          };
        }

        // PHASE 4: Event Aggregation - wait for all parallel results
        if (context.isWaitingAllProducts) {
          // Wait until all product calculations complete
          if (
            (collectedEvents['evt.calculator.product.success']?.length ?? 0) !==
              context.inputItems.length
          ) {
            return; // Implicit wait - preserves context and suspends
          }
          
          // All results received - sum them up
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

        // PHASE 5: Calculate final average
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

        // PHASE 6: Workflow completion
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
  ],
};
