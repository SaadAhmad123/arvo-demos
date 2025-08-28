import type { CodeBlockProps } from '../../../../../components/CodeBlock';

const label = 'execute.test.ts';
export const TestExecuteTab: CodeBlockProps['tabs'][number] = {
  title: label,
  lang: 'ts',
  code: `
import { type ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { addContract, greetingContract } from './demo';
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
};
  
`,
};
