import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const SecondSimpleHandlerTab: DemoCodePanel = {
  heading: 'Your Second Event Handler',
  description: cleanString(`
    Building additional handlers follows the same pattern. Create a contract defining the interface, implement 
    a handler function that processes events, and bind them together. Within handlers, you have complete freedom 
    to call external APIs, transform data, trigger services, or perform any business logic your application requires.

    The greeting handler demonstrates a minimal request-response pattern. It accepts a name and returns a greeting 
    message. While simple, this establishes the foundation for understanding how multiple handlers collaborate in 
    event-driven systems without tight coupling.

    ### Simplified Contract Creation

    This example introduces \`createSimpleArvoContract\`, a convenience utility that automatically generates event 
    type strings following Arvo's naming conventions. Instead of explicitly defining all event types, this function 
    applies standard prefixes. It prepends \`com.\` to create the input event type, generates \`evt.\` prefixed 
    success events, and automatically defines \`sys.\` prefixed error events.

    For the greeting handler, providing \`type: 'greeting.create'\` produces \`com.greeting.create\` as the input 
    type and \`evt.greeting.create.success\` as the success emission type. System error events become 
    \`sys.com.greeting.create.error\`. Use \`createSimpleArvoContract\` for straightforward request-response 
    patterns and \`createArvoContract\` when you need complete control over event type naming.

    ### Event Handler Factory Pattern

    Handlers are created as functions returning handler instances rather than direct objects, following the 
    \`EventHandlerFactory\` pattern. This enables dependency injection at instantiation time. When you register 
    handlers with brokers or execute them in different environments, you can inject dependencies like database 
    connections, API clients, or configuration without modifying handler code. The factory accepts an optional 
    configuration object for providing these dependencies, keeping handlers testable and portable across deployment 
    contexts.
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
    contract: greetingContract, // Contract binding ensures type safety through IntelliSense, compile-time validation, and runtime checks
    handler: {
      // Register handlers for all the versions of the contract
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.greeting.create.success',
          data: {
            greeting:\`Hello, \${event.data.name}!\`,
          },
        };
      },
    },
  });

  
`,
    },
  ],
};
