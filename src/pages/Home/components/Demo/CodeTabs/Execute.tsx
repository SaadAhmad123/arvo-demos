import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

const label = 'execute.ts';
export const ExecuteTab: DemoCodePanel = {
  heading: 'Setup Execution Environment',
  description: cleanString(`
      Arvo handlers are execution environment agnostic, enabling deployment across local, 
      single-server, or distributed architectures. They require only an event broker for 
      event distribution between handlers.
      
      This demonstration implements a local execution environment using Arvo's 
      \`SimpleEventBroker\`, an in-memory FIFO queue that facilitates rapid development 
      and testing. The \`createSimpleEventBroker\` function registers handlers and 
      provides a \`resolve\` method that processes events and returns final results.
      
      Stateful components like ArvoOrchestrators and ArvoResumables require key-value 
      storage for intermediate state management. Arvo includes \`SimpleMachineMemory\`, 
      an in-memory implementation of the \`IMachineMemory\` interface, designed for 
      quick prototyping and experimentation.
    `),
  tabs: [
    {
      title: label,
      lang: 'ts',
      code: `
import type { ArvoEvent } from 'arvo-core';
import { addHandler } from './handlers/add.handler.ts';
import { greetingHandler } from './handlers/greeting.handler.ts';
import { greetingOrchestrator } from './handlers/greeting.orchestrator.ts'
import { greetingResumable } from './handlers/greeting.resumable.ts';
import { createSimpleEventBroker, SimpleMachineMemory } from 'arvo-event-handler';


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
    addHandler(), 
    greetingHandler(), 
    greetingResumable({ memory }), 
    greetingOrchestrator({ memory })
  ]);
  return await resolve(event);
};
  
`,
    },
  ],
};
