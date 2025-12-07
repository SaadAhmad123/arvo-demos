import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const FirstEventHandler: DemoCodePanel = {
  heading: 'Your First Event Handler',
  description: cleanString(`
    The \`ArvoEventHandler\` class in the \`arvo-event-handler\` package extends 
    [\`IArvoEventHandler\`](https://saadahmad123.github.io/arvo-event-handler/interfaces/index.IArvoEventHandler.html), 
    which serves as the foundation for all Arvo event handler implementations. While 
    direct instantiation is possible, the \`createArvoEventHandler\` factory method 
    provides a more consistant and ergonomic interface by handling default values and simplifying 
    configuration.

    Every event handler in Arvo binds to one or more \`ArvoContract\` instances that 
    define the handler's operational boundaries. These contracts specify the structure 
    and validation rules for \`ArvoEvent\` messages the handler can accept and emit, 
    automatically establishing a type-safe interface that enforces consistency 
    across your system.

    This example demonstrates a simple service that adds numbers (in practice, you 
    can implement handlers of any complexity). The handler 
    showcases several key Arvo patterns: 
    
    - Contract-based validation ensuring input arrays contain only numbers.
    - Automatic error event generation when validation fails (resulting in \`sys.calculator.add.error\` events).
    - Successful response emission through the  contract-defined \`evt.calculator.add.success\` event type. 
    
    All Arvo event handlers implement \`executionunits\`, an \`ArvoEvent\` field 
    representing operational cost within your system. This domain-specific metric 
    adapts to your requirements, whether measuring CPU cycles, memory consumption, 
    API call costs, or processing time. This example demonstrates an optional 
    dynamic calculation based on array length, though you can implement any 
    cost model appropriate for your use case.
  `),
  tabs: [
    {
      title: 'add.handler.ts',
      lang: 'ts',
      code: `
import { createArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

// Define the contract specifying what events this handler accepts and emits
export const addContract = createArvoContract({
  uri: '#/demo/calculator/add',
  type: 'com.calculator.add',
  description: 'This service provides the sum of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      // Input schema: array of numbers to sum
      accepts: z.object({
        numbers: z.number().array(),
      }),
      // Output schema: single success event with the computed result
      emits: {
        'evt.calculator.add.success': z.object({
          result: z.number(),
        }),
      },
    },
  },
});

// Factory function returns a configured event handler instance
export const addHandler = createArvoEventHandler({
    contract: addContract,
    // Base execution cost (required) - represents fixed overhead
    executionunits: 0,
    handler: {
      // Handler implementation for contract version 1.0.0
      '1.0.0': async ({ event }) => {
        // Validate input and throw error for empty arrays
        // Errors automatically generate 'sys.calculator.add.error' events
        if (event.data.numbers.length === 0) {
          throw new Error('Numbers array cannot be empty');
        }
        
        // Return success event with computed sum
        return {
          type: 'evt.calculator.add.success',
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc + cur, 0),
          },
          // Optional dynamic cost: cost per number processed
          executionunits: event.data.numbers.length * 1e-6,
        };
      },
    },
  });

  
`,
    },
  ],
};
