import { ArvoOrchestratorLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const MutliAgentSystem: DemoCodePanel = {
  heading: 'Your First Multi-Agent System',
  description: cleanString(`
    Now we expand the system into a multi-agent architecture. As you've seen extensively, agents in Arvo 
    are just event handlers. This section builds on that foundation to demonstrate how multiple specialized 
    agents coordinate through events to handle complex requests requiring different capabilities.

    ### Specializing Agent Responsibilities

    This example refactors the monolithic simple agent into specialized components. The calculator agent 
    defined in \`handlers/calculator.agent.ts\` focuses exclusively on mathematical operations, delegating 
    actual computation to the calculator service. The simple agent in \`handlers/simple.agent.ts\` now 
    concentrates on its core strengths, providing current time information and accessing Astro documentation. 
    Each agent maintains clear boundaries around its domain expertise.

    The operator agent introduced in \`handlers/operator.agent.ts\` serves as a convenient entry point to 
    the system. It understands the capabilities of all available agents and routes user requests to appropriate 
    specialists. When a request requires multiple capabilities, the operator coordinates between agents to 
    synthesize a complete response. However, this is purely a convenience pattern. You can send events directly 
    to any agent. If you know you need calculations, emit a calculator agent event directly. If you need time 
    and documentation queries, send a simple agent event. The operator simply provides a unified interface 
    when you don't want to determine agent selection yourself. This doesn't create functional hierarchy. From 
    each agent's perspective, they're simply processing events and emitting responses. The operator happens to 
    emit events targeting other agents, but those agents don't know or care who initiated the request.

    ### Advanced Agent Configuration Patterns

    The calculator agent demonstrates several configuration techniques beyond the defaults. The \`context\` 
    function receives the raw input event and tools catalog, returning the complete system prompt and initial 
    message history. This provides full control over context construction when \`AgentDefaults.CONTEXT_BUILDER\` 
    is too restrictive. The \`llmResponseType: 'json'\` setting forces structured output generation, essential 
    when your contract's complete schema differs from \`AgentDefaults.COMPLETE_SCHEMA\`. The custom \`output\` 
    function shows explicit output validation logic, though in practice \`AgentDefaults.OUTPUT_BUILDER\` handles 
    this automatically when using JSON mode.

    The calculator agent also demonstrates LLM provider customization through \`invocationParam\`. These 
    provider-specific settings control model selection, streaming behavior, token limits, and temperature. 
    Both OpenAI and Anthropic integrations support these overrides, enabling fine-grained control over model 
    behavior per agent without changing the agent's core logic.

    ### Event-Driven Coordination Across Agents

    The \`main.ts\` file registers all agents with the simple broker. When you send an event to the operator 
    agent, it reasons about the request and emits events to appropriate specialists. The simple agent needs 
    Astro information, so the operator emits a simple agent event. The calculator agent handles mathematical 
    operations, so the operator emits a calculator agent event. These can execute in parallel when the operator 
    determines they're independent operations.

    The console output reveals the coordination pattern. Initial operator tool calls show identical token counts, 
    confirming parallel execution. The simple and calculator agents each process their events independently, 
    potentially making their own tool calls. When the simple agent encounters a permission-restricted tool, 
    it emits a permission request to the human interaction domain. The main loop handles this externally, then 
    feeds the authorization response back. The simple agent resumes and completes its work. Meanwhile, the 
    calculator agent makes parallel calls to its calculator service, evidenced by identical token counts across 
    multiple service invocations.

    ### Maintaining Architectural Equality

    Notice that permission management still operates identically despite the multi-agent structure. The simple 
    agent emits permission requests that route to human handlers. From the agent's perspective, this is just 
    another event emission. The fact that the simple agent was invoked by the operator agent is irrelevant to 
    the permission workflow. This demonstrates that logical orchestration hierarchies (operator delegates to 
    specialists) don't create functional hierarchies. Every component remains an architectural peer emitting 
    and consuming events through uniform protocols.

    The stream event listener now receives metadata identifying which agent generated each event. This enables 
    observability across the multi-agent system without coupling agents to specific logging implementations. 
    The same stream listener injected into all agents captures their activities, tagged with agent identifiers 
    for correlation.

    ### Scaling Beyond Simple Cases

    This pattern scales naturally. Add new specialist agents by registering them with the broker and making 
    the operator aware of their capabilities. Agents can coordinate with other agents, workflows, services, 
    and humans using identical event patterns. The simple broker works for development and small deployments. 
    Production systems swap in brokers backed by message queues or event buses and the in-memory backend
    with database back memory backends (See [the memory backend](${ArvoOrchestratorLearn.link}) documentation) without changing agent code. 
    The event handler interface abstracts the delivery mechanism entirely.
  `),
  tabs: [
    {
      title: 'handlers/simple.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import type { EventHandlerFactory, IMachineMemory } from 'arvo-event-handler';
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
import type {
  AgentStreamListener,
  IPermissionManager,
} from '@arvo-tools/agentic';

const currentDateTool = createAgentTool({
  name: 'current_date_tool',
  description: 'Provided the curret data and time as an ISO string',
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
  description: 'This is simple AI agent which can tell you about the current time accurately and has access to Astro documentation',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

export const simpleAgent: EventHandlerFactory<
  {
    memory: IMachineMemory<Record<string, unknown>>;
    permissionManager?: IPermissionManager;
    onStream?: AgentStreamListener;
  }
> = ({ memory, permissionManager, onStream }) =>
  createArvoAgent({
    contracts: {
      self: simpleAgentContract,
      services: {},
    },
    tools: {
      currentDateTool,
    },
    memory,
    mcp: new MCPClient(() => ({
      url: 'https://mcp.docs.astro.build/mcp',
      requestInit: {
        headers: {},
      },
    })),
    maxToolInteractions: 10,
    onStream,
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    ),
    permissionManager,
    handler: {
      '1.0.0': {
        // The tools object here provide the safe mechanism to
        // access the service name as well. Just like other tool.
        explicityPermissionRequired: (tools) => [
          tools.mcp.search_astro_docs.name,
        ],
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
      title: 'handlers/calculator.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import type { EventHandlerFactory, IMachineMemory } from 'arvo-event-handler';
import {
  AgentDefaults,
  Anthropic,
  anthropicLLMIntegration,
  createArvoAgent,
} from '@arvo-tools/agentic';
import z from 'zod';
import { cleanString } from 'arvo-core';
import type { AgentStreamListener } from '@arvo-tools/agentic';
import { calculatorContract } from './calculator.service.ts';

export const calculatorAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/calculator',
  name: 'agent.calculator',
  description:
    'This is a calculator agent which can take your request in natural language and if possible return an output of the calculation',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: z.object({
        output: z.number().nullable().describe(
          'The output of the calculation. If the output is not a number then this is null',
        ),
        remarks: z.string().describe(
          'The thought process/ remarks of the agent on the request and output',
        ),
      }),
    },
  },
});

export const calculatorAgent: EventHandlerFactory<
  {
    memory: IMachineMemory<Record<string, unknown>>;
    onStream?: AgentStreamListener;
  }
> = ({ memory, onStream }) =>
  createArvoAgent({
    contracts: {
      self: calculatorAgentContract,
      services: {
        calculatorContract: {
          contract: calculatorContract.version('1.0.0'),
        },
      },
    },
    onStream,
    memory,
    llm: anthropicLLMIntegration(
      new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      {
        // Provider-specific LLM configuration overriding defaults.
        // Controls model selection, streaming, token limits, and temperature.
        // Available for both OpenAI and Anthropic integrations.
        invocationParam: {
          model: 'claude-4-sonnet-20250514',
          stream: true, // Enable LLM stream. This is in addition to the agent streaming
          max_tokens: 4096,
          temperature: 0,
        },
        // This is the same as the default functionality.
        // However it is shown here for demonstration purposes
        executionunits: (prompt, completion) => {
          return prompt + completion
        },
      },
    ),
    handler: {
      '1.0.0': {
        // Forces the LLM to generate structured JSON output instead of text.
        // Required when the contract's complete schema differs from AgentDefaults.COMPLETE_SCHEMA.
        // The output builder validates the JSON against the contract schema.
        llmResponseType: 'json',
        // Raw context builder providing full control over system prompt and message history.
        // Executes only on init events. Use this when AgentDefaults.CONTEXT_BUILDER is too 
        // restrictive.
        context: ({ input, tools }) => {
          return {
            system: cleanString(\`
              You are strictly a calculation agent. Your sole purpose is to understand user requests
              and use the \${tools.services.calculatorContract.name} to perform calculations
              and respond with results. If the user request is not related to calculation, or you find
              that your tool cannot perform the calculation due to tool limitations,
              then respond with a null output and in remarks explain to the user why you were 
              not able to address the request.

              For complex queries that you believe are solvable, you can break down the 
              query into smaller calculations which your tool can perform and use the tool to 
              solve each part.

              **Critical tool use direction:** If you determine that a request needs 
              multiple tool calls and they can be made in parallel, then always execute parallel 
              tool calls. You are banned from performing sequential tool calls when they can 
              be parallelized.
            \`),
            // This and more is automatically done by the "AgentDefaults.CONTEXT_BUILDER"
            messages: [{
              role: 'user',
              content: { type: 'text', content: JSON.stringify(input.data) },
            }],
          };
        },
        // Explicit output validation for JSON responses.
        // In practice, AgentDefaults.OUTPUT_BUILDER handles this automatically with JSON mode.
        // Shown here for pedagogical purposes to demonstrate the functionality.
        output: (param) => {
          if (param.type === 'json') {
            const { error, data } = param.outputFormat.safeParse(
              param.parsedContent ?? {},
            );
            return error ? { error } : { data };
          }
          return {
            error: new Error(
              'The final output must be output format compliant only',
            ),
          };
        },
      },
    },
  });

      `,
    },
    {
      title: 'handlers/operator.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import type { EventHandlerFactory, IMachineMemory } from 'arvo-event-handler';
import {
  AgentDefaults,
  Anthropic,
  anthropicLLMIntegration,
  createArvoAgent,
} from '@arvo-tools/agentic';
import { cleanString } from 'arvo-core';
import type { AgentStreamListener } from '@arvo-tools/agentic';
import { simpleAgentContract } from './simple.agent.ts';
import { calculatorAgentContract } from './calculator.agent.ts';

export const operatorAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/operator',
  name: 'agent.operator',
  description:
    'An agent which is aware of all the other agents and entities in the system can route the user request to the most suitable agent',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

export const operatorAgent: EventHandlerFactory<
  {
    memory: IMachineMemory<Record<string, unknown>>;
    onStream?: AgentStreamListener;
  }
> = ({ memory, onStream }) =>
  createArvoAgent({
    contracts: {
      self: operatorAgentContract,
      // Other agents registered as event-driven services.
      // The operator can emit events to these agents just like any other service.
      // Agents don't care whether they're invoked by the operator or directly.
      services: {
        simpleAgent: {
          contract: simpleAgentContract.version('1.0.0'),
        },
        calculatorAgent: {
          contract: calculatorAgentContract.version('1.0.0'),
        },
      },
    },
    onStream,
    memory,
    // High interaction limit for complex coordination scenarios.
    // The operator may need many cycles to coordinate between multiple agents.
    maxToolInteractions: 100,
    llm: anthropicLLMIntegration(
      new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    ),
    handler: {
      '1.0.0': {
        // Instructs the LLM to parallelize independent operations.
        // When multiple agents can work simultaneously, invoke them in parallel.
        // This reduces total execution time and token consumption.
        context: AgentDefaults.CONTEXT_BUILDER(() =>
          cleanString(\`
            You a a helpful agent whose job is to respond to the user's
            request as accurately as possible. You must use the available tools
            and agent to you, when it makes sense, to get the most accurate answer.

            **Critical tool/agent use direction:** If you determine that a request needs 
            multiple tool/agent calls and they can be made in parallel then always do parallel 
            tool calls. You are banned from performing sequential tool calls when they can 
            be parallelized
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
import { simpleAgent } from './handlers/simple.agent.ts';
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import {
  createSimpleEventBroker,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { cleanString } from 'arvo-core';
import {
  type AgentStreamListener,
  SimplePermissionManager,
} from '@arvo-tools/agentic';
import confirm from '@inquirer/confirm';
import {
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { calculatorHandler } from './handlers/calculator.service.ts';
import { calculatorAgent } from './handlers/calculator.agent.ts';
import {operatorAgent, operatorAgentContract} from './handlers/operator.agent.ts'
const TEST_EVENT_SOURCE = 'test.test.test';

const tracer = trace.getTracer('main-agent-tracer');

function createOtelContextFromEvent(event: ArvoEvent) {
  const traceParent = event.traceparent;
  let parentContext = context.active();
  if (traceParent) {
    const parts = traceParent.split('-');
    if (parts.length === 4) {
      const [_, traceId, spanId, traceFlags] = parts;
      const spanContext: SpanContext = {
        traceId,
        spanId,
        traceFlags: Number.parseInt(traceFlags),
      };
      parentContext = trace.setSpanContext(context.active(), spanContext);
    }
  }
  return parentContext;
}

async function handlePermissionRequest(event: ArvoEvent): Promise<ArvoEvent> {
  return await tracer.startActiveSpan(
    'Permission.HumanApproval',
    {
      kind: SpanKind.INTERNAL,
    },
    createOtelContextFromEvent(event),
    async (span): Promise<ArvoEvent> => {
      try {
        console.log('==== Agent Requesting Tool Use Permission ====');
        const approval = await confirm({
          message: event.data?.reason ??
            'Agent need to call tools. Do you approve?',
        });
        span.setStatus({ code: SpanStatusCode.OK });
        return createArvoEventFactory(
          SimplePermissionManager.VERSIONED_CONTRACT,
        ).emits({
          subject: event.data?.parentSubject$$ ?? event.subject ?? undefined,
          parentid: event.id ?? undefined,
          to: event.source ?? undefined,
          accesscontrol: event.accesscontrol ?? undefined,
          source: TEST_EVENT_SOURCE,
          type: 'evt.arvo.default.simple.permission.request.success',
          data: {
            denied: !approval ? (event.data?.requestedTools ?? []) : [],
            granted: approval ? (event.data?.requestedTools ?? []) : [],
          },
        });
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.recordException(e as Error);
        throw e;
      } finally {
        span.end();
      }
    },
  );
}

const memory = new SimpleMachineMemory();
const permissionManager = new SimplePermissionManager({
  domains: ['human.interaction'],
});

// Unified stream listener injected into all agents.
// Captures tool requests and permission events with agent identifiers for correlation.
// Enables observability across multi-agent coordination without coupling agents to logging.
const onStream: AgentStreamListener = ({ type, data }, metadata) => {
  if (type === 'agent.tool.request') {
    console.log('==== [Agent Stream] Tool call requested by Agent ====');
    console.log(JSON.stringify({ type, sourceAgent: metadata.selfId, data }, null, 2));
    return
  }
  if (type === 'agent.tool.permission.requested') {
    console.log('==== [Agent Stream] Tool permission requested by Agent ====');
    console.log(JSON.stringify({ type, sourceAgent: metadata.selfId, data }, null, 2));
    return
  }
};

export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  const domainedEvents: ArvoEvent[] = [];
  const response = await createSimpleEventBroker([
    simpleAgent({ memory, permissionManager, onStream }),
    calculatorAgent({ memory, onStream }),    // Added calculator agent
    operatorAgent({ memory, onStream }),      // Added operator agent
    calculatorHandler(),
  ], {
    onDomainedEvents: async ({ event }) => {
      domainedEvents.push(event);
    },
  }).resolve(event);
  return response ? [response, ...domainedEvents] : domainedEvents;
};

async function main() {
  await tracer.startActiveSpan(
    'main',
    async (span) => {
      let eventToProcess: ArvoEvent = createArvoEventFactory(
        operatorAgentContract.version('1.0.0'),
      )
        .accepts({
          source: TEST_EVENT_SOURCE,
          data: {
            parentSubject$$: null,
            message: cleanString(\`
                Can you answer my following queries as accurately as possible:

                - What is the day today?
                - Can you tell what is Astro? (Just tell me in 2 sentences at high level)
                - Can you solve for x in 3x + 3x^2 + 45 = 100

                Also in your response exactly tell me what tool did you use. And the strategy you 
                employed.
              \`),
          },
        });

      let events: ArvoEvent[] = [];
      while (true) {
        const response = await executeHandlers(eventToProcess);
        // If no events are emitted then that means that
        // the agents is waiting on some unresolved domained
        // events so take the existing events and process more
        events = response.length ? response : events;
        const toolRequestEvent = events.find(
          (item) =>
            item.type ===
              SimplePermissionManager.VERSIONED_CONTRACT.accepts.type,
        );
        if (toolRequestEvent) {
          eventToProcess = await handlePermissionRequest(toolRequestEvent);
        } else {
          break;
        }
      }
      console.log('==== Agent final output ====');
      for (const evt of events) {
        console.log(evt.toString(2));
      }
      span.end();
    },
  );
}

main();

/*

Console Log

==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.operator",
  "data": {
    "tool": {
      "name": "service_arvo_orc_agent_simple",
      "kind": "arvo",
      "originalName": "arvo.orc.agent.simple"
    },
    "usage": {
      "prompt": 740,
      "completion": 190
    },
    "executionunits": 930
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.operator",
  "data": {
    "tool": {
      "name": "service_arvo_orc_agent_calculator",
      "kind": "arvo",
      "originalName": "arvo.orc.agent.calculator"
    },
    "usage": {
      "prompt": 740,
      "completion": 190
    },
    "executionunits": 930         // The calculator and simple agent calls were made in parallel because the tokens are the same
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.calculator",
  "data": {
    "tool": {
      "name": "service_com_calculator_execute",
      "kind": "arvo",
      "originalName": "com.calculator.execute"
    },
    "usage": {
      "prompt": 1657,
      "completion": 357
    },
    "executionunits": 2014
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.calculator",
  "data": {
    "tool": {
      "name": "service_com_calculator_execute",
      "kind": "arvo",
      "originalName": "com.calculator.execute"
    },
    "usage": {
      "prompt": 1657,
      "completion": 357
    },
    "executionunits": 2014
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.calculator",
  "data": {
    "tool": {
      "name": "service_com_calculator_execute",
      "kind": "arvo",
      "originalName": "com.calculator.execute"
    },
    "usage": {
      "prompt": 1657,
      "completion": 357
    },
    "executionunits": 2014
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.calculator",
  "data": {
    "tool": {
      "name": "service_com_calculator_execute",
      "kind": "arvo",
      "originalName": "com.calculator.execute"
    },
    "usage": {
      "prompt": 1657,
      "completion": 357
    },
    "executionunits": 2014      // The calculator tool calls were made in parallel because the tokens are the same
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.simple",
  "data": {
    "tool": {
      "name": "internal_current_date_tool",
      "kind": "internal",
      "originalName": "currentDateTool"
    },
    "usage": {
      "prompt": 130,
      "completion": 50
    },
    "executionunits": 180
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.simple",
  "data": {
    "tool": {
      "name": "mcp_search_astro_docs",
      "kind": "mcp",
      "originalName": "search_astro_docs"
    },
    "usage": {
      "prompt": 130,
      "completion": 50
    },
    "executionunits": 180
  }
}
==== [Agent Stream] Tool permission requested by Agent ====
{
  "type": "agent.tool.permission.requested",
  "sourceAgent": "arvo.orc.agent.simple",
  "data": {
    "tools": [
      {
        "name": "mcp_search_astro_docs",
        "kind": "mcp",
        "originalName": "search_astro_docs"
      }
    ],
    "usage": {
      "prompt": 130,
      "completion": 50
    },
    "executionunits": 180
  }
}

// The simple agent encountered a permission-restricted tool.
// It emits a permission request regardless of being invoked by the operator.
// Demonstrates that logical hierarchies don't create functional dependencies.

==== Agent Requesting Tool Use Permission ====
✔ Agent arvo.orc.agent.simple is requesting permission to execute following tools Yes
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.simple",
  "data": {
    "tool": {
      "name": "mcp_search_astro_docs",
      "kind": "mcp",
      "originalName": "search_astro_docs"
    },
    "usage": {
      "prompt": 475,
      "completion": 71
    },
    "executionunits": 546         // MCP tool call made again as it was dropped before due to permission denied
  }
}
==== Agent final output ====
{
  "id": "f9183917-4834-41f2-8fd3-92a9a93f047d",
  "source": "arvo.orc.agent.operator",
  "specversion": "1.0",
  "type": "arvo.orc.agent.operator.done",
  "subject": "eJw9jtEKwyAMRf8lz1V0tNvs36SabkLVYdMykP77shX2kod7LuemQan+SStX5FJhbJAxEYyAdS9amMYHZdblRWejg53qGkuWjtVGGzg6oDf5jX9hgxi+6IbhSrNVU3BW9cM0K3dHo+hi/WDI94ML4oo5cjyXgeUL/T8CQ0kYRZm3ZZGRRIziP44PHrM7MA==",
  "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
  "dataschema": "#/org/amas/agent/operator/1.0.0",
  "data": {
    "response": "## Answers to your queries:\n\n1. **What is the day today?**\n   Today is December 15, 2025.\n\n2. **What is Astro?**\n   Astro is a modern web framework designed for building fast, content-focused websites. It emphasizes performance by delivering only the necessary JavaScript to the client, making it ideal for static site generation and server-side rendering.\n\n3. **Solving 3x + 3x² + 45 = 100**\n   The calculator agent provided an approximate solution: x ≈ 3.81 or x ≈ -4.81. The equation can be rearranged to 3x² + 3x - 55 = 0, and using the quadratic formula, these are the two solutions.\n\n## Tools Used and Strategy:\n\n**Tools Used:**\n1. \`service_arvo_orc_agent_simple\` - For getting current date and Astro information\n2. \`service_arvo_orc_agent_calculator\` - For solving the mathematical equation\n\n**Strategy Employed:**\nI used a **parallel approach** where I could combine the first two queries (date and Astro info) into a single call to the simple agent since they were both informational requests that agent could handle. Then I made a separate call to the calculator agent for the mathematical equation. This was more efficient than making three separate sequential calls, as the first two queries could be handled together by the same agent."
  },
  "time": "2025-12-15T16:31:15.664+00:00",
  "to": "test.test.test",
  "accesscontrol": null,
  "redirectto": "arvo.orc.agent.operator",
  "executionunits": 2411,
  "traceparent": "00-f2ab9c5d0cb43c9089262ec292ba73d8-32c29bd905489308-01",
  "tracestate": null,
  "parentid": "49b96b78-de79-4df9-8c35-2f0d4e377ca3",
  "domain": null
}

*/


      `,
    },
  ],
};
