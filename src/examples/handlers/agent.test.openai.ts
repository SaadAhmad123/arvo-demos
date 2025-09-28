import { greetingOrchestratorContract } from './greeting.orchestrator';
import { createAgenticResumable } from './agentFactory/createAgenticResumable';
import { openaiLLMCaller } from './agentFactory/integrations/openai';
import { testAnthropicAgent } from './agent.test.anthropic';
import type { CallAgenticLLM } from './agentFactory/types';

/**
 * Test implementation of an OpenAI-powered agentic resumable orchestrator.
 *
 * ## Inter-Agent Communication Architecture
 * This implementation highlights two critical communication patterns:
 * - **Agent-to-Workflow**: Direct integration with state machine-based orchestrators
 * - **Agent-to-Agent**: Seamless communication between different AI agents
 */
export const testOpenaiAgent = createAgenticResumable({
  name: 'test.openai',
  description: 'A test agent with access to many tools a greeting agent and a greeting tool',
  // Available service contracts demonstrating universal communication patterns.
  services: {
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'), // Workflow orchestration via ArvoEvent
    anthropicAgent: testAnthropicAgent.contract.version('1.0.0'), // Agent-to-agent communication via ArvoEvent
  },
  // System prompt generator defining the agent's operational guidelines.
  systemPrompt: () => 'You are a helpful agent...',
  // Enables comprehensive conversation history to be returned in agent responses.
  enableMessageHistoryInResponse: true,
  agenticLLMCaller: openaiLLMCaller as CallAgenticLLM,
});
