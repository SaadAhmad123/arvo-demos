import { greetingContract } from './greeting.handler';
import { greetingOrchestratorContract } from './greeting.orchestrator';
import { greetingResumableContract } from './greeting.resumable';
import { anthropicLLMCaller } from './createAgenticResumable/integrations/anthropic';
import { createAgenticResumable } from './createAgenticResumable';

export const testAgent = createAgenticResumable({
  name: 'test',
  services: {
    greeting: greetingContract.version('1.0.0'),
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'),
    greetingResumable: greetingResumableContract.version('1.0.0'),
  },
  prompts: {},
  agenticLLMCaller: async (param) => {
    return await anthropicLLMCaller({
      ...param,
      system: undefined,
    });
  },
});
