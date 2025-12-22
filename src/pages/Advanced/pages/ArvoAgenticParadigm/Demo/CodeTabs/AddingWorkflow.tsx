import {
  ArvoMachineLearn,
  ArvoMentalModelLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
} from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const AddingWorkflow: DemoCodePanel = {
  heading: 'Building Agentic Workflows',
  description: cleanString(`
    Multi-agent systems demonstrate substantial power for intelligent task execution, yet they represent 
    only one modality within Arvo's capabilities. Many production scenarios demand workflow-based systems 
    where predetermined steps and rules govern agentic behavior. Arvo enables you to express workflow 
    logic through state charts or imperative code, packaging these as event handlers that participate 
    alongside agents in the event fabric. Orchestrators, workflows, services, agents, and human interactions 
    compose seamlessly within Arvo's architecture. You can explore orchestration patterns in depth through 
    the [${ArvoMentalModelLearn.name.toLowerCase()}](${ArvoMentalModelLearn.link}), 
    [${ArvoMachineLearn.name.toLowerCase()}](${ArvoMachineLearn.link}), 
    [${ArvoOrchestratorLearn.name.toLowerCase()}](${ArvoOrchestratorLearn.link}), and 
    [${ArvoResumableLearn.name.toLowerCase()}](${ArvoResumableLearn.link}) documentation.

    The fundamental principle across all orchestration patterns is that Arvo orchestrators are virtual 
    coordinators. They declare logic for coordinating events within the system but never control the 
    execution of other components. An orchestrator activates when triggered by relevant events, applies 
    its internal logic, and emits new events into the system. This maintains architectural equality where 
    no component holds privileged control over others.

    ## The Agentic Workflow Pattern

    Agentic workflows combine the intelligence of autonomous agents with the predictability of structured 
    processes. Unlike pure multi-agent systems where coordination emerges from agent interactions, agentic 
    workflows explicitly define process stages while delegating intelligent decision-making to agents at 
    each stage. This pattern proves valuable when you need governance over process flow but want agents 
    to handle the complexity within each step. The workflow doesn't micromanage agent behavior. It simply 
    defines what stages exist, when to transition between them, and what events trigger those transitions.

    Each stage in an Arvo-based workflow can invoke agents, other workflows, services, request human input, and much more. 
    The workflow coordinates these interactions through event emission, maintaining no direct coupling to 
    the components it orchestrates. This differs fundamentally from traditional orchestration engines where 
    a central controller manages execution of subordinate components. In Arvo, workflows emit events and 
    suspend. Other components process those events independently. When responses arrive, the workflow resumes 
    and continues. Every participant remains an architectural peer communicating through standard event-driven 
    mechanisms.

    ## Understanding This Example

    This example models essay generation as a three-stage process demonstrating agentic workflow patterns. 
    The workflow begins by invoking an outline agent that generates five essay headings from a given topic. 
    Once the outline is complete, the workflow routes it to a human for review through an approval contract. 
    If the human rejects the outline, the workflow terminates with an error explaining the rejection. When 
    the human approves, the workflow invokes a writer agent that composes the full essay following the 
    approved outline. Throughout this process, the workflow coordinates transitions between stages but never 
    controls what happens within them.

    The workflow implementation uses [\`ArvoMachine\`](${ArvoMachineLearn.link}) to define state charts 
    integrated with the XState ecosystem, enabling visualization through IDE extensions. Each stage declares 
    its entry actions as event emissions targeting appropriate handlers. The outline and writer agents are 
    simple implementations here, but they could incorporate permission management, human collaboration, tool 
    invocation, or any other agent capability demonstrated in previous sections. The workflow remains unchanged 
    regardless of agent complexity because it only coordinates through events. 
    
    In \`main.ts\`, the essay outline agent, essay writer agent, and essay builder workflow register 
    with the same broker alongside existing agents, services, and human interaction handlers. They 
    immediately participate in the event fabric without requiring changes to broker configuration or 
    existing components. This demonstrates Arvo's compositional architecture where adding sophisticated 
    workflows involves simply registering new handlers that communicate through standard event-driven 
    mechanics.

    ## Component Independence and Direct Invocation

    The architectural independence of these components means you can invoke any of them directly without 
    engaging the workflow. If you emit an essay outline event instead of the workflow initialization event 
    in main.ts, only the outline agent executes and returns its result. The workflow never activates. This 
    applies universally across Arvo - every handler, whether agent, service, or workflow, responds to its 
    contract events independently. The state chart governs coordination when the workflow is active, but it 
    doesn't create functional dependencies. Each component remains independently addressable through direct 
    event emission, enabling flexible composition where you choose whether to use structured workflows or 
    direct component invocation based on your use case requirements.

    ## Beyond State Charts for Dynamic Workflows

    This example demonstrates state chart based workflow implementation, ideal when your process has clear 
    stages and well-defined transitions. However, if your use case demands dynamic coordination where the 
    process structure emerges during execution, consider using \`ArvoResumable\` instead. It provides imperative 
    workflow construction where you programmatically define coordination logic rather than declaring it 
    upfront in state charts. You can explore this approach in the 
    [${ArvoResumableLearn.name.toLowerCase()}](${ArvoResumableLearn.link}) documentation.
  `),
  tabs: [
    {
      title: 'handlers/essay.builder.workflow/machineV100.ts',
      lang: 'ts',
      code: `
import { ArvoDomain, setupArvoMachine, xstate } from 'arvo-event-handler';
import { essayBuilderWorkflowContract } from './contract.ts';
import { essayOutlineAgentContract } from '../essay-outline.agent.ts';
import { essayWriterAgentContract } from '../essay-writer.agent.ts';
import { humanApprovalContract } from '../human.approval.contract.ts';
import { ArvoErrorType } from 'arvo-core';
import { cleanString } from 'arvo-core';

export const machineV100 = setupArvoMachine({
  contracts: {
    self: essayBuilderWorkflowContract.version('1.0.0'),
    services: {
      essayOutlineAgent: essayOutlineAgentContract.version('1.0.0'),
      essayWriterAgent: essayWriterAgentContract.version('1.0.0'),
      humanApproval: humanApprovalContract.version('1.0.0'),
    },
  },
  types: {
    context: {} as {
      topic: string;
      instruction: string | null;
      outline: string | null;
      essay: string | null;
      errors: ArvoErrorType[];
      comment: string | null;
      // This is used to provide context for the agents/orchestrator called by
      // this orchestration so that they can return their responses with correct
      // context stitching
      currentSubject: string;
      totalExecutionUnits: number;
    },
  },

  actions: {
    accumulateExecutionUnits: xstate.assign({
      totalExecutionUnits: ({ event, context }) =>
        context.totalExecutionUnits + (event.executionunits ?? 0),
    }),
  },
}).createMachine({
  id: 'machineV100',
  // Initialize workflow context with input data and execution tracking.
  // This context persists across suspend-resume cycles, maintaining state
  // when the workflow waits for external events from agents or humans.
  context: ({ input }) => ({
    currentSubject: input.subject,
    topic: input.data.topic,
    instruction: input.data.instructions,
    essay: null,
    outline: null,
    comment: null,
    errors: [],
    totalExecutionUnits: 0,
  }),
  // Construct the final event payload when the workflow reaches a terminal state.
  // The __executionunits field accumulates costs from all agents and operations
  // invoked during the workflow execution.
  output: ({ context }) => ({
    errors: context.errors,
    essay: context.essay,
    success: Boolean(context.errors.length),
    comment: context.comment ??
      (context.errors.length
        ? 'Worflow failed with errors'
        : 'Essay generated successfully'),
    __executionunits: context.totalExecutionUnits,
  }),

  initial: 'generate_outline',
  states: {
    generate_outline: {
      description: 'Use the essay outline agent to generate an essay outline',
      // Emit an event to the essay outline agent when entering this state.
      // The workflow suspends after emission, waiting for the agent's response
      // before transitioning to the next state.
      entry: xstate.emit(({ context }) => ({
        type: 'arvo.orc.agent.essay.outline',
        data: {
          parentSubject$$: context.currentSubject,
          message: cleanString(\`
            Generate an essay outline for the following topic:
            "\${context.topic}"
            Additional Instructions:
            \{context.instruction ?? 'None'}
          \`),
        },
      })),

      // Define state transitions based on incoming response events.
      // Error events route to the error state, while success events
      // store the outline and advance to human approval.
      on: {
        'sys.arvo.orc.agent.essay.outline.error': {
          target: 'error',
          // Append the error to the context for inclusion in the final output.
          actions: xstate.assign({
            errors: ({ event, context }) => [...context.errors, event.data],
          }),
        },
        'arvo.orc.agent.essay.outline.done': {
          target: 'request_approval',
          // Store the generated outline and accumulate token costs.
          // The accumulateExecutionUnits action is defined in the setup block
          // and shared across all states that track LLM usage.
          actions: [
            xstate.assign({
              outline: ({ event }) => event.data.response,
            }),
            'accumulateExecutionUnits',
          ],
        },
      },
    },

    request_approval: {
      description: 'Show the outline to a human and request their approval',
      entry: xstate.emit(({ context }) => ({
        type: 'com.human.approval',
        // Explicit domain declaration
        domain: [ArvoDomain.FROM_EVENT_CONTRACT],
        // Human approval uses a simple request-response pattern, not orchestration.
        // No parentSubject$$ is needed because the approval handler doesn't emit
        // events into the system's event plane during processing. Orchestrators
        // require parentSubject$$ for event correlation because they emit intermediate
        // events that must be distinguished from unrelated system traffic.
        data: {
          prompt: cleanString(\`
            For the topic "\${context.topic}" following is the proposed outline:
            
            \${context.outline}

            Please review this and provide your approval
          \`),
        },
      })),

      on: {
        // Use XState guards to branch based on approval status within a single event type.
        // This demonstrates conditional transitions where the same event triggers
        // different state changes depending on the event's data payload.
        'evt.human.approval.success': [
          {
            description: 'If approval deined',
            guard: ({ event }) => !event.data.approval,
            target: 'error',
            actions: [
              xstate.assign({ comment: 'Human did not approve this outline' }),
              xstate.assign({
                errors: ({ context }) => [...context.errors, {
                  errorName: 'ApprovalRejection',
                  errorMessage: 'Human did not appove the outline',
                  errorStack: null,
                }],
              }),
            ],
          },
          {
            description: 'If approval granted',
            target: 'generate_essay',
          },
        ],
        // The current implementation never produces system errors for human approval
        // because main.ts handles all approval events successfully. Future execution
        // models might introduce error scenarios requiring a 'sys...error' transition path.
      },
    },
    generate_essay: {
      description: 'Use the essay writer agent to write the essay',
      entry: xstate.emit(({ context }) => ({
        type: 'arvo.orc.agent.essay.writer',
        data: {
          parentSubject$$: context.currentSubject,
          message: cleanString(\`
            Can you write an essay for the topic "\${context.topic}" 

            You must follow this outline exactly: 
            \${context.outline}

            Additional instructions: 
            \${context.instruction}
          \`),
        },
      })),

      on: {
        // Route system errors from the essay writer agent to the error state,
        // preserving the error details in context for the final output.
        'sys.arvo.orc.agent.essay.writer.error': 
          target: 'error',
          actions: xstate.assign(
            errors: ({ event, context }) => [...context.errors, event.data],),
        },
        // Store the generated essay and transition to completion,
        // accumulating the agent's token consumption into total execution units.
        arvo.orc.agent.essay.writer.done': 
          target: 'done',
          actions: [
            xstate.assign(essay: ({ event }) => event.data.response ),
            'accumulateExecutionUnits',
          ],,
      },
    },

    // Terminal states trigger output construction and workflow completion.
    // The error state produces output with accumulated errors, while done
    // state produces output with the generated essay.
    error: {
      type: 'final',
    },
    done: {
      type: 'final',
    },
  },
});


      `,
    },
    {
      title: 'handlers/essay.builder.workflow/contract.ts',
      lang: 'ts',
      code: `
import { ArvoErrorSchema, createArvoOrchestratorContract } from 'arvo-core';
import z from 'zod';

export const essayBuilderWorkflowContract = createArvoOrchestratorContract({
  uri: '#/org/amas/workflow/essay/builder',
  name: 'workflow.essay.builder',
  versions: {
    '1.0.0': {
      init: z.object({
        topic: z.string().describe('The topic of the essay to write'),
        instructions: z.string().nullable().describe(
          'Addition instructions to follow while building the essay',
        ),
      }),
      complete: z.object({
        success: z.boolean(),
        essay: z.string().nullable(),
        comment: z.string(),
        errors: ArvoErrorSchema.array(),
      }),
    },
  },
});
      `,
    },
    {
      title: 'handlers/essay.builder.workflow/index.ts',
      lang: 'ts',
      code: `
import {
  createArvoOrchestrator,
  EventHandlerFactory,
  IMachineMemory,
} from 'arvo-event-handler';
import { machineV100 } from './machineV100.ts';

export const essayBuilderWorkflow: EventHandlerFactory<
  { memory: IMachineMemory }
> = ({ memory }) =>
  createArvoOrchestrator({
    memory
    executionunits: 1,
    machines: [
      machineV100,
    ],
  });
      `,
    },
    {
      title: 'handlers/essay-outline.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import type { EventHandlerFactory } from 'arvo-event-handler';
import {
  AgentDefaults,
  AgentStreamListener,
  createArvoAgent,
  OpenAI,
  openaiLLMIntegration,
} from '@arvo-tools/agentic';
import { cleanString } from 'arvo-core';

export const essayOutlineAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/essay-outline',
  name: 'agent.essay.outline',
  description: 'Generates 5 main essay headings for any given topic',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

export const essayOutlineAgent: EventHandlerFactory<
  { onStream?: AgentStreamListener }
> = ({ onStream }) =>
  createArvoAgent({
    contracts: {
      self: essayOutlineAgentContract,
      services: {},
    },
    onStream,
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      {
        invocationParam: {
          model: 'gpt-4o-mini',
          temperature: 1,
          max_completion_tokens: 1024,
        },
      },
    ),
    handler: {
      '1.0.0': {
        context: AgentDefaults.CONTEXT_BUILDER(() =>
          cleanString(\`
          Generate exactly 5 essay headings for the given topic. First heading 
          is Introduction. Last heading is Conclusion. Middle 3 headings are main 
          topics. Use Roman numerals (I-V). No subsections. Just 5 headings only.  
        \`)
        ),
        output: AgentDefaults.OUTPUT_BUILDER,
      },
    },
  });

      `,
    },
    {
      title: 'handlers/essay-writer.agent.ts',
      lang: 'ts',
      code: `
import { createArvoOrchestratorContract } from 'arvo-core';
import type { EventHandlerFactory } from 'arvo-event-handler';
import {
  AgentDefaults,
  AgentStreamListener,
  createArvoAgent,
  OpenAI,
  openaiLLMIntegration,
} from '@arvo-tools/agentic';
import { cleanString } from 'arvo-core';

export const essayWriterAgentContract = createArvoOrchestratorContract({
  uri: '#/org/amas/agent/essay-writer',
  name: 'agent.essay.writer',
  description:
    'Writes a complete essay with one paragraph per heading from the given outline',
  versions: {
    '1.0.0': {
      init: AgentDefaults.INIT_SCHEMA,
      complete: AgentDefaults.COMPLETE_SCHEMA,
    },
  },
});

export const essayWriterAgent: EventHandlerFactory<
  { onStream?: AgentStreamListener }
> = ({ onStream }) =>
  createArvoAgent({
    contracts: {
      self: essayWriterAgentContract,
      services: {},
    },
    onStream,
    llm: openaiLLMIntegration(
      new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    ),
    handler: {
      '1.0.0': {
        context: AgentDefaults.CONTEXT_BUILDER(() =>
          cleanString(\`
          Write a complete essay on the given topic. 
          Follow exaclty the provided outline and write exactly one paragraph 
          under each heading. Each paragraph should be 4-6 sentences. 
          Format with headings in bold.
        \`)
        ),
        output: AgentDefaults.OUTPUT_BUILDER,
      },
    },
  });


      `,
    },
    {
      title: 'handlers/human.approval.contract.ts',
      lang: 'ts',
      code: `
import { createSimpleArvoContract } from 'arvo-core';
import z from 'zod';

export const humanApprovalContract = createSimpleArvoContract({
  uri: '#/org/amas/external/human_approval',
  type: 'human.approval',
  domain: 'human.interaction',
  description:
    'This is a service which gets approval from the human based on the provided prompt',
  versions: {
    '1.0.0': {
      accepts: z.object({
        prompt: z.string(),
      }),
      emits: z.object({
        approval: z.boolean(),
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
import { operatorAgent } from './handlers/operator.agent.ts';
import { humanConversationContract } from './handlers/human.conversation.contract.ts';
import { essayOutlineAgent } from './handlers/essay-outline.agent.ts';
import { essayWriterAgent } from './handlers/essay-writer.agent.ts';
import { essayBuilderWorkflow } from './handlers/essay.builder.workflow/index.ts';
import { humanApprovalContract } from './handlers/human.approval.contract.ts';
import { essayBuilderWorkflowContract } from './handlers/essay.builder.workflow/contract.ts';
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

// Handles workflow-initiated approval requests from humans.
// Unlike handleHumanConversation which supports multi-turn dialogue,
// this processes simple yes/no approval decisions for workflow gates.
// Maintains trace continuity and constructs response events with proper
// context stitching to allow the workflow to resume from the approval point.
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
        essayBuilderWorkflowContract.version('1.0.0'),
      )
        .accepts({
          source: TEST_EVENT_SOURCE,
          data: {
            parentSubject$$: null,
            topic: 'State of Agentic Systems - A high-level overview',
            instructions:
              'The essay must have only 5 headings and each heading must have only one paragraph.',
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

  Console Logs


  >>>> Human approval denied

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
  ==== [Agent Stream] Agent Finalised Output ====
  {
    "type": "agent.output",
    "sourceAgent": "arvo.orc.agent.essay.outline",
    "data": {
      "content": "{\"response\":\"I. Introduction  \\nII. Defining Agentic Systems and Their Importance  \\nIII. Current Developments and Innovations in Agentic Systems  \\nIV. Challenges and Ethical Considerations in Agentic Systems  \\nV. Conclusion  \"}",
      "usage": {
        "prompt": 101,
        "completion": 43
      },
      "executionunits": 144
    }
  }
  ==== Agent Initiated Plan Approval ====
  ✔ For the topic "State of Agentic Systems - A high-level overview" following is the proposed outline:
  I. Introduction
  II. Defining Agentic Systems and Their Importance
  III. Current Developments and Innovations in Agentic Systems
  IV. Challenges and Ethical Considerations in Agentic Systems
  V. Conclusion
  Please review this and provide your approval 
  [User Input: No]
  ==== Agent final output ====
  {
    "id": "3ddbf507-5697-4848-b44c-763536327130",
    "source": "arvo.orc.workflow.essay.builder",
    "specversion": "1.0",
    "type": "arvo.orc.workflow.essay.builder.done",
    "subject": "eJw9jtEKgzAMRf8lzzbU4Zzub2IbWVltIa26If77wgZ7uQ854dx7QBb34FKFaha4H5BoYbgDyZZRGe5ZnnPMO3Ip9MZpDdGzQAMbSwk56W+LFi2cDfCL3Vq/xwOCV8Q0s+07Mq4fJ9P50ZuhZTL2ch0nN9wc21ldIYUafgug6hr8h0KfFwqqTGuMWrJwJfWf5weGtz7Q",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/workflow/essay/builder/1.0.0",
    "data": {
      "success": true,
      "essay": null,
      "comment": "Human did not approve this outline",
      "errors": [
        {
          "errorName": "ApprovalRejection",
          "errorMessage": "Human did not appove the outline",
          "errorStack": null
        }
      ]
    },
    "time": "2025-12-17T12:14:04.570+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.workflow.essay.builder",
    "executionunits": 144,
    "traceparent": "00-d2674ba96bdac90ed34ed9385385a229-bbb1cfbdc268880e-01",
    "tracestate": null,
    "parentid": "4eeef56f-2bb8-4ac8-860e-ebae37a77a0b",
    "domain": null
  }


  >>>> When Human Approval Granted

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
  ==== [Agent Stream] Agent Finalised Output ====
  {
    "type": "agent.output",
    "sourceAgent": "arvo.orc.agent.essay.outline",
    "data": {
      "content": "{\"response\":\"I. Introduction  \\nII. Definition and Characteristics of Agentic Systems  \\nIII. Current Applications and Use Cases of Agentic Systems  \\nIV. Challenges and Limitations Facing Agentic Systems  \\nV. Conclusion  \"}",
      "usage": {
        "prompt": 101,
        "completion": 41
      },
      "executionunits": 142
    }
  }
  ==== Agent Initiated Plan Approval ====
  ✔ For the topic "State of Agentic Systems - A high-level overview" following is the proposed outline:
  I. Introduction
  II. Definition and Characteristics of Agentic Systems
  III. Current Applications and Use Cases of Agentic Systems
  IV. Challenges and Limitations Facing Agentic Systems
  V. Conclusion
  Please review this and provide your approval 
  [User Input: Yes]
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
            "content": "Can you write an essay for the topic \"State of Agentic Systems - A high-level overview\"\nYou must follow this outline exactly:\nI. Introduction\nII. Definition and Characteristics of Agentic Systems\nIII. Current Applications and Use Cases of Agentic Systems\nIV. Challenges and Limitations Facing Agentic Systems\nV. Conclusion\nAdditional instructions:\nThe essay must have only 5 headings and each heading must have only one paragraph."
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
  ==== [Agent Stream] Agent Finalised Output ====
  {
    "type": "agent.output",
    "sourceAgent": "arvo.orc.agent.essay.writer",
    "data": {
      "content": "{\"response\":\"# Introduction\\n\\nAgentic systems, ...\"}",
      "usage": {
        "prompt": 141,
        "completion": 656
      },
      "executionunits": 797
    }
  }
  ==== Agent final output ====
  {
    "id": "32c398fd-316b-445c-ae95-a35e9213292e",
    "source": "arvo.orc.workflow.essay.builder",
    "specversion": "1.0",
    "type": "arvo.orc.workflow.essay.builder.done",
    "subject": "eJw9jksKwzAMRO+idWzyT5vbKLZMTR0bZCdpCbl7RQvdzEJPvJkTEpsH5cJYEsN8QsSVYAbkPWlh+kj8dCEdmnLGt142HywxVLATZ5+i/Da61jVcFdCLzFa+xxO8FWSGW900/aKc61rVD25SS4+dsuPQTuPdWoOjuHz0xf8WQJE1+h8CbVrRizJuIUjJSgXFf10fRcQ+DA==",
    "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
    "dataschema": "#/org/amas/workflow/essay/builder/1.0.0",
    "data": {
      "success": false,
      "essay": "# Introduction\n\nAgentic systems, a burgeoning field within artificial intelligence, are transforming the way we interact with technology. These systems, characterized by their ability to act autonomously and make decisions based on environmental inputs, are becoming increasingly prevalent in various sectors. As technology continues to advance, the integration of agentic systems into everyday life is expected to grow, offering new opportunities and challenges. This essay provides a high-level overview of the current state of agentic systems, exploring their definition, applications, and the challenges they face. By understanding these aspects, we can better appreciate the potential and limitations of these systems in shaping the future.\n\n# Definition and Characteristics of Agentic Systems\n\nAgentic systems are defined as autonomous entities capable of perceiving their environment, processing information, and making decisions to achieve specific goals. These systems are characterized by their ability to learn from experiences, adapt to new situations, and operate independently without constant human intervention. They often incorporate elements of machine learning, natural language processing, and robotics to enhance their functionality. The core characteristic of agentic systems is their agency, which allows them to perform tasks and solve problems in dynamic and complex environments. This autonomy distinguishes them from traditional software systems, which require explicit instructions for every action.\n\n# Current Applications and Use Cases of Agentic Systems\n\nAgentic systems are currently being utilized across a wide range of industries, demonstrating their versatility and potential. In the automotive sector, autonomous vehicles are a prime example, using agentic systems to navigate roads, interpret traffic signals, and make real-time driving decisions. In healthcare, these systems assist in diagnostics and personalized treatment plans by analyzing patient data and medical histories. The financial industry employs agentic systems for algorithmic trading, fraud detection, and customer service through chatbots. Additionally, smart home devices, such as virtual assistants, leverage agentic systems to manage household tasks and provide users with personalized experiences. These applications highlight the transformative impact of agentic systems on various aspects of daily life and industry operations.\n\n# Challenges and Limitations Facing Agentic Systems\n\nDespite their potential, agentic systems face several challenges and limitations that hinder their widespread adoption. One major challenge is ensuring the reliability and safety of these systems, particularly in high-stakes environments like healthcare and transportation. The complexity of real-world scenarios can lead to unpredictable behavior, raising concerns about accountability and trust. Additionally, ethical considerations, such as privacy and bias, pose significant hurdles, as these systems often rely on large datasets that may contain sensitive information or reflect societal prejudices. Technical limitations, including computational power and data processing capabilities, also restrict the performance of agentic systems. Addressing these challenges is crucial for the responsible development and deployment of agentic systems.\n\n# Conclusion\n\nIn conclusion, agentic systems represent a significant advancement in artificial intelligence, offering the promise of enhanced autonomy and decision-making capabilities across various domains. While their applications are already making a substantial impact, the challenges and limitations they face must be addressed to fully realize their potential. As technology continues to evolve, it is essential to balance innovation with ethical considerations and safety measures to ensure that agentic systems are developed responsibly. By doing so, we can harness the benefits of these systems while mitigating risks, paving the way for a future where agentic systems play an integral role in society.",
      "comment": "Essay generated successfully",
      "errors": []
    },
    "time": "2025-12-17T12:14:26.249+00:00",
    "to": "test.test.test",
    "accesscontrol": null,
    "redirectto": "arvo.orc.workflow.essay.builder",
    "executionunits": 939,      // Accumulated execution units
    "traceparent": "00-64973b3660f89a99519dbabab592667e-f21a9a7aecff6d51-01",
    "tracestate": null,
    "parentid": "a106737e-2271-4a86-bc68-ad7cec5f42e6",
    "domain": null
  }

*/
      
      `,
    },
  ],
};
