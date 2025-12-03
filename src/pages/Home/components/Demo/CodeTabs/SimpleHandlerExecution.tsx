import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const SimpleHandlerExecutionTab: DemoCodePanel = {
  heading: 'Executing Your First Event Handler',
  description: cleanString(`
    Arvo event handlers are functions wrapped in objects that perform intelligent operations 
    crucial to event handling. What sets Arvo apart from other EDA toolchains is its execution simplicity—handlers 
    don't require special execution environments or event brokers to run. By treating these as deployment and
    infrastructure concerns, Arvo allows you to defer such decisions and change them later as your needs evolve.

    In this example, the add handler is invoked directly via its \`.execute\` function—no 
    ceremony required. The factory creates the event, the handler processes it, and outputs 
    the result.
    
    ## Handler Execution Interface

    Every event handler exposes a consistent \`.execute()\` function that accepts a properly formatted 
    \`ArvoEvent\` and returns a list of events along with optional metadata. This uniformity extends 
    across all handler types, from basic request-response handlers to state machine-based and imperative 
    orchestration handlers. They all implement \`IArvoEventHandler\` interface and share the same 
    execution signature, \`(ArvoEvent) => Promise<{events: ArvoEvent[]}>\`


    ## Event Creation Factory

    Creating events manually can be complex, requiring careful management of numerous fields formatted 
    according to both the base structure and the handler's \`ArvoContract\`. Arvo simplifies this through 
    a powerful factory pattern. Using \`createArvoEventFactory\` with a contract version, you can easily 
    create events that handlers can **accept** or **emit**. You will learn more about this in the \`ArvoEventFactory\`
    documentation
  `),
  tabs: [
    {
      title: 'handlers/execute.add.handler.ts',
      lang: 'ts',
      code: `
import { createArvoEventFactory } from 'arvo-core';
import { addContract, addHandler } from './handlers/add.handler.js';

export async function executeAddHandler() {
  const event = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    // This can be any valid string. It denotes the source of the initiating event  
    source: 'test.test.test',
    data: {
      numbers: [1, 2],
    },
  });

  const { events: emittedEvents } = await addHandler().execute(event, { inheritFrom: 'EVENT' });

  for (const item of emittedEvents) {
    console.log(item.toString(2));
  }
}

executeAddHandler()

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
