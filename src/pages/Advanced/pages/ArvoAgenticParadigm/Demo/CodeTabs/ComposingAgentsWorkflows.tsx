import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const ComposingAgentsWorkflows: DemoCodePanel = {
  heading: 'Composing Agents & Workflows',
  description: cleanString(`
    Arvo's composability extends to seamless integration between agents and workflows,
    demonstrating true architectural symmetry. Agents can invoke workflows just as easily
    as workflows invoke agents, with no special handling required. By declaring the essay
    building workflow as a service to the operator agent, we enable the operator to
    intelligently choose when to delegate essay generation to the structured workflow
    based on the nature of the user's request.
    
    This example shows the operator agent coordinating four different tasks in parallel:
    solving a mathematical equation via the calculator agent, fetching current date
    information and Astro documentation via the simple agent, and generating a complete
    essay through the essay building workflow. Each component executes independently,
    with the workflow internally orchestrating its own multi-step process including
    outline generation, human approval, and essay writing.
    
    This demonstrates architectural symmetry where agents and workflows are peers in the
    event fabric, coordinating through identical event-driven patterns without hierarchical
    dependencies. The operator agent doesn't need to know whether it's invoking an agent
    or a workflow—both expose the same event-based interface through contracts. This
    uniform composition model enables building arbitrarily complex systems by mixing
    intelligent agents with deterministic workflows, each playing to their strengths
    while maintaining clean separation of concerns.
  `),
  tabs: [
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
import { essayBuilderWorkflowContract } from './essay.builder.workflow/contract.ts';

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
    memory: IMachineMemory;
    onStream?: AgentStreamListener;
  }
> = ({ memory, onStream }) =>
  createArvoAgent({
    contracts: {
      self: operatorAgentContract,
      services: {
        simpleAgent: {
          contract: simpleAgentContract.version('1.0.0'),
        },
        calculatorAgent: {
          contract: calculatorAgentContract.version('1.0.0'),
        },
        // Just added this to tell the agent that is can 
        // use this service as well
        essayBuilder: {
          contract: essayBuilderWorkflowContract.version('1.0.0')
        }
      },
    },
    onStream,
    memory,
    // It needs to interact with many different entities in the system. This might need many tool interactions
    maxToolInteractions: 100,
    llm: anthropicLLMIntegration(
      new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    ),
    handler: {
      '1.0.0': {
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
import {
  type AgentStreamListener,
  SimplePermissionManager,
} from '@arvo-tools/agentic';
import { confirm, input } from '@inquirer/prompts';
import {
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { calculatorHandler } from './handlers/calculator.service.ts';
import { calculatorAgent } from './handlers/calculator.agent.ts';
import { operatorAgent, operatorAgentContract } from './handlers/operator.agent.ts';
import { humanConversationContract } from './handlers/human.conversation.contract.ts';
import { essayOutlineAgent } from './handlers/essay-outline.agent.ts';
import { essayWriterAgent } from './handlers/essay-writer.agent.ts';
import { essayBuilderWorkflow } from './handlers/essay.builder.workflow/index.ts';
import { humanApprovalContract } from './handlers/human.approval.contract.ts';
import { cleanString } from 'arvo-core';
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

async function handleHumanConversation(event: ArvoEvent): Promise<ArvoEvent> {
  return await tracer.startActiveSpan(
    'HumanConversation.Interaction',
    {
      kind: SpanKind.INTERNAL,
    },
    createOtelContextFromEvent(event),
    async (span): Promise<ArvoEvent> => {
      try {
        console.log('==== Agent Initiated Conversation ====');

        const userResponse = await input({
          message: event.data?.prompt ?? 'Agent is requesting input',
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return createArvoEventFactory(
          humanConversationContract.version('1.0.0'),
        ).emits({
          subject: event.data?.parentSubject$$ ?? event.subject ?? undefined,
          parentid: event.id ?? undefined,
          to: event.source ?? undefined,
          accesscontrol: event.accesscontrol ?? undefined,
          source: TEST_EVENT_SOURCE,
          type: 'evt.human.conversation.success',
          data: {
            response: userResponse,
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

async function handleHumanApproval(event: ArvoEvent): Promise<ArvoEvent> {
  return await tracer.startActiveSpan(
    'HumanConversation.Approval',
    {
      kind: SpanKind.INTERNAL,
    },
    createOtelContextFromEvent(event),
    async (span): Promise<ArvoEvent> => {
      try {
        console.log('==== Agent Initiated Plan Approval ====');

        const userResponse = await confirm({
          message: event.data?.prompt ?? 'Agent is requesting approval',
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return createArvoEventFactory(
          humanApprovalContract.version('1.0.0'),
        ).emits({
          subject: event.data?.parentSubject$$ ?? event.subject ?? undefined,
          parentid: event.id ?? undefined,
          to: event.source ?? undefined,
          accesscontrol: event.accesscontrol ?? undefined,
          source: TEST_EVENT_SOURCE,
          type: 'evt.human.approval.success',
          data: {
            approval: userResponse,
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

// Capturing agent stream as dependency injection as well.
const onStream: AgentStreamListener = ({ type, data }, metadata) => {
  if (type === 'agent.init') {
    console.log('==== [Agent Stream] Agent Initiated ====');
    console.log(
      JSON.stringify({ type, sourceAgent: metadata.selfId, data }, null, 2),
    );
    return;
  }
  if (type === 'agent.output') {
    console.log('==== [Agent Stream] Agent Finalised Output ====');
    console.log(
      JSON.stringify({ type, sourceAgent: metadata.selfId, data }, null, 2),
    );
    return;
  }
  if (type === 'agent.tool.request') {
    console.log('==== [Agent Stream] Tool call requested by Agent ====');
    console.log(
      JSON.stringify({ type, sourceAgent: metadata.selfId, data }, null, 2),
    );
    return;
  }
  if (type === 'agent.tool.permission.requested') {
    console.log('==== [Agent Stream] Tool permission requested by Agent ====');
    console.log(
      JSON.stringify({ type, sourceAgent: metadata.selfId, data }, null, 2),
    );
    return;
  }
};

export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  const domainedEvents: ArvoEvent[] = [];
  const response = await createSimpleEventBroker([
    simpleAgent({ memory, permissionManager, onStream }),
    calculatorAgent({ memory, onStream }),
    operatorAgent({ memory, onStream }),
    calculatorHandler(),
    // Add the new handlers into the event-fabric
    essayOutlineAgent({ onStream }),
    essayWriterAgent({ onStream }),
    essayBuilderWorkflow({ memory }),
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

                - Can you solve for x in 3x + 3x^2 + 45 = 100
                - Can tell me about Astro (at a high level in 2-4 sentences)
                - Can you tell me what day it was yesterday
                - Write an essay on "State of Agentic Systems - A high-level overview"
                  The essay must have only 5 headings and each heading must have only one paragraph.

                Also in your response exactly tell me what tool did you use. And the strategy you 
                employed.
              \`),
          },
        });

      let events: ArvoEvent[] = [];
      while (true) {
        const response = await executeHandlers(eventToProcess);
        events = response.length ? response : events;

        const toolRequestEventIndex = events.findIndex(
          (item) =>
            item.type ===
              SimplePermissionManager.VERSIONED_CONTRACT.accepts.type,
        );
        if (toolRequestEventIndex !== -1) {
          eventToProcess = await handlePermissionRequest(
            events[toolRequestEventIndex],
          );
          events.splice(toolRequestEventIndex, 1);
          continue;
        }

        const humanConversationEventIndex = events.findIndex(
          (item) => item.type === humanConversationContract.type,
        );
        if (humanConversationEventIndex !== -1) {
          eventToProcess = await handleHumanConversation(
            events[humanConversationEventIndex],
          );
          events.splice(humanConversationEventIndex, 1);
          continue;
        }

        const humanApprovalEventIndex = events.findIndex(
          (item) => item.type === humanApprovalContract.type,
        );
        if (humanApprovalEventIndex !== -1) {
          eventToProcess = await handleHumanApproval(
            events[humanApprovalEventIndex],
          );
          events.splice(humanApprovalEventIndex, 1);
          continue;
        }

        break;
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

Console log

==== [Agent Stream] Agent Initiated ====
{
  "type": "agent.init",
  "sourceAgent": "arvo.orc.agent.operator",
  "data": {
    "system": "You a a helpful agent whose job is to respond to the user's\nrequest as accurately as possible. You must use the available tools\nand agent to you, when it makes sense, to get the most accurate answer.\n**Critical tool/agent use direction:** If you determine that a request needs\nmultiple tool/agent calls and they can be made in parallel then always do parallel\ntool calls. You are banned from performing sequential tool calls when they can\nbe parallelized",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "content": "Can you answer my following queries as accurately as possible:\n- Can you solve for x in 3x + 3x^2 + 45 = 100\n- Can tell me about Astro (at a high level in 2-4 sentences)\n- Can you tell me what day it was yesterday\n- Write an essay on \"State of Agentic Systems - A high-level overview\"\nThe essay must have only 5 headings and each heading must have only one paragraph.\nAlso in your response exactly tell me what tool did you use. And the strategy you\nemployed."
        },
        "seenCount": 0
      }
    ],
    "tools": [
      "service_arvo_orc_agent_simple",
      "service_arvo_orc_agent_calculator",
      "service_arvo_orc_workflow_essay_builder"
    ],
    "llmResponseType": "text",
    "toolIteractionCycle": {
      "max": 100,
      "current": 0,
      "exhausted": false
    }
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
      "prompt": 911,
      "completion": 318
    },
    "executionunits": 1229
  }
}
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
      "prompt": 911,
      "completion": 318
    },
    "executionunits": 1229
  }
}
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
      "prompt": 911,
      "completion": 318
    },
    "executionunits": 1229
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.operator",
  "data": {
    "tool": {
      "name": "service_arvo_orc_workflow_essay_builder",
      "kind": "arvo",
      "originalName": "arvo.orc.workflow.essay.builder"
    },
    "usage": {
      "prompt": 911,
      "completion": 318
    },
    "executionunits": 1229
  }
}
==== [Agent Stream] Agent Initiated ====
{
  "type": "agent.init",
  "sourceAgent": "arvo.orc.agent.essay.outline",
  "data": {
    "system": "Generate exactly 5 essay headings for the given topic. First heading\nis Introduction. Last heading is Conclusion. Middle 3 headings are main\ntopics. Use Roman numerals (I-V). No subsections. Just 5 headings only.",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "content": "Generate an essay outline for the following topic:\n\"State of Agentic Systems - A high-level overview\"\nAdditional Instructions:\nThe essay must have only 5 headings and each heading must have only one paragraph."
        },
        "seenCount": 0
      }
    ],
    "tools": [],
    "llmResponseType": "text",
    "toolIteractionCycle": {
      "max": 5,
      "current": 0,
      "exhausted": false
    }
  }
}
==== [Agent Stream] Agent Initiated ====
{
  "type": "agent.init",
  "sourceAgent": "arvo.orc.agent.simple",
  "data": {
    "system": "You are a helpful agent. For queries about the current date,\nuse internal_current_date_tool.\nFor information about Astro, use mcp_search_astro_docs.",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "content": "What day was it yesterday?"
        },
        "seenCount": 0
      }
    ],
    "tools": [
      "mcp_search_astro_docs",
      "internal_current_date_tool"
    ],
    "llmResponseType": "text",
    "toolIteractionCycle": {
      "max": 10,
      "current": 0,
      "exhausted": false
    }
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
      "prompt": 112,
      "completion": 12
    },
    "executionunits": 124
  }
}

==== [Agent Stream] Agent Initiated ====
{
  "type": "agent.init",
  "sourceAgent": "arvo.orc.agent.simple",
  "data": {
    "system": "You are a helpful agent. For queries about the current date,\nuse internal_current_date_tool.\nFor information about Astro, use mcp_search_astro_docs.",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "content": "Can you tell me about Astro at a high level in 2-4 sentences?"
        },
        "seenCount": 0
      }
    ],
    "tools": [
      "mcp_search_astro_docs",
      "internal_current_date_tool"
    ],
    "llmResponseType": "text",
    "toolIteractionCycle": {
      "max": 10,
      "current": 0,
      "exhausted": false
    }
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
      "prompt": 123,
      "completion": 21
    },
    "executionunits": 144
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
      "prompt": 123,
      "completion": 21
    },
    "executionunits": 144
  }
}
==== [Agent Stream] Agent Initiated ====
{
  "type": "agent.init",
  "sourceAgent": "arvo.orc.agent.calculator",
  "data": {
    "system": "You are strictly a calculation agent. Your sole purpose is to understand user requests\nand use the service_com_calculator_execute to perform calculations\nand respond with results. If the user request is not related to calculation, or you find\nthat your tool cannot perform the calculation due to tool limitations,\nthen respond with a null output and in remarks explain to the user why you were\nnot able to address the request.\nFor complex queries that you believe are solvable, you can break down the\nquery into smaller calculations which your tool can perform and use the tool to\nsolve each part.\n**Human approval workflow:** Before executing any calculation tool calls, you must first\nuse the service_com_human_conversation to present your execution plan to the\nhuman user. Clearly describe what calculations you intend to perform and how you will\nsolve their request. Wait for the human to explicitly approve your plan before proceeding\nwith the service_com_calculator_execute. If the human asks questions or requests\nclarification about your plan, continue using the service_com_human_conversation\nto address their questions until they explicitly approve. Only execute the calculation tools\nafter receiving clear approval from the human.\n**Critical tool use direction:** If you determine that a request needs\nmultiple tool calls and they can be made in parallel, then always execute parallel\ntool calls. You are banned from performing sequential tool calls when they can\nbe parallelized.",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "content": "Solve for x in the equation: 3x + 3x^2 + 45 = 100"
        },
        "seenCount": 0
      }
    ],
    "tools": [
      "service_com_calculator_execute",
      "service_com_human_conversation"
    ],
    "llmResponseType": "json",
    "toolIteractionCycle": {
      "max": 5,
      "current": 0,
      "exhausted": false
    }
  }
}
==== [Agent Stream] Tool call requested by Agent ====
{
  "type": "agent.tool.request",
  "sourceAgent": "arvo.orc.agent.calculator",
  "data": {
    "tool": {
      "name": "service_com_human_conversation",
      "kind": "arvo",
      "originalName": "com.human.conversation"
    },
    "usage": {
      "prompt": 1782,
      "completion": 332
    },
    "executionunits": 2114
  }
}
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
      "prompt": 420,
      "completion": 42
    },
    "executionunits": 462
  }
}

==== Agent Initiated Conversation ====
✔ I need to solve the quadratic equation 3x + 3x² + 45 = 100 for x. Here's my execution plan:

1. First, I'll rearrange the equation to standard form by subtracting 100 from both sides:
   3x² + 3x + 45 - 100 = 0
   3x² + 3x - 55 = 0

2. I'll use the quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)
   Where a = 3, b = 3, c = -55

3. I'll calculate the discriminant: b² - 4ac = 3² - 4(3)(-55) = 9 + 660 = 669

4. Then calculate both solutions:
   x₁ = (-3 + √669) / 6
   x₂ = (-3 - √669) / 6

I'll use the calculator to compute:
- The discriminant: 9 + 660
- The square root of 669
- Both final solutions

Does this approach look correct to you? Should I proceed with these calculations? do it
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
      "prompt": 3914,
      "completion": 566
    },
    "executionunits": 4480
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
      "prompt": 3914,
      "completion": 566
    },
    "executionunits": 4480
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
      "prompt": 3914,
      "completion": 566
    },
    "executionunits": 4480
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
      "prompt": 3914,
      "completion": 566
    },
    "executionunits": 4480
  }
}

==== Agent Initiated Plan Approval ====
✔ For the topic "State of Agentic Systems - A high-level overview" following is the proposed outline:
I. Introduction
II. Overview of Agentic Systems
III. Current Applications and Innovations
IV. Challenges and Ethical Considerations
V. Conclusion
Please review this and provide your approval Yes
==== [Agent Stream] Agent Initiated ====
{
  "type": "agent.init",
  "sourceAgent": "arvo.orc.agent.essay.writer",
  "data": {
    "system": "Write a complete essay on the given topic.\nFollow exaclty the provided outline and write exactly one paragraph\nunder each heading. Each paragraph should be 4-6 sentences.\nFormat with headings in bold.",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "content": "Can you write an essay for the topic \"State of Agentic Systems - A high-level overview\"\nYou must follow this outline exactly:\nI. Introduction\nII. Overview of Agentic Systems\nIII. Current Applications and Innovations\nIV. Challenges and Ethical Considerations\nV. Conclusion\nAdditional instructions:\nThe essay must have only 5 headings and each heading must have only one paragraph."
        },
        "seenCount": 0
      }
    ],
    "tools": [],
    "llmResponseType": "text",
    "toolIteractionCycle": {
      "max": 5,
      "current": 0,
      "exhausted": false
    }
  }
}

==== Agent final output ====
{
  "id": "a45fc2b5-70c7-458f-b522-e5c4f9182778",
  "source": "arvo.orc.agent.operator",
  "specversion": "1.0",
  "type": "arvo.orc.agent.operator.done",
  "subject": "eJw9jtEKgzAMRf8lz7Z0Olnn36Q13Qq2HTWKIP33hQl7ycM9l3NzQqn+TStX5FJhOiFjIpgA6160MI0vyqzLh65GBzvVNZYsnZs22kDrgA7yG//CE+IsyAcc6EFB9UijuluLypkhqNE8exNsoOCcuGKOHK9lYPlC/4/AuSSMoszbsshIIkbxt/YFSQQ7xA==",
  "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
  "dataschema": "#/org/amas/agent/operator/1.0.0",
  "data": {
    "response": "## Answers to Your Queries:\n\n### 1. Solving 3x + 3x² + 45 = 100\nThe equation has two solutions:\n- x₁ ≈ 3.811\n- x₂ ≈ -4.811\n\nThe calculator agent rearranged the equation to standard form (3x² + 3x - 55 = 0) and used the quadratic formula to find these solutions.\n\n### 2. About Astro\nAstro is a modern web framework designed to optimize the performance of websites by delivering only the necessary JavaScript to the client. It allows developers to build fast, content-focused websites using a component-based architecture. Astro supports multiple front-end frameworks, enabling developers to use their preferred tools and libraries. It emphasizes server-side rendering and static site generation, making it ideal for building high-performance, SEO-friendly websites.\n\n### 3. Yesterday's Date\nYesterday was December 16, 2025, which was a Tuesday.\n\n### 4. Essay on \"State of Agentic Systems - A high-level overview\"\n\n**I. Introduction**\n\nAgentic systems, a subset of artificial intelligence, have become a focal point in the technological landscape due to their ability to perform tasks autonomously. These systems are designed to perceive their environment, make decisions, and execute actions without human intervention. As the world becomes increasingly digital, the demand for such systems is growing, driven by the need for efficiency and the ability to handle complex tasks. This essay provides a high-level overview of agentic systems, exploring their current applications, innovations, challenges, and ethical considerations.\n\n**II. Overview of Agentic Systems**\n\nAgentic systems are characterized by their autonomy, adaptability, and ability to learn from their environment. They are built on algorithms that enable them to process data, recognize patterns, and make decisions based on predefined goals. These systems can range from simple rule-based agents to complex machine learning models that evolve over time. The core components of agentic systems include sensors for data collection, processors for decision-making, and actuators for executing actions. As technology advances, these systems are becoming more sophisticated, capable of handling a wide range of tasks across various domains.\n\n**III. Current Applications and Innovations**\n\nAgentic systems are being deployed across numerous industries, revolutionizing the way tasks are performed. In the automotive industry, autonomous vehicles are a prime example, using agentic systems to navigate roads and make real-time decisions. In healthcare, these systems assist in diagnostics and patient monitoring, improving accuracy and efficiency. The financial sector utilizes agentic systems for algorithmic trading, risk management, and fraud detection. Innovations continue to emerge, such as smart home devices that learn user preferences and industrial robots that optimize manufacturing processes. These applications highlight the transformative potential of agentic systems in enhancing productivity and innovation.\n\n**IV. Challenges and Ethical Considerations**\n\nDespite their potential, agentic systems pose significant challenges and ethical concerns. One major issue is the reliability and safety of these systems, particularly in critical applications like healthcare and transportation. Ensuring that agentic systems make decisions that align with human values and ethics is another challenge, as biases in data can lead to unintended consequences. Privacy concerns also arise, as these systems often require access to vast amounts of personal data. Additionally, the potential for job displacement due to automation raises socio-economic concerns. Addressing these challenges requires robust regulatory frameworks and ongoing dialogue between technologists, policymakers, and society.\n\n**V. Conclusion**\n\nThe state of agentic systems reflects both the remarkable advancements in technology and the complex challenges that accompany them. As these systems become more integrated into daily life, their impact on industries and society will continue to grow. While they offer significant benefits in terms of efficiency and innovation, it is crucial to address the ethical and practical challenges they present. By fostering responsible development and deployment, agentic systems can be kerneled to improve quality of life while minimizing risks. The future of agentic systems will depend on our ability to balance technological progress with ethical considerations and societal needs.\n\n## Tools Used and Strategy:\n\n**Tools Used:**\n1. **service_arvo_orc_agent_calculator** - For solving the quadratic equation\n2. **service_arvo_orc_agent_simple** - For Astro information and yesterday's date (2 calls)\n3. **service_arvo_orc_workflow_essay_builder** - For generating the essay\n\n**Strategy Employed:**\nI used a **parallel execution strategy** for maximum efficiency. Since all four queries were independent of each other, I made all four tool calls simultaneously rather than sequentially. This approach minimized response time and followed the critical direction to parallelize tool calls whenever possible. Each tool was specifically chosen based on its capabilities:\n- Calculator agent for mathematical problem solving\n- Simple agent for factual information queries (Astro and date)\n- Essay builder workflow for structured content creation with specific formatting requirements"
  },
  "time": "2025-12-17T17:22:20.563+00:00",
  "to": "test.test.test",
  "accesscontrol": null,
  "redirectto": "arvo.orc.agent.operator",
  "executionunits": 4582,
  "traceparent": "00-0079dd47661289932655ca01a6eca6e6-1c38711f35b765ce-01",
  "tracestate": null,
  "parentid": "4289aba7-9772-4d9f-a97a-2f2d70363d19",
  "domain": null
}

*/

      
      `,
    },
  ],
};
