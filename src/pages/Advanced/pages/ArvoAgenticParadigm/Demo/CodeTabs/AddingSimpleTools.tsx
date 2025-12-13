import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const AddingSimpleTools: DemoCodePanel = {
  heading: 'Providing The Agent Simple Tools',
  description: cleanString(`
    Now let's give the agent capabilities beyond text generation by adding internal tools. Internal tools 
    are synchronous functions that execute immediately within the agent loop, perfect for lightweight 
    operations like calculations, data transformations, or accessing local resources.

    We'll create a simple tool that provides the current date and time. Tools are created using 
    \`createAgentTool\`, which wraps your function with automatic input validation via Zod schemas and 
    OpenTelemetry instrumentation. The tool definition includes a name, description (which the LLM sees), 
    input and output schemas, and the implementation function.

    Once defined, tools are registered in the agent's \`tools\` configuration. The Actions Registry makes 
    them available to the LLM during execution. Notice that the context builder receives a \`tools\` 
    parameter exposing all registered tools. This lets you reference tool names safely in your system 
    prompt, as the Actions Registry may transform tool names internally.

    When the LLM decides to use a tool, the Actions Engine validates the input against the tool's schema, 
    executes the function, and appends the result to the conversation history. The agent then continues 
    reasoning with the tool's output available in context.
  `),
  tabs: [
    {
      title: 'handlers/simple.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract, cleanString } from 'arvo-core';
import type { EventHandlerFactory, IMachineMemory } from 'arvo-event-handler';
import {
  AgentDefaults,
  createAgentTool,
  createArvoAgent,
  OpenAI,
  openaiLLMIntegration,
} from '@arvo-tools/agentic';
import z from 'zod';

// Define a tool that fetches the current date and time
const currentDateTool = createAgentTool({
  name: 'current_date_tool',
  description: 'Provides the current date and time as an ISO string',
  // No input parameters needed for this tool
  input: z.object({}),
  // Define what the tool returns
  output: z.object({
    datetime: z.string(),
  }),
  // The tool implementation
  fn: () => ({
    datetime: new Date().toISOString(),
  }),
});

export const simpleAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/simple',
  name: 'agent.simple',
  description: 'A simple AI agent with access to tools',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

export const simpleAgent: EventHandlerFactory
  { memory: IMachineMemory<Record<string, unknown>> }
> = ({ memory }) =>
  createArvoAgent({
    contracts: {
      self: simpleAgentContract,
      services: {},
    },
    // Register internal tools that execute synchronously
    tools: {
      currentDateTool,
    },
    memory,
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') }),
    ),
    handler: {
      '1.0.0': {
        // The context builder exposes registered tools for safe referencing
        // Note: Use tools.tools.currentDateTool.name, not just 'current_date_tool'
        // The Actions Registry may transform tool names internally
        context: AgentDefaults.CONTEXT_BUILDER(({ tools }) => cleanString(\`
          You are a helpful agent. For any queries related to the current date or time, 
          always use the tool \${tools.tools.currentDateTool.name}.
        \`)),
        output: AgentDefaults.OUTPUT_BUILDER,
      },
    },
  });
      `,
    },
  ],
};
