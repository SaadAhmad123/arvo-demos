import type { CodeBlockProps } from '../../../../../components/CodeBlock';

const label = 'execute.ts';
export const ExecuteTab: CodeBlockProps['tabs'][number] = {
  title: label,
  lang: 'ts',
  code: `
import type { ArvoEvent } from "arvo-core";
import { addHandler, greetingHandler } from "./demo";
import { createSimpleEventBroker } from "arvo-event-handler";

export const execute = async (event: ArvoEvent): Promise<ArvoEvent | null> => {
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
  const { resolve } = createSimpleEventBroker([addHandler(), greetingHandler()]);
  return await resolve(event);
};

`,
};
