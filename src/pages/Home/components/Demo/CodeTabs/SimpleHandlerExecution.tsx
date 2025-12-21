import { ArvoEventFactoryLearn, ArvoEventLearn } from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const SimpleHandlerExecutionTab: DemoCodePanel = {
  heading: 'Executing Your First Event Handler',
  description: cleanString(`
    Event handlers in Arvo don't require special runtime environments or event brokers for exection. This design treats 
    deployment and infrastructure as separate concerns, allowing you to defer those decisions and change them as 
    requirements evolve.

    The \`main.ts\` file demonstrates the simplest execution pattern. Create an event using the factory, call 
    the handler's \`.execute()\` method with that event, and receive emitted events in response. No brokers, 
    no queues, no infrastructure setup. This makes development, testing, and debugging straightforward since you can 
    invoke handlers like regular functions.

    ### A Uniform Execution Interface

    Every event handler in Arvo implements the same \`IArvoEventHandler\` interface with an identical execution 
    signature of \`(ArvoEvent) => Promise<{events: ArvoEvent[]}>\`. Whether executing a simple request-response 
    handler, a state machine workflow, or an imperative orchestrator, the pattern remains consistent. This uniformity 
    extends beyond call structure. Arvo standardizes execution behavior across handler types, enabling infrastructure 
    and execution layers to treat all handlers identically without special-casing different implementations.

    ### Event Factory Pattern

    Manually constructing \`ArvoEvent\` objects requires managing numerous fields following both CloudEvents 
    specification and your contract's schemas. The [\`createArvoEventFactory\`](${ArvoEventFactoryLearn.link}) 
    function eliminates this complexity. Bind it to a specific contract version and you get a factory with 
    type-safe methods for creating events that handlers accept or emit. The factory enforces schema compliance 
    at compile time through TypeScript and at runtime through validation, preventing malformed events from 
    entering your system. The \`.accepts()\` method creates events conforming to the contract's input schema, 
    while \`.emits()\` creates events matching emission schemas. 

    ### The ArvoEvent

    The logged event reveals the [\`ArvoEvent\`](${ArvoEventLearn.link}) structure. The \`type\` field matches the emission key from the contract 
    (\`evt.calculator.add.success\`). The \`source\` field shows the handler's identifier (\`com.calculator.add\`), 
    different from the triggering event's source. The \`to\` field contains the original source 
    (\`test.test.test\`), establishing response routing. The \`subject\` field encodes workflow context enabling 
    correlation across multi-step processes. The \`traceparent\` field provides [opentelemetry](https://opentelemetry.io/docs/concepts/signals/traces/)
    distributed tracing context following W3C standards.
  `),
  tabs: [
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { createArvoEventFactory } from 'arvo-core';
import { addContract, addHandler } from './handlers/add.service.ts';

async function main() {
  const event = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test', // A valid source string, telling the event handler where to send the response back
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
 *    "executionunits": 0,
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
