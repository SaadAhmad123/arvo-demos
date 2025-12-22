import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const HumanCollaboration: DemoCodePanel = {
  heading: 'Enabling Agent-Human Collaboration',
  description: cleanString(`
    Multi-agent systems can automate substantial workflows, but they perform optimally when humans can 
    contribute insights at critical moments. Rather than limiting human involvement to predefined checkpoints 
    in rigid workflows, Arvo enables agents to reach out to humans whenever needed. These interactions aren't 
    constrained to simple approvals or single-message exchanges. They're unstructured conversations where agents 
    and humans collaborate naturally on problems.

    ### Conversational Human Interaction

    The human conversation contract defined in \`handlers/human.conversation.contract.ts\` establishes a flexible 
    communication channel. Unlike the permission manager that handles yes/no authorization decisions, this contract 
    supports open-ended dialogue. An agent can initiate conversation by posing questions or sharing plans. Humans 
    respond with feedback, clarifications, or additional questions. The agent processes these responses and continues 
    the conversation as needed. This back-and-forth continues until both parties reach understanding.

    The calculator agent demonstrates this pattern in \`handlers/calculator.agent.ts\`. Its system prompt instructs 
    it to present execution plans to humans before performing calculations. When a user requests a calculation, the 
    agent formulates a strategy, reaches out through the conversation contract to explain its approach, and waits for 
    human approval. If the human questions the strategy, the agent doesn't simply abort or proceed blindly. It engages 
    in dialogue, explaining its reasoning and addressing concerns until receiving clear approval.

    ### Domain Resolution Patterns

    The calculator agent registers the human conversation service with a special domain configuration using 
    \`ArvoDomain.FROM_EVENT_CONTRACT\`. This symbolic domain tells the event emission system to inherit the domain 
    from the service contract itself at emission time. When the agent emits a conversation event, the Actions Engine 
    reads the domain field from \`humanConversationContract\` and applies it to the emitted event. This provides a 
    clean way to centralize domain configuration in contracts rather than duplicating it across every agent that uses 
    the service.

    The alternative approach specifies domains directly in the service configuration like \`domains: ['human.interaction']\`. 
    Both patterns work identically. The symbolic domain simply keeps domain management centralized in the contract 
    definition, useful when multiple agents interact with the same external service and you want consistent routing 
    without repeating domain specifications.

    ### Handling Multiple External Interactions

    The \`main.ts\` file shows the execution loop handling two types of external interactions simultaneously. The 
    \`handlePermissionRequest\` function processes authorization decisions while \`handleHumanConversation\` manages 
    dialogue events. Both functions extract trace context from events to maintain observability continuity, create 
    child spans for their processing, prompt humans appropriately, and construct response events with proper context 
    stitching.

    The main loop checks accumulated events for both permission requests and conversation events. If either appears, 
    it routes to the appropriate handler, collects the human's response, and feeds it back to the agent. The agent 
    resumes with this new information and continues executing. This pattern scales to any number of external interaction 
    types. Add new contracts for different collaboration modes, register them with appropriate domains, and extend the 
    main loop to handle their event types.

    ### Natural Collaboration Flow

    The console output demonstrates the collaborative pattern. The calculator agent emits a conversation event 
    presenting its quadratic formula strategy. The human questions this approach, asking why that method was chosen. 
    The agent responds with detailed reasoning about why the quadratic formula is most appropriate, mentions alternative 
    approaches, and asks if the human wants to proceed. The human requests specifics about tool calls. The agent lists 
    each calculator invocation it plans to make. Only after this thorough discussion does the human approve execution.

    Notice that the agent made four parallel calculator service calls (identical token counts confirm simultaneity) only 
    after completing the approval conversation. The human interaction didn't just gate execution with a yes/no decision. 
    It enabled genuine collaboration where the human educated themselves about the agent's strategy and the agent adapted 
    its communication to address human concerns. This produces better outcomes than rigid approval gates because both 
    parties reach shared understanding before critical operations execute.
  `),
  tabs: [
    {
      title: 'handlers/calculator.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import {
  ArvoDomain,
  type EventHandlerFactory,
  type IMachineMemory,
} from 'arvo-event-handler';
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
import { humanConversationContract } from './human.conversation.contract.ts';

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
    memory: IMachineMemory;
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
        humanConversation: {
          contract: humanConversationContract.version('1.0.0'),
          // Symbolic domain that resolves at emission time.
          // ArvoDomain.FROM_EVENT_CONTRACT inherits the domain from humanConversationContract,
          // centralizing domain configuration in the contract rather than repeating it here.
          domains: [ArvoDomain.FROM_EVENT_CONTRACT],
        },
      },
    },
    onStream,
    memory,
    llm: anthropicLLMIntegration(
      new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      {
        invocationParam: {
          model: 'claude-4-sonnet-20250514',
          stream: true, // Enable LLM stream. This is in addition to the agent streaming
          max_tokens: 4096,
          temperature: 0,
        },
        executionunits: (prompt, completion) => {
          return prompt + completion;
        },
      },
    ),
    handler: {
      '1.0.0': {
        llmResponseType: 'json',
        // Instructs the agent to engage in dialogue before execution.
        // The agent presents its plan, addresses questions, and waits for explicit approval.
        // This enables collaborative problem-solving rather than just yes/no gating.
        context: AgentDefaults.CONTEXT_BUILDER(({ tools }) =>
          cleanString(\`
              You are strictly a calculation agent. Your sole purpose is to understand user requests
              and use the \${tools.services.calculatorContract.name} to perform calculations
              and respond with results. If the user request is not related to calculation, or you find
              that your tool cannot perform the calculation due to tool limitations,
              then respond with a null output and in remarks explain to the user why you were 
              not able to address the request.

              For complex queries that you believe are solvable, you can break down the 
              query into smaller calculations which your tool can perform and use the tool to 
              solve each part.

              **Human approval workflow:** Before executing any calculation tool calls, you must first 
              use the \${tools.services.humanConversation.name} to present your execution plan to the 
              human user. Clearly describe what calculations you intend to perform and how you will 
              solve their request. Wait for the human to explicitly approve your plan before proceeding 
              with the \${tools.services.calculatorContract.name}. If the human asks questions or requests 
              clarification about your plan, continue using the \${tools.services.humanConversation.name} 
              to address their questions until they explicitly approve. Only execute the calculation tools 
              after receiving clear approval from the human.

              **Critical tool use direction:** If you determine that a request needs 
              multiple tool calls and they can be made in parallel, then always execute parallel 
              tool calls. You are banned from performing sequential tool calls when they can 
              be parallelized.
            \`)
        ),
        output: AgentDefaults.OUTPUT_BUILDER,
      },
    },
  });


      `,
    },
    {
      title: 'handlers/human.conversation.contract.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import z from 'zod';
import { cleanString } from 'arvo-core';

// Defines a flexible conversation channel between agents and humans.
// Unlike permission contracts (yes/no decisions), this supports open-ended dialogue.
// Agents initiate conversations, humans respond with questions or feedback,
// and the exchange continues until both reach understanding.
// In this way, Arvo considers Humans as event handlers as well.
export const humanConversationContract = createSimpleArvoContract({
  uri: '#/org/amas/external/human/conversation',
  type: 'human.conversation',
  domain: 'human.interaction',
  description: cleanString(\`
    A mechanism through which the agent can reach out to the human during 
    task execution to initiate a conversation. Once initiated by the agent, 
    the human can respond and continue the conversation for as long as needed. 
    This enables back-and-forth dialogue for clarification, additional input, 
    or confirmation before the agent provides the final answer.  
  \`),
  versions: {
    '1.0.0': {
      accepts: z.object({
        prompt: z.string().describe(
          'The question or message from the agent to the human user that initiates or continues the conversation',
        ),
      }),
      emits: z.object({
        response: z.string().describe(
          "The human user's response that continues the dialogue and provides the requested information, feedback, or further questions",
        ),
      }),
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
import {
  operatorAgent,
  operatorAgentContract,
} from './handlers/operator.agent.ts';
import { humanConversationContract } from './handlers/human.conversation.contract.ts';
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

// Handles agent-initiated conversational interactions with humans.
// Maintains trace continuity through OTEL context extraction.
// Prompts the human with the agent's question and constructs a response event
// with proper context stitching for agent resumption.
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

const memory = new SimpleMachineMemory();
const permissionManager = new SimplePermissionManager({
  domains: ['human.interaction'],
});

// Capturing agent stream as dependency injection as well.
const onStream: AgentStreamListener = ({ type, data }, metadata) => {
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
    calculatorAgent({ memory, onStream }), // Added calculator agent
    operatorAgent({ memory, onStream }), // Added operator agent
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
        const humanConversationEvent = events.find(
          (item) => item.type === humanConversationContract.type, // The type stays the same across version
        );
        
        // Address the tool permission request in the events list
        // and remove it to avoid duplicate requests
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


        // Address the human conversation event in the events list
        // and remove it to avoid duplicate requests
        const humanConversationEventIndex = events.findIndex(
          // The type stays the same across version
          (item) => item.type === humanConversationContract.type, 
        );
        if (humanConversationEventIndex !== -1) {
          eventToProcess = await handleHumanConversation(
            events[humanConversationEventIndex],
          );
          events.splice(humanConversationEventIndex, 1);
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

Console Log

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
      "prompt": 741,
      "completion": 232
    },
    "executionunits": 973
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
      "prompt": 741,
      "completion": 232
    },
    "executionunits": 973
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
      "prompt": 741,
      "completion": 232
    },
    "executionunits": 973
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
      "prompt": 1783,
      "completion": 314
    },
    "executionunits": 2097
  }
}

// The permission request and human conversation events are both
// emitted and pushed in the events list. They are being addressed
// one by one by the main loop.

==== Agent Requesting Tool Use Permission ====
✔ Agent arvo.orc.agent.simple is requesting permission to execute following tools 
[User Input: No]

// Permission is explicitly denied so no MCP tool is called

==== Agent Initiated Conversation ====
✔ I need to solve the quadratic equation 3x + 3x² + 45 = 100 for x. Here's my execution plan:

1. First, I'll rearrange the equation to standard form: 3x² + 3x + 45 - 100 = 0, which simplifies to 3x² + 3x - 55 = 0

2. I'll use the quadratic formula: x = (-b ± √(b² - 4ac)) / (2a), where a = 3, b = 3, c = -55

3. I'll calculate the discriminant: b² - 4ac = 3² - 4(3)(-55) = 9 + 660 = 669

4. Then calculate the two solutions:
   - x₁ = (-3 + √669) / 6
   - x₂ = (-3 - √669) / 6

5. I'll use the calculator to compute √669 and then the final values for both solutions.

Does this approach look correct to you? Should I proceed with these calculations? 
[User Input: why this way?]
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
      "prompt": 3899,
      "completion": 623
    },
    "executionunits": 4522
  }
}
==== Agent Initiated Conversation ====
✔ Good question! I'm using the quadratic formula because this is a quadratic equation (it has an x² term). Let me explain why this is the most reliable approach:

The equation 3x + 3x² + 45 = 100 is a quadratic equation because of the x² term. When rearranged to standard form (ax² + bx + c = 0), it becomes 3x² + 3x - 55 = 0.

For quadratic equations, we have a few options:
1. **Quadratic formula** - Always works for any quadratic equation
2. **Factoring** - Only works if the equation factors nicely (which this one doesn't appear to)
3. **Completing the square** - Works but is more complex for this particular equation

The quadratic formula is the most systematic and reliable method here. It will give us the exact solutions.

Would you prefer I try a different approach, or shall I proceed with the quadratic formula method I outlined? 
[User Input: in quadratic way how many tool calls will be done show me all of them]
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
      "prompt": 6327,
      "completion": 966
    },
    "executionunits": 7293
  }
}
==== Agent Initiated Conversation ====
✔ Great question! Let me break down all the calculator tool calls I'll need for the quadratic formula approach:

**Tool Call 1:** Calculate the discriminant
- Expression: "3**2 - 4*3*(-55)"
- This gives us b² - 4ac = 9 + 660 = 669

**Tool Call 2:** Calculate √669
- Expression: "sqrt(669)"
- This gives us the square root of the discriminant

**Tool Call 3:** Calculate the first solution x₁
- Expression: "(-3 + sqrt(669)) / (2*3)"
- This is (-b + √discriminant) / (2a)

**Tool Call 4:** Calculate the second solution x₂
- Expression: "(-3 - sqrt(669)) / (2*3)"
- This is (-b - √discriminant) / (2a)

**Total: 4 tool calls**

Since some of these calculations are independent (like calculating √669 separately), I can potentially run some in parallel to be more efficient.

Would you like me to proceed with this plan, or would you prefer to see a different approach? 
[User Input: do it]
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
      "prompt": 9092,
      "completion": 1209
    },
    "executionunits": 10301
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
      "prompt": 9092,
      "completion": 1209
    },
    "executionunits": 10301
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
      "prompt": 9092,
      "completion": 1209
    },
    "executionunits": 10301
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
      "prompt": 9092,
      "completion": 1209
    },
    "executionunits": 10301
  }
}
==== Agent final output ====
{
  "id": "7efc16cb-7fe6-436e-a772-baaaaeb80630",
  "source": "arvo.orc.agent.operator",
  "specversion": "1.0",
  "type": "arvo.orc.agent.operator.done",
  "subject": "eJw9jtEKgzAMRf8lz7a0Tjvn38Q2bgXbjhplIP77woS95OGey7k5oFT/opUrcqkwHpAxEYyAdS9amMYnZdblTVejgZ3qGkuWjtVGGzgboA/5jX/hATEIotk553ur7DAE1bX+oaYZb6pzw70NfWfayYgr5sjxWgaWL/T/CAwlYRRl3pZFRhIxiv88v+sOOnU=",
  "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
  "dataschema": "#/org/amas/agent/operator/1.0.0",
  "data": {
    "response": "## Answers to your queries:\n\n1. **Solving 3x + 3x² + 45 = 100:**\n   The equation has two solutions: x ≈ 3.811 or x ≈ -4.811. The calculator agent rearranged it to standard form (3x² + 3x - 55 = 0) and used the quadratic formula to find both solutions.\n\n2. **About Astro:**\n   Astro is a modern web framework designed for building fast, content-focused websites. It emphasizes performance by delivering only the necessary JavaScript to the browser, and it supports a wide range of UI frameworks like React, Vue, and Svelte. Astro is particularly well-suited for static site generation and offers a component-based architecture.\n\n3. **Yesterday's day:**\n   Yesterday was December 14, 2025, which was a Sunday.\n\n## Tools Used and Strategy:\n\n**Tools Used:**\n- \`service_arvo_orc_agent_calculator\` for the mathematical equation\n- \`service_arvo_orc_agent_simple\` for both the Astro information and the date question\n\n**Strategy Employed:**\nI used a **parallel execution strategy** since all three queries were independent and could be processed simultaneously. I made all three tool calls at once rather than sequentially, which is more efficient and follows the directive to parallelize when possible. Each query was routed to the most appropriate agent - the calculator agent for the mathematical problem and the simple agent for the informational queries about Astro and the date."
  },
  "time": "2025-12-16T00:32:41.890+00:00",
  "to": "test.test.test",
  "accesscontrol": null,
  "redirectto": "arvo.orc.agent.operator",
  "executionunits": 2608,
  "traceparent": "00-033a331168a70644cdfd2290cf224d60-1a4e299fcce4fec8-01",
  "tracestate": null,
  "parentid": "ea92c23b-88d0-4a45-99c6-d3098afa156a",
  "domain": null
}

*/


      
      `,
    },
  ],
};
