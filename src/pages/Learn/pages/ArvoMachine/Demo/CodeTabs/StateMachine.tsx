import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const StateMachine: DemoCodePanel = {
  heading: 'The State Machine',
  description: cleanString(`
    This state machine unifies all contracts and handlers from previous sections into 
    a declarative workflow that demonstrates multi-step coordination through explicit, 
    visualizable state definitions.

    The workflow begins with human approval, emitting a domained event that inherits 
    its domain symbolically from the contract via \`ArvoDomain.FROM_EVENT_CONTRACT\`. Notice 
    that domains can be provided as an array, enabling event broadcasting to multiple domains 
    simultaneously—a powerful pattern for complex routing scenarios. This state demonstrates 
    how state machines integrate external interactions without blocking execution. The machine 
    emits an event and declares what transition to perform when the eventual human response arrives.
    This pattern makes long-running, external or human-in-the-loop like workflows feel natural 
    rather than exceptional.

    The calculation state leverages [XState's parallel](https://stately.ai/docs/parallel-states) capabilities to orchestrate sum and product 
    handlers simultaneously. Each branch emits its respective event and declares that when completion 
    or error events arrive, specific transitions should occur. Importantly, **the orchestrator does 
    not wait**. It emits events, stores its state via the \`ArvoOrchestrator\` and storage implementation 
    of \`IMachineMemory\`, releases all resources, and becomes dormant. When new events arrive, 
    the orchestrator starts again from its persisted state, continuing the workflow. This 
    start-stop model ensures resource efficiency and horizontal scalability.

    Error handling operates at multiple levels. Individual service failures in parallel states and 
    human approval rejections both transition to the error state. The output function aggregates context 
    into the contractually-defined complete schema, ensuring type safety from machine definition 
    through event emission to final result.

    This definition serves as both executable code and living documentation. Throughout this implementation several XState concepts are leveraged including 
    [context](https://stately.ai/docs/context) building via [input](https://stately.ai/docs/input), 
    [output](https://stately.ai/docs/output) event building where XState returns the final object 
    that \`ArvoOrchestrator\` converts into a contract-compliant event, 
    [actions](https://stately.ai/docs/actions) including context 
    [assignment](https://stately.ai/docs/context#updating-context-with-assign), 
    event [emission](https://stately.ai/docs/event-emitter), 
    and [guard](https://stately.ai/docs/guards) statements that control flow based on 
    human approval responses. These capabilities create a visual workflow compatible with 
    [XState tools](https://stately.ai/docs/xstate-vscode-extension) while remaining fully integrated
     with Arvo's event-driven environment.
 `),
  tabs: [
    {
      title: 'orchestrator.demo/machine.V100.ts',
      lang: 'ts',
      code: `
import { ArvoDomain, setupArvoMachine, xstate } from 'arvo-event-handler';
import { demoOrchestratorContract } from './contract.js';
import { addContract } from '../add.service.js';
import { productContract } from '../product.service.js';
import { humanApprovalContract } from '../human.approval.contract.js';
import type { ArvoErrorType } from 'arvo-core';

// Setup the machine with contracts for type safety and intellisense
// The 'self' contract binds the machine to its orchestrator contract
// 'services' maps other contracts that this machine will interact with
export const demoMachineV100 = setupArvoMachine({
  contracts: {
    self: demoOrchestratorContract.version('1.0.0'),
    services: {
      sum: addContract.version('1.0.0'),
      product: productContract.version('1.0.0'),
      approval: humanApprovalContract.version('1.0.0'),
    },
  },
  types: {
    // Defining the type of the context for better typescript experience
    context: {} as {
      currentSubject: string;
      values: number[];
      sum: number | null;
      product: number | null;
      errors: ArvoErrorType[];
    },
  },
}).createMachine({
  id: 'demoMachineV100',
  
  // Initialize context from the incoming event's input data
  // This runs once when the machine first starts
  // Context holds workflow state across multiple execution cycles
  context: ({ input }) => ({
    currentSubject: input.subject,
    values: input.data.values,
    errors: [],
    sum: null,
    product: null,
  }),
  
  // Transform final context into the contract's output schema
  // Runs when machine reaches a final state
  // ArvoOrchestrator will convert this object into the completion event
  output: ({ context }) => {
    if (context.errors.length) {
      return {
        errors: context.errors,
        sum: null,
        product: null,
        success: false,
        result: null,
      };
    }
    return {
      errors: null,
      sum: context.sum,
      product: context.product,
      success: true,
      result: context.sum === null || context.product === null ? null : context.sum / context.product,
    };
  },
  
  // The initial state of the machine
  initial: 'humanApproval',
  
  // State definitions
  states: {
    humanApproval: {
      // Entry action: emit human approval request on entering this state
      // Domain inheritance happens here via ArvoDomain.FROM_EVENT_CONTRACT
      // This becomes available in onDomainedEvents callback for external handling
      entry: xstate.emit({
        type: 'com.human.approval',
        data: {
          prompt: 'Please provide approval for further execution',
        },
        // Automatically inherit the domain from the contract definition
        domain: [ArvoDomain.FROM_EVENT_CONTRACT],
      }),
      
      // Declare transitions based on events that will arrive later
      // The machine will become dormant after emission and resume when events arrive
      on: {
        'evt.human.approval.success': [
          {
            // Guard checks the approval boolean from human response
            guard: ({ event }) => event.data.approval,
            description: 'Human provides approval',
            target: 'calculation',
          },
          {
            description: 'Human rejects approval',
            // Rejection path accumulates errors and moves to error state
            actions: xstate.assign({
              errors: ({ context }) => [
                ...context.errors,
                {
                  errorMessage: 'Unable to obtain human approval',
                  errorName: 'NoHumanApproval',
                  errorStack: '',
                },
              ],
            }),
            target: 'error',
          },
        ],
        'sys.com.human.approval.error': {
          actions: xstate.assign({ errors: ({ context, event }) => [...context.errors, event.data] }),
          target: 'error',
        },
      },
    },
    
    // Parallel state runs addition and multiplication simultaneously
    // Both branches must reach their 'done' final state before triggering onDone
    // This demonstrates concurrent event-driven coordination
    calculation: {
      type: 'parallel',
      states: {
        addition: {
          initial: 'execute',
          states: {
            execute: {
              // Emit calculation event to external handler
              // State persists after emission, machine becomes dormant
              // When evt.calculator.add.success arrives, machine resumes here
              entry: xstate.emit(({ context }) => ({
                type: 'com.calculator.add',
                data: {
                  numbers: context.values,
                },
              })),
              
              // Declare expected response events
              on: {
                'evt.calculator.add.success': {
                  actions: xstate.assign({ sum: ({ event }) => event.data.result }),
                  target: 'done',
                },
                'sys.com.calculator.add.error': {
                  actions: xstate.assign({ errors: ({ context, event }) => [...context.errors, event.data] }),
                  // Error path uses root target (#demoMachineV100.error) for global error state
                  // This is necessary because nested parallel states don't have error state visibility
                  target: '#demoMachineV100.error',
                },
              },
            },
            
            // Final state signals completion for this parallel branch
            done: {
              type: 'final',
            },
          },
        },
        
        multiplication: {
          initial: 'execute',
          states: {
            execute: {
              entry: xstate.emit(({ context }) => ({
                type: 'com.calculator.product',
                data: {
                  numbers: context.values,
                },
              })),
              on: {
                'evt.calculator.product.success': {
                  actions: xstate.assign({ product: ({ event }) => event.data.result }),
                  target: 'done',
                },
                'sys.com.calculator.product.error': {
                  actions: xstate.assign({ errors: ({ context, event }) => [...context.errors, event.data] }),
                  target: '#demoMachineV100.error',
                },
              },
            },
            done: {
              type: 'final',
            },
          },
        },
      },
      
      // onDone triggers when all parallel branches complete
      // Transitions to final 'done' state for workflow completion
      onDone: {
        target: 'done',
      },
    },
    
    done: {
      type: 'final',
    },
    
    error: {
      type: 'final',
    },
  },
});

     `,
    },
  ],
};
