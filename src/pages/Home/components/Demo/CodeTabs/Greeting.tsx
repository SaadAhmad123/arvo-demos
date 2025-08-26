import type { CodeBlockProps } from '../../../../../components/CodeBlock';

const label = 'greeting.handler.ts';
export const GreetingTab: CodeBlockProps['tabs'][number] = {
  title: label,
  lang: 'ts',
  code: `
import { createSimpleArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

export const greetingContract = createSimpleArvoContract({
  uri: '#/demo/greeting',
  type: 'greeting.create',
  versions: {
    '1.0.0': {
      accepts: z.object({
        name: z.string(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
      emits: z.object({
        greeting: z.string(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
    },
  },
});

export const greetingHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: greetingContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.greeting.create.success',
          data: {
            greeting: \`Hello, \${event.data.name}!\`,
            toolUseId: event.data.toolUseId,
          },
        };
      },
    },
  });

`,
};
