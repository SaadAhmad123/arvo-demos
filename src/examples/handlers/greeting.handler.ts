import { createSimpleArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';

import { z } from 'zod';

export const greetingContract = createSimpleArvoContract({
  uri: '#/demo/greeting',
  type: 'greeting.create',
  description: 'A service to great standard greeting text',
  versions: {
    '1.0.0': {
      accepts: z.object({
        name: z.string(),
        toolUseId$$: z.string().optional(),
      }),
      emits: z.object({
        greeting: z.string(),
        toolUseId$$: z.string().optional(),
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
            toolUseId$$: event.data.toolUseId$$,
          },
        };
      },
    },
  });
