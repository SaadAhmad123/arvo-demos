import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const AdditionHandlerTab: DemoCodePanel = {
  heading: 'Your First Event Handler',
  description: cleanString(`\
      The fundamental event handler in Arvo models a simple request-response system. Created using 
      \`createArvoEventHandler\`, these \`ArvoEventHandler\` objects accept events as defined by their 
      bound contract and emit one or more events according to that same contract. IntelliSense guides 
      you toward correct data types and structures, eliminating the need to memorize event schemas.

      ## Contract-First Design

      Every event handler in Arvo is bound by one or more contracts that define the structure 
      and key fields of \`ArvoEvent\` messages the handler can accept and emit. These contracts 
      establish the interface through which handlers participate in Arvo's event-driven fabric.

      Unlike traditional EDA specifications, Arvo contracts are executable code objects that serve 
      multiple critical functions. They act as the single source of truth for communication interfaces, 
      enable runtime event validation, facilitate \`ArvoEvent\` construction, and empower the TypeScript 
      compiler to perform static type checking while providing comprehensive IntelliSense for all handler 
      inputs and outputs. Additionally, their built-in versioning system enables seamless service evolution. 
      You'll explore these \`ArvoContract\` objects in depth in their dedicated documentation.

      


      ## Error Handling

      All event handlers in Arvo feature a consistent yet powerful error boundary system, explored 
      comprehensively in its dedicated documentation. This system provides two distinct error handling 
      approaches. First, system error events—uniform, specialized \`ArvoEvent\` messages that propagate 
      errors through the event-driven fabric as part of your workflow. This is demonstrated in this
      addition event handler. Second, \`ViolationError\` exceptions that bubble up beyond the handler's 
      scope, representing critical failures requiring external intervention. These violations signal 
      breaking conditions that exceed the handler's capacity to resolve and can be leveraged according 
      to your architectural needs. The specific types of \`ViolationError\` exceptions available to 
      you will be covered in the dedicated documentation.

      ## Execution Units

      All Arvo event handlers implement \`executionunits\`, a field in \`ArvoEvent\` that represents 
      operational cost within the system. This domain-specific metric is yours to define based on your 
      requirements and utilization patterns. This example demonstrates dynamic calculation of 
      \`executionunits\` based on data size, though numerous other approaches exist.
          
    `),
  tabs: [
    {
      title: 'handlers/add.handler.ts',
      lang: 'ts',
      code: `
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
        // This is a usefull field when working with AI Agents for tool call correlation
        toolUseId$$: z.string().optional(),
      }),
      emits: {
        'evt.calculator.add.success': z.object({
          result: z.number(),
          // This is a usefull field when working with AI Agents for tool call correlation
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

  
`,
    },
  ],
};

/**
 * **Contracts function as calling cards between Arvo event handlers**. Rather than invoking other handlers 
      directly, handlers register the contracts of services they're permitted to use, which becomes part of 
      their interface and defines what events they can emit and expect during communication. **This pattern 
      becomes clearer when exploring Arvo's orchestration capabilities**.
 */
