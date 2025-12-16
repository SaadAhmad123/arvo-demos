import {
  ArvoContractLearn,
  ArvoEventHandlerLearn,
  ArvoMentalModelLearn,
} from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const SettingUpArvoAgentic: DemoCodePanel = {
  heading: 'Your First Simple Agent',
  description: cleanString(`
  Let's build your first agent. We'll start simple with an agent that responds to user queries 
  without any tools. This helps you learn Arvo's patterns before adding complexity.

  Every Arvo component needs a contract that defines its interface. For agents, we use 
  \`createArvoOrchestratorContract\` because Arvo treats all agents as orchestrators from an 
  architectural perspective, whether they actually orchestrate other services or not. The contract 
  specifies what events the agent accepts (init) and what it eventually produces (complete) when it marks
  the task done. If you want to 
  dive deeper into Arvo's contract system, check out [${ArvoContractLearn.name.toLowerCase()}](${ArvoContractLearn.link}) 
  documentation. For understanding the orchestration model, see [${ArvoMentalModelLearn.name.toLowerCase()}](${ArvoMentalModelLearn.link}). 
  Neither is required to build your first agent.

  Notice the agent is defined as a factory function pattern. This pattern 
  enables dependency injection, so that you can provide infrastructure level
  dependencies to your agent without changing the agent code. Currently, 
  no dependency is needed by the agent, however, it is good to introduce this
  pattern to you earlier because it is Arvo's standard pattern across all
  [event handlers](${ArvoEventHandlerLearn.link}#dependency-injection-in-your-event-handlers) 
  and in the subsequent sections you will leverage this a lot. 

  The configuration has a few key pieces. The \`contracts\` section defines your agent's interface 
  (\`self\`) and any external services it can call (\`services\`). We leave services empty for now 
  since this agent works standalone. The \`llm\` integration connects your agent to the language model. 
  Here we're using OpenAI, but you can plug in any supported provider.

  The \`handler\` section defines version-specific implementations. Each version specified in your 
  contract gets its own handler configuration. This lets you run multiple versions simultaneously, 
  which is powerful for gradual rollouts and testing. For each version, you provide a \`context\` 
  builder that transforms the init event into the system prompt and conversation history, and an 
  \`output\` builder that validates the agent's response matches the contract schema.

  The \`@arvo-tools/agentic\` package provides helpful defaults to get you started quickly. 
  \`AgentDefaults.INIT_SCHEMA\` expects a simple message string as input, while 
  \`AgentDefaults.COMPLETE_SCHEMA\` outputs a response string. The \`CONTEXT_BUILDER\` accepts 
  a function that returns your system prompt and automatically constructs the initial conversation 
  history from the input message. The \`OUTPUT_BUILDER\` validates that the agent's final response 
  matches the expected schema and wraps it in the proper event format. These defaults handle common 
  patterns so you can focus on your agent's specific behavior. We'll explore customization options 
  as we build more sophisticated agents below.
`),
  tabs: [
    {
      title: 'handlers/simple.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import type { EventHandlerFactory } from 'arvo-event-handler';
import {
  AgentDefaults,
  createArvoAgent,
  OpenAI,
  openaiLLMIntegration,
} from '@arvo-tools/agentic';

// Define the agent's contract
export const simpleAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/simple',
  name: 'agent.simple',
  description: 'A simple AI agent which answers questions',
  versions: {
    '1.0.0': {
      // The init event accepts a simple message string
      init: AgentDefaults.INIT_SCHEMA,
      // The complete event outputs a simple response string
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

// Define the agent using the factory pattern for dependency injection
export const simpleAgent: EventHandlerFactory = () =>
  createArvoAgent({
    contracts: {
      // The agent's own contract
      self: simpleAgentContract,
      // No external services yet
      services: {},
    },
    // Default LLM integration used across all versions
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    ),
    // Version-specific handler implementations
    handler: {
      '1.0.0': {
        // Context builder transforms init event into system prompt and messages
        context: AgentDefaults.CONTEXT_BUILDER(() => 'You are a helpful agent'),
        // Output builder validates agent output against contract schema
        output: AgentDefaults.OUTPUT_BUILDER,
      },
    },
  });
      `,
    },
  ],
};
