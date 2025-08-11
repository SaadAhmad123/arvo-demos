import {
  ArvoErrorSchema,
  createArvoEventFactory,
  createArvoOrchestratorContract,
  createSimpleArvoContract,
  type ArvoErrorType,
} from 'arvo-core';
import { z } from 'zod';
import {
  createArvoEventHandler,
  createArvoOrchestrator,
  createArvoResumable,
  createSimpleEventBroker,
  type EventHandlerFactory,
  type IMachineMemory,
  type MachineMemoryRecord,
  setupArvoMachine,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { assign, emit } from 'xstate';

// Phase 1 of the example - Define an add service
export const addContract = createSimpleArvoContract({
  uri: '#/handler/calculator/add',
  type: 'calculator.add',
  description: 'This service provides the sum of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
      emits: z.object({
        result: z.number(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
    },
  },
});

export const addService: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: addContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.calculator.add.success',
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc + cur, 0),
            toolUseId: event.data.toolUseId,
          },
        };
      },
    },
  });

// This is an example runner for your understanding
export const runPhase1 = async () => {
  const { resolve } = createSimpleEventBroker([addService()]);
  const addEvent = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      numbers: [1, 2, 3],
    },
  });
  const resolvedEvent = await resolve(addEvent);
  console.log(resolvedEvent?.data); // { result: 6 }
  return resolvedEvent;
};

// Phase 2 - Define a machine orchrestraotr
const processMachineContract = createArvoOrchestratorContract({
  uri: '#/example/process/machine',
  name: 'machine.process',
  versions: {
    '1.0.0': {
      init: z.object({
        numbers: z.number().array(),
      }),
      complete: z.object({
        success: z.boolean(),
        result: z.number().nullable(),
        error: ArvoErrorSchema.array(),
      }),
    },
    '2.0.0': {
      init: z.object({
        numbers: z.number().array(),
      }),
      complete: z.object({
        success: z.boolean(),
        result: z.number().nullable(),
        error: ArvoErrorSchema.array(),
      }),
    },
  },
});

// This is a workflow for demonstration purposes - only.
// Practically, this may not need a workflow as it is simple addition
const processMachineV100 = setupArvoMachine({
  contracts: {
    self: processMachineContract.version('1.0.0'),
    services: {
      add: addContract.version('1.0.0'),
    },
  },
  types: {
    context: {} as {
      dataToAdd: number[];
      additionResult: number | null;
      error: ArvoErrorType[];
    },
  },
}).createMachine({
  id: 'processMachineV100',
  context: ({ input }) => ({
    dataToAdd: input.data.numbers,
    additionResult: null,
    error: [],
  }),
  output: ({ context }) => ({
    success: context.additionResult !== null,
    result: context.additionResult,
    error: context.error,
  }),
  initial: 'add',
  states: {
    add: {
      entry: emit(({ context }) => ({
        type: 'com.calculator.add',
        data: {
          numbers: context.dataToAdd,
        },
      })),
      on: {
        'evt.calculator.add.success': {
          actions: assign({ additionResult: ({ event }) => event.data.result }),
          target: 'done',
        },
        'sys.com.calculator.add.error': {
          actions: assign({ error: ({ context, event }) => [...context.error, event.data] }),
          target: 'error',
        },
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

const processMachineOrchestratorV100: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoOrchestrator({
    executionunits: 0,
    memory: memory as IMachineMemory<MachineMemoryRecord>,
    machines: [processMachineV100],
  });

// This is an example runner for your understanding
export const runPhase2 = async () => {
  const memory = new SimpleMachineMemory();
  const { resolve } = createSimpleEventBroker([addService(), processMachineOrchestratorV100({ memory })]);
  const inputEvent = createArvoEventFactory(processMachineContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      numbers: [1, 2, 3],
    },
  });
  const resolvedEvent = await resolve(inputEvent);
  console.log(resolvedEvent?.data); // { result: 6 }
  return resolvedEvent;
};

// For Phase 3 of the example lets get the average in the result of the process.
// We need multiplier service
export const multiplyContract = createSimpleArvoContract({
  uri: '#/handler/calculator/multiply',
  type: 'calculator.multiply',
  description: 'This service provides the scalar product of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
        toolUseId: z.string().optional(),
      }),
      emits: z.object({
        result: z.number(),
        toolUseId: z.string().optional(),
      }),
    },
  },
});

export const multiplyService: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: multiplyContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.calculator.multiply.success',
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc * cur, 1),
            toolUseId: event.data.toolUseId,
          },
        };
      },
    },
  });

// Lets create version 2 of the process machine to also demonstract versioning and A/B testing
// It is verbose - yes but it is very reliables and production safe way of updating functionality
// This is a workflow for demonstration purposes - only.
// Practically, this may not need a workflow as it is simple addition
const processMachineV200 = setupArvoMachine({
  contracts: {
    self: processMachineContract.version('2.0.0'),
    services: {
      add: addContract.version('1.0.0'),
      multiply: multiplyContract.version('1.0.0'),
    },
  },
  types: {
    context: {} as {
      dataToAdd: number[];
      additionResult: number | null;
      averageResult: number | null;
      error: ArvoErrorType[];
    },
  },
}).createMachine({
  id: 'processMachineV100',
  context: ({ input }) => ({
    dataToAdd: input.data.numbers,
    additionResult: null,
    averageResult: null,
    error: [],
  }),
  output: ({ context }) => ({
    success: context.averageResult !== null,
    result: context.averageResult,
    error: context.error,
  }),
  initial: 'add',
  states: {
    add: {
      entry: emit(({ context }) => ({
        type: 'com.calculator.add',
        data: {
          numbers: context.dataToAdd,
        },
      })),
      on: {
        'evt.calculator.add.success': {
          actions: assign({ additionResult: ({ event }) => event.data.result }),
          target: 'average',
        },
        'sys.com.calculator.add.error': {
          actions: assign({ error: ({ context, event }) => [...context.error, event.data] }),
          target: 'error',
        },
      },
    },
    average: {
      entry: emit(({ context }) => {
        if (context.additionResult === null) throw new Error('Unable to get addition result. Workflow is faulty.');
        return {
          type: 'com.calculator.multiply',
          data: {
            numbers: [context.additionResult, 1 / context.dataToAdd.length],
          },
        };
      }),
      on: {
        'evt.calculator.multiply.success': {
          actions: assign({ averageResult: ({ event }) => event.data.result }),
          target: 'done',
        },
        'sys.com.calculator.multiply.error': {
          actions: assign({ error: ({ context, event }) => [...context.error, event.data] }),
          target: 'error',
        },
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

const processMachineOrchestratorAllVersions: EventHandlerFactory<{
  memory: IMachineMemory<Record<string, unknown>>;
}> = ({ memory }) =>
  createArvoOrchestrator({
    executionunits: 0,
    memory: memory as IMachineMemory<MachineMemoryRecord>,
    machines: [processMachineV100, processMachineV200],
  });

// This is an example runner for your understanding
export const runPhase3 = async () => {
  const memory = new SimpleMachineMemory();
  const inputEventV100 = createArvoEventFactory(processMachineContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      numbers: [1, 2, 3],
    },
  });
  const resolvedEventV100 = await createSimpleEventBroker([
    addService(), // Even tho one of the versions of the process machine needs multiply service - this wont throw any error as the machine deinfition is just contractualy. And here that version is not being call
    processMachineOrchestratorAllVersions({ memory }),
  ]).resolve(inputEventV100);
  console.log(resolvedEventV100?.data); // { result: 6 }

  const inputEventV200 = createArvoEventFactory(processMachineContract.version('2.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      numbers: [1, 2, 3],
    },
  });
  const resolvedEventV200 = await createSimpleEventBroker([
    addService(),
    multiplyService(), // Added multiply service in the broker - If not defined the broker with not find the handler and throw the error that handler does not exist
    processMachineOrchestratorAllVersions({ memory }),
  ]).resolve(inputEventV200);
  console.log(resolvedEventV200?.data); // { result: 6 }
};

// In phase 4 lets replace the arvoOrchestraotor + machine combitation with ArvoResumable which is an impretive orchestration primitive
const processResumableAllVersions: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoResumable({
    contracts: {
      self: processMachineContract,
      services: {
        add: addContract.version('1.0.0'),
        multiply: multiplyContract.version('1.0.0'),
      },
    },
    types: {
      context: {} as {
        dataToAdd: number[];
        additionResult: number | null;
        averageResult: number | null;
        error: ArvoErrorType[];
      },
    },
    memory: memory,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ input, service, context }) => {
        if (service?.type === 'sys.com.calculator.add.error') {
          // Emits a sys error
          return {
            output: {
              success: false,
              result: null,
              error: [service.data],
            },
          };
        }
        if (input) {
          return {
            context: {
              dataToAdd: input.data.numbers,
              additionResult: null,
              averageResult: null,
              error: [],
            },
            services: [
              {
                type: 'com.calculator.add' as const,
                data: {
                  numbers: input.data.numbers,
                },
              },
            ],
          };
        }

        if (!context) {
          // Emit a sys error event - context is not properly set in input event
          throw new Error('Error occured in process. Context not properly set');
        }

        if (service?.type === 'evt.calculator.add.success') {
          return {
            context: {
              ...context,
              additionResult: service.data.result,
            },
            output: {
              success: true,
              result: service.data.result,
              error: [],
            },
          };
        }
      },
      '2.0.0': async ({ input, service, context }) => {
        if (service?.type === 'sys.com.calculator.add.error' || service?.type === 'sys.com.calculator.multiply.error') {
          // Emits a sys error
          return {
            output: {
              success: false,
              result: null,
              error: [service.data],
            },
          };
        }
        if (input) {
          return {
            context: {
              dataToAdd: input.data.numbers,
              additionResult: null,
              averageResult: null,
              error: [],
            },
            services: [
              {
                type: 'com.calculator.add' as const,
                data: {
                  numbers: input.data.numbers,
                },
              },
            ],
          };
        }

        if (!context) {
          // Emit a sys error event - context is not properly set in input event
          throw new Error('Error occured in process. Context not properly set');
        }

        if (service?.type === 'evt.calculator.add.success') {
          return {
            context: {
              ...context,
              additionResult: service.data.result,
            },
            services: [
              {
                type: 'com.calculator.multiply' as const,
                data: {
                  numbers: [service.data.result, 1 / context.dataToAdd.length],
                },
              },
            ],
          };
        }

        if (service?.type === 'evt.calculator.multiply.success') {
          return {
            context: {
              ...context,
              averageResult: service.data.result,
            },
            output: {
              success: true,
              result: service.data.result,
              error: [],
            },
          };
        }
      },
    },
  });

// This is an example runner for your understanding
export const runPhase4 = async () => {
  const memory = new SimpleMachineMemory();
  const inputEventV100 = createArvoEventFactory(processMachineContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      numbers: [1, 2, 3],
    },
  });
  const resolvedEventV100 = await createSimpleEventBroker([
    addService(), // Even tho one of the versions of the process machine needs multiply service - this wont throw any error as the machine deinfition is just contractualy. And here that version is not being call
    processResumableAllVersions({ memory }), // Replace the orchestrator
  ]).resolve(inputEventV100);
  console.log(resolvedEventV100?.data); // { result: 6 }

  const inputEventV200 = createArvoEventFactory(processMachineContract.version('2.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      numbers: [1, 2, 3],
    },
  });
  const resolvedEventV200 = await createSimpleEventBroker([
    addService(),
    multiplyService(), // Added multiply service in the broker - If not defined the broker with not find the handler and throw the error that handler does not exist
    processResumableAllVersions({ memory }), // Replace the orchestrator
  ]).resolve(inputEventV200);
  console.log(resolvedEventV200?.data); // { result: 6 }
};

// This example shows the power simplicity and composibkity of the Arvo
