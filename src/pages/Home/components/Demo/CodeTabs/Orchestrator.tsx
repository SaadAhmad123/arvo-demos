import {
  ArvoContractLearn,
  ArvoMachineLearn,
  ArvoMentalModelLearn,
  ArvoOrchestratorLearn,
} from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const OrchestratorTab: DemoCodePanel = {
  heading: 'Composing Declarative Workflows',
  description: cleanString(`
    With two event handlers in place, you're ready to orchestrate them into workflows. Orchestration in Arvo 
    means coordinating multiple handlers through events to accomplish multi-step processes. A key distinction 
    is that orchestrators in Arvo are also event handlers that emit events to other handlers and react to their 
    responses. This maintains the decoupling you've seen while enabling sophisticated coordination patterns.

    ### Orchestrator Contracts

    Orchestrators in Arvo are event handlers and require contracts like any other handler, defined using 
    [\`createArvoOrchestratorContract\`](${ArvoContractLearn.link}). The contract specifies \`init\` and \`complete\` 
    schemas - what data the workflow accepts to start and what it produces upon completion. This establishes the 
    orchestrator's interface, enabling type-safe initialization and result handling.

    **The Service Contracts**

    The state machine setup declares service contracts representing handlers this orchestrator will coordinate. 
    **Services can be simple event handlers or other orchestrators - the coordinating orchestrator doesn't distinguish 
    between them**. When coordinating another orchestrator, the parent only concerns itself with that orchestrator's 
    \`init\` and \`complete\` events, treating it as a black box. By registering contracts as services, the state 
    machine gains type-safe access to event types and schemas. When the workflow emits events to services, the 
    [\`ArvoContract\`](${ArvoContractLearn.link}) validates that event data conforms to service contracts. This 
    explicit declaration makes coordination responsibilities clear while providing compile-time and runtime safety 
    for all event emissions.

    ### State Machines for Workflow Definition

    Arvo uses state machines to define orchestration logic declaratively. The \`ArvoMachine\` builds on 
    [XState](https://xstate.js.org/docs), implementing a synchronous subset focused on states, transitions, and 
    event emissions. Instead of writing imperative coordination code, you declare what states your workflow occupies 
    and what events trigger transitions between them. This declarative approach separates workflow logic from 
    execution mechanics, making coordination explicit and self-documenting. For learning state machine concepts and 
    XState's syntax, the [XState documentation](https://xstate.js.org/docs) provides comprehensive guides. Arvo's 
    [state machine documentation](${ArvoMachineLearn.link}) covers how \`ArvoMachine\` integrates XState into the 
    event-driven paradigm.

    ### The Durable Execution Pattern

    Orchestrators in Arvo don't run continuously. They follow an emit-persist-resume cycle that's fundamental to 
    understanding how Arvo workflows operate. When an orchestrator needs another handler to execute, it emits 
    an event for that handler, saves the current workflow state, and completely releases all resources. The 
    orchestrator instance terminates. It doesn't wait for responses or hold connections.

    When the handler's response event arrives, any orchestrator instance can load the saved state and continue 
    the workflow from exactly where it stopped. The workflow appears continuous from a logical perspective, but 
    physically it's a series of start-stop executions. This pattern enables workflows spanning arbitrary durations 
    without consuming resources between events.

    The [mental model documentation](${ArvoMentalModelLearn.link}) explores this pattern's theoretical foundation and its 
    implications for distributed systems. The [orchestrator documentation](${ArvoOrchestratorLearn.link}) details the 
    execution engine that makes this pattern work reliably in production.

    ### Memory Backends for State Persistence

    Workflow state persists through the \`IMachineMemory\` interface. This abstraction lets you swap storage 
    implementations without changing orchestrator code. This example will use \`SimpleMachineMemory\` in the next
    section which is an in-memory implementation perfect for local development, testing, or small-scale applications. 
    You can provide your deployments with the memory backend of your choice by implementing the \`IMachineMemory\`
    interface. The state is JSON, so any key-value storage works.

    The memory backend handles more than just storage. It implements optimistic locking to prevent concurrent 
    executions from corrupting workflow state. Multiple orchestrator instances can exist, but only one processes 
    a specific workflow execution at any time. The [orchestrator documentation](${ArvoOrchestratorLearn.link}) covers
    memory backend requirements and implementation patterns in detail.

    ### Understanding the Example Workflow

    The example coordinates addition and product handlers to calculate an average. This is intentionally trivial 
    functionality that could easily be implemented in a single handler. The goal isn't to showcase complex technology 
    but to demonstrate Arvo's orchestration concepts clearly. By using simple arithmetic, you can focus on understanding 
    the coordination patterns rather than getting lost in business logic complexity.

    The state machine defines workflow stages as states and coordination logic as transitions. When you initialize the 
    workflow with a list of numbers, the orchestrator transitions through states, emitting events to handlers and 
    collecting their responses. The workflow emits events to both the addition and product handlers. Each handler 
    processes its event independently and emits a response. The orchestrator receives these responses as new events, 
    transitions to the next state based on which responses arrived, and eventually emits a completion event containing 
    the final result.

    Between each event, the orchestrator automatically saves state and terminates, consuming zero resources while waiting. This 
    start-stop cycle happens even in this simple example, demonstrating the pattern you can use for workflows requiring 
    human approvals, third-party integrations, or long-running batch processes. The coordination mechanism remains 
    identical regardless of workflow complexity.
  `),
  tabs: [
    {
      title: 'handlers/average.workflow.ts',
      lang: 'ts',
      code: `
import {
  ArvoErrorSchema,
  ArvoErrorType,
  createArvoOrchestratorContract,
} from 'arvo-core';
import {
  createArvoOrchestrator,
  EventHandlerFactory,
  IMachineMemory,
  MachineMemoryRecord,
  setupArvoMachine,
  xstate,
} from 'arvo-event-handler';
import z from 'zod';
import { addContract } from './add.service.ts';
import { productContract } from './product.service.ts';

// Workflow and orchestrators in Arvo are event handlers which
// emit event mid process to coordinate the workflows. Their execution
// is initiated via the init event, during the lifecycle of the
// worflow they can emit many events to different services and
// get triggered by the response events and at the end of the workflow
// they emit the complete event as the workflow output.
export const averageWorkflowContract = createArvoOrchestratorContract({
  uri: '#/org/amas/calculator/average',
  name: 'workflow.average',
  versions: {
    '1.0.0': {
      // The init schema defines the orchestrator's initial event
      init: z.object({
        numbers: z.number().array().min(2),
      }),
      // The complete schema defines the orchestrator's final event
      complete: z.object({
        success: z.boolean(),
        average: z.number().nullable(),
        errors: ArvoErrorSchema.array().nullable(),
      }),
    },
  },
});

// The ArvoMachine is integrated with the xstate
// ecosystem. This means that you can visulise the
// state machine using the xstate visualiser in your
// IDE
const machineV100 = setupArvoMachine({
  // Declare the exhaustive interface of the state machine
  // which defines the workflow
  contracts: {
    // Declare the contract for the workflow itself
    self: averageWorkflowContract.version('1.0.0'),
    // Declare the contracts of the services this workflow
    // will invoke during the lifecycle. The worflow does not
    // invoke these services directly. Rather, it emits the
    // events which may eventually invoke the service
    services: {
      add: addContract.version('1.0.0'),
      product: productContract.version('1.0.0'),
    },
  },
  types: {
    context: {} as {
      numbers: number[];
      sum: number | null;
      average: number | null;
      errors: ArvoErrorType[];
    },
  },
}).createMachine({
  id: 'machine', // Keep it like this. It is just an ID
  // Build the machine context from the init event.
  // The context is the JSON object which store the
  // workflow relevant data and preserves it durably
  // across the start-stop executions.
  context: ({ input }) => ({
    numbers: input.data.numbers,
    sum: null,
    average: null,
    errors: [],
  }),
  output: ({ context }) => ({
    average: context.average,
    errors: context.errors.length ? context.errors : null,
    success: !context.errors.length,
  }),
  initial: 'add',
  states: {
    add: {
      // This xstate function registers an
      // event to be emitted to the ArvoOrchestrator.
      // When the machine execution reaches a stable state
      // i.e. when all the transitions for the execution
      // have been carried out. The orchestrator execution engine
      // collects all these events from be emitted and emits
      // them together. The orchestrator triggers again when
      // a response event arrives and performs the next state
      // transition. This process goes on until the state machine
      // reaches the terminal state
      entry: xstate.emit(({ context }) => ({
        type: 'com.calculator.add',
        data: {
          numbers: context.numbers,
        },
      })),
      on: {
        // This declares that when the event of type (event.type) evt.calculator.add.success
        // arrives then perform this state transition
        'evt.calculator.add.success': {
          target: 'divide',
          actions: xstate.assign({ sum: ({ event }) => event.data.result }),
        },
        'sys.com.calculator.add.error': {
          target: 'error',
          actions: xstate.assign({
            errors: ({ event, context }) => [...context.errors, event.data],
          }),
        },
      },
    },
    divide: {
      entry: xstate.emit(({ context }) => ({
        type: 'com.calculator.product',
        data: {
          numbers: [context.sum ?? 0, 1 / (context.numbers.length)],
        },
      })),
      on: {
        'evt.calculator.product.success': {
          target: 'done',
          actions: xstate.assign({ average: ({ event }) => event.data.result }),
        },
        'sys.com.calculator.product.error': {
          target: 'error',
          actions: xstate.assign({
            errors: ({ event, context }) => [...context.errors, event.data],
          }),
        },
      },
    },
    done: {
      // A final state marks the terminal state of the
      // state chart and triggers the output event creation
      type: 'final',
    },
    error: {
      type: 'final',
    },
  },
});


// ArvoOrchestrator executes the state machine using the durable execution pattern.
// It emits events, persists workflow state via IMachineMemory, releases resources,
// and resumes when responses arrive. The memory backend provides pluggable storage
// (SimpleMachineMemory for dev, Redis/databases for production) with optimistic
// locking to prevent concurrent state corruption.
export const averageWorkflow: EventHandlerFactory<
  { memory: IMachineMemory<Record<string, unknown>> }
> = ({ memory }) =>
  createArvoOrchestrator({
    machines: [machineV100],
    memory: memory as IMachineMemory<MachineMemoryRecord>, // Type cast to satisfy TypeScript compiler requirements
  });
  
`,
    },
  ],
};
