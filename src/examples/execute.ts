import type { ArvoEvent } from 'arvo-core';
import { addHandler, greetingHandler } from './demo';
import { createSimpleEventBroker } from 'arvo-event-handler';

export const execute = async (event: ArvoEvent): Promise<ArvoEvent | null> => {
  const { resolve } = createSimpleEventBroker([addHandler(), greetingHandler()]);
  return await resolve(event);
};
