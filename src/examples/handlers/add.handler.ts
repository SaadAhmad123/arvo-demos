import { createArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';

import { z } from 'zod';

export const addContract = createArvoContract({
  uri: '#/demo/calculator/add',
  type: 'com.calculator.add',
  description: 'This service provides the sum of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
        toolUseId$$: z.string().optional(),
      }),
      emits: {
        'evt.calculator.add.success': z.object({
          result: z.number(),
          toolUseId$$: z.string().optional(),
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
            toolUseId$$: event.data.toolUseId$$,
          },
          executionunits: event.data.numbers.length * 1e-6,
        };
      },
    },
  });
