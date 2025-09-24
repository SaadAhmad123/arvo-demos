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
      testAnthropicAgent.handlerFactory({ memory }),
      testOpenaiAgent.handlerFactory({ memory }),
    ],
    {
      onError: (error) => console.error(error),
    },
  );
  return await resolve(event);
};
