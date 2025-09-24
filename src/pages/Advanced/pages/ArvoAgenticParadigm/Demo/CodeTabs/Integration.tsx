import { cleanString } from '../../../../../../utils';
import {} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const Integration: DemoCodePanel = {
  heading: 'Stitching Agents in Arvo Fabric',
  description: cleanString(`
    Once AI agents are created using the factory patterns, integrating them into 
    the Arvo ecosystem becomes remarkably straightforward. The agents register 
    with the event broker exactly like any other event handler, requiring only 
    a memory manager for persisting execution state between event cycles.

    The \`execute\` function demonstrates this simplicity through minimal infrastructure 
    components with an in-memory key-value store (essentially a hash map) for state 
    management and a simple event broker implemented as an in-memory FIFO queue. 

    Notice how the AI agents integrate identically to traditional event handlers. 
    The \`testAnthropicAgent\` and \`testOpenaiAgent\` register through their \`handlerFactory\` 
    methods, receiving the same memory interface as \`ArvoOrchestrators\` and \`ArvoResumable\`. 
    This uniform integration pattern means AI capabilities can be added to existing 
    Arvo systems without architectural changes or special handling.

    The in-memory broker automatically routes events based on type matching, handling 
    the complete event flow from initial request through all intermediate processing 
    to final response. When an agent emits an event to invoke another service, the 
    broker ensures proper delivery and response correlation without the agents 
    needing direct knowledge of each other.

    For **production deployments**, this same code structure scales to distributed 
    scenarios by replacing the \`SimpleMachineMemory\` with a distributed state store 
    with optimistic locking capability and the \`createSimpleEventBroker\` with production message brokers 
    **RabbitMQ. **The event handlers, including AI agents, remain unchanged during this 
    transition, demonstrating the architecture's scalability from prototype to 
    production**. Distributed deployment patterns and broker integrations are covered 
    in their respective documentation sections.

    > **Note:** This \`execute\` function extends the [Getting Started example](/). The 
    > handlers \`addHandler\`, \`greetingHandler\`, \`greetingOrchestrator\`, and 
    > \`greetingResumable\` are documented in the Getting Started section. This 
    > example demonstrates how AI agents integrate alongside these existing handlers 
    > using identical patterns.
  `),
  tabs: [
    {
      title: 'execute.ts',
      lang: 'ts',
      code: `
import type { ArvoEvent } from 'arvo-core';
import { addHandler, greetingHandler, greetingOrchestrator, greetingResumable } from './handlers';
import { createSimpleEventBroker, SimpleMachineMemory } from 'arvo-event-handler';
import { testAnthropicAgent } from './handlers/agent.test.anthropic';
import { testOpenaiAgent } from './handlers/agent.test.openai';

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
  const { resolve } = createSimpleEventBroker(
    [
      addHandler(),
      greetingHandler(),
      greetingResumable({ memory }),
      greetingOrchestrator({ memory }),
      // Same integration pattern for agents as the other handlers
      testAnthropicAgent.handlerFactory({ memory }),
      testOpenaiAgent.handlerFactory({ memory }),
    ],
    {
      onError: (error) => console.error(error),
    },
  );
  return await resolve(event);
};


    `,
    },
  ],
};
