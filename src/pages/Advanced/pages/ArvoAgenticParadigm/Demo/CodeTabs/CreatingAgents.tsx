import { cleanString } from '../../../../../../utils';
import {} from '../../../../../Home/components/Installation';
import type { DemoCodePanel } from '../../../../../types';

export const CreatingAgents: DemoCodePanel = {
  heading: 'Creating Arvo-compatible Event Driven AI Agents',
  description: cleanString(`
    Once the factory patterns and LLM integrations are established in your 
    codebase (these implementations can be copied directly), creating 
    sophisticated AI agents becomes remarkably straightforward.

    This example demonstrates seamless integration of Anthropic Claude and 
    OpenAI GPT models through the \`createAgenticResumable\` factory. The 
    architecture cleanly separates operational concerns from agent behavior, 
    allowing developers to focus on defining agent capabilities through 
    service contracts rather than infrastructure complexity.

    The key insight is that agents don't directly call services—they emit 
    events according to contracts that specify how to invoke other event 
    handlers in the system. This indirection provides powerful benefits:
    
    - **Uniform Communication**: The OpenAI agent can invoke the Anthropic 
      agent as easily as calling any other service, using the same event-driven 
      patterns throughout.
    
    - **Service Agnosticism**: Event handlers (whether simple services, complex 
      workflows, or other AI agents) don't need to know they're being invoked 
      by an AI—they just process events.
    
    - **Natural Composition**: Agents can trigger orchestrated workflows, call 
      other agents, or invoke simple services without special protocols or 
      authentication between components.

    The actual execution flow when an agent "calls" a service:
    \`LLM Agent → Emit Event → Event Broker → Target Event Handler (possibly another Agent) → Process (may emit additional events) → Emit Response Event → Return to Original Agent\`

    This event-driven approach eliminates direct dependencies between agents 
    and services, enabling true loose coupling while maintaining type safety 
    through contracts. The result is an AI system that integrates naturally 
    with existing enterprise architectures rather than requiring special 
    infrastructure for AI components.
  `),
  tabs: [
    {
      title: 'handlers/agent.test.anthropic.ts',
      lang: 'ts',
      code: `
import { greetingContract } from './greeting.handler';
import { greetingOrchestratorContract } from './greeting.orchestrator';
import { greetingResumableContract } from './greeting.resumable';
import { createAgenticResumable } from './createAgenticResumable';
import { anthropicLLMCaller } from './createAgenticResumable/integrations/anthropic';
import { z } from 'zod';

/**
 * Test implementation of an Anthropic-powered agentic resumable orchestrator.
 *
 * Demonstrates the creation of an AI agent that can interact with multiple types
 * of Arvo event handlers while maintaining a modular, loosely-coupled architecture.
 * The agent has access to different handler patterns (event handlers, orchestrators,
 * and resumables) and can intelligently select which services to invoke based on
 * conversation context.
 */
export const testAnthropicAgent = createAgenticResumable({
  name: 'test.anthropic',
  /**
   * Available service contracts that define the agent's tool ecosystem.
   *
   * These contracts represent the full spectrum of Arvo event handlers,
   * demonstrating that agents can seamlessly communicate with any handler
   * type without requiring specialized integration protocols. The modular
   * design ensures high cohesion within services and loose coupling between
   * the agent and the broader system architecture.
   */
  services: {
    greeting: greetingContract.version('1.0.0'), // ArvoEventHandler for simple operations
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'), // ArvoOrchestrator for state-based workflows
    greetingResumable: greetingResumableContract.version('1.0.0'), // ArvoResumable for imperative orchestration
  },
  /**
   * Structured output schema defining the agent's response format.
   * When not provided, agents default to simple string responses.
   */
  outputFormat: z.object({
    response: z.string().describe('The final response string'),
    thoughts: z.string().describe('Elaborate why you made this response'),
  }),
  // System prompt generator that defines the agent's behavioral guidelines.
  systemPrompt: () => 'You are a helpful agent...',
  agenticLLMCaller: anthropicLLMCaller,
});



    `,
    },
    {
      title: 'handlers/agent.test.openai.ts',
      lang: 'ts',
      code: `
import { greetingOrchestratorContract } from './greeting.orchestrator';
import { createAgenticResumable } from './createAgenticResumable';
import { openaiLLMCaller } from './createAgenticResumable/integrations/openai';
import { testAnthropicAgent } from './agent.test.anthropic';

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
  // Available service contracts demonstrating universal communication patterns.
  services: {
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'), // Workflow orchestration via ArvoEvent
    anthropicAgent: testAnthropicAgent.contract.version('1.0.0'), // Agent-to-agent communication via ArvoEvent
  },
  // System prompt generator defining the agent's operational guidelines.
  systemPrompt: () => 'You are a helpful agent...',
  // Enables comprehensive conversation history to be returned in agent responses.
  enableMessageHistoryInResponse: true,
  agenticLLMCaller: openaiLLMCaller,
});


    `,
    },
  ],
};
