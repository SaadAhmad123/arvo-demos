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
    prompt, as the Actions Registry transforms tool names internally.

    When the LLM decides to use a tool, the Actions Engine validates the input against the tool's schema, 
    executes the function, and appends the result to the conversation history. The agent then continues 
    reasoning with the tool's output available in context.

    ### Controlling Tool Interaction Cycles

    The \`maxToolInteractions\` parameter limits how many tool execution cycles the agent can perform, 
    including self-correction loops triggered by validation errors. This prevents runaway execution where 
    the agent gets stuck in infinite reasoning loops or consumes excessive tokens trying to solve 
    unsolvable problems. The default limit is 5 cycles. When the quota is exhausted, the Action Interaction 
    Manager injects a termination prompt forcing the LLM to provide a final answer without additional tool 
    calls. You can adjust this limit based on your use case complexity and cost tolerance.
  `),
  tabs: [
    {
      title: 'handlers/simple.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract, cleanString } from 'arvo-core';
import type { EventHandlerFactory } from 'arvo-event-handler';
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

export const simpleAgent: EventHandlerFactory = () =>
  createArvoAgent({
    contracts: {
      self: simpleAgentContract,
      services: {},
    },
    // Register internal tools that execute synchronously
    tools: {
      currentDateTool,
    },
    // Limiting the max interaction cycle (including the error feedback)
    // By default, this is 5
    maxToolInteractions: 10,
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
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
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { simpleAgent, simpleAgentContract } from './handlers/simple.agent.ts';
import { createArvoEventFactory } from 'arvo-core';

async function main() {
  const event = createArvoEventFactory(simpleAgentContract.version('1.0.0'))
    .accepts({
      source: 'test.test.test',
      data: {
        parentSubject$$: null,
        message: 'What day is today? Show me the exact tool output you received.',
      },
    });

  const { events } = await simpleAgent().execute(event);

  for (const evt of events) {
    console.log(evt.toString(2));
  }
}

main();

/*
  Example output showing the agent used the tool:

  {
    "id": "aa802800-93a8-435e-8414-77be758f7cfe",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "arvo.orc.agent.simple.done",
    "subject": "eJw9jt0KgzAMhd8l17ZULJv6NrGmW6A/o0YZiO++sMFuzkW+8J1zQm3hSZs0lNpgPqFgJpgB21GtMosPKmI3zq9E0MFBbeNa9KO3zjq4OqA3hV2+xxN4VTQ439M4oOnDFI1fJm9wGIPBKSw3R3cfXVQXFxb+9YLoBvsPhWvNyKose0pakklQ/df1AW/TOh0=",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/agent/simple/1.0.0",
    "data": {
      "response": "Today is December 13, 2025. I determined this by using the internal tool that provides the current date and time. The exact output from the tool was \"2025-12-13T10:01:11.403Z\"."
    },
    "time": "2025-12-13T21:01:13.248+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 286,
    "traceparent": null,
    "tracestate": null,
    "parentid": "c532defc-4f6d-481f-ad55-bfa15f53086a",
    "domain": null
  }
*/
      `,
    },
  ],
};
