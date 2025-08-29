import type { CodeBlockProps } from '../../../../../components/CodeBlock';

const label = 'execute.test.ts';
export const TestExecuteTab: CodeBlockProps['tabs'][number] = {
  title: label,
  lang: 'ts',
  code: `
import { type ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { addContract, greetingContract, greetingOrchestratorContract } from './demo';
import { execute } from './execute';

// This is just a sample script to do a quick test.
// Actual tests should be done via actual Typescript
// testing frameworks like jest
export const testArvoDemo = () => {
  console.log('Testing greeting handler');
  let event: ArvoEvent = createArvoEventFactory(greetingContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      name: 'John Doe',
    },
  });

  // Event flow: 'com.greeting.create' -> greetingHandler -> evt.greeting.create.success
  execute(event)
    .then((e) => console.log(e))
    .catch(console.error);

  console.log('Testing add handler');
  event = createArvoEventFactory(addContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      numbers: [2, 3, 4],
    },
  });

  // Event flow: 'com.calculator.add' -> addHandler -> evt.calculator.add.success
  execute(event)
    .then((e) => console.log(e))
    .catch(console.error);

  console.log('Testing greeting orchestrator');
  event = createArvoEventFactory(greetingOrchestratorContract.version('1.0.0')).accepts({
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
  execute(event)
    .then((e) => console.log(e))
    .catch(console.error);
};
    
`,
};
