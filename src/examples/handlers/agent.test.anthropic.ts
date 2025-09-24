import { greetingContract } from './greeting.handler';
import { greetingOrchestratorContract } from './greeting.orchestrator';
import { greetingResumableContract } from './greeting.resumable';
import { createAgenticResumable } from './createAgenticResumable';
import { anthropicLLMCaller } from './createAgenticResumable/integrations/anthropic';

export const testAnthropicAgent = createAgenticResumable({
  name: 'test.anthropic',
  services: {
    // Define the scope of the services the AI Agent can
    // access. These are not tool (i.e. functions) rather
    // these are the contracts of the event handler available
    // in the eco-system. This keeps the entire architecture
    // full modular, highly cohesive and least coupled
    // This demonstrates that the Agent can communicate with
    // all the kinds of event handlers in Arvo without any special
    // communication protocol.
    greeting: greetingContract.version('1.0.0'), // ArvoEventHandler
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'), // ArvoOrchestrator (state machine based declarative workflow)
    greetingResumable: greetingResumableContract.version('1.0.0'), // ArvoResumable (some imperative orchestrator)
  },
  prompts: {},
  agenticLLMCaller: async (param) => {
    return await anthropicLLMCaller({
      ...param,
      system: undefined,
    });
  },
});
