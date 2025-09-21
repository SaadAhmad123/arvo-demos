import { greetingContract } from '../greeting.handler';
import { anthropicLLMCaller } from './anthropic.utils';
import { createAgenticResumable } from './createAgenticResumable';

export const testAgent = createAgenticResumable({
  name: 'test',
  services: {
    greeting: greetingContract.version('1.0.0'),
  },
  prompts: {},
  agenticLLMCaller: async (param) => {
    return await anthropicLLMCaller({
      ...param,
      system: undefined,
    });
  },
});
