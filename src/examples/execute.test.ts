import { createArvoEventFactory } from 'arvo-core';
import { greetingContract } from './demo';
import { execute } from './execute';

// This is just a sample script to do a quick test.
// Actual tests should be done via actual Typescript
// testing frameworks like jest
export const testArvoDemo = () => {
  const event = createArvoEventFactory(greetingContract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      name: 'John Doe',
    },
  });

  execute(event)
    .then((e) => console.log(e))
    .catch(console.error);
};
