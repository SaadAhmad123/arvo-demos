import { createArvoOrchestratorContract, createSimpleArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';

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

export const addContract = createSimpleArvoContract({
  uri: '#/demo/calculator/add',
  type: 'calculator.add',
  description: 'This service provides the sum of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
      }),
      emits: z.object({
        result: z.number(),
      }),
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

const greetingOrchestratorContract = createArvoOrchestratorContract({
  uri: '#/demo/orc/greeting',
  name: 'greeting', // -> type = 'arvo.orc.greeting' as the type creation here is 'arvo.core.${name}'
  versions: {
    '1.0.0': {
      init: z.object({
        name: z.string(),
        age: z.number(),
      }),
      complete: z.object({
        result: z.string(),
      }),
    },
  },
});

// const greetingMachineV100 = setupArvoMachine({
//   contracts: {
//     self: greetingOrchestratorContract.version('1.0.0'),
//     services: {
//       greeting: greetingContract.version('1.0.0'),
//       adder: addContract.version('1.0.0'),
//     },
//   },
//   types: {
//     context: {} as {
//       name: string;
//       age: number;
//       greeting: string | null;
//       updatedAge: number | null;
//     },
//   },
// }).createMachine({
//   id: 'greetingMachine',
//   context: ({ input }) => ({
//     name: input.data.name,
//     age: input.data.age,
//     greeting: null,
//     updatedAge: null,
//   }),
//   init: 'route',
//   states: {
//     route: {},
//     process: {
//       type: 'parallel',
//       states: {
//         greet: {},
//         add: {},
//       },
//     },
//     done: {},
//     error: {},
//   },
// });
