import { greetingOrchestratorContract } from './greeting.orchestrator';
import { createAgenticResumable } from './createAgenticResumable';
import { openaiLLMCaller } from './createAgenticResumable/integrations/openai';
import { testAnthropicAgent } from './agent.test.anthropic';

export const testOpenaiAgent = createAgenticResumable({
  name: 'test.openai',
  services: {
    // This demonstrates that the agent can easily communicate with workflows with the same communication infrastrucutre i.e. ArvoEvent over any event broker
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'),
    // This demonstrates that then agent can easily communicate with other Agents with the same communication infrastrucutre i.e. ArvoEvent over any event broker
    anthropicAgent: testAnthropicAgent.contract.version('1.0.0'),
  },
  prompts: {},
  agenticLLMCaller: async (param) => {
    return await openaiLLMCaller({
      ...param,
      system: undefined,
    });
  },
});
