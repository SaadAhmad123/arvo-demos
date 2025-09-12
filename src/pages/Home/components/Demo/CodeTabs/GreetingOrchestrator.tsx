import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../types';

export const GreetingOrchestratorTab: DemoCodePanel = {
  heading: 'Composing Declarative Workflows',
  description: cleanString(`
    Simple event handlers in Arvo are intentionally narrow in scope—they perform one job 
    with strict boundaries. Their real strength emerges when they are composed into larger 
    workflows. Since Arvo is built on functional, event-driven, and distributed principles, 
    handlers cannot directly call each other like functions or APIs. Instead, they 
    communicate exclusively through events, ensuring loose coupling and composability.

    One powerful composition pattern in Arvo is **state machine–based orchestration**. 
    An orchestrator is itself an event handler: it consumes events, calculates the next 
    workflow state, and emits new events accordingly. Unlike centralized orchestration 
    frameworks, Arvo treats orchestrators as specialized event handlers that remain cohesive 
    and decoupled.

    To support this, Arvo builds on [Stately’s **XState**](https://stately.ai/docs), 
    a best-in-class functional state machine library with strong ecosystem support 
    (e.g., visualization tools). On top of this, Arvo introduces:
    - \`ArvoMachine\`: a declarative state machine that **extends XState**, defined via 
      \`setupArvoMachine(...)\` and \`createMachine(...)\`. Notice that the machine **declares the 
      contracts of the events it handles** but does not call these handlers directly. The 
      assumption is that each declared contract has a handler participating in the pipeline. 
      The state machine itself is purely declarative—execution is handled by the orchestrator 
      runtime.
    - \`createArvoOrchestratorContract\`: generates orchestrator contracts with meaningful 
      default event names and lifecycle fields.
    - \`ArvoOrchestrator\`: a runtime created with \`createArvoOrchestrator\` that registers 
      machine definitions, manages lifecycle, persists state via the \`IMachineMemory\` 
      interface, and tracks execution cost through \`executionunits\`.

    In this example, the \`ArvoMachine\` declares both its own contract and the service contracts 
    it coordinates. The orchestrator runtime then drives execution, providing composability, 
    type safety, persistence, versioning, and cost monitoring out of the box.

    While the example here is simple, orchestrators in Arvo can express rich, production-grade 
    workflows. More advanced examples are explored in the dedicated documentation.

    > **Note:** This example is intentionally minimal for demonstration purposes.  
    > It’s meant to help you get acquainted with Arvo’s concepts in a getting-started 
    > scenario. Practical and complex workflows are covered later in the documentation.
  `),
  tabs: [
    {
      title: 'handlers/greeting.orchestrator.ts',
      lang: 'ts',
      code: `
import {
  ArvoErrorSchema,
  createArvoOrchestratorContract,
  type ArvoErrorType,
} from 'arvo-core';
import {
  createArvoOrchestrator,
  type EventHandlerFactory,
  type IMachineMemory,
  type MachineMemoryRecord,
  setupArvoMachine,
  xstate,
} from 'arvo-event-handler';
import { z } from 'zod';
import { addContract } from './add.handler.ts';
import { greetingContract } from './greeting.handler.ts';

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
