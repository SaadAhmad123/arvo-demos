import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const ExecuteTab: DemoCodePanel = {
  heading: 'A Complete Event-Driven System',
  description: cleanString(`
    This brings together everything from the tutorial into a complete, runnable event-driven application. All 
    handlers register with the same broker, simple request-response handlers working alongside state machine 
    orchestrators and imperative orchestrators. The system coordinates across different handler types through 
    events, demonstrating how Arvo components compose naturally without architectural distinction.

    ### The Event Loop Pattern

    The \`executeHandlers\` function now captures domained events alongside regular results, returning both to 
    the caller. The main function implements an explicit event loop that executes handlers, checks for events 
    requiring external coordination, handles them outside the broker, and feeds responses back. The loop continues 
    until the workflow completes with a final event. This pattern enables external systems like humans, third-party 
    services, or cross-environment integrations to participate in workflows without blocking the event broker.

    ### Human Approval and Distributed Tracing

    The \`handleHumanApproval\` function demonstrates external coordination using a console interface. Your 
    implementation could replace this with Slack integrations, web dashboards, or enterprise approval platforms without 
    changing orchestrator code. The function extracts OpenTelemetry trace context from the incoming approval 
    request event using \`createOtelContextFromEvent\`, then creates a child span maintaining the parent-child 
    relationship in the distributed trace. This ensures observability continuity across event-driven boundaries, 
    linking the human approval step back to the originating workflow in your tracing platform.

    The approval handler also demonstrates event context stitching in practice. It extracts \`subject\`, \`parentid\`, 
    \`to\`, and \`accesscontrol\` from the approval request and passes them when constructing the response event. 
    This maintains proper event chain relationships, ensuring the orchestrator receives a correctly correlated 
    response that resumes the workflow exactly where it suspended.

    ### Complete Foundation

    This tutorial provides an end-to-end introduction to event-driven development with Arvo. You've built simple 
    handlers, coordinated them through brokers, orchestrated multi-step workflows with state machines, implemented 
    imperative orchestration for dynamic scenarios, integrated human-in-the-loop patterns, and maintained distributed 
    observability. The detailed documentation explores many deeper concepts about these components. You now have 
    the foundational knowledge of Arvo for building event-driven application.
  `),
  tabs: [
    {
      title: 'main.ts',
      lang: 'ts',
      code: `
import { confirm } from '@inquirer/prompts';
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import {
  createSimpleEventBroker,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { addHandler } from './handlers/add.service.ts';
import { productHandler } from './handlers/product.service.ts';
import { averageWorkflow } from './handlers/average.workflow.ts';
import {
  weightedAverageContract,
  weightedAverageResumable,
} from './handlers/weighted.average.resumable.ts';
import {
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { humanApprovalContract } from './handlers/human.approval.contract.ts';

const tracer = trace.getTracer('main-agent-tracer');
const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

// Added domained event handling
export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  const domainedEvents: ArvoEvent[] = [];
  const response = await createSimpleEventBroker([
    addHandler(),
    productHandler(),
    averageWorkflow({ memory }),
    weightedAverageResumable({ memory }),
  ], {
    onDomainedEvents: async ({ event }) => {
      domainedEvents.push(event);
    },
  }).resolve(event);
  return response ? [response, ...domainedEvents] : domainedEvents;
};

// Utility function to create otel context from event
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

// Handle the human approval console interface
async function handleHumanApproval(event: ArvoEvent): Promise<ArvoEvent> {
  return await tracer.startActiveSpan(
    'HumanConversation.Approval',
    {
      kind: SpanKind.INTERNAL,
    },
    createOtelContextFromEvent(event),
    async (span): Promise<ArvoEvent> => {
      try {
        console.log('==== Initiated Plan Approval ====');

        const userResponse = await confirm({
          message: event.data?.prompt ?? 'Apprvoal is requested',
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

// Added otel tracing and nuances event handling
async function main() {
  await tracer.startActiveSpan(
    'main',
    async (span) => {
      let eventToProcess: ArvoEvent = createArvoEventFactory(
        weightedAverageContract.version('1.0.0'),
      )
        .accepts({
          source: TEST_EVENT_SOURCE,
          data: {
            parentSubject$$: null,
            input: [
              [2, 0.3],
              [45, 0.8],
            ].map(([value, weight]) => ({ value, weight })),
          },
        });

      let events: ArvoEvent[] = [];
      while (true) {
        const response = await executeHandlers(eventToProcess);
        // If no event is returned then that means
        // pervious events have not been addressed yet
        events = response.length ? response : events;

        // Pop and address a human approval event
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

      console.log('==== Final Event ====');
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

==== Initiated Plan Approval ====
✔ To calculate the weighted average we will
emit 2 events to generate
the products and then emit add event to add them all
and then emit a final product event to calculate
average and then emit the final output event.
Do you approve? 
[User Input: Yes]
==== Final Event ====
{
  "id": "79314e17-81de-4033-a6c6-c7efaa35e09a",
  "source": "arvo.orc.weighted.average",
  "specversion": "1.0",
  "type": "arvo.orc.weighted.average.done",
  "subject": "eJw9jtEKgzAMRf8lz7ZU56T4N7HNNGBbqNENxH9ftsFeQsgJ594TSg0LbVJRSoXxhIyJYASsR7HK7JN4XoSixYMqzgQN6LJxyfrVWmcdXA3Qi8Iu3+MJHD/I3z056s0QcDB9F4OZ6NYZP7jH5LCL0bXq4szCv2wQ7WH/Q2EsCVmVeV9XDUkkqP7regOHVDug",
  "datacontenttype": "application/cloudevents+json;charset=UTF-8;profile=arvo",
  "dataschema": "#/org/amas/resumable/weighted_average/1.0.0",
  "data": {
    "output": 18.3
  },
  "time": "2025-12-21T21:25:53.062+00:00",
  "to": "test.test.test",
  "accesscontrol": null,
  "redirectto": "arvo.orc.weighted.average",
  "executionunits": 0,
  "traceparent": "00-916e581a6329b877acd545f64b464068-4fa70892906ffec6-01",
  "tracestate": null,
  "parentid": "365d2b1e-094b-4bc6-b217-44072b8eb1d8",
  "domain": null
}

*/

    
`,
    },
  ],
};
