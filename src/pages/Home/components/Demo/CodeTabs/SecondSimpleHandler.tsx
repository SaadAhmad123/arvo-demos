import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const SecondSimpleHandlerTab: DemoCodePanel = {
  heading: 'Your Second Event Handler',
  description: cleanString(`
    Building your second handler reinforces the contract-handler pattern while introducing new concepts around 
    validation and execution tracking. The product handler follows the same structure as the addition handler but 
    demonstrates how contracts enforce business rules and how handlers can report computational work.

    ### Contract-Enforced Validation

    The product contract introduces schema-level constraints through \`.min(2)\` on the numbers array. This 
    demonstrates an important architectural principle in Arvo of **pushing the validation into contracts rather than 
    scattering defensive checks throughout handler code**. When you define \`numbers: z.number().array().min(2)\`, 
    the contract enforces this requirement at two critical points.

    1. The event factory validates data when you create events. If you attempt to create an event with 
    fewer than two numbers, the factory throws an error immediately, preventing malformed events from entering 
    your system. 

    1. The handler validates incoming events against the contract schema before executing 
    your handler function. If an event somehow bypasses factory validation and arrives at the handler with 
    invalid data, Arvo throws a \`ViolationError\` (specifically a \`ContractViolation\`) before your code 
    executes.

    This layered validation approach centralizes data integrity rules in contract definitions. Your handler 
    code can assume the data conforms to the schema, eliminating defensive checks and keeping business logic 
    focused on its core responsibility. The handler trusts that \`event.data.numbers\` contains at least two 
    numbers because the contract guarantees it.

    ### Introducing Execution Units

    This implementation introduces the execution units concept. Execution units are numeric values that handlers 
    can assign to events. What these numbers represent and how your system processes them is entirely your decision. 
    Arvo provides the mechanism to attach these values to events but assigns no inherent meaning to them and performs 
    no automatic processing or accumulation.

    From Arvo's perspective, execution units simply represent a number associated with generating that specific event. 
    You might use them to track computational cost, API calls, database queries, token consumption, or any metric 
    meaningful to your system. Your infrastructure layer decides whether to aggregate them, monitor them, enforce 
    quotas based on them, or ignore them completely. If execution units don't serve your needs, you can omit them 
    entirely without affecting handler functionality.

    **For Example**

    The product handler calculates execution units dynamically based on array length, demonstrating that these values 
    can reflect actual work performed rather than being static configuration. Each number processed costs \`1e-6\` 
    units in this example. The handler multiplies this base cost by array length and returns it with the result. 
    This is purely illustrative - your handlers can use any calculation or static value that fits your system's 
    requirements.

    ### Event Handler Factory Pattern

    Notice that the handlers defined so far are functions returning a handler instances rather than being direct handler objects. 
    This factory pattern enables dependency injection at instantiation time. When you execute handlers directly or 
    register them with brokers, you call the factory function to create the handler instance. The factory can accept 
    configuration objects providing dependencies like database connections, API clients, logging systems, or feature 
    flags. This keeps handlers decoupled from their runtime environment, making them testable in isolation and portable 
    across different deployment contexts. For simple handlers like this product service, the factory takes no parameters, 
    but the pattern remains consistent across all Arvo handlers regardless of their dependency requirements.
  `),
  tabs: [
    {
      title: 'handlers/product.service.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import {
  createArvoEventHandler,
  type EventHandlerFactory,
} from 'arvo-event-handler';
import { z } from 'zod';

/**
 * Contract definition that generates standardized event types:
 * - Input: 'com.calculator.product' (createSimpleArvoContract prepends 'com.' to the type)
 * - Success output: 'evt.calculator.product.success'
 * - Error output: 'sys.com.calculator.product.error' (system-generated on handler failure)
 *
 * 'createSimpleArvoContract' is a utility for creating simple request-response like contracts.
 * It automatically generates these event types with standard prefixes. Other contract creation
 * methods use different patterns.
 */
export const productContract = createSimpleArvoContract({
  uri: '#/org/amas/calculator/product',
  type: 'calculator.product',
  description:
    'This service provides the product of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        // The contract enforces the array requirement and 
        // will throw error at event creation time (via the event factory)
        // and it will also throw a ViolationError (ContractViolation) 
        // if the event somehow makes its way to the event handler
        numbers: z.number().array().min(2),
      }),
      emits: z.object({
        result: z.number(),
      }),
    },
  },
});

export const productHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    // Contract binding ensures type safety through compile-time validation, 
    // runtime checks, and provides intellisense
    contract: productContract, 
    handler: {
      // Register handlers for all the versions of the contract
      '1.0.0': async ({ event }) => {
        // The error is not needed here because the contract makes 
        // sure that invalid data never reaches the handler
        return {
          type: 'evt.calculator.product.success' as const,
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc * cur, 1),
          },
          // Assign a cost (you decide what you mean by cost in your system) 
          // which represent the cost needed to generate this event. Your
          // system implementation can decide what this means and what to do with 
          // this
          executionunits: event.data.numbers.length * 1e-6,
        };
      },
    },
  });

  
`,
    },
  ],
};
