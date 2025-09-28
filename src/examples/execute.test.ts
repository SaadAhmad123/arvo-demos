import { createArvoEventFactory } from 'arvo-core';
import { addContract, greetingContract, greetingOrchestratorContract, greetingResumableContract } from './handlers';
import { execute } from './execute';
import { testAnthropicAgent } from './handlers/agent.test.anthropic';
import { testOpenaiAgent } from './handlers/agent.test.openai';
import { testMcpAnthropicAgent } from './handlers/agent.mcp.test.anthropic';

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

  // Event flow: 'arvo.orc.greeting' -> greetingOrchestrator(greetingMachineV100) -> 'com.greeting.create', 'com.calculator.add', 'arvo.orc.greeting' -> Concurrently [greetingHandler, addHandler] <This is dues to single threaded nature of NodeJS>  -> 'evt.calculator.add.success', 'evt.greeting.create.success' -> greetingOrchestrator -> 'arvo.orc.greeting.resumable.done'
  await execute(event).then((e) => console.log(e));
};

const testAnthropicAgentic = async () => {
  console.log('Testing agentic Anthropic resumable');

  const event = createArvoEventFactory(testAnthropicAgent.contract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      message:
        'I am John Doe, aged 23. Use all the available tools at your disposal one by one (Request all tools at the same time) and finally show me the result from all and give me helpful insights.',
    },
  });

  await execute(event).then((e) => console.log(e));
};

const testOpenaiAgentic = async () => {
  console.log('Testing agentic OpenAI resumable');

  const event = createArvoEventFactory(testOpenaiAgent.contract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      message:
        'I am John Doe, aged 23. Use all the available tools at your disposal one by one (Request all tools at the same time) and finally show me the result from all and give me helpful insights.',
    },
  });

  await execute(event).then((e) => console.log(e));
};

const testMcpAnthropicAgentic = async () => {
  console.log('Testing agentic MCP OpenAI event handler');

  const event = createArvoEventFactory(testMcpAnthropicAgent.contract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      message:
        'What are the tools available to you? And what can you do with it. Also create a sample, call a tool and then show the results',
    },
  });

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
    await testOpenaiAgentic();
    await testAnthropicAgentic();
    await testMcpAnthropicAgentic();
  } catch (e) {
    console.log(e);
  }
};
