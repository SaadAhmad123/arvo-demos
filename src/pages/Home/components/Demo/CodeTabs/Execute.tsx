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
  const { resolve } = createSimpleEventBroker([addHandler(), greetingHandler()]);
  return await resolve(event);
};

`,
};
