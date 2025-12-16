import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const AddingMcpServer: DemoCodePanel = {
  heading: 'Connect Your Agent With An MCP Server',
  description: cleanString(`
    Model Context Protocol (MCP) servers provide standardized access to external resources like filesystems, 
    databases, and APIs. MCP has become the industry-standard approach for connecting LLMs to external tools, 
    and Arvo agents support MCP integration natively.

    Each agent can connect to one MCP server. This intentional limitation prevents overwhelming the agent with 
    too many tool options, which can degrade decision-making quality. If you need access to multiple MCP servers, 
    you can coordinate multiple agents, each specialized for different tool domains. We'll explore multi-agent 
    coordination patterns later in this documentation.

    ### Arvo's MCP Client

    Connecting an MCP server is straightforward. Instantiate an \`MCPClient\` with the server URL and pass it to 
    the agent configuration. The \`MCPClient\` supports both direct configuration and lazy configuration patterns. 
    Direct configuration provides a static configuration object, while lazy configuration accepts a function that 
    resolves configuration at connection time. Lazy configuration is useful when you need to load environment 
    variables, fetch credentials from secret managers, or compute configuration dynamically based on runtime context.

    The Actions Registry automatically discovers available tools when the agent initializes and makes them available 
    to the LLM. MCP tools appear in the \`tools.mcp\` object in your context builder, allowing you to reference them 
    safely in system prompts. 
    
    Since MCP tools are discovered dynamically at runtime, TypeScript cannot provide autocomplete for tool names. 
    You'll need to consult the MCP server's documentation to know which tools are available. In practice, you often 
    don't need to explicitly mention tools in your system prompt (it is done here for pedagogical purposes). The LLM 
    can discover appropriate tools from their descriptions alone.

    MCP tools execute synchronously from the agent's perspective, even though they may access remote resources. 
    The \`MCPClient\` handles connection lifecycle, transport selection, and error recovery automatically. When 
    the LLM requests an MCP tool, the Actions Engine routes the call to the MCP server, waits for the result, 
    and appends it to the conversation history.

    ## Observing Agent Activity with Stream Events

    The \`onStream\` callback provides real-time visibility into agent execution. As the agent runs, it emits 
    structured events capturing activities like tool requests, LLM output generation, token consumption, and 
    execution costs. This stream is particularly valuable for building live UIs that show agent reasoning as 
    it happens, allowing users to watch the agent work through problems in real-time.
    
    While stream events are optimized for real-time observation, comprehensive telemetry is automatically 
    captured through OpenTelemetry integration. All metrics, logs, and traces flow to your configured 
    observability platform without additional instrumentation. Stream events complement this by providing 
    application-level semantics useful for user-facing interfaces, while OTEL handles production monitoring, 
    debugging, and long-term analysis.
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
  createAgentTool,
  createArvoAgent,
  OpenAI,
  openaiLLMIntegration,
} from '@arvo-tools/agentic';
import z from 'zod';
import { cleanString } from 'arvo-core';
import { MCPClient } from '@arvo-tools/agentic';

const currentDateTool = createAgentTool({
  name: 'current_date_tool',
  description: 'Provides the current data and time as an ISO string',
  input: z.object({}),
  output: z.object({
    response: z.string(),
  }),
  fn: () => ({
    response: new Date().toISOString(),
  }),
});

export const simpleAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/simple',
  name: 'agent.simple',
  description: 'A simple AI agent which answers questions',
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
    tools: {
      currentDateTool,
    },
    maxToolInteractions: 10,

    // Direct MCP configuration with static values
    // mcp: new MCPClient({
    //   url: 'https://mcp.docs.astro.build/mcp',
    //   requestInit: {
    //     headers: {
    //       // Example: 'Authorization': 'Bearer token'
    //     }
    //   }
    // }),

    // Lazy MCP configuration - function resolves config at connection time
    // Useful for loading environment variables, fetching credentials from secret managers,
    // or computing configuration dynamically based on runtime context
    mcp: new MCPClient(() => ({
      url: 'https://mcp.docs.astro.build/mcp',
      // Define custom headers, authentication, or other RequestInit options here
      // Configuration is resolved when the agent initializes, not at definition time
      requestInit: {
        headers: {
          // Example: 'Authorization': \`Bearer \${getSecretToken()}\`
        }
      }
    })),

    onStream: ({type, data}) => {
      // Filter to log only tool requests made by the LLM
      // This helps track which tools the agent decides to use and when
      if (type === 'agent.tool.request') {
        console.log('==== Agent Stream Capture ====')
        console.log(JSON.stringify({type, data}, null, 2))
      }
    },
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    ),
    handler: {
      '1.0.0': {
        context: AgentDefaults.CONTEXT_BUILDER(({ tools }) =>
          cleanString(\`
            You are a helpful agent. For queries about the current date, 
            use \${tools.tools.currentDateTool.name}.
            For information about Astro, use \${tools.mcp.search_astro_docs.name}.
          \`)
        ),
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
import { cleanString } from 'arvo-core';

async function main() {
  const event = createArvoEventFactory(simpleAgentContract.version('1.0.0'))
    .accepts({
      source: 'test.test.test',
      data: {
        parentSubject$$: null, 
        message: cleanString(\`
          Can you answer my following queries as accurately as possible:

          - What is the day today?
          - Can you tell me how to get started with Astro?

          Also in your response exactly tell me what tool did you use.
        \`),
      },
    });

  const { events } = await simpleAgent().execute(event);

  for (const evt of events) {
    console.log(evt.toString(2));
  }
}

main()

/*
  Console logs

  ==== Agent Stream Capture ====
  {
    "type": "agent.tool.request",
    "data": {
      "tool": {
        "name": "internal_current_date_tool",   // Name as seen by the LLM (prefixed by Actions Registry)
        "kind": "internal",                     // Execution strategy: internal (sync function invocation), mcp (external api call), or arvo (event-based)
        "originalName": "currentDateTool"       // Original name from your tool definition
      },
      "usage": {                                
        "prompt": 155,                          // Input tokens consumed by the LLM for this request
        "completion": 50                        // Output tokens generated by the LLM for this request
      },
      "executionunits": 205                     // Custom cost metric tracking agent resource consumption
                                                // Defaults to sum of prompt + completion tokens (155 + 50 = 205)
                                                // Can be overridden to track monetary cost, API credits, or any custom unit
                                                // Accumulates across tool calls and LLM invocations during execution
                                                // We'll explore custom executionunit calculation strategies later
    }
  }

  ==== Agent Stream Capture ====
  {
    "type": "agent.tool.request",
    "data": {
      "tool": {
        "name": "mcp_search_astro_docs",
        "kind": "mcp",
        "originalName": "search_astro_docs"
      },
      "usage": {
        "prompt": 155,
        "completion": 50
      },
      "executionunits": 205
    }
  }

  
  ==== Agent Final Output ====
  {
    "id": "8b43d292-54c7-4fce-aeb7-412e601c351e",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "arvo.orc.agent.simple.done",
    "subject": "eJw9jksOwjAMRO/idROlTUtIbxNSA5byQalbIVW9OxZIbGbhZ72ZA2qLT1y5Ba4N5gNKyAgzhLZXLUyHBxbWK+VXQuhgx7ZSLfLRa6MNnB3gG+PG3+MBtAiK2Ft3GaIavPdqnG535Z2d1HS1Dh2iseMoLirE9OsFlg36HwKXmgOJsmwpSUlGDuI/zw87gzlK",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/agent/simple/1.0.0",
    "data": {
      "response": "Here are the answers to your queries:\n\n1. **What is the day today?**\n   - Today is Sunday, December 14, 2025.\n   - Tool used: \`internal_current_date_tool\`\n\n2. **How to get started with Astro?**\n   - To get started with Astro, you can follow these steps:\n     - **Create a New Project**: Run the following command in your terminal to create a new Astro project:\n       \`\`\`bash\n       npm create astro@latest -- --template starlight\n       \`\`\`\n       Alternatively, you can use \`pnpm\` or \`Yarn\`:\n       \`\`\`bash\n       pnpm create astro --template starlight\n       yarn create astro --template starlight\n       \`\`\`\n     - **Start the Development Server**: Inside your project directory, run the following command to start the development server:\n       \`\`\`bash\n       npm run dev\n       \`\`\`\n       Or use \`pnpm\` or \`Yarn\`:\n       \`\`\`bash\n       pnpm dev\n       yarn dev\n       \`\`\`\n     - **Add Content**: Add new pages to your site by creating Markdown files in the \`src/content/docs/\` directory.\n     - **Next Steps**: You can configure, navigate, and extend your project by following the guides on customizing Starlight, setting up sidebar navigation, using components, exploring plugins, and deploying your site.\n\n   - For more detailed instructions, you can visit the [Astro Getting Started Guide](https://starlight.astro.build/getting-started/#_top).\n\n   - Tool used: \`mcp_search_astro_docs\`"
    },
    "time": "2025-12-14T13:22:23.674+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 6819,                   // Total execution cost accumulated across all LLM calls and tool executions
                                              // Sum of all executionunits from each operation during this agent run
    "traceparent": null,
    "tracestate": null,
    "parentid": "95c8e166-503f-4339-91ba-0cb15a9532fc",
    "domain": null
  }
*/
      `,
    },
  ],
};
