import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../types';

export const SimpleHandlersTab: DemoCodePanel = {
  heading: 'The Building Blocks',
  description: cleanString(`
    At the core of event handling in Arvo are **simple event handlers**. These handlers 
    consume a specific \`ArvoEvent\` and can emit one or more \`ArvoEvent\` instances in response. 
    Their behavior is defined by an \`ArvoContract\`, which binds directly to the handler and 
    provides IntelliSense, compile-time guarantees, and runtime validation.

    Arvo includes several utilities to streamline contract and handler creation. Some are 
    demonstrated in the examples below, while others are covered in detail later in the 
    documentation.

    This example highlights the flexibility and key features of \`ArvoEventHandler\`:
    - The \`greetingHandler\` shows how to define a contract using 
      \`createSimpleArvoContract\` and bind it to a handler via \`createArvoEventHandler\`.
    - The \`addHandler\` demonstrates contract creation with the lower-level 
      \`createArvoContract\`. The simpler \`createSimpleArvoContract\` is essentially a 
      wrapper around this function, with sensible defaults for common use cases.

    All contracts automatically include a default error event type (\`sys.*.error\`) for 
    robust error handling. They also support versioning, enabling seamless API evolution, 
    and expose an \`executionunits\` field for cost tracking and performance monitoring. 
    Handlers can define both static and dynamic execution costs—for example, scaling based 
    on the complexity of the input.

    Together, these building blocks make event-driven development with Arvo both 
    powerful and developer-friendly.
  `),
  tabs: [
    {
      title: 'handlers/greeting.handler.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

/**
 * Contract definition that generates standardized event types:
 * - Input: 'com.greeting.create' (createSimpleArvoContract prepends 'com.' to the type)
 * - Success output: 'evt.greeting.create.success'
 * - Error output: 'sys.com.greeting.create.error' (system-generated on handler failure)
 *
 * 'createSimpleArvoContract' is a utility for creating simple request-response like contracts.
 * It automatically generates these event types with standard prefixes. Other contract creation 
 * methods use different patterns.
 */
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
    contract: greetingContract,     // Contract binding ensures type safety through IntelliSense, compile-time validation, and runtime checks
    executionunits: 0,              // Base execution cost for handler operations - enables cost tracking and performance analysis in event-driven systems
    handler: {
      // Register handlers for all the versions of the contract
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.greeting.create.success',
          data: {
            greeting: \`Hello, \${event.data.name}!\`,
          },
        };
      },
    },
  });
  
`,
    },
    {
      title: 'handlers/add.handler.ts',
      lang: 'ts',
      code: `
import { createArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

// This is the same as \`createSimpleArvoContract\` but by using the low-level
// \`createArvoContract\` function
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
  
`,
    },
  ],
};
