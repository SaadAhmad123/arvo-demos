import { ArvoContractLearn, ArvoEventHandlerLearn, ArvoEventLearn } from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const AdditionHandlerTab: DemoCodePanel = {
  heading: 'Your First Event Handler',
  description: cleanString(`
    The simple request-response event handler is a fundamental building block in Arvo. This example demonstrates 
    how to create your first handler using [\`createArvoEventHandler\`](${ArvoEventHandlerLearn.link}), bind it 
    to a contract for type safety, and understand Arvo's error handling patterns.

    ### Contract-First Design

    All communication happens through [\`ArvoEvent\`](${ArvoEventLearn.link}) objects. Before building handlers, 
    you define [\`ArvoContract\`](${ArvoContractLearn.link}) objects that specify what events your handler accepts 
    and emits. Contracts provide:

    - Single source of truth for service interfaces
    - Runtime event validation against schemas
    - Type-safe event construction through factory methods
    - Full IntelliSense support during development
    - Built-in versioning for evolving services without breaking changes
    - JSON schema generation for building event catalogues

    The \`addContract\` demonstrates this pattern. It declares a URI identifying the service, a type string for 
    events it accepts, and version-specific schemas. The \`accepts\` schema defines input structure while \`emits\` 
    defines possible output events. When you bind this contract to a handler, TypeScript infers the exact shape of 
    \`event.data\`, giving you compile-time verification and IntelliSense guidance.

    ### Handler Implementation

    The \`addHandler\` function creates an \`ArvoEventHandler\` bound to \`addContract\`. The handler configuration 
    maps contract versions to implementation functions. Each implementation receives a typed event matching the 
    contract's \`accepts\` schema and returns either success data or throws an error. The return object specifies 
    which emission type to use and provides data conforming to that emission's schema. Arvo validates this data 
    against the schema and constructs the response event automatically.

    ### Error Handling Patterns

    Arvo distinguishes between two error categories serving different purposes:

    - **System errors** are addressable failures that workflows and handlers can handle programmatically. When your 
    handler throws an \`Error\`, Arvo catches it and emits a system error event (e.g., \`sys.com.calculator.add.error\`) 
    that propagates through the event fabric. Other handlers can subscribe to these events and implement recovery 
    logic. The schema for system error events is automatically defined by [\`ArvoContract\`](${ArvoContractLearn.link}), 
    giving you this functionality immediately. The add handler demonstrates this by throwing when the numbers array 
    is empty.

    - **Violation errors** represent problems that cannot be addressed within the event system, such as infrastructure 
    failures, misconfigurations, or transient issues. These extend \`ViolationError\` and are not caught by event 
    handlers. Instead, they propagate to your operational layer where you implement mitigation strategies like retries, 
    dead letter queues, or circuit breakers. Specific violation types are detailed in the 
    [documentation](${ArvoEventHandlerLearn.link}).

    This separation keeps business logic errors (handled via events) distinct from operational problems (handled via 
    infrastructure patterns), enabling you to reason about each category with appropriate tools.
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
        };
      },
    },
  });

  
`,
    },
  ],
};
