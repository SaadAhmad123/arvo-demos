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

export const testOpenaiAgent = createAgenticResumable({
  name: 'test.openai',
  services: {
    // This demonstrates that the agent can easily communicate 
    // with workflows with the same communication infrastrucutre 
    // i.e. ArvoEvent over any event broker
    greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'),
    // This demonstrates that then agent can easily communicate 
    // with other Agents with the same communication infrastrucutre 
    // i.e. ArvoEvent over any event broker
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

    `,
    },
  ],
};
