import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

const label = 'execute.test.ts';
export const ExecuteTab: DemoCodePanel = {
  heading: 'Integrating Orchestrators Into Arvo Fabric',
  description: cleanString(`
    With orchestrators defined in both paradigms—declarative state machines and imperative resumables—you're 
    ready to integrate them into your event-driven system. Despite their different internal implementations, 
    both orchestrator types share the same execution interface through the \`.execute\` method, allowing them 
    to participate in the event fabric exactly like basic event handlers.

    ## Memory Requirements for Orchestrators

    Orchestrators require a memory backend to persist their state between event processing cycles. This is 
    implemented as a simple key-value store through the \`IMachineMemory\` interface. Arvo provides 
    \`SimpleMachineMemory\` for in-memory storage during development and testing, but production deployments 
    should use persistent storage solutions suited to your infrastructure—Redis, DynamoDB, PostgreSQL, or any 
    database that can implement the interface.

    The memory interface handles state persistence, retrieval, and cleanup. In production scenarios, you'll 
    also need to consider the locking mechanisms required for concurrent access, which are covered in detail 
    in the dedicated memory documentation. Any storage solution that implements \`IMachineMemory\` will work 
    seamlessly with Arvo's orchestrators.

    ## Bringing It All Together

    This example demonstrates the complete integration of all components from this getting started guide. 
    The \`executeBroker\` function creates an in-memory event broker that routes events to registered handlers 
    based on the event's \`to\` field matching each handler's \`source\`. This pattern enables local event 
    processing without external message brokers, making it valuable for development, testing, and 
    self-contained applications.

    The example shows four different event types being processed: a simple addition operation, a greeting 
    generation, a declarative state machine orchestration, and an imperative resumable orchestration. Notice 
    how both orchestrators produce similar outputs despite using fundamentally different internal logic. The 
    resumable even validates its result against the state machine orchestrator's output, demonstrating the 
    interoperability between the two approaches.

    The \`parentSubject$$\` field in orchestrator events deserves special attention. This field identifies the 
    parent process ID for nested orchestrations, enabling proper context stitching across workflow hierarchies. 
    A \`null\` value indicates a root-level orchestration, which will be the case for the vast majority of 
    workflows you create. Only when deliberately composing nested orchestrations will you need to pass a parent 
    subject.

    This pattern—simple handlers, declarative orchestrators, imperative resumables, and memory-backed state 
    management—forms the foundation of Arvo's event-driven architecture. From here, you can scale to 
    distributed deployments, integrate external message brokers, add persistent storage, and build complex 
    agentic workflows while maintaining the same core abstractions demonstrated in this guide.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import { type ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { createSimpleEventBroker, SimpleMachineMemory } from 'arvo-event-handler';
import { addContract, addHandler } from './handlers/add.handler';
import { greetingContract, greetingHandler } from './handlers/greeting.handler';
import { greetingOrchestrator, greetingOrchestratorContract } from './handlers/greeting.orchestrator';
import { greetingResumable, greetingResumableContract } from './handlers/greeting.resumable';

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
const executeBroker = async (event: ArvoEvent) => {
  /**
   * An in-memory key-value pair which following IMachineMemory interface. The
   * orchestrators and resumables use it to store their state in this memory.
   */
  const memory = new SimpleMachineMemory();
  return await createSimpleEventBroker([
    addHandler(),
    greetingHandler(),
    greetingOrchestrator({ memory }),
    greetingResumable({ memory }),
  ]).resolve(event);
};

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

  const greetingOrchestratorEvent = createArvoEventFactory(greetingOrchestratorContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      /**
       * A field specific to orchestrators and resumables to identify the parent
       * process id (subject). This enable context stitching for nested orchestrations.
       * A 'null' value means that this is the root orchestration and for 99.99% of the
       * cases developer will be marking it as 'null'.
       */
      parentSubject$$: null,
      name: 'John Doe',
      age: 23,
    },
  });

  const greetingResumableEvent = createArvoEventFactory(greetingResumableContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      name: 'John Doe',
      age: 23,
    },
  });

  await executeBroker(additionEvent).then((result) => console.log(result?.toString(2) ?? 'No event resolved'));
  await executeBroker(greetingEvent).then((result) => console.log(result?.toString(2) ?? 'No event resolved'));

  await executeBroker(greetingOrchestratorEvent).then((result) =>
    console.log(result?.toString(2) ?? 'No event resolved'),
  );
  /*
    {
      "id": "0ece5fc6-5070-47ed-80b5-dde111d307c9",
      "source": "arvo.orc.greeting",
      "specversion": "1.0",
      "type": "arvo.orc.greeting.done",
      "subject": "eJw9jUsKwzAMBe+idWzydUluI9siFcQ2OEoIhNy9ooVu3uINzNxQanjTLhWlVFhuyJgIFsB6FqvMrpVIOK/QwEl155KVdra1LTwN0EXhkO95A0dFQ+8GcpM3LiCaccZofBxn413XD26eXi5EdXFm4V8TRPv2PwpjSciqzMe2aSSRoPqf5wNrjTiC",
      "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
      "dataschema": "#/demo/orc/greeting/1.0.0",
      "data": {
        "errors": null,
        "result": "Greeting -> Hello, John Doe!, Updated Age -> 30"
      },
      "time": "2025-09-30T22:35:52.263+00:00",
      "to": "test.test.test",
      "accesscontrol": null,
      "redirectto": "arvo.orc.greeting",
      "executionunits": 0,
      "traceparent": "00-96ff83190570c64606f2812a3387d260-97f0f9f1b694c388-01",
      "tracestate": null,
      "parentid": "f6bdb78b-9e91-4c04-85f9-aac05c9fd064",
      "domain": null
    }
  */

  await executeBroker(greetingResumableEvent).then((result) => console.log(result?.toString(2) ?? 'No event resolved'));
  /*
    {
      "id": "56c42c7b-d750-463a-a6cd-a2813bcd2859",
      "source": "arvo.orc.greeting.resumable",
      "specversion": "1.0",
      "type": "arvo.orc.greeting.resumable.done",
      "subject": "eJw9jt0KgzAMhd8l17ZU58/0bWqbuYBtIUYRxHdf2GA35yJf+M65oHB44ybspTBMF2SfECbwfBSrzC6MKJQXy7jtyc8rQgUH8kYl619tnXVwV4Anhl2+xwsoKnLN2A0Ba+PmUJvW4WCe8TWarnnMse1d34VBXZRJ6NcOokvsPxTGkjypMu/rqiUJxav/vj8EEDwK",
      "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
      "dataschema": "#/demo/resumable/greeting/1.0.0",
      "data": {
        "errors": null,
        "result": "Greeting -> Hello, John Doe!, Updated Age -> 30",
        "sameResultFromWorkflow": true
      },
      "time": "2025-09-30T22:37:03.471+00:00",
      "to": "test.test.test",
      "accesscontrol": null,
      "redirectto": "arvo.orc.greeting.resumable",
      "executionunits": 0,
      "traceparent": "00-7149213e5975f1fcdeb09fedac100257-6a652985acd4c13b-01",
      "tracestate": null,
      "parentid": "718899bd-369b-49a8-aab6-51c84d5309b6",
      "domain": null
    }
  */
};


    
`,
    },
  ],
};
