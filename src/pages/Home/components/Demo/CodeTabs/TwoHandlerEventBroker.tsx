import { EventRoutingAndBrokerInArvoLearn } from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const TwoHandlerBrokerTab: DemoCodePanel = {
  heading: 'The Event Broker Pattern',
  description: cleanString(`
    The event broker is Arvo's native execution pattern and represents a shift from direct 
    handler execution to event-driven coordination. Instead of calling handlers directly, you send events to 
    a broker that routes them to appropriate handlers. This architectural change enables the decoupling and scalability characteristics 
    that define event-driven systems.

    ### The \`SimpleEventBroker\` in Arvo

    Arvo provides \`SimpleEventBroker\`, an in-memory FIFO queue-based broker that runs entirely within your 
    process. This broker works for local development, testing, and small-scale production applications where 
    distributed infrastructure isn't needed yet.

    The \`SimpleEventBroker\` implements Arvo's lightweight broker design by performing simple string matching between 
    the event's \`to\` field and registered handlers' \`source\` identifiers. When a match occurs, it executes 
    that handler and returns the result. This simplicity is intentional. Events in Arvo are self-describing and 
    carry their routing information, allowing brokers to remain lightweight while handlers contain the orchestration 
    intelligence. For a comprehensive understanding of this design philosophy and how it enables scalability, see 
    the [${EventRoutingAndBrokerInArvoLearn.name}](${EventRoutingAndBrokerInArvoLearn.link}) documentation.

    The \`executeHandlers\` function demonstrates the registration pattern. Pass an array of handler instances 
    to \`createSimpleEventBroker\`, and the broker builds an internal routing mechanism. Call \`.resolve()\` with 
    an event, and the broker routes it through registered handlers, continuing until an event is emitted back 
    to the original source. It returns this final event addressed to the initiating source.

    ### Handler Coordination Without Coupling

    Both the addition and product handlers register with the same broker but remain completely unaware of each 
    other. Neither handler imports or references the other. They declare their identities through source values 
    and trust the broker to deliver relevant events.

    In later sections, you'll see orchestration and workflow handlers that emit events into this same broker. Those orchestrators 
    won't call the addition or product handlers directly. They'll emit events based on workflow logic, and the 
    broker routes those events to the appropriate handlers. This establishes true architectural decoupling where 
    components communicate purely through events.

    ### Infrastructure Portability

    The same lightweight routing pattern that \`SimpleEventBroker\` implements locally is expected from large-scale brokers 
    like Kafka or RabbitMQ. Handler code remains unchanged because handlers only interact with events, not the 
    delivery mechanism. This enables you to defer infrastructure complexity. Start with \`SimpleEventBroker\` 
    and build your handler logic without provisioning message queues. When your application scales beyond a 
    single process, swap the broker implementation without modifying handler code.
  `),
  tabs: [
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { addHandler } from './handlers/add.service.ts';
import { createSimpleEventBroker } from 'arvo-event-handler';
import { productContract, productHandler } from './handlers/product.service.ts';

const TEST_EVENT_SOURCE = 'test.test.test';

// The function provides a simple interface to execute
// any event by registering the event handler in a simple
// in-process in-memory FIFO queue based event broker
// provided out-of-the-box by Arvo
export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  // Registers event handlers with an in-memory broker that routes events
  // based on the event's 'to' field matching handler 'source' identifiers.
  // The broker continues routing until an event addressed to the original
  // source is emitted, then returns that final event.
  const response = await createSimpleEventBroker([
    addHandler(),
    productHandler(),
  ]).resolve(event);
  return response ? [response] : [];
};

async function main() {
  const event = createArvoEventFactory(productContract.version('1.0.0'))
    .accepts({
      source: TEST_EVENT_SOURCE,
      data: {
        numbers: [1, 2, 3, 4],
      },
    });

  const emittedEvents = await executeHandlers(event);

  console.log('The output of the product handler');
  for (const item of emittedEvents) {
    console.log(item.toString(2));
  }
}

main();


/*

Console log

// Notice the emitted event structure:
// - 'source' identifies which handler produced this event (com.calculator.product)
// - 'to' contains the original event source (test.test.test) for response routing
// - 'executionunits' shows the accumulated cost (0.000004) calculated by the handler
// - 'subject' encodes workflow context enabling correlation across multi-step processes

The output of the product handler
{
  "id": "a0ed0460-f688-4fee-9cca-461c76f50ffd",
  "source": "com.calculator.product",
  "specversion": "1.0",
  "type": "evt.calculator.product.success",
  "subject": "eJw9jksOwjAMRO/idROlJUDb26SOKyLlg1KnQqp6dwxIbGbhZ72ZA0rFB21cHZcK8wHZJYIZsCSNLmKLH6CftfiGDB3sVLdQsrz02mgDZwf0Imz8PR4QvCBzQTs5e1P9OEzK3pdJjVfjVb+O1i+D87SSuEIOHH7FwDJC/0OgL8kFUeYWo5QkYif+83wDxcM6ng==",
  "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
  "dataschema": "#/org/amas/calculator/product/1.0.0",
  "data": {
    "result": 24
  },
  "time": "2025-12-21T13:34:40.404+00:00",
  "to": "test.test.test",
  "accesscontrol": null,
  "redirectto": null,
  "executionunits": 0.000004,
  "traceparent": "00-dc28fda621a4cbdafc837371a48a1af6-b2b7938e5022e5dd-01",
  "tracestate": null,
  "parentid": "f8a9e7cc-1d84-40ec-bb82-5b4778761d3d",
  "domain": null
}

*/
  
`,
    },
  ],
};
