import {
  ArvoErrorSchema,
  createArvoContract,
  createArvoOrchestratorContract,
  createSimpleArvoContract,
  type ArvoErrorType,
} from 'arvo-core';
import {
  createArvoEventHandler,
  createArvoOrchestrator,
  createArvoResumable,
  type EventHandlerFactory,
  ExecutionViolation,
  type IMachineMemory,
  type MachineMemoryRecord,
  setupArvoMachine,
  xstate,
} from 'arvo-event-handler';

import { z } from 'zod';

export const greetingContract = createSimpleArvoContract({
  uri: '#/demo/greeting',
  type: 'greeting.create',
  versions: {
    '1.0.0': {
      accepts: z.object({
        name: z.string(),
      }),
      emits: z.object({
        greeting: z.string(),
      }),
    },
  },
});

export const greetingHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: greetingContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.greeting.create.success',
          data: {
            greeting: `Hello, ${event.data.name}!`,
          },
        };
      },
    },
  });

export const addContract = createArvoContract({
  uri: '#/demo/calculator/add',
  type: 'com.calculator.add',
  description: 'This service provides the sum of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
      }),
      emits: {
        'evt.calculator.add.success': z.object({
          result: z.number(),
        }),
      },
    },
  },
});

export const addHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: addContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        if (event.data.numbers.length === 0) {
          // This will result in 'sys.calculator.add.error' event
          throw new Error('Numbers array cannot be empty');
        }
        return {
          type: 'evt.calculator.add.success',
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc + cur, 0),
          },
          executionunits: event.data.numbers.length * 1e-6,
        };
      },
    },
  });

export const greetingOrchestratorContract = createArvoOrchestratorContract({
  uri: '#/demo/orc/greeting',
  name: 'greeting', // -> type = 'arvo.orc.greeting' as the type creation here is 'arvo.core.${name}'
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
  /** @xstate-layout N4IgpgJg5mDOIC5RQE5jAFwJYDsoFkBDAYwAtcwA6ABxQHti5YBiCOnK2DQjK1dbHiJkKNeo1iwA2gAYAuolDU6sLNnaKQAD0QAOAEwBWSgGYZRgCwyLARgCcMgxYA0IAJ6J9uk5Rl2TurqG+gDsFiF24SYAvtGu-Ji4BCTkHGIMTJQJGJS4asxgAG452UmUxGg8nACuxBLS8prKquo4mjoI+gBsMpR2XbohPXZB1jZdrh4IwV19hiZm+ksyEYaGsfFoiUIporQZkllbOXkYzLBusOV0ALZHAmUVYFWUYCj0KLIKSCDNalgaH4dEL6Hy6BxdcL2Gwgiy6SaILohXoWfQjbw2GwycaQjYgUo7ERpfb1SiECAQXI4fJFHLEQgAG2I1QZPDoKDJFMosFq9S+TRU-0BoA63TsphChmsulsgX6IQRnX0vSlMhkXRMXQGhgsizxBOSRKoJMy5Mpp3Ol2ud3pTJZbI5Zte73Z-J+f1a7UQILBEKhdhh+jhitRxmVJn0MMlGv6ulicRAODoEDgmgNwlSYAFLQBbSBiAAtKjFUWbH07BWQiFxhYut0vPrjkkM3txExs0K8yLESHjKqZJqLLXddiuo2HoTM+lSdkO5789MXO5ELrxRZ5l5dMMQiYA+PtoapybDtkqWo57mvQgsfpFTrenY0YN15FdDCLPvBIfWwcrqe2BwF7CtoiDBCElDdIYkKDJE4Y2HecJ9GiET9AM-QmDYn7NrsxJtocZpAV2IEIHWlBWBq2IRjYwR+DYS5TDYCy+GqMiqoYYRbmOCbpjhxp4VcTqnIRV6Yii6pmIxkY0QGiqghYZFDBqPShtB6zcU2k4-qSToAVm7qCvO3bTKEEFdFBcIRKiA7wcunSogpWo4kiJg7iCWGaWkunCQuWIDhKhg2KCUFmV4ioucY64RvMWJhCscbqRO35pG8HzeUZvk+OFgUmMFwTwrZ67yTKkK1tWz6OPG0RAA */
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
    result: context.errors.length ? null : `Greeting -> ${context.greeting}, Updated Age -> ${context.updatedAge}`,
  }),
  initial: 'process',
  states: {
    process: {
      type: 'parallel',
      states: {
        greet: {
          initial: 'init',
          states: {
            init: {
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
                  target: '#greetingMachine.error',
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

export const greetingOrchestrator: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoOrchestrator({
    machines: [greetingMachineV100],
    memory: memory as unknown as IMachineMemory<MachineMemoryRecord>,
    executionunits: 0, // Default machine
  });

export const greetingResumableContract = createArvoOrchestratorContract({
  uri: '#/demo/resumable/greeting', // Must always be unique across all orchestrator contracts,
  name: 'greeting.resumable', // Must always be unique across all orchestrator contracts,
  versions: {
    '1.0.0': {
      init: z.object({
        name: z.string(),
        age: z.number(),
      }),
      complete: z.object({
        errors: ArvoErrorSchema.array().min(1).nullable(),
        result: z.string().nullable(),
        sameResultFromWorkflow: z.boolean(),
      }),
    },
  },
});

// ArvoResumable is an imperitive form of orchestrator event handler. From
// an event point of view it is an orchestrator. It is just that it implementation
// is imperitive
export const greetingResumable: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoResumable({
    contracts: {
      self: greetingResumableContract,
      services: {
        greeting: greetingContract.version('1.0.0'),
        adder: addContract.version('1.0.0'),
        greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'),
      },
    },
    memory,
    executionunits: 0,
    types: {
      context: {} as {
        name: string;
        age: number;
        greeting: string | null;
        updatedAge: number | null;
        errors: ArvoErrorType[];
        /**
         * This is to store the process id/subject of the current orchestration.
         * This is because this resumable (which is an imperitive orchestrator) will
         * be emitting an event to for an other workflow orchestrator and this field
         * communicated the required id for proper context process tracking.
         */
        selfSubject$$: string;
      },
    },
    handler: {
      '1.0.0': async ({ input, service, context, collectedEvents }) => {
        if (
          service?.type === 'sys.com.calculator.add.error' ||
          service?.type === 'sys.com.greeting.create.error' ||
          service?.type === 'sys.arvo.orc.greeting.error'
        ) {
          // This will cause emission of system error event for the resumable it will be sys.arvo.orc.greeting.error
          throw new Error(`Something went wrong in the service exection. ${service.data.errorMessage}`);
        }

        if (input) {
          if (context) {
            // This will result in a actual error being throw in the execution.
            // This is a fatal error and must be able to be bubbled up
            // This way the developers choose to handle error boundaries
            // and error handling becomes transparent.
            throw new ExecutionViolation(
              '[Critical Error]Init event consumed after context availability. This mean a race condition or a event de-duplication issue',
            );
          }

          return {
            context: {
              name: input.data.name,
              age: input.data.age,
              greeting: null,
              updatedAge: null,
              errors: [],
              selfSubject$$: input.subject, // ArvoEvent subjects are basically the process ids which remain same across the scope of a particular workflow carried out by a particular orchestrator. Nested orchestration will have different subject across different orchestrator
            },
            services: [
              {
                type: 'com.calculator.add' as const,
                data: {
                  numbers: [input.data.age, 7],
                },
              },
              {
                type: 'com.greeting.create' as const,
                data: {
                  name: input.data.name,
                },
              },
              {
                type: 'arvo.orc.greeting' as const,
                data: {
                  name: input.data.name,
                  age: input.data.age,
                  parentSubject$$: input.subject, // This `parentSubject$$` is added automatically in the ArvoContract created by `createArvoOrchestratorContract`
                },
              },
            ],
          };
        }

        if (!context) {
          throw new ExecutionViolation(
            '[Critical Error] Service event consumed without context availability. This mean state storage issues.',
          );
        }

        if (
          (collectedEvents?.['evt.calculator.add.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['evt.greeting.create.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['arvo.orc.greeting.done']?.length ?? 0) > 0
        ) {
          const orchestratorString = collectedEvents['arvo.orc.greeting.done']?.[0]?.data?.result;
          const lowLevelGeneratedString = `Greeting -> ${collectedEvents['evt.greeting.create.success']?.[0]?.data?.greeting}, Updated Age -> ${collectedEvents['evt.calculator.add.success']?.[0]?.data?.result}`;
          return {
            output: {
              errors: null,
              sameResultFromWorkflow: lowLevelGeneratedString === orchestratorString,
              result: lowLevelGeneratedString,
            },
          };
        }
      },
    },
  });
