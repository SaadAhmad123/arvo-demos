import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const Testing: DemoCodePanel = {
  heading: 'Testing the Workflow',
  description: cleanString(`
    The [Getting Started guide](/) demonstrated Arvo's execution model. This tutorial now explores Arvo's 
    testing framework for both event handlers and orchestrators, where contracts become the testing 
    vocabulary and infrastructure concerns disappear.

    Testing event-driven systems traditionally demands significant infrastructure investment, with 
    temporal workflows requiring even more complexity through stubs and interfaces. Both workflow 
    and handler testing have historically needed brokers, memory stores, and external services 
    before tests could begin.

    Arvo's infrastructure abstraction layer and virtual orchestration concept fundamentally transform 
    this reality. The framework-agnostic \`runArvoTestSuites\` function works seamlessly with any 
    test runner—Vitest, Jest, Mocha, or others—enabling sophisticated unit and integration testing 
    without external infrastructure or stub implementations. By leveraging \`ArvoContract\`, which are already
    defined for handler implementation, 
    as the testing vocabulary, inputs and expected responses are modeled directly from contract definitions, 
    eliminating the need to invoke or stubbing actual handlers.

    The testing suite provides a step-based testing pattern where each step defines an \`input\` function 
    that creates an event and an \`expectedEvents\` callback that validates the emitted events. This 
    allows simulating complete event sequences and demonstrates multiple ways of stitching event 
    context—particularly useful when orchestrations emit multiple events in parallel. The \`updateEventContext\` 
    helper shows how to maintain context across steps by extracting correlation data from emitted events.

    Two distinct testing strategies are demonstrated. 
    
    - The **unit test** validates the orchestrator 
    logic in isolation, ensuring state transitions and event emissions follow the prescribed contract 
    without invoking dependent handlers. 
    - The **integration test** runs the orchestrator alongside 
    real handlers in an in-memory event broker, validating end-to-end behavior while still avoiding 
    external infrastructure. 
    
    This testing approach provides confidence in both the machine's correctness 
    and its integration patterns, all while remaining true to the event-driven model.
 `),
  tabs: [
    {
      title: 'tests/orchestrator.demo.test',
      lang: 'ts',
      code: `
import {
  createSimpleEventBroker,
  runArvoTestSuites,
  SimpleMachineMemory,
  type ArvoTestSuite,
} from 'arvo-event-handler';
import { beforeEach, describe, expect, test } from 'vitest';
import { demoOrchestrator } from '../src/handlers/orchestrator.demo/index.js';
import { type ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { demoOrchestratorContract } from '../src/handlers/orchestrator.demo/contract.js';
import { humanApprovalContract } from '../src/handlers/human.approval.contract.js';
import { addContract, addHandler } from '../src/handlers/add.service.js';
import { productContract, productHandler } from '../src/handlers/product.service.js';

const TEST_EVENT_SOURCE = 'test.test.test';

// Using the following event context mechanims to demonstrate multiple ways of stiching event context
// This is especially useful for orchestrations which emit multiple events in parrallel.
let eventContext:
  | {
      subject: string | undefined;
      parentid: string;
      to: string;
    }
  | undefined = undefined;

const updateEventContext = (evt: ArvoEvent) => {
  eventContext = {
    subject: evt.data.parentSubject$$ ?? evt.subject ?? undefined,
    parentid: evt.id,
    to: evt.source,
  };
};

const machineMemory = new SimpleMachineMemory();
const orchestratorUnitTest: ArvoTestSuite = {
  config: {
    handler: demoOrchestrator({
      memory: machineMemory,
    }),
  },

  cases: [
    {
      name: 'must emit follow the expected pipeline behaviour',
      steps: [
        // Step 1 -> Emit the human approval event
        {
          input: () =>
            createArvoEventFactory(demoOrchestratorContract.version('1.0.0')).accepts({
              source: TEST_EVENT_SOURCE,
              data: {
                parentSubject$$: null,
                values: [1, 2, 3],
              },
            }),
          expectedEvents: (events) => {
            expect(events).toHaveLength(1);
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const evt = events[0]!;
            updateEventContext(evt);
            expect(evt.type).toBe(humanApprovalContract.type);
            expect(evt.domain).toBe('human.interaction');
            return true;
          },
        },
        {
          // Step 2 -> Consume approval and emit addition and multiplication events
          input: (prev) =>
            createArvoEventFactory(humanApprovalContract.version('1.0.0')).emits({
              // Stitching the context previous event
              subject: prev?.[0]?.data?.parentSubject$$ ?? prev?.[0]?.subject ?? undefined,
              parentid: prev?.[0]?.id ?? undefined,
              to: prev?.[0]?.source ?? undefined,
              // Defining the next event data
              type: 'evt.human.approval.success',
              source: TEST_EVENT_SOURCE,
              data: {
                approval: true,
              },
            }),
          expectedEvents: (events) => {
            expect(events).toHaveLength(2);
            // biome-ignore lint/style/noNonNullAssertion: This is always non-zero
            updateEventContext(events[0]!);
            const eventTypes = events?.map((item) => item.type) ?? [];
            expect(eventTypes).toContain(addContract.type);
            expect(eventTypes).toContain(productContract.type);
            return true;
          },
        },
        {
          // Step 3 -> Input the addition result. Nothing must be emitted as the
          // multiplication state is still waiting for input
          // Input can be sync or async
          input: async () =>
            createArvoEventFactory(addContract.version('1.0.0')).emits({
              subject: eventContext?.subject,
              parentid: eventContext?.parentid,
              to: eventContext?.to,
              type: 'evt.calculator.add.success',
              source: TEST_EVENT_SOURCE,
              data: {
                result: 6,
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(0);
            return true;
          },
        },
        {
          // Step 4 -> Input the product result. This will emit the completion event
          input: () =>
            createArvoEventFactory(productContract.version('1.0.0')).emits({
              subject: eventContext?.subject,
              parentid: eventContext?.parentid,
              to: eventContext?.to,
              type: 'evt.calculator.product.success',
              source: TEST_EVENT_SOURCE,
              data: {
                result: 6,
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            // biome-ignore lint/style/noNonNullAssertion: Cannot be empty
            const evt = events[0]!;
            expect(evt.type).toBe(demoOrchestratorContract.metadata.completeEventType);
            expect(evt.data.success).toBe(true);
            expect(evt.data.product).toBe(6);
            expect(evt.data.sum).toBe(6);
            expect(evt.data.result).toBe(1);
            return true;
          },
        },
      ],
    },
  ],
};

// Let's test the system together. Not just the orchestrator but along
// with the other handlers. This is a form of integration testing in Arvo.
// Since Arvo is an application layer construct it limits its purview to
// business logic integration testing and enables engineers to leverage their
// existing infrastructure tools to test the handlers over the infrastructure
const orchestratorIntegrationTest: ArvoTestSuite = {
  config: {
    name: 'DemoOrchestratorIntegrationTest',
    fn: async (event) => {
      let domainedEvent: ArvoEvent | null = null;
      const result = await createSimpleEventBroker(
        [addHandler(), productHandler(), demoOrchestrator({ memory: machineMemory })],
        {
          onDomainedEvents: async ({ event }) => {
            domainedEvent = event;
          },
        },
      ).resolve(event);
      const resolvedEvent = result ?? domainedEvent ?? null;
      return { events: resolvedEvent === null ? [] : [resolvedEvent] };
    },
  },

  cases: [
    {
      name: 'full integration test',
      steps: [
        // Step 1 -> Init the workflow and expect the human approval event as captured by the onDomaindEvents callback
        {
          input: () =>
            createArvoEventFactory(demoOrchestratorContract.version('1.0.0')).accepts({
              source: TEST_EVENT_SOURCE,
              data: {
                parentSubject$$: null,
                values: [2, 3, 4],
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            // biome-ignore lint/style/noNonNullAssertion: Cannot be null
            const evt = events[0]!;
            expect(evt.type).toBe(humanApprovalContract.type);
            return true;
          },
        },
        {
          // Step 2 -> Provide the approval and the events will execute will the output is received
          input: (prev) =>
            createArvoEventFactory(humanApprovalContract.version('1.0.0')).emits({
              // Stitching the context previous event
              subject: prev?.[0]?.data?.parentSubject$$ ?? prev?.[0]?.subject ?? undefined,
              parentid: prev?.[0]?.id ?? undefined,
              to: prev?.[0]?.source ?? undefined,
              // Defining the next event data
              type: 'evt.human.approval.success',
              source: TEST_EVENT_SOURCE,
              data: {
                approval: true,
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            // biome-ignore lint/style/noNonNullAssertion: Cannot be empty
            const evt = events[0]!;
            expect(evt.type).toBe(demoOrchestratorContract.metadata.completeEventType);
            expect(evt.data.success).toBe(true);
            expect(evt.data.product).toBe(24);
            expect(evt.data.sum).toBe(9);
            expect(evt.data.result).toBe(9 / 24);
            return true;
          },
        },
      ],
    },
  ],
};

runArvoTestSuites([orchestratorUnitTest, orchestratorIntegrationTest], { test, describe, beforeEach });

     `,
    },
  ],
};
