import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const TestResumableTab: DemoCodePanel = {
  heading: 'Testing the Imperative Orchestration',
  description: cleanString(`
    Integration testing for resumables uses the same framework and patterns you've learned. Unit testing works 
    identically to state machine unit testing, so it's not repeated here. The step-based approach, event context 
    stitching, and contract factories apply uniformly across all orchestrator and event handler types.

    The test coordinates the resumable with actual service handlers through \`SimpleEventBroker\`. Initialize the 
    workflow, capture the human approval request, simulate approval, and validate the final calculation after the 
    broker routes all parallel operations. The same testing pattern works whether you're testing declarative state 
    machines or imperative resumables.

    ### Domain Event Routing

    The \`onDomainedEvents\` callback captures events marked with domains before they reach the standard broker 
    routing. When the resumable emits the human approval request with \`domain: [ArvoDomain.FROM_EVENT_CONTRACT]\`, 
    the broker intercepts it and delivers it to this callback instead of attempting handler matching. This creates 
    a clean separation between automated event processing and external coordination.

    External systems handle domained events through whatever interface makes sense. The approval request in this 
    test is responded to by manually crafting a simulated response event, but in real systems that same approval 
    could come from console input, Slack channels, web dashboards, email workflows, or enterprise approval platforms. 
    The orchestrator code remains unchanged regardless of the response source. After approval arrives through the 
    external interface, the response event routes back through normal event fabric. The orchestrator resumes, 
    examines the approval decision, and continues or terminates accordingly. This enables workflows spanning 
    arbitrary durations, suspending completely while awaiting external input without consuming resources.
  `),
  tabs: [
    {
      title: 'tests/weighted.average.resumable_test.ts',
      lang: 'ts',
      code: `
import {
  ArvoTestSuite,
  createSimpleEventBroker,
  runArvoTestSuites,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { beforeEach, describe, expect, test } from 'vitest';
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { addHandler } from '../handlers/add.service.ts';
import { productHandler } from '../handlers/product.service.ts';
import {
  weightedAverageContract,
  weightedAverageResumable,
} from '../handlers/weighted.average.resumable.ts';
import { humanApprovalContract } from '../handlers/human.approval.contract.ts';

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

// Test data: [value, weight] pairs
const TEST_INPUT = [
  [34, 0.2],
  [45, 0.1],
  [67, 0.7],
];

const resumableIntegrationTest: ArvoTestSuite = {
  config: {
    fn: async (event) => {
      const domainedEvents: ArvoEvent[] = [];
      const response = await createSimpleEventBroker([
        addHandler(),
        productHandler(),
        weightedAverageResumable({ memory }),
      ], {
        onDomainedEvents: async ({ event }) => {
          domainedEvents.push(event);
        },
      }).resolve(event);
      return {
        events: response ? [response, ...domainedEvents] : domainedEvents,
      };
    },
  },
  cases: [
    {
      name: 'must complete the whole workflow',
      steps: [
        {
          input: () =>
            createArvoEventFactory(weightedAverageContract.version('1.0.0'))
              .accepts({
                source: TEST_EVENT_SOURCE,
                data: {
                  // parentSubject$$ identifies parent orchestrator (null = root workflow)
                  parentSubject$$: null,
                  input: TEST_INPUT.map(([value, weight]) => ({
                    value,
                    weight,
                  })),
                },
              }),
          expectedEvents: (events) => {
            expect(events).toHaveLength(1);
            const evt = events[0]!;
            expect(evt.type).toBe(humanApprovalContract.type);
            expect(evt.domain).toBe('human.interaction');
            return true;
          },
        },
        {
          input: (prev) =>
            createArvoEventFactory(humanApprovalContract.version('1.0.0'))
              .emits({
                subject: prev?.[0]?.data?.parentSubject$$ ??
                  prev?.[0]?.subject ?? undefined,
                parentid: prev?.[0]?.id ?? undefined,
                to: prev?.[0]?.source ?? undefined,
                accesscontrol: prev?.[0]?.accesscontrol ?? undefined,
                type: 'evt.human.approval.success',
                source: TEST_EVENT_SOURCE,
                data: {
                  approval: true,
                },
              }),
          expectedEvents: (events) => {
            expect(events).toHaveLength(1);
            const evt = events[0]!;
            expect(evt.type).toBe(
              weightedAverageContract.metadata.completeEventType,
            );
            const expectedAvg = TEST_INPUT.reduce(
              (acc, [value, weight]) => acc + (value * weight),
              0,
            ) / TEST_INPUT.length;
            expect(evt.data.output.toFixed(1)).toBe(expectedAvg.toFixed(1));
            return true;
          },
        },
      ],
    },
  ],
};

runArvoTestSuites([
  resumableIntegrationTest,
], { test, describe, beforeEach });


  
`,
    },
  ],
};
