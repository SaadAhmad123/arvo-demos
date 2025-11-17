import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ContextSetup: DemoCodePanel = {
  heading: 'Setting up Context',
  description: cleanString(`
    This tutorial demonstrates how state machines coordinate event handlers in Arvo through a deceptively
    simple workflow that reveals sophisticated patterns for production systems.

    The scenario is intentionally minimal. It processes a list of numbers through human approval, parallel 
    calculation, and ratio generation. Yet this simple workflow perfectly exposes three critical orchestration 
    challenges that Arvo solves elegantly. These include coordinating external services across distributed 
    boundaries, integrating human decision points without blocking execution, and maintaining state 
    across asynchronous, potentially long-running processes.

    What makes this tutorial valuable isn't the arithmetic—it's the architectural patterns. 
    The machine emits a domained event for human approval, which the broker captures outside 
    the standard event flow. This demonstrates how any external integration becomes a natural extension 
    of the workflow rather than a special case. External integration includes human interaction, 
    third-party services, or cross-environment communication. The parallel sum/product calculation 
    shows how state machines orchestrate other handlers through event emission, enabling loose coupling 
    while maintaining strict type safety. The internal ratio calculation proves that synchronous 
    business logic coexists cleanly with event-driven coordination, occurring within the machine's 
    state context before emitting the final result.

    This tutorial also introduces two distinct testing approaches. The Arvo test suite validates 
    the orchestrator's logic in isolation, ensuring state transitions and event emissions follow the 
    prescribed contract. Meanwhile, integration tests run the orchestrator alongside its dependent handlers 
    in an in-memory event broker, validating end-to-end behavior. This dual testing strategy provides 
    confidence in both the machine's correctness and its integration patterns.

    This section implements the lightweight sum and product handlers. These are familiar patterns 
    from the event handler documentation that serve as the orchestrator's worker services, completing 
    the picture of a fully coordinated, contract-bound system.
  `),
  tabs: [
    {
      title: 'product.service.ts',
      lang: 'ts',
      code: `
import { createArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

export const productContract = createArvoContract({
  uri: '#/org/amas/calculator/product',
  type: 'com.calculator.product',
  description: 'This service provides the product of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
      }),
      emits: {
        'evt.calculator.product.success': z.object({
          result: z.number(),
        }),
      },
    },
  },
});

export const productHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: productContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        if (event.data.numbers.length === 0) {
          // This will result in 'sys.calculator.product.error' event
          throw new Error('Numbers array cannot be empty');
        }
        return {
          type: 'evt.calculator.product.success',
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc * cur, 1),
          },
          executionunits: event.data.numbers.length * 1e-6,
        };
      },
    },
  });
      `,
    },
    {
      title: 'add.service.ts',
      lang: 'ts',
      code: `
import { createArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

export const addContract = createArvoContract({
  uri: '#/org/amas/calculator/add',
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
