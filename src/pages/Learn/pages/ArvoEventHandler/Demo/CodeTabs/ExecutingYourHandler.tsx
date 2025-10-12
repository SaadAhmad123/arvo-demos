import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ExecutingYourHandler: DemoCodePanel = {
  singlePanel: true,
  heading: 'Executing Your Event Handler',
  description: cleanString(`
    \`ArvoEventHandler\` instances wrap versioned handler functions to seamlessly 
    integrate them into Arvo's event-driven architecture. Every event handler exposes 
    a consistent \`.execute()\` method that accepts a properly formatted \`ArvoEvent\` 
    and returns a list of emitted events along with optional metadata.

    This uniformity extends across all handler types in Arvo—from basic request-response 
    handlers to state machine-based and imperative orchestration handlers. They all 
    inherit from \`AbstractArvoEventHandler\` and share the same execution signature: 
    \`(ArvoEvent) => Promise<{events: ArvoEvent[]}>\`. This consistency enables 
    predictable integration patterns regardless of handler complexity.

    This example demonstrates two execution approaches:

    1. **Direct execution** invokes the handler's \`.execute()\` method immediately. 
    The factory creates the event, the handler processes it, and returns the result. 
    This approach works well for synchronous workflows, testing, and scenarios where 
    you need direct control over handler invocation.
    2. **Event broker execution** demonstrates Arvo's native operational paradigm using 
    \`SimpleEventBroker\` from \`arvo-event-handler\` for in-memory event routing. 
    The broker matches the \`event.to\` field with registered handlers' \`handler.source\` 
    values to route events automatically. 
    
    While the demonstrated \`SimpleEventBroker\` uses a TypeScript 
    array as a FIFO queue for development and testing, production systems can replace 
    it with distributed message brokers like RabbitMQ, AWS SQS, or Apache Kafka that 
    implement the same routing pattern. You can reference the \`SimpleEventBroker\` 
    [implementation](https://github.com/SaadAhmad123/arvo-event-handler/blob/main/src/utils/SimpleEventBroker/index.ts) for reference to build your own broker intergrations.
  `),
  tabs: [
    {
      title: 'execute.ts',
      lang: 'ts',
      code: `
import { type ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { createSimpleEventBroker } from 'arvo-event-handler';
import { addContract, addHandler } from './handlers/add.handler';

/**
 * [[OPTION # 1]]
 * 
 * Direct handler execution example
 * 
 * This approach invokes the handler immediately without broker mediation.
 * Useful for testing, debugging, and synchronous workflows where you need
 * direct control over event processing.
 */
export async function executeAddHandler() {
  // Create input event using the contract factory for type safety
  const event = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      numbers: [1, 2],
    },
  });

  console.log(\`Executing handler with source: \${addHandler.source}\`)

  // Execute handler directly and destructure the emitted events
  // inheritFrom: 'EVENT' preserves OpenTelemetry trace context from input event
  const { events: emittedEvents } = await addHandler.execute(event, { inheritFrom: 'EVENT' });

  
  // Log each emitted event in pretty-printed JSON format
  for (const item of emittedEvents) {
    console.log(item.toString(2));
  }

  /**
   * Console log output
   * 
   * Executing handler with source: com.calculator.add
   *
   * {
   *    "id": "6443a5d7-1ea1-41a4-a6b7-4bd7cf2dfa64",
   *    "source": "com.calculator.add",              // Handler's source identifier
   *    "specversion": "1.0",
   *    "type": "evt.calculator.add.success",         // Success event type from contract
   *    "subject": "eJw9jksKwzAMRO+idWzc2E3S3MZICjX4A45TAiZ3r9pCN7OYB2+mQ6n45L1V30qFtUP2iWEFLEmjj3jED9CeCAZ4cd1DyYJv2mgD1wB8Mh7tW3YIJIgeRPeZrbKbGZUzdlOLs05NG7oF58WN0ySukEMLv1FockD/QyCV5IMo8xGjjCRuXvzX9QZ9szhA",
   *    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
   *    "dataschema": "#/demo/calculator/add/1.0.0", // Contract version reference
   *    "data": {
   *      "result": 3                                  // Computed sum: 1 + 2
   *    },
   *    "time": "2025-09-30T19:56:11.051+00:00",
   *    "to": "test.test.test",                       // Return address (original source)
   *    "accesscontrol": null,
   *    "redirectto": null,
   *    "executionunits": 0.000002,                   // Dynamic cost: 2 numbers
   *    "traceparent": "00-18abd9d92ac359994073cce4f7a3ab3a-37c41500126dbfa4-01",
   *    "tracestate": null,
   *    "parentid": "7714c68e-a670-4de2-84d4-0b85af34921d", // Links to input event
   *    "domain": null
   * }
   */
}

/**
 * [[OPTION # 2]]
 * 
 * Event broker execution example
 * 
 * Creates an in-memory event broker that automatically routes events to registered handlers
 * based on event.to === handler.source matching. The broker processes events through a
 * FIFO queue, executing handlers sequentially until no more events remain.
 *
 * This pattern demonstrates Arvo's native operational model where handlers don't invoke
 * each other directly but communicate through event emission and broker-mediated routing.
 * 
 * Benefits:
 * - Decouples handlers from each other
 * - Enables testing without external infrastructure
 * - Provides foundation for distributed broker implementations
 */
const executeBroker = async (event: ArvoEvent) =>
  await createSimpleEventBroker([
    addHandler, 
    // Additional handlers can be registered here
    // The broker routes events to the appropriate handler automatically
  ]).resolve(event);

export const executeWithEventBrokerPattern = async () => {
  // Create input event with four numbers to sum
  const additionEvent = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      numbers: [1, 2, 3, 4],
    },
  });

  // Submit event to broker and await final result
  // The broker handles routing, execution, and returns the terminal event
  await executeBroker(additionEvent).then((result) => 
    console.log(result?.toString(2) ?? 'No event resolved')
  );
  
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
        "result": 10                                    // Computed sum: 1 + 2 + 3 + 4
      },
      "time": "2025-09-30T21:56:55.713+00:00",
      "to": "test.test.test",                          // Routes back to originating source
      "accesscontrol": null,
      "redirectto": null,
      "executionunits": 0.000004,                      // Dynamic cost: 4 numbers
      "traceparent": "00-582e4a4d20e56ec93f804e8eda00138a-3c1389d5a4717fe4-01",
      "tracestate": null,
      "parentid": "291bc961-bdfb-467f-a4db-a36a1177f0bb",
      "domain": null
    }
  */
};

// Execute both examples concurrently to demonstrate both patterns
Promise.all([executeWithEventBrokerPattern(), executeAddHandler()])

 
`,
    },
  ],
};
