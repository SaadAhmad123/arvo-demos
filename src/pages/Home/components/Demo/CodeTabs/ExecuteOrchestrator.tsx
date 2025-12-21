import {} from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const ExecuteOrchestratorTab: DemoCodePanel = {
  heading: 'Running the Complete Workflow',
  description: cleanString(`
    The orchestrator registers with \`SimpleEventBroker\` alongside the handlers it coordinates, instantiated 
    with \`SimpleMachineMemory\` for state persistence. \`SimpleMachineMemory\` provides in-memory storage for 
    workflow state, implementing the \`IMachineMemory\` interface. It's perfect for local development, testing, 
    and small-scale applications. For production deployments requiring durability or distributed coordination, 
    you'd implement \`IMachineMemory\` backed by Redis, PostgreSQL, DynamoDB, or any key-value store. The 
    orchestrator code remains identical regardless of the memory backend.

    The complete multi-step workflow executes through event-driven coordination. The orchestrator emits events 
    to handlers, persists state to \`SimpleMachineMemory\` between responses, and eventually returns the 
    completion event. This state persistence enables the start-stop execution model where the orchestrator 
    releases all resources between events while maintaining workflow continuity. The console output shows the 
    final completion event containing the calculated average after the workflow coordinated both addition and 
    product handlers.
  `),
  tabs: [
    {
      title: 'tests/average.workflow__unit_test.ts',
      lang: 'ts',
      code: `
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import {
  createSimpleEventBroker,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { addHandler } from './handlers/add.service.ts';
import { productHandler } from './handlers/product.service.ts';
import {
  averageWorkflow,
  averageWorkflowContract,
} from './handlers/average.workflow.ts';

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  const response = await createSimpleEventBroker([
    addHandler(),
    productHandler(),
    // Register the orchestrator here
    averageWorkflow({ memory }),
  ]).resolve(event);
  return response ? [response] : [];
};

async function main() {
  const event = createArvoEventFactory(averageWorkflowContract.version('1.0.0'))
    .accepts({
      source: TEST_EVENT_SOURCE,
      data: {
        parentSubject$$: null,  // This is an implementation detail
        numbers: [1, 2, 3, 4],
      },
    });
  const emittedEvents = await executeHandlers(event);
  for (const item of emittedEvents) {
    console.log(item.toString(2));
  }
}

main();

/*

Console log

{
  "id": "4d1fe001-e447-4a85-9796-0531c190b5dc",
  "source": "arvo.orc.workflow.average",
  "specversion": "1.0",
  "type": "arvo.orc.workflow.average.done",
  "subject": "eJw9jt0KwyAMRt8l11WU6Vb6NrGmm8wasPYHSt99YYPdhJATzvedwHV80dIqNq4wnFBwJhgA68ZamN65vqfMu8aNKj4JOpBlSVzky2qjDVwd0EHj2r7HE1IU5KaHDdbclfejV85OQeGt75ULzmMMGPvoxZVKaumXDU166P8QGHnGJMqy5iwhMzUU/3V9AJxCO9U=",
  "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
  "dataschema": "#/org/amas/calculator/average/1.0.0",
  "data": {
    "success": true,
    "average": 2.5,
    "errors": null
  },
  "time": "2025-12-21T20:08:44.909+00:00",
  "to": "test.test.test",
  "accesscontrol": null,
  "redirectto": "arvo.orc.workflow.average",
  "executionunits": 0,
  "traceparent": "00-7f77327b2217b75b029f10e56e481c41-5b45f48b428298bc-01",
  "tracestate": null,
  "parentid": "898786bc-0d89-4a21-a083-7c73e7599cf0",
  "domain": null
}

*/



      `,
    },
  ],
};
