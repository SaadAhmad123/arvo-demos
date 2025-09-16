import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

const label = 'execute.test.ts';
export const TestExecuteTab: DemoCodePanel = {
  heading: 'Test Event Processing',
  description: cleanString(`
    Before actually delving into creating the event handlers. Let's create 
    a simple test script to demonstrate the event processing pipeline execution. 
    The scenarios here cover individual handler executions and orchestrated workflows.
    
    Each test creates an \`ArvoEvent\` using the appropriate contract factory, then 
    passes it to the execute function to process through the event broker. This 
    validates that handlers are properly registered, events are correctly routed, 
    and the orchestrator manages complex multi-step workflows as expected.
    
    This example script show three key patterns: simple handler processing, calculator 
    operations, and orchestrated workflows that coordinate multiple handlers 
    concurrently to produce final results.

    > **Note:** In production applications, use proper testing frameworks like Jest 
    > instead of console logging for comprehensive test suites.
  `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import { createArvoEventFactory } from 'arvo-core';
import { addContract } from './handlers/add.handler.ts';
import { greetingContract } from './handlers/greeting.handler.ts';
import { greetingOrchestratorContract } from './handlers/greeting.orchestrator.ts'
import { greetingResumableContract } from './handlers/greeting.resumable.ts';
import { execute } from './execute';

const testGreetingHandler = async () => {
  console.log('Testing greeting handler');
  const event = createArvoEventFactory(greetingContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      name: 'John Doe',
    },
  });
  // Event flow: 'com.greeting.create' -> greetingHandler -> evt.greeting.create.success
  await execute(event).then((e) => console.log(e));
};

const testAddHandler = async () => {
  console.log('Testing add handler');
  const event = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      numbers: [2, 3, 4],
    },
  });

  // Event flow: 'com.calculator.add' -> addHandler -> evt.calculator.add.success
  await execute(event).then((e) => console.log(e));
};

export const testGreetingOrchestrator = async () => {
  console.log('Testing greeting orchestrator');
  const event = createArvoEventFactory(greetingOrchestratorContract.version('1.0.0')).accepts({
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
      age: 45,
    },
  });

  // Event flow: 'arvo.orc.greeting' -> greetingOrchestrator(greetingMachineV100) -> 'com.greeting.create', 'com.calculator.add' -> Concurrently [greetingHandler, addHandler] <This is dues to single threaded nature of NodeJS>  -> 'evt.calculator.add.success', 'evt.greeting.create.success' -> greetingOrchestrator -> 'arvo.orc.greeting.done'
  await execute(event).then((e) => console.log(e));
};

export const testGreetingResumable = async () => {
  console.log('Testing greeting orchestrator');
  const event = createArvoEventFactory(greetingResumableContract.version('1.0.0')).accepts({
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
      age: 45,
    },
  });

  // Event flow: 'arvo.orc.greeting.resumable' -> greetingOrchestrator(greetingMachineV100) -> 'com.greeting.create', 'com.calculator.add', 'arvo.orc.greeting' -> Concurrently [greetingHandler, addHandler] <This is dues to single threaded nature of NodeJS>  -> 'evt.calculator.add.success', 'evt.greeting.create.success' -> greetingOrchestrator -> 'arvo.orc.greeting.resumable.done'
  await execute(event).then((e) => console.log(e));
};

// This is just a sample script to do a quick test.
// Actual tests should be done via actual Typescript
// testing frameworks like jest
export const testArvoDemo = async () => {
  try {
    await testAddHandler();
    await testGreetingHandler();
    await testGreetingOrchestrator();
    await testGreetingResumable();
  } catch (e) {
    console.log(e);
  }
};
    
`,
    },
  ],
};
