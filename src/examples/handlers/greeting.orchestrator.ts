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
import { greetingContract } from './greeting.handler';
import { addContract } from './add.handler';
import type { Persistable } from './types';

export const greetingOrchestratorContract = createArvoOrchestratorContract({
  uri: '#/demo/orc/greeting',
  name: 'greeting', // -> type = 'arvo.orc.greeting' as the type creation here is 'arvo.core.${name}'
  description:
    'This service takes an age and name and returns the result after performing operations specific to this orchestrator',
  versions: {
    '1.0.0': {
      init: z.object({
        name: z.string(),
        age: z.number(),
        toolUseId$$: z.string().optional(),
      }),
      complete: z.object({
        errors: ArvoErrorSchema.array().min(1).nullable(),
        result: z.string().nullable(),
        toolUseId$$: z.string().optional(),
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
      toolUseId$$: string | null;
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
    toolUseId$$: input.data.toolUseId$$ ?? null,
  }),
  output: ({ context }) => ({
    errors: context.errors.length ? context.errors : null,
    result: context.errors.length ? null : `Greeting -> ${context.greeting}, Updated Age -> ${context.updatedAge}`,
    toolUseId$$: context.toolUseId$$ ?? undefined,
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

export const greetingOrchestrator: EventHandlerFactory<Persistable> = ({ memory }) =>
  createArvoOrchestrator({
    machines: [greetingMachineV100],
    memory: memory as unknown as IMachineMemory<MachineMemoryRecord>,
    executionunits: 0, // Default machine
  });
