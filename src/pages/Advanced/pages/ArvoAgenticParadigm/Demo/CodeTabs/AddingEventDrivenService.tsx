import {
  ArvoEventHandlerLearn,
  ArvoMentalModelLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
  EventRoutingAndBrokerInArvoLearn,
} from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const AddingEventDrivenService: DemoCodePanel = {
  heading: 'Making Your Agent Participate In Event Driven Ecosystem',
  description: cleanString(`
    Now we introduce the third tool execution mode, enabling agents to participate in event-driven 
    coordination with other services, workflows, agents, and external systems. This transforms agents 
    from isolated components into peers within the event fabric.

    ## Event-Driven Service Coordination

    The calculator handler defined in \`calculator.service.ts\` is a standard Arvo event handler following 
    the patterns described in the [${ArvoEventHandlerLearn.name.toLowerCase()}](${ArvoEventHandlerLearn.link}) 
    documentation. It accepts mathematical expressions and returns evaluated results. The **crucial architectural 
    difference** from internal and MCP tools is that the agent doesn't invoke this handler directly through 
    function calls or API requests. Instead, the agent emits an event containing the tool request. This event 
    routes through your event delivery mechanism to the calculator service. The agent immediately suspends 
    execution after emission, persisting its state to the memory backend and releasing all resources.

    When the calculator processes the event and emits its response, that response event routes back to the 
    agent. The agent's execution manager detects the incoming event, fetches the persisted state from 
    memory, and resumes the conversation exactly where it stopped. From the LLM's perspective, there was no 
    interruption. The conversation history contains the tool request and now includes the tool result. The 
    agent continues reasoning with this new information available.

    This suspend-resume pattern is fundamental to event-driven coordination. It is discussed in great detail in
    [${ArvoMentalModelLearn.name.toLowerCase()}](${ArvoMentalModelLearn.link}), 
    [${ArvoOrchestratorLearn.name.toLowerCase()}](${ArvoOrchestratorLearn.link}), and
    [${ArvoResumableLearn.name.toLowerCase()}](${ArvoResumableLearn.link}) documentations.
    This enables processes and workflows lasting hours or days without holding connections open or tying up processing threads. 
    The same architectural pattern that coordinates with the calculator service also enables coordination with 
    workflows, other agents, humans awaiting approval, and external systems processing asynchronously. They're 
    all modeled as event handlers that emit and consume events through the same uniform protocol.

    > **Note**: You might feel that the calculator service could easily be an internal agent tool, and that assessment 
    > is correct. Arvo doesn't dictate system design at this level, leaving the decision in your hands where flexibility 
    > matters more than prescription. A practical guideline is to make a capability an event-driven service when multiple 
    > agents need it, when non-agent workflows also use it, or when execution requires significant time or compute resources. 
    > You don't need to decide this upfront. The low integration cost allows you to evolve your design as requirements and 
    > understanding develop, converting internal tools to services or vice versa without major refactoring.

    ### The Agent Configuration

    The \`handlers/simple.agent.ts\` shows service declaration in the agent's contracts configuration. 
    Adding the calculator contract to the services object makes its interface known to the agent. The Actions 
    Registry automatically transforms this into a tool definition that appears in the LLM's context alongside 
    internal tools and MCP resources. The tools parameter in the context builder provides type-safe access to 
    service tool names, enabling you to reference them correctly in system prompts. When the LLM requests the 
    calculator tool, the Actions Engine recognizes it as an event-driven service, constructs a properly formatted 
    event matching the calculator's contract, emits it, and triggers the suspend sequence.

    ## Local Development with Simple Event Broker

    The \`main.ts\` demonstrates practical event-driven execution using \`createSimpleEventBroker\`. This 
    is an in-memory event queue that routes events between registered handlers within a single process. You 
    register the agent and calculator as participants, then call \`resolve\` with an event. The broker delivers 
    the event to the appropriate handler based on event type, collects emitted events, routes them to their 
    destinations, and continues until no handlers emit new events or an event routes to an external domain. 
    You can explore the in-depth event-broker design for Arvo in the 
    [${EventRoutingAndBrokerInArvoLearn.name.toLowerCase()}](${EventRoutingAndBrokerInArvoLearn.link}) documentation

    This simple broker is perfect for development, testing, and small-scale deployments because it requires zero 
    infrastructure. No message queues, no event buses, no network protocols. Just register your handlers and 
    start processing events. Yet the code you write against the simple broker works identically when you swap 
    in production brokers backed by Kafka, RabbitMQ, or cloud messaging services. The event handler interface 
    remains the same. Only the broker implementation changes.

    The broker's \`onDomainedEvents\` callback captures events marked with domains that indicate external handling 
    requirements. In the example, permission request events have the domain \`'human.interaction'\`, signaling 
    they need routing outside the automated broker. The callback accumulates these events so the main loop can 
    process them separately, maintaining the architectural separation between automated event processing and 
    external coordination.

    ## Testing Event-Driven Agents

    The tests introduce Arvo's testing framework, designed specifically for declarative event-driven testing. 
    This framework works with any testing library through adapters. You define test suites as data structures 
    describing event sequences and expected outcomes rather than writing imperative test code with manual event 
    construction and assertion logic.

    ### Agent Unit Test

    The \`test/simple.agent__unit_test.ts\` demonstrates agent unit testing. The test configuration 
    specifies the agent as the handler under test. Each test case defines steps as input-output pairs. The first 
    step provides an initialization event and asserts that the agent emits a calculator service event. The second 
    step manually crafts a response event acting as a stub for the calculator service, then asserts the agent 
    produces its final output. This tests the agent's reasoning and event emission logic without requiring the 
    actual calculator implementation, providing fast isolated validation of agent behavior.

    ### Agent Integration Test

    The \`test/simple.agent__integration_test.ts\` shows full integration testing. Instead of specifying a 
    single handler, the test configuration provides a function that creates a simple broker with both the agent 
    and calculator registered. Now when the agent emits a calculator event, the broker actually routes it to the 
    real calculator handler. The calculator processes it and emits a response. The broker routes that back to the 
    agent. The test validates the complete end-to-end coordination without any mocking or stubbing. This runs 
    entirely locally without infrastructure, yet it exercises the full event-driven flow that will occur in 
    production.

    Both testing approaches run locally. The declarative test structure makes it easy 
    to add test cases covering different prompts, tool combinations, permission scenarios, and error conditions. 
    This provides a solid foundation for validating agent behavior before deployment, ensuring your prompts 
    produce the expected tool calls and your agents handle service responses correctly.

    ## The Architectural Peers

    Notice that agents, services, permission managers, and eventually humans all participate using identical event 
    patterns. An agent requesting calculation emits an event. A permission manager emits authorization requests. 
    The calculator emits computation results. Humans emit approval responses. The event fabric treats these 
    participants uniformly. They're architectural peers communicating through standard event protocols. There's 
    no privileged orchestrator controlling the flow. Each participant reacts to incoming events according to its 
    internal logic and emits events for others to consume. This peer-based architecture is what enables the 
    sophisticated coordination patterns we'll explore in subsequent sections.
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
import type { IPermissionManager } from '@arvo-tools/agentic';
import { calculatorContract } from './calculator.service.ts';

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
  description: 'A simple AI agent which answers qu1estions',
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
  }
> = ({ memory, permissionManager }) =>
  createArvoAgent({
    contracts: {
      self: simpleAgentContract,
      services: {
        // Register the calculator as an event-driven service.
        // When the LLM requests this tool, the agent emits an event
        // matching the calculator's contract, then suspends execution.
        // The calculator event handler processes the event and emits
        // a response. The agent resumes when the response arrives.
        calculatorContract: {
          contract: calculatorContract.version('1.0.0'),
        },
      },
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
    onStream: ({ type, data }) => {
      if (type === 'agent.tool.request') {
        console.log('==== [Agent Stream] Tool call requested by Agent ====');
        console.log(JSON.stringify({ type, data }, null, 2));
      }
      if (type === 'agent.tool.permission.requested') {
        console.log('==== [Agent Stream] Tool permission requested by Agent ====');
        console.log(JSON.stringify({ type, data }, null, 2));
      }
    },
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    ),
    permissionManager,
    handler: {
      '1.0.0': {
        // The tools parameter provides type-safe access to service names
        // just like internal tools and MCP resources.
        explicitPermissionRequired: (tools) => [
          tools.mcp.search_astro_docs.name,
        ],
        context: AgentDefaults.CONTEXT_BUILDER(({ tools }) =>
          cleanString(\`
            You are a helpful agent. For queries about the current date, 
            use \${tools.tools.currentDateTool.name}.
            For information about Astro, use \${tools.mcp.search_astro_docs.name}.
            For any mathematical operation, use \${tools.services.calculatorContract.name}
          \`)
        ),
        output: AgentDefaults.OUTPUT_BUILDER,
      },
    },
  });

      `,
    },
    {
      title: 'handlers/calculator.service.ts',
      lang: 'ts',
      code: `
import { cleanString, createArvoContract } from 'arvo-core';
import {
  createArvoEventHandler,
  type EventHandlerFactory,
} from 'arvo-event-handler';
import { z } from 'zod';

export const calculatorContract = createArvoContract({
  uri: '#/org/amas/calculator/execute',
  type: 'com.calculator.execute',
  description: cleanString(\`
    Evaluates mathematical expressions in a secure sandboxed environment. 
    Supports arithmetic operations, common mathematical functions (trigonometric, logarithmic, 
    exponential, rounding), and constants (PI, E). Does not support: symbolic algebra, equation 
    solving, calculus operations, matrix operations, statistical analysis, or custom function definitions.  

    # Critical Tool Limitation

    The calculator tool evaluates ONLY numeric expressions - it cannot solve equations or work with variables.

    **Valid inputs:** "2 + 2", "sqrt(16) * 5", "(3 * 10) / 2", "45 * 8 + 62 * 3"
    **Invalid inputs:** "3 * w = 30", "solve 2x + 4 = 6", "x = sqrt(1500)"

    When solving problems with variables:
    - Solve for the variable value algebraically in your reasoning
    - Once you know the numeric value, use the calculator with pure numbers
    - Example: To solve "3w = 30", determine w = 10 mentally, then calculate with "10" not "w" but rather "30/3"
  \`),
  versions: {
    '1.0.0': {
      accepts: z.object({
        expression: z
          .string()
          .describe(
            'Mathematical expression to evaluate. Supports arithmetic operators (+, -, *, /, %, **), ' +
              'Math functions (sqrt, pow, sin, cos, tan, asin, acos, atan, log, exp, abs, round, min, max, floor, ceil), ' +
              'and constants (PI, E). Examples: "2 + 2", "sqrt(16) * 5", "PI * pow(2, 3)", "sin(PI/2)", "(45 * 8) + (62 * 3)"',
          ),
      }),
      emits: {
        'evt.calculator.execute.success': z.object({
          result: z.number().describe(
            'Numeric result of the evaluated expression',
          ),
          expression: z.string().describe(
            'Original expression that was evaluated',
          ),
        }),
      },
    },
  },
});

export const calculatorHandler: EventHandlerFactory = () =>
  createArvoEventHandler({
    contract: calculatorContract,
    executionunits: 0,
    handler: {
      '1.0.0': async ({ event }) => {
        const { expression } = event.data;

        if (!expression || expression.trim().length === 0) {
          throw new Error('Expression cannot be empty');
        }

        try {
          const result = evaluateMathExpression(expression);

          if (typeof result !== 'number' || !Number.isFinite(result)) {
            throw new Error('Expression must evaluate to a finite number');
          }

          return {
            type: 'evt.calculator.execute.success',
            data: {
              result,
              expression,
            },
            executionunits: expression.length * 1e-6,
          };
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : 'Unknown error';
          throw new Error(\`Failed to evaluate expression: \${message}\`);
        }
      },
    },
  });

function evaluateMathExpression(expr: string): number {
  const whitelist = /^[0-9+\-*/().%\s,]+$/;

  const safeExpr = expr
    .replace(/\bPI\b/g, 'PI')
    .replace(/\bE\b/g, 'E')
    .replace(/\bsqrt\b/g, 'sqrt')
    .replace(/\bpow\b/g, 'pow')
    .replace(/\babs\b/g, 'abs')
    .replace(/\bsin\b/g, 'sin')
    .replace(/\bcos\b/g, 'cos')
    .replace(/\btan\b/g, 'tan')
    .replace(/\basin\b/g, 'asin')
    .replace(/\bacos\b/g, 'acos')
    .replace(/\batan\b/g, 'atan')
    .replace(/\blog\b/g, 'log')
    .replace(/\bexp\b/g, 'exp')
    .replace(/\bfloor\b/g, 'floor')
    .replace(/\bceil\b/g, 'ceil')
    .replace(/\bround\b/g, 'round')
    .replace(/\bmin\b/g, 'min')
    .replace(/\bmax\b/g, 'max');

  const testExpr = safeExpr.replace(
    /\b(sqrt|pow|abs|sin|cos|tan|asin|acos|atan|log|exp|floor|ceil|round|min|max|PI|E)\b/g,
    '',
  );

  if (!whitelist.test(testExpr)) {
    throw new Error('Expression contains invalid characters or functions');
  }

  const evalFunc = new Function(
    'sqrt',
    'pow',
    'abs',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'log',
    'exp',
    'floor',
    'ceil',
    'round',
    'min',
    'max',
    'PI',
    'E',
    \`"use strict"; return (\${safeExpr});\`,
  );

  return evalFunc(
    Math.sqrt,
    Math.pow,
    Math.abs,
    Math.sin,
    Math.cos,
    Math.tan,
    Math.asin,
    Math.acos,
    Math.atan,
    Math.log,
    Math.exp,
    Math.floor,
    Math.ceil,
    Math.round,
    Math.min,
    Math.max,
    Math.PI,
    Math.E,
  );
}

      `,
    },
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { simpleAgent, simpleAgentContract } from './handlers/simple.agent.ts';
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import {
  createSimpleEventBroker,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { cleanString } from 'arvo-core';
import { SimplePermissionManager } from '@arvo-tools/agentic';
import confirm from '@inquirer/confirm';
import {
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { calculatorHandler } from './handlers/calculator.service.ts';
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

// Coordinates multiple event handlers using the simple in-memory broker.
// Registered handlers (agent, calculator) process events in sequence.
// The broker routes events between handlers until completion or external
// coordination is required (captured via onDomainedEvents).
export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  const domainedEvents: ArvoEvent[] = [];
  const response = await createSimpleEventBroker([
    simpleAgent({ memory, permissionManager }),
    calculatorHandler(),
  ], {
    // Captures events marked with domains, indicating they require
    // external handling outside the automated broker (e.g., human approval).
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
        simpleAgentContract.version('1.0.0'),
      )
        .accepts({
          source: TEST_EVENT_SOURCE,
          data: {
            parentSubject$$: null,
            message: cleanString(\`
                Can you answer my following queries as accurately as possible:

                - What is the day today?
                - Can you tell what is Astro? (Just tell me in 2 sentences at high level)
                - Can you give me the average of 2,3,4,6

                Also in your response exactly tell me what tool did you use.
              \`),
          },
        });

      let events: ArvoEvent[] = [];
      while (true) {
        const response = await executeHandlers(eventToProcess);
        // If the broker returns no events, existing events contain unresolved
        // domained events requiring external processing before continuing.
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

main()

/*
  Console log 

  ==== [Agent Stream] Tool call requested by Agent ====
  {
    "type": "agent.tool.request",
    "data": {
      "tool": {
        "name": "internal_current_date_tool",
        "kind": "internal",
        "originalName": "currentDateTool"
      },
      "usage": {
        "prompt": 542,
        "completion": 81
      },
      "executionunits": 623
    }
  }
  ==== [Agent Stream] Tool call requested by Agent ====
  {
    "type": "agent.tool.request",
    "data": {
      "tool": {
        "name": "mcp_search_astro_docs",
        "kind": "mcp",
        "originalName": "search_astro_docs"
      },
      "usage": {
        "prompt": 542,
        "completion": 81
      },
      "executionunits": 623
    }
  }
  ==== [Agent Stream] Tool call requested by Agent ====
  {
    "type": "agent.tool.request",
    "data": {
      "tool": {
        "name": "service_com_calculator_execute",
        "kind": "arvo",
        "originalName": "com.calculator.execute"
      },
      "usage": {
        "prompt": 542,
        "completion": 81
      },
      "executionunits": 623
    }
  }
  ==== [Agent Stream] Tool permission requested by Agent ====
  {
    "type": "agent.tool.permission.requested",
    "data": {
      "tools": [
        {
          "name": "mcp_search_astro_docs",
          "kind": "mcp",
          "originalName": "search_astro_docs"
        }
      ],
      "usage": {
        "prompt": 542,
        "completion": 81
      },
      "executionunits": 623
    }
  }
  ==== Agent Requesting Tool Use Permission ====
  ✔ Agent arvo.orc.agent.simple is requesting permission to execute following tools No
  ==== Agent final output ====
  {
    "id": "bf4eae44-4bc1-4f2c-906d-424388a30caf",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "arvo.orc.agent.simple.done",
    "subject": "eJw9jtEKgzAMRf8lz7Z0rq7q30QbtoBtR40iiP++sMFe7kNOOPeeUOr8olUqSqkwnpAxEYyAdS9WmcUnZbErp/dC0MBOdeWS9eNmnXVwNUAHzZt8jydwVDS1ffD3bjauH4LxbSAzOBfNFEPs2kec0Ht1cWbhXy+IbrD/UBhLQlZl3pZFSxIJqv+6Pke5OZQ=",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/agent/simple/1.0.0",
    "data": {
      "response": "Here are the answers to your queries:\n\n- **What is the day today?** Today is Monday, December 15, 2025. *(Tool used: \`internal_current_date_tool\`)*\n- **Can you tell what is Astro?** Unfortunately, I couldn't access the Astro documentation to provide a detailed answer. However, Astro is generally known as a modern web framework for building fast, content-focused websites. *(Tool attempted: \`mcp_search_astro_docs\`, but access was denied)*\n- **Can you give me the average of 2, 3, 4, 6?** The average is 3.75. *(Tool used: \`service_com_calculator_execute\`)*\n"
    },
    "time": "2025-12-15T11:54:00.575+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 1591,
    "traceparent": "00-4d5c9bc5aa647b88bf616d8972e4902a-4c0c5fcbb86a24db-01",
    "tracestate": null,
    "parentid": "27fcb601-40f3-43f9-8a73-f00229f4346f",
    "domain": null
  }
*/



`,
    },
    {
      title: 'test/simple.agent__unit_test.ts',
      lang: 'ts',
      code: `
import {
  ArvoTestSuite,
  runArvoTestSuites,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { simpleAgent, simpleAgentContract } from '../handlers/simple.agent.ts';
import { createArvoEventFactory } from 'arvo-core';
import { beforeEach, describe, expect, test } from 'vitest';
import { calculatorContract } from '../handlers/calculator.service.ts';

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

const simpleAgentUnitTest: ArvoTestSuite = {
  config: {
    // Unit test validates agent behavior in isolation by stubbing service responses.
    // No permission manager needed since we're not testing permission flows.
    handler: simpleAgent({ memory }),
  },
  cases: [
    {
      name:
        'should process calculation request correctly by emitting calculator events and processing the response',
      steps: [
        // Step 1: Init the agent and expect it to emit a calculator event defined by the contracts accept schema
        {
          input: () =>
            createArvoEventFactory(simpleAgentContract.version('1.0.0'))
              .accepts({
                source: TEST_EVENT_SOURCE,
                data: {
                  parentSubject$$: null,
                  message: 'Can you give me the average of 1,2,3?',
                },
              }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            const event = events[0]!;
            expect(event.type).toBe(
              calculatorContract.version('1.0.0').accepts.type,
            );
            expect(event.data.expression).toBeDefined();
            return true;
          },
        },
        {
          // Step 2: Manually craft calculator response (acting as stub).
          // Proper context stitching maintains event chain continuity.
          input: (prev) =>
            createArvoEventFactory(calculatorContract.version('1.0.0')).emits({
              // Stitching the context previous event
              subject: prev?.[0]?.data?.parentSubject$$ ?? prev?.[0]?.subject ??
                undefined,
              parentid: prev?.[0]?.id ?? undefined,
              to: prev?.[0]?.source ?? undefined,
              accesscontrol: prev?.[0]?.accesscontrol ?? undefined,
              // Defining the next event data
              type: 'evt.calculator.execute.success',
              source: TEST_EVENT_SOURCE,
              data: {
                result: 2,
                expression: '(1+2+3)/3',
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            const event = events[0]!;
            // The orchestrator contract API provides the metadata.completeEventType
            expect(event.type).toBe(
              simpleAgentContract.version('1.0.0').metadata.completeEventType,
            );
            expect(event.data.response).toContain('2');
            return true;
          },
        },
      ],
    },
  ],
};

// Here you can add any testing framework functions
runArvoTestSuites([
  simpleAgentUnitTest,
], {
  test: test,
  describe: describe,
  beforeEach: beforeEach,
});
      `,
    },
    {
      title: 'test/simple.agent__integration_test.ts',
      lang: 'ts',
      code: `
import {
  ArvoTestSuite,
  createSimpleEventBroker,
  runArvoTestSuites,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { simpleAgent, simpleAgentContract } from '../handlers/simple.agent.ts';
import { createArvoEventFactory } from 'arvo-core';
import { calculatorHandler } from '../handlers/calculator.service.ts';
await load({ export: true });

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

const simpleAgentIntegrationTest: ArvoTestSuite = {
  config: {
    // Integration test validates full event-driven coordination.
    // Both agent and calculator execute in a shared broker,
    // exercising the complete emit-suspend-resume-respond cycle.
    // Uses SimpleMachineMemory for state persistence during suspends.
    // No infrastructure required - runs entirely in-memory locally.
    fn: async (event) => {
      const response = await createSimpleEventBroker([
        // Here you just basically register your actual handler implementations
        simpleAgent({ memory }),
        calculatorHandler(),
      ]).resolve(event);

      return { events: response ? [response] : [] };
    },
  },
  cases: [
    {
      name: 'should process calculation request respond with the final event',
      steps: [
        // Step 1: Init the agent and expect it to emit the final event of the agent result
        {
          input: () =>
            createArvoEventFactory(simpleAgentContract.version('1.0.0'))
              .accepts({
                source: TEST_EVENT_SOURCE,
                data: {
                  parentSubject$$: null,
                  message: 'Can you give me the average of 1,2,3?',
                },
              }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            const event = events[0]!;
            expect(event.type).toBe(
              simpleAgentContract.version('1.0.0').metadata.completeEventType,
            );
            expect(event.data.response).toContain('2');
            return true;
          },
        },
      ],
    },
  ],
};

// Here you can add any testing framework functions
runArvoTestSuites([
  simpleAgentUnitTest,
], {
  test: test,
  describe: describe,
  beforeEach: beforeEach,
});

      
      `,
    },
  ],
};
