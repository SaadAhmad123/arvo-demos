import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const SecondSimpleHandlerTab: DemoCodePanel = {
  heading: 'Your Second Event Handler',
  description: cleanString(`
    Now that you're familiar with creating a simple handler, you can apply this same pattern 
    to build any handler following the request-response model. Within these handlers, you have 
    complete flexibility—call external APIs, transform and process data, trigger email services, 
    or even emit no events at all. The possibilities are limited only by your imagination.

    The true power of event-driven architecture emerges when multiple event handlers participate 
    in a system, collaborating to complete tasks and workflows. To demonstrate this, let's create 
    a second handler that accepts a name and outputs a greeting message. This simple handler serves 
    as Arvo's equivalent to "Hello World" while setting the stage for more complex interactions 
    between handlers.

    ## Simplified Contract Creation

    This example introduces \`createSimpleArvoContract\`, a specialized utility for building 
    request-response contracts with automatic event type generation. Unlike \`createArvoContract\`, 
    which requires explicit definition of all event types, \`createSimpleArvoContract\` follows 
    a convention-based approach that automatically generates the necessary event types. This 
    reduces boilerplate for simple handlers while maintaining the full power of Arvo's contract 
    system, including type safety, runtime validation, and versioning capabilities.

    ## Event Handler Factory Pattern

    You'll notice that event handlers aren't created directly as objects but rather as functions 
    that return handlers—the \`EventHandlerFactory\` pattern. This design enables injection of 
    deployment-specific functionality when handlers are instantiated for execution or registered 
    with event brokers. This powerful mechanism provides a flexible dependency injection system 
    that you'll explore further as you build more sophisticated applications.
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
        // This is a useful field when working with AI Agents for tool call correlation
        toolUseId$$: z.string().optional(),
      }),
      emits: z.object({
        greeting: z.string(),
        // This is a useful field when working with AI Agents for tool call correlation
        toolUseId$$: z.string().optional(),
      }),
    },
  },
});

export const greetingHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: greetingContract, // Contract binding ensures type safety through IntelliSense, compile-time validation, and runtime checks
    executionunits: 0, // Base execution cost for handler operations - enables cost tracking and performance analysis in event-driven systems
    handler: {
      // Register handlers for all the versions of the contract
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.greeting.create.success',
          data: {
            greeting:\`Hello, \${event.data.name}!\`,
            toolUseId$$: event.data.toolUseId$$,
          },
        };
      },
    },
  });

  
`,
    },
  ],
};
