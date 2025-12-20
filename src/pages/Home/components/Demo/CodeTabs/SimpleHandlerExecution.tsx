import { ArvoEventFactoryLearn } from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const SimpleHandlerExecutionTab: DemoCodePanel = {
  heading: 'Executing Your First Event Handler',
  description: cleanString(`
    Arvo event handlers execute without requiring special runtime environments or event brokers. This design treats 
    deployment and infrastructure as separate concerns, allowing you to defer those decisions and change them as 
    requirements evolve. Your handlers remain pure functions that process events and return events, independent of 
    how those events are delivered.

    The \`main.ts\` file demonstrates the simplest execution pattern. Create an event using the factory, call 
    the handler's \`.execute()\` method with that event, and receive emitted events in response. No brokers, 
    no queues, no infrastructure setup. The handler processes the event synchronously in your local process and 
    returns results immediately. This makes development, testing, and debugging straightforward since you can 
    invoke handlers like regular functions.

    ### Uniform Execution Interface

    Every Arvo event handler, regardless of complexity, implements the same \`IArvoEventHandler\` interface with 
    an identical execution signature of \`(ArvoEvent) => Promise<{events: ArvoEvent[]}>\`. Whether you're executing 
    a simple request-response handler like this addition service, a state machine-based workflow, or an imperative 
    orchestration handler, the execution pattern remains consistent. This uniformity simplifies testing, composition, 
    and deployment because all handlers are called the same way.

    The handler returns an object containing an \`events\` array rather than a single event because some handler 
    types emit multiple events during execution. Simple handlers typically return a single success or error event, 
    but the uniform interface accommodates more complex patterns without special-casing different handler types.

    ### Event Factory Pattern

    Manually constructing \`ArvoEvent\` objects requires managing numerous fields following both CloudEvents 
    specification and your contract's schemas. The [\`createArvoEventFactory\`](${ArvoEventFactoryLearn.link}) 
    function eliminates this complexity. Bind it to a specific contract version and you get a factory with 
    type-safe methods for creating events that handlers accept or emit. The factory enforces schema compliance 
    at compile time through TypeScript and at runtime through validation, preventing malformed events from 
    entering your system.

    The \`.accepts()\` method creates events conforming to the contract's input schema, while \`.emits()\` creates 
    events matching emission schemas. IntelliSense guides you through required fields and their types. The source 
    field identifies where the event originated using reverse-domain notation. The data field provides the typed 
    payload matching your contract schema. The factory handles everything else automatically, including generating 
    unique identifiers, timestamps, trace context, and subject encoding.

    ### What happened here?

    The logged event reveals Arvo's event structure. The \`type\` field matches the emission key from the contract 
    (\`evt.calculator.add.success\`). The \`source\` field shows the handler's identifier (\`com.calculator.add\`), 
    different from the triggering event's source. The \`to\` field contains the original source 
    (\`test.test.test\`), establishing response routing. The \`subject\` field encodes workflow context enabling 
    correlation across multi-step processes. The \`traceparent\` field provides distributed tracing context 
    following W3C standards. The \`executionunits\` field tracks computational cost for the operation.

    This execution pattern works identically whether you're testing locally, running in Lambda functions, processing 
    from Kafka topics, or coordinating through custom event brokers. The handler doesn't know or care about its 
    deployment context. It simply receives events and emits events. Your infrastructure layer handles routing and 
    delivery according to your operational requirements.
  `),
  tabs: [
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { createArvoEventFactory } from 'arvo-core';
import { addContract, addHandler } from './handlers/add.handler.ts';

async function main() {
  const event = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    // This can be any valid reverse-domain string. 
    // It denotes the source of the initiating event  
    source: 'test.test.test',
    data: {
      numbers: [1, 2],
    },
  });

  const { events: emittedEvents } = await addHandler().execute(event);

  for (const item of emittedEvents) {
    console.log(item.toString(2));
  }
}

main()

/**
 * Console log output
 *
 * {
 *    "id": "6443a5d7-1ea1-41a4-a6b7-4bd7cf2dfa64",
 *    "source": "com.calculator.add",
 *    "specversion": "1.0",
 *    "type": "evt.calculator.add.success",
 *    "subject": "eJw9jksKwzAMRO+idWzc2E3S3MZICjX4A45TAiZ3r9pCN7OYB2+mQ6n45L1V30qFtUP2iWEFLEmjj3jED9CeCAZ4cd1DyYJv2mgD1wB8Mh7tW3YIJIgeRPeZrbKbGZUzdlOLs05NG7oF58WN0ySukEMLv1FockD/QyCV5IMo8xGjjCRuXvzX9QZ9szhA",
 *    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
 *    "dataschema": "#/demo/calculator/add/1.0.0",
 *    "data": {
 *      "result": 3
 *    },
 *    "time": "2025-09-30T19:56:11.051+00:00",
 *    "to": "test.test.test",
 *    "accesscontrol": null,
 *    "redirectto": null,
 *    "executionunits": 0.000002,
 *    "traceparent": "00-18abd9d92ac359994073cce4f7a3ab3a-37c41500126dbfa4-01",
 *    "tracestate": null,
 *    "parentid": "7714c68e-a670-4de2-84d4-0b85af34921d",
 *    "domain": null
 * }
 */


  
`,
    },
  ],
};
