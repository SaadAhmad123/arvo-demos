import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const AddingPermissionManager: DemoCodePanel = {
  heading: 'Adding Permission Management To Your Agent',
  description: cleanString(`
    In production systems, agents frequently interact with tools that carry significant consequences. Some 
    operations are expensive to execute, others make irreversible changes to state, and certain actions 
    require explicit authorization from users or governance systems before proceeding. A common but naive 
    approach relies on prompting the LLM to request permission before calling sensitive tools. This 
    technique is fundamentally fragile because it depends on the LLM's compliance with instructions, making 
    it vulnerable to adversarial prompt engineering, model updates, or simple reasoning failures that could 
    bypass authorization checks.

    Arvo takes a different position. LLMs should focus on reasoning about ambiguous situations and making 
    intelligent decisions. Deterministic process enforcement like authorization checks, compliance validation, 
    and operational guardrails belongs in the operational harness, not in prompts. When you provide an 
    \`IPermissionManager\` implementation to your agent, the Actions Engine enforces authorization 
    deterministically. Tools marked as requiring permission always pass through this gate, regardless of 
    what the LLM decides or how cleverly someone tries to manipulate it through prompts.

    ### Declaring Permission Requirements

    Permission policies are version-specific. Each agent version independently declares which tools require 
    explicit authorization through the \`explicityPermissionRequired\` function in its handler configuration. 
    Versions don't inherit permission policies from each other, enabling you to evolve authorization 
    requirements as your agent matures without affecting existing deployments.

    The function receives all registered tools as parameters, providing type-safe access to their names 
    as the Actions Registry transforms them. Using the provided tools parameter ensures your permission 
    policy references the correct names that the system actually uses during execution.

    Note that permission request events count toward the \`maxToolInteractions\` quota. When the agent emits 
    a permission request and receives authorization, that cycle consumes one interaction from the available 
    budget. This prevents permission workflows from bypassing interaction limits. If your agent requires 
    multiple permission approvals or operates in scenarios with frequent authorization checks, adjust 
    \`maxToolInteractions\` accordingly to accommodate both tool execution and permission request cycles.

    ### The \`SimplePermissionManager\`

    The \`main.ts\` file shows a complete working example of this pattern in action. Arvo includes 
    \`SimplePermissionManager\` as a reference implementation. It manages permissions in memory, 
    caching authorization decisions per workflow. Each new workflow starts without permissions, requiring 
    explicit approval before restricted tools execute. Once granted, permissions persist for that workflow's 
    lifetime, eliminating redundant approval prompts for repeated operations. When a restricted tool is 
    requested without permission, the manager blocks execution and the agent emits a permission request event.

    This event-driven authorization pattern creates complete architectural decoupling. The agent doesn't know 
    whether permission comes from a human, an IAM system, a policy engine, or an automated governance service. 
    It emits a request, suspends execution while maintaining state, and resumes when authorization arrives.

    ### Routing Permission Requests with Domains

    When instantiating \`SimplePermissionManager\`, you specify event domains. Domains route events outside 
    the standard processing plane to external handlers. Permission request events marked with domains escape 
    the default event fabric, signaling they require external coordination. In this example, the domain 
    \`'human.interaction'\` indicates these events need human attention rather than automated processing.

    As you build more sophisticated systems, this configuration enables powerful patterns. The same permission 
    request that triggers a command-line prompt in development can route to Slack in staging and an enterprise 
    approval workflow in production, all without changing agent code.

    ### Human Approval Implementation

    The example in \`main.ts\` demonstrates a minimal human-in-the-loop pattern using a command-line prompt. 
    The \`handlePermissionRequest\` function receives the permission request event, presents it to a human 
    via \`@inquirer/confirm\`, and constructs an authorization response event. In production deployments, 
    replace this with appropriate approval mechanisms like web UIs, Slack integrations, email workflows, or 
    policy engines.

    The execution loop in \`main.ts\` shows the pattern. Execute the agent, check if it emitted a permission 
    request, handle the request externally, feed the response back, and let the agent resume. This cycle 
    repeats until the agent completes without requiring additional permissions. The agent's internal state 
    persists across these suspend-resume cycles, maintaining conversation context and reasoning continuity.

    ### Distributed Observability

    The example demonstrates trace continuity across system boundaries. Events carry their trace context 
    in the \`traceparent\` field following W3C standards. When an external system handles a permission request, 
    it can extract this context and create child spans that maintain parent-child relationships in the 
    distributed trace. The \`createOtelContextFromEvent\` helper parses \`traceparent\` and establishes the 
    proper span context, enabling the approval workflow to appear as a natural continuation of the agent's 
    execution in your observability platform.
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
  MCPClient,
  OpenAI,
  openaiLLMIntegration,
  type IPermissionManager,
} from '@arvo-tools/agentic';
import z from 'zod';

const currentDateTool = createAgentTool({
  name: 'current_date_tool',
  description: 'Provides the current date and time as an ISO string',
  input: z.object({}),
  output: z.object({
    datetime: z.string(),
  }),
  fn: () => ({
    datetime: new Date().toISOString(),
  }),
});

export const simpleAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/simple',
  name: 'agent.simple',
  description: 'A simple AI agent with permission-controlled tool access',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

// Enable dependency injection for the permission manager
// Multiple agents can share the same permission manager instance across executions
export const simpleAgent: EventHandlerFactory<{
  memory: IMachineMemory<Record<string, unknown>>;
  permissionManager?: IPermissionManager;
}> = ({ memory, permissionManager }) =>
  createArvoAgent({
    contracts: {
      self: simpleAgentContract,
      services: {},
    },
    tools: {
      currentDateTool,
    },
    memory,
    // The permission event emission is also consider a tool interaction
    // by the ArvoAgent
    maxToolInteractions: 10,
    mcp: new MCPClient(() => ({
      url: 'https://mcp.docs.astro.build/mcp',
      requestInit: {
        headers: {},
      },
    })),
    onStream: ({ type, data }) => {
      if (type === 'agent.tool.request') {
        console.log('==== [Agent Stream] Tool call requested by Agent ====');
        console.log(JSON.stringify({ type, data }, null, 2));
      }
      if (type === 'agent.tool.permission.blocked') {
        console.log('==== [Agent Stream] Tool call blocked by permission manager ====');
        console.log(JSON.stringify({ type, data }, null, 2));
      }
      if (type === 'agent.tool.permission.requested') {
        console.log('==== [Agent Stream] Tool permission requested by the agent ====');
        console.log(JSON.stringify({ type, data }, null, 2));
      }
    },
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    ),
    permissionManager,
    handler: {
      '1.0.0': {
        // Each version defines its own permission requirements independently
        // Versions don't inherit permission policies from each other
        // The function receives all registered tools for safe name resolution
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
      title: 'main.ts',
      lang: 'ts',
      code: `
import { simpleAgent, simpleAgentContract } from './handlers/simple.agent.ts';
import { ArvoEvent, createArvoEventFactory, cleanString } from 'arvo-core';
import { SimpleMachineMemory } from 'arvo-event-handler';
import { SimplePermissionManager } from '@arvo-tools/agentic';
import confirm from '@inquirer/confirm';
import { context, SpanContext, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('main-agent-tracer');

const TEST_EVENT_SOURCE = 'test.application';

// Extract OpenTelemetry context from event for trace continuity
// Enables external systems to maintain parent-child span relationships
function createOtelContextFromEvent(event: ArvoEvent) {
  const traceParent = event.traceparent;
  let parentContext = context.active();
  if (traceParent) {
    // Parse traceparent format: version-trace-id-parent-id-trace-flags
    // Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
    const parts = traceParent.split('-');
    if (parts.length === 4) {
      const [_, traceId, spanId, traceFlags] = parts;
      const spanContext: SpanContext = {
        traceId,
        spanId,
        traceFlags: parseInt(traceFlags),
      };
      parentContext = trace.setSpanContext(context.active(), spanContext);
    }
  }
  return parentContext;
}



// Simulates external approval system (human, IAM, policy engine, etc.)
// In production, replace with proper UI, Slack bot, email workflow, etc.
async function handlePermissionRequest(event: ArvoEvent): Promise<ArvoEvent> {
  return await tracer.startActiveSpan(
    'Permission.HumanApproval',
    { kind: SpanKind.INTERNAL },
    createOtelContextFromEvent(event), // Maintain trace continuity
    async (span): Promise<ArvoEvent> => {
      try {
        span.setStatus({ code: SpanStatusCode.OK });
        
        console.log('==== Permission Request Event ====');
        console.log(event.toString(2));

        console.log('==== Requesting Human Approval ====');
        const approval = await confirm({
          message: event.data?.reason ?? 
            'Agent needs tool access. Do you approve?',
        });

        // Create response event with proper context stitching
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

async function main() {
  await tracer.startActiveSpan('main', async (span) => {
    const memory = new SimpleMachineMemory();
    
    // Initialize permission manager
    // Domains route permission requests outside default event processing
    // 'human.interaction' signals these events need external handling
    const permissionManager = new SimplePermissionManager({
      domains: ['human.interaction'],
    });

    let eventToProcess: ArvoEvent = createArvoEventFactory(
      simpleAgentContract.version('1.0.0'),
    ).accepts({
      source: TEST_EVENT_SOURCE,
      data: {
        parentSubject$$: null,
        message: cleanString(\`
          Answer these queries:
          1. What day is today?
          2. What is Astro? (2 sentences, high level)
          
          Include which tools you used.
        \`),
      },
    });

    let events: ArvoEvent[] = [];
    
    // Execute agent, handling permission requests in a loop
    while (true) {
      const response = await simpleAgent({ memory, permissionManager })
        .execute(eventToProcess);
      events = response.events;
      // Check if agent emitted a permission request
      const toolRequestEvent = events.find(
        (item) =>
          item.type === SimplePermissionManager.VERSIONED_CONTRACT.accepts.type,
      );
      if (toolRequestEvent) {
        // Handle permission request and loop back
        eventToProcess = await handlePermissionRequest(toolRequestEvent);
      } else {
        // No permission request - agent completed
        break;
      }
    }

    console.log('==== Agent Final Output ====');
    for (const evt of events) {
      console.log(evt.toString(2));
    }
    span.end()
  });
}

main();



/*
  Console logs

  >>>> When the permission is granted

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
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
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
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
    }
  }
  ==== [Agent Stream] Tool call blocked by permission manager ====
  {
    "type": "agent.tool.permission.blocked",
    "data": {
      "tools": [
        {
          "name": "mcp_search_astro_docs",
          "kind": "mcp",
          "originalName": "search_astro_docs"
        }
      ],
      "usage": {
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
    }
  }
  ==== [Agent Stream] Tool permission requested by the agent ====
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
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
    }
  }
  ==== Permission Request Event ====
  {
    "id": "c91714f8-7b70-45b4-8dac-e721ecb8f82d",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "com.arvo.default.simple.permission.request",
    "subject": "eJw9jksOgzAMRO/iNUSUb+E2TjCtpXyqYFAllLvXaqVuZuE3euMLUnZP2iWjpAzLBREDwQKYz2SUGXxQFLNzeHmCCk7KO6eojZtpTAOlAnqTO+R7vIBXRbNdkab7UPf9QBqOajtQW4/NOM2u29rNduriyMK/XRD9wfxD4ZoCsirj4b2OBBJUfykffOc6LA==",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/arvo/tools/default/agentic/permission/simple/1.0.0",
    "data": {
      "agentId": "arvo.orc.agent.simple",
      "requestedTools": [
        "mcp_search_astro_docs"
      ],
      "reason": "Agent arvo.orc.agent.simple is requesting permission to execute following tools"
    },
    "time": "2025-12-14T21:38:02.636+00:00",
    "to": "com.arvo.default.simple.permission.request",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 207,
    "traceparent": "00-457c014a715ab191e66bc559d58e4b02-4400db3dbfd1bd1b-01",
    "tracestate": null,
    "parentid": "a5d22c8b-851a-4655-b867-7fe04677601c",
    "domain": "human.interaction"
  }
  ==== Agent Requesting Tool Use Permission ====
  ✔ Agent arvo.orc.agent.simple is requesting permission to execute following tools Yes
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
        "prompt": 529,
        "completion": 71
      },
      "executionunits": 600
    }
  }
  ==== Agent final output ====
  {
    "id": "48177134-01bf-42b7-91bc-caa4fbdf3af7",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "arvo.orc.agent.simple.done",
    "subject": "eJw9jksOgzAMRO/iNUSUb+E2TjCtpXyqYFAllLvXaqVuZuE3euMLUnZP2iWjpAzLBREDwQKYz2SUGXxQFLNzeHmCCk7KO6eojZtpTAOlAnqTO+R7vIBXRbNdkab7UPf9QBqOajtQW4/NOM2u29rNduriyMK/XRD9wfxD4ZoCsirj4b2OBBJUfykffOc6LA==",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/agent/simple/1.0.0",
    "data": {
      "response": "- Today is Sunday, December 14, 2025. (Tool used: \`internal_current_date_tool\`)\n- Astro is a modern web framework for building fast, content-focused websites. It allows developers to use their favorite tools and frameworks while optimizing for performance by delivering only the necessary JavaScript to the browser. (Tool used: \`mcp_search_astro_docs\`)"
    },
    "time": "2025-12-14T21:38:10.311+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 3593,
    "traceparent": "00-457c014a715ab191e66bc559d58e4b02-b3181ffd6b28d8cb-01",
    "tracestate": null,
    "parentid": "a5d22c8b-851a-4655-b867-7fe04677601c",
    "domain": null
  }


  >>>> When the permission is not granted

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
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
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
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
    }
  }
  ==== [Agent Stream] Tool call blocked by permission manager ====
  {
    "type": "agent.tool.permission.blocked",
    "data": {
      "tools": [
        {
          "name": "mcp_search_astro_docs",
          "kind": "mcp",
          "originalName": "search_astro_docs"
        }
      ],
      "usage": {
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
    }
  }
  ==== [Agent Stream] Tool permission requested by the agent ====
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
        "prompt": 157,
        "completion": 50
      },
      "executionunits": 207
    }
  }
  ==== Permission Request Event ====
  {
    "id": "59883ca1-8689-427a-bac8-60c266cc09ca",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "com.arvo.default.simple.permission.request",
    "subject": "eJw9jkEKg0AMRe+StTNotVq9TYyxDTgzZYwiiHdvaKGbv8gL7/8TUqYXr5pRU4bhhIiBYQDMe/LGPD45ql8lvBeGAnbOq6RoH5UvfQlXAXwwbfo9niCToY5obG9V73h+1K6ZqXV9R7W7V0hz3ZTdyKO5JIrKrxfUNvh/GJxSQDFl3JbFSgIrmv+6PoU0OlU=",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/arvo/tools/default/agentic/permission/simple/1.0.0",
    "data": {
      "agentId": "arvo.orc.agent.simple",
      "requestedTools": [
        "mcp_search_astro_docs"
      ],
      "reason": "Agent arvo.orc.agent.simple is requesting permission to execute following tools"
    },
    "time": "2025-12-14T21:40:40.952+00:00",
    "to": "com.arvo.default.simple.permission.request",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 207,
    "traceparent": "00-ec5d3025f6a02d8d186530668ab9b324-21cef23508364c3a-01",
    "tracestate": null,
    "parentid": "9ea37a4a-5042-4254-a32e-7cb69954c34e",
    "domain": "human.interaction"
  }
  ==== Agent Requesting Tool Use Permission ====
  ✔ Agent arvo.orc.agent.simple is requesting permission to execute following tools No
  ==== Agent final output ====
  {
    "id": "d86b1443-ed4e-4f77-b24e-131e0d63a270",
    "source": "arvo.orc.agent.simple",
    "specversion": "1.0",
    "type": "arvo.orc.agent.simple.done",
    "subject": "eJw9jkEKg0AMRe+StTNotVq9TYyxDTgzZYwiiHdvaKGbv8gL7/8TUqYXr5pRU4bhhIiBYQDMe/LGPD45ql8lvBeGAnbOq6RoH5UvfQlXAXwwbfo9niCToY5obG9V73h+1K6ZqXV9R7W7V0hz3ZTdyKO5JIrKrxfUNvh/GJxSQDFl3JbFSgIrmv+6PoU0OlU=",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/agent/simple/1.0.0",
    "data": {
      "response": "Here are the answers to your queries:\n\n- **What is the day today?**  \n  Today is Sunday, December 14, 2025.  \n  *(Tool used: \`internal_current_date_tool\`)*\n\n- **Can you tell what is Astro?**  \n  Unfortunately, I am unable to access the Astro documentation at the moment due to permission restrictions. However, I can tell you that Astro is a modern web framework designed for building fast, content-focused websites. It emphasizes performance by delivering less JavaScript to the browser and supports a component-based architecture.\n\nIf you have any more questions or need further assistance, feel free to ask!"
    },
    "time": "2025-12-14T21:40:44.629+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.agent.simple",
    "executionunits": 711,
    "traceparent": "00-ec5d3025f6a02d8d186530668ab9b324-0417f91b35554234-01",
    "tracestate": null,
    "parentid": "9ea37a4a-5042-4254-a32e-7cb69954c34e",
    "domain": null
  }

*/
      `,
    },
  ],
};
