import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const GreetingOrchestratorTab: DemoCodePanel = {
  heading: 'Composing Declarative Workflows',
  description: cleanString(`
    With two event handlers in place, you're ready to orchestrate them into a cohesive workflow. This 
    example demonstrates a simple workflow that accepts a name and age, triggers both handlers in 
    parallel through event emission, and collates the results. It showcases how to build scalable 
    workflows that start simple and adapt to any deployment model.

    ## Event-Driven Composition

    Individual event handlers in Arvo are intentionally narrow in scope, performing one job with strict 
    boundaries. Their strength emerges through composition into larger workflows. Built on functional, 
    event-driven, and distributed principles, Arvo handlers communicate exclusively through events 
    rather than direct function or API calls, ensuring loose coupling and composability.

    ## State Machine-Based Orchestration

    Arvo employs state machine-based orchestration as a powerful composition pattern. An orchestrator 
    (implemented as \`ArvoOrchestrator\` for execution state machines) is itself an event handler that 
    consumes events, calculates the next workflow state, and emits new events accordingly. Unlike 
    centralized frameworks, Arvo treats orchestrators as specialized event handlers that remain cohesive 
    and decoupled.

    Arvo builds on [Stately's **XState**](https://stately.ai/docs), a robust functional state machine 
    library with comprehensive ecosystem support including visualization tools. Arvo extends XState with 
    three key components:

    **ArvoMachine**: A declarative state machine created via \`setupArvoMachine(...)\` and 
    \`createMachine(...)\` that declares event contracts without calling handlers directly. The machine 
    assumes each declared contract has a participating handler in the pipeline, keeping the state 
    machine purely declarative while execution is handled by the orchestrator runtime.

    **createArvoOrchestratorContract**: Generates orchestrator contracts with meaningful default event 
    names and lifecycle fields for streamlined workflow management.

    **ArvoOrchestrator**: A runtime created with \`createArvoOrchestrator\` that registers machine 
    definitions, manages lifecycle, persists state via the \`IMachineMemory\` interface, and tracks 
    execution cost through \`executionunits\`.

    ## Understanding This Example

    This orchestrator demonstrates parallel event processing through a state machine. When initialized 
    with a name and age, the machine enters a parallel state that simultaneously emits two events: one 
    to the greeting handler with the name, and another to the addition handler to calculate age plus 
    seven. The machine waits for both responses, handling success or error outcomes for each. Once both 
    operations complete, it collates the results into a final output message. This pattern showcases 
    how orchestrators coordinate multiple handlers without direct coupling, relying entirely on 
    event-based communication.

    ## Architectural Significance

    The combination of \`ArvoMachine\` and \`ArvoOrchestrator\` represents a fundamental shift in event-driven 
    architecture orchestration. Together, they create orchestrators that function as standard event 
    handlers within your system. Orchestrators register with the same event broker, communicate through 
    the same event contracts, and follow identical execution patterns as any other handler. There's no 
    special orchestration layer, no centralized control plane, and no architectural distinction between 
    workers and orchestrators.

    This uniformity unlocks significant flexibility. You can compose orchestrators within orchestrators, 
    creating hierarchical workflows where each level remains independently testable and deployable. You 
    can start with a simple orchestrator running locally, then deploy it to serverless infrastructure 
    without modifying workflow code. You can version, test, and roll back orchestrators using the same 
    patterns as your business logic handlers. In Arvo, **the orchestrator participates in the system 
    rather than controlling it**, emitting events that other handlers respond to, creating truly 
    distributed and loosely coupled architecture.
  `),
  tabs: [
    {
      title: 'handlers/greeting.orchestrator.ts',
      lang: 'ts',
      code: `
import { ArvoErrorSchema, createArvoOrchestratorContract, type ArvoErrorType } from 'arvo-core';
import {
  createArvoOrchestrator,
  type EventHandlerFactory,
  type IMachineMemory,
  type MachineMemoryRecord,
  setupArvoMachine,
  xstate,
} from 'arvo-event-handler';
import { z } from 'zod';
import { addContract } from './add.handler';
import { greetingContract } from './greeting.handler';

/**
 * Orchestrator Contract Definition
 *
 * createArvoOrchestratorContract is a specialized utility that automatically:
 * - Generates standardized orchestrator event types (e.g., 'arvo.orc.greeting')
 * - Provides init/complete lifecycle management for orchestrator workflows
 *
 * This abstraction simplifies orchestrator development while maintaining full type safety
 * and event traceability across complex workflows.
 */
export const greetingOrchestratorContract = createArvoOrchestratorContract({
  uri: '#/demo/orc/greeting',
  name: 'greeting', // Generates type: 'arvo.orc.greeting' with 'arvo.orc.' prefix
  versions: {
    '1.0.0': {
      init: z.object({
        name: z.string(),
        age: z.number(),
      }),
      complete: z.object({
        errors: ArvoErrorSchema.array().min(1).nullable(),
        result: z.string().nullable(),
      }),
    },
  },
});

/**
 * State Machine Definition
 *
 * This XState machine is optimized for Arvo's event-driven architecture:
 * - Uses setupArvoMachine for contract-aware type safety
 * - Integrates with Arvo's event routing and error handling
 * - Compatible with XState ecosystem tools (VSCode visualizer, inspector, etc.)
 *
 * > In VSCode, download the xstate visualiser extenstion and a 'Open Visual Editor'
 * > button will appear below
 *
 * Key limitation: Async XState features (actors, promises) are not supported
 * in Arvo orchestrators due to the event-driven execution model. Please, follow
 * xstate documentation to learn more about this xstate state machine definition
 *
 */
export const greetingMachineV100 = setupArvoMachine({
  contracts: {
    self: greetingOrchestratorContract.version('1.0.0'),
    services: {
      greeting: greetingContract.version('1.0.0'),
      adder: addContract.version('1.0.0'),
    },
  },
  types: {
    context: {} as {
      name: string;
      age: number;
      greeting: string | null;
      updatedAge: number | null;
      errors: ArvoErrorType[];
    },
  },
}).createMachine({
  id: 'greetingMachine',
  context: ({ input }) => ({
    name: input.data.name,
    age: input.data.age,
    greeting: null,
    updatedAge: null,
    errors: [],
  }),
  output: ({ context }) => ({
    errors: context.errors.length ? context.errors : null,
    result: context.errors.length ? null : \`Greeting -> \${context.greeting}, Updated Age -> \${context.updatedAge}\`,
  }),
  initial: 'process',
  states: {
    process: {
      type: 'parallel', // Enables concurrent execution of greeting and math operations
      states: {
        greet: {
          initial: 'init',
          states: {
            init: {
              // Emit event to greeting service using xstate.emit for Arvo integration
              entry: xstate.emit(({ context }) => ({
                type: 'com.greeting.create',
                data: {
                  name: context.name,
                },
              })),
              on: {
                'evt.greeting.create.success': {
                  target: 'done',
                  actions: xstate.assign({ greeting: ({ event }) => event.data.greeting }),
                },
                'sys.com.greeting.create.error': {
                  actions: xstate.assign({ errors: ({ event, context }) => [...context.errors, event.data] }),
                  target: '#greetingMachine.error', // Global error state reference
                },
              },
            },
            done: {
              type: 'final',
            },
          },
        },
        add: {
          initial: 'init',
          states: {
            init: {
              // Emit event to calculator service with age + 7 calculation
              entry: xstate.emit(({ context }) => ({
                type: 'com.calculator.add',
                data: {
                  numbers: [7, context.age],
                },
              })),
              on: {
                'evt.calculator.add.success': {
                  target: 'done',
                  actions: xstate.assign({ updatedAge: ({ event }) => event.data.result }),
                },
                'sys.com.calculator.add.error': {
                  target: '#greetingMachine.error',
                  actions: xstate.assign({ errors: ({ context, event }) => [...context.errors, event.data] }),
                },
              },
            },
            done: {
              type: 'final',
            },
          },
        },
      },
      onDone: {
        target: 'done', // Triggered when both parallel states reach 'done'
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

/**
 * Orchestrator Event Handler Factory
 *
 * Creates an ArvoOrchestrator that provides:
 * - Runtime execution environment for XState machines
 * - Built-in event routing and correlation logic
 * - State persistence capability (configurable via IMachineMemory interface)
 * - Version-aware machine deployment and lifecycle management
 *
 * Production considerations:
 * - Memory interface can be replaced with persistent storage (Redis, Database, etc.)
 * - Multiple machine versions can coexist for zero-downtime deployments
 * - Missing machine versions will won't prevent deployment (this is only special to this event
 *   handler so please be mindful)
 */
export const greetingOrchestrator: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoOrchestrator({
    machines: [greetingMachineV100],
    memory: memory as unknown as IMachineMemory<MachineMemoryRecord>,
    executionunits: 0, // Base cost - can be dynamic based on machine complexity
  });


  
`,
    },
  ],
};
