import { cleanString } from '../../../../../../utils';
import {} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const Integration: DemoCodePanel = {
  heading: 'Stitching Agents in Arvo Fabric',
  description: cleanString(`
    Once AI agents are created using factory patterns, integrating them into 
    the Arvo ecosystem is straightforward. Agents register with the event broker 
    like any other event handler, requiring only a memory manager to persist 
    execution state between event cycles.

    ## Infrastructure Simplicity

    The \`execute\` function demonstrates this simplicity through minimal infrastructure with
    an in-memory key-value store for state management and a simple event broker 
    implemented as an in-memory FIFO queue. The testing function \`testArvoDemo\` 
    in \`execute.test.ts\` demonstrates that the same execute function can run any 
    handler, orchestrator, or agent with the correct event.

    The in-memory broker automatically routes events based on type matching, handling 
    the complete event flow from initial request through intermediate processing to 
    final response. When an agent emits an event to invoke another service, the broker 
    ensures proper delivery and response correlation without requiring agents to have 
    direct knowledge of each other. See the [event broker design](/advanced/event-routing-and-brokers) for more information in this
    area. 

    ## Production Scalability

    For production deployments, this code structure scales to distributed scenarios 
    by replacing \`SimpleMachineMemory\` with a distributed state store featuring 
    optimistic locking capability and replacing \`createSimpleEventBroker\` with 
    production message brokers like RabbitMQ. Event handlers, including AI agents, 
    remain unchanged during this transition, demonstrating the architecture's 
    scalability from prototype to production. Distributed deployment patterns and 
    broker integrations are covered in their respective documentation sections.
  `),
  tabs: [
    {
      title: 'execute.ts',
      lang: 'ts',
      code: `
import type { ArvoEvent } from 'arvo-core';
import { createSimpleEventBroker, SimpleMachineMemory } from 'arvo-event-handler';
import { findDomainMcpAgent } from './handlers/agent.mcp.findadomain.js';
import { calculatorAgent } from './handlers/agent.calculator.js';
import { calculatorHandler } from './handlers/calculator.handler.js';
import { webInfoAgent } from './handlers/agent.webinfo.js';
import { astroDocsMcpAgent } from './handlers/agent.mcp.astro.docs.js';
import { fibonacciHandler } from './handlers/fibonacci.handler.js';

export const execute = async (event: ArvoEvent): Promise<ArvoEvent | null> => {
  /**
   * An in-memory key-value pair which following IMachineMemory interface. The
   * orchestrators and resumables use it to store their state in this memory.
   */
  const memory = new SimpleMachineMemory();
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
  const { resolve } = createSimpleEventBroker([
    calculatorHandler(),
    findDomainMcpAgent.handlerFactory(),
    calculatorAgent.handlerFactory({ memory }),
    astroDocsMcpAgent.handlerFactory(),
    webInfoAgent.handlerFactory({ memory }),
    fibonacciHandler(),
  ]);
  return await resolve(event);
};


    `,
    },
    {
      title: 'execute.test.ts',
      lang: 'ts',
      code: `
import { createArvoEventFactory } from 'arvo-core';
import { execute } from './execute.js';
import { findDomainMcpAgent } from './handlers/agent.mcp.findadomain.js';
import { calculatorAgent } from './handlers/agent.calculator.js';
import { webInfoAgent } from './handlers/agent.webinfo.js';

export const testFindDomainMcpAgent = async () => {
  console.log('Testing Find A Domain MCP Agent');
  const event = createArvoEventFactory(findDomainMcpAgent.contract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      message:
        'I want to register the domain http://arvo.land. If that is taken can you give me similar domains that are open?',
    },
  });
  await execute(event).then((e) => console.log(e));
};

export const testCalculatorAgent = async () => {
  console.log('Testing Calculator Agent');
  const event = createArvoEventFactory(calculatorAgent.contract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      message: 'What can you do?',
    },
  });
  await execute(event).then((e) => console.log(e));
};

export const testWebInfoAgent = async () => {
  console.log('Testing Web Info Agent');
  const event = createArvoEventFactory(webInfoAgent.contract.version('1.0.0')).accepts({
    source: 'test.test.test',
    data: {
      parentSubject$$: null,
      message:
        'Can I register arvo.land domain? Also based on the Astro docs give me a summary of Astro with references',
    },
  });
  await execute(event).then((e) => console.log(e));
};

// This is just a sample script to do a quick test.
// Actual tests should be done via actual Typescript
// testing frameworks like jest
export const testArvoDemo = async () => {
  try {
    await testFindDomainMcpAgent();
    await testCalculatorAgent();
    await testWebInfoAgent();
  } catch (e) {
    console.log(e);
  }
};

    `,
    },
  ],
};
