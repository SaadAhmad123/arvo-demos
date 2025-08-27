import { createSimpleArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

export const greetingContract = createSimpleArvoContract({
  uri: '#/demo/greeting',
  type: 'greeting.create',
  versions: {
    '1.0.0': {
      accepts: z.object({
        name: z.string(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
      emits: z.object({
        greeting: z.string(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
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
            toolUseId: event.data.toolUseId,
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
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
      emits: z.object({
        result: z.number(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
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
            toolUseId: event.data.toolUseId,
          },
          executionunits: event.data.numbers.length * 1e-6,
        };
      },
    },
  });
