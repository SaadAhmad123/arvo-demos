import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const TwoHandlerBrokerTab: DemoCodePanel = {
  heading: 'The Event Broker Pattern',
  description: cleanString(`
      The event broker pattern is Arvo's native operation paradigm. What distinguishes Arvo is its 
      requirement for a remarkably simple broker design as the operational minimum. At its core, Arvo 
      requires only a basic event broker capable of content-based filtering and targeted delivery—matching 
      events to their intended handlers. You can explore the complete broker design philosophy in the 
      [dedicated documentation](/advanced/event-routing-and-brokers).

      **The essence is elegantly simple:** regardless of system complexity or scale, if your broker can match 
      the \`event.to\` field of an \`ArvoEvent\` to a registered handler's \`handler.source\` value, you 
      have everything needed. Complex routing logic is managed by orchestration event handlers, making the 
      broker design exceptionally lightweight and scalable.

      ## Local Development with \`SimpleEventBroker\`

      Arvo being a toolkit and not a framework expects you to implement the necessary logic and networking 
      for your event broker, and therefore doesn't provide native integrations with external brokers like RabbitMQ 
      or Kafka. However, for local and non-distributed execution, development, and testing, Arvo provides \`SimpleEventBroker\`
      which is a FIFO in-memory queue-based broker that executes entirely within your code. This eliminates external dependencies
      for simpler use cases and testing scenarios, providing exceptional flexibility during development.

      ## Registration and Execution

      This example demonstrates the registration pattern where event handlers register themselves with the 
      broker. You send events to the broker, which decides which handler to execute based on the routing 
      logic. This same pattern extends to all subsequent examples, including orchestrator event handlers 
      registering with the same broker. This exemplifies the power of composition in Arvo where every component, 
      from simple handlers to complex orchestrators, participates in the system through the same unified 
      interface. Rather than being tightly coupled to each other, components maintain cohesion through 
      \`ArvoContract\` definitions, enabling flexibility and independent evolution while preserving 
      system-wide coordination.
    `),
  tabs: [
    {
      title: 'execute.ts',
      lang: 'ts',
      code: `
import { type ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { createSimpleEventBroker } from 'arvo-event-handler';
import { addContract, addHandler } from './handlers/add.handler';
import { greetingContract, greetingHandler } from './handlers/greeting.handler';

/**
 * Creates an in-memory event broker that automatically routes events to registered handlers.
 *
 * The broker uses event routing based on the 'event.to' field matching the handler's 'handler.source' field.
 * The 'resolve' function processes the event through the appropriate handler and returns
 * the final result after all event processing is complete.
 *
 * This pattern enables event brokering without requiring external message brokers and is helpful
 * for rapid development, limited-scoped projects, and testing
 */
const executeBroker = async (event: ArvoEvent) =>
  await createSimpleEventBroker([addHandler(), greetingHandler()]).resolve(event);

export const executeWithEventBrokerPattern = async () => {
  const additionEvent = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      numbers: [1, 2, 3, 4],
    },
  });

  const greetingEvent = createArvoEventFactory(greetingContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      name: 'John Doe',
    },
  });

  await executeBroker(additionEvent).then((result) => console.log(result?.toString(2) ?? 'No event resolved'));
  /* Console log output
    {
      "id": "210242ac-5f05-4984-934e-144d965ddd3a",
      "source": "com.calculator.add",
      "specversion": "1.0",
      "type": "evt.calculator.add.success",
      "subject": "eJw9jtsKwjAQRP9ln5sQbVpt/2a72WIgF0gTEUL/3VXBl3mYA2emQy704KMWrLnA2iFhZFiBctSEgVr4AI3OwQBPLofPSfBFG23gHIBfTK1+yw7eCRrNjtbMVo0zb8oax2qZ6K6Y7LbsE17tdhOXT7763yhUOaD/IdDliF6UqYUgI5Eriv8836O2OO0=",
      "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
      "dataschema": "#/demo/calculator/add/1.0.0",
      "data": {
        "result": 10
      },
      "time": "2025-09-30T21:56:55.713+00:00",
      "to": "test.test.test",
      "accesscontrol": null,
      "redirectto": null,
      "executionunits": 0.000004,
      "traceparent": "00-582e4a4d20e56ec93f804e8eda00138a-3c1389d5a4717fe4-01",
      "tracestate": null,
      "parentid": "291bc961-bdfb-467f-a4db-a36a1177f0bb",
      "domain": null
    }
  */

  await executeBroker(greetingEvent).then((result) => console.log(result?.toString(2) ?? 'No event resolved'));
  /* Console log output
    {
      "id": "2fc51d15-5c38-42d2-a8c2-3a2cd9b12eed",
      "source": "com.greeting.create",
      "specversion": "1.0",
      "type": "evt.greeting.create.success",
      "subject": "eJw9jsEKwzAMQ//F5yakowukf+MmbmdoEkjdMQj993kb7KKDhJ7Uobb4oEMaSm0wdyiYCWaINdutEQmXzcZGKAQDPKkdXIvmo3XWwTUAvSie8jU7cPpUVwzkcTErxclMKTqDYwrGe3cLfiFc1ruyuLDwbxVEH9i/aJhqRlZkOfddRzIJKv+63kIrOlI=",
      "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
      "dataschema": "#/demo/greeting/1.0.0",
      "data": {
        "greeting": "Hello, John Doe!"
      },
      "time": "2025-09-30T21:56:55.717+00:00",
      "to": "test.test.test",
      "accesscontrol": null,
      "redirectto": null,
      "executionunits": 0,
      "traceparent": "00-3f26d50949798776bcf3d1956a68c53f-7474d5ca5bb1afdd-01",
      "tracestate": null,
      "parentid": "79dfe032-c4ea-4f04-8040-70f8f9049bec",
      "domain": null
    }
  */
};

  
`,
    },
  ],
};
