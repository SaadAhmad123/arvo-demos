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
