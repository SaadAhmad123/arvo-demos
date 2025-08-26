import type { CodeBlockProps } from '../../../../../components/CodeBlock';

const label = 'add.handler.ts';
export const AdderTab: CodeBlockProps['tabs'][number] = {
  title: label,
  lang: 'ts',
  code: `
import { createSimpleArvoContract } from 'arvo-core';
import { createArvoEventHandler, type EventHandlerFactory } from 'arvo-event-handler';
import { z } from 'zod';

export const addContract = createSimpleArvoContract({
  uri: '#/handler/calculator/add',
  type: 'calculator.add',
  description: 'This service provides the sum of all the numbers provided to it.',
  versions: {
    '1.0.0': {
      accepts: z.object({
        numbers: z.number().array(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
      emits: z.object({
        result: z.number(),
        toolUseId: z.string().optional().describe('For AI agents to reference tool calls'),
      }),
    },
  },
});

export const addHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: addContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        return {
          type: 'evt.calculator.add.success',
          data: {
            result: event.data.numbers.reduce((acc, cur) => acc + cur, 0),
            toolUseId: event.data.toolUseId,
          },
        };
      },
    },
  });

`,
};
