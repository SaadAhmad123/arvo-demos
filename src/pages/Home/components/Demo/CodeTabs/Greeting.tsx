import type { CodeBlockProps } from '../../../../../components/CodeBlock';
const label = 'greeting.handler.ts';
export const GreetingTab: CodeBlockProps['tabs'][number] = {
  title: label,
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
};
