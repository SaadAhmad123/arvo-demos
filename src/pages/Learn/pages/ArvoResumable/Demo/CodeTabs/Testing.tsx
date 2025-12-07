import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const Testing: DemoCodePanel = {
  singlePanel: true,
  heading: 'Testing the Resumable',
  description: cleanString(`
    \`ArvoResumable\` implements the same \`IArvoEventHandler\` interface as every other handler in Arvo, 
    which means testing follows the same patterns you've already learned. Arvo provides a test suite 
    runner that works with any TypeScript testing framework. You configure your handlers however you 
    need them (with memory, dependencies, whatever), declare your test cases as sequences of input 
    events and expected outputs, and the runner executes those tests using your chosen framework.

    This integration test demonstrates the complete workflow execution. It sets up an in-memory event 
    broker with all the required handlers, simulates the entire orchestration from initialization 
    through human approval to final completion, and validates the results at each step. The test 
    captures domain-routed events (like the human approval request) separately from standard handler 
    responses, showing how external systems integrate with your orchestration. Notice how the test 
    stitches events together by preserving subject and parent context between steps, exactly how 
    production systems would coordinate distributed workflows.
  `),
  tabs: [
    {
      title: 'resumable.demo/tests.ts',
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
import { expect } from '@std/expect';
import { humanApprovalContract } from '../handlers/human.approval.contract.ts';

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

// Test data: [value, weight] pairs
const TEST_INPUT = [
  [34, 0.2],
  [45, 0.1],
  [67, 0.7],
];

/**
 * Integration Test: Weighted Average Resumable
 * 
 * This test validates the complete workflow execution including:
 * - Initialization and human approval request
 * - Event routing to external domain (human.interaction)
 * - Resume after approval
 * - Final result calculation and validation
 * 
 * IMPORTANT: This is an integration test, not a unit test.
 * It runs the actual orchestrator with real service handlers,
 * demonstrating end-to-end workflow execution in a controlled environment.
 */
const resumableIntegrationTest: ArvoTestSuite = {
  config: {
    /**
     * Test Broker Configuration
     * 
     * Creates an in-memory event broker with:
     * - All required service handlers (add, product)
     * - The orchestrator being tested (weightedAverageResumable)
     * - Domain event capture for human interaction events
     * 
     * The broker automatically routes events based on event.to matching handler.source
     */
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
          /**
           * STEP 1: Workflow Initialization
           * 
           * Create the initialization event using the contract's event factory.
           * This ensures the event structure exactly matches what the contract expects.
           */
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
              
          /**
           * Validate Step 1 Output
           * 
           * After initialization, we expect:
           * - Exactly one event (the human approval request)
           * - Event type matches the human approval contract
           * - Event is routed to 'human.interaction' domain
           */
          expectedEvents: (events) => {
            expect(events).toHaveLength(1);
            const evt = events[0]!;
            expect(evt.type).toBe(humanApprovalContract.type);
            expect(evt.domain).toBe('human.interaction');
            return true;
          },
        },
        {
          /**
           * STEP 2: Human Approval Simulation
           * 
           * In production, this event would come from:
           * - A web UI where a manager clicks "Approve"
           * - A Slack bot responding to a user's reaction
           * - An email system processing a reply
           * - An API endpoint receiving approval from external system
           * 
           * Here we simulate that external approval by constructing
           * the response event manually.
           */
          input: (prev) =>
            createArvoEventFactory(humanApprovalContract.version('1.0.0'))
              .emits({
                /**
                 * To properly route this approval back to the waiting orchestrator,
                 * we need to preserve the context from the approval request:
                 */
                subject: prev?.[0]?.data?.parentSubject$$ ??
                  prev?.[0]?.subject ?? undefined,
                parentid: prev?.[0]?.id ?? undefined,
                to: prev?.[0]?.source ?? undefined,
                accesscontrol: prev?.[0]?.accesscontrol ?? undefined,
                
                // The approval response
                type: 'evt.human.approval.success',
                source: TEST_EVENT_SOURCE,
                data: {
                  approval: true,
                },
              }),
              
          /**
           * Validate Step 2 Output (Final Result)
           * 
           * After approval, the orchestrator should:
           * 1. Emit parallel product events (one per input item)
           * 2. Wait for all product results
           * 3. Sum the results
           * 4. Calculate the average
           * 5. Emit the completion event
           * 
           * Because it is integration test, all of this happens automatically.
           */
          expectedEvents: (events) => {
            expect(events).toHaveLength(1);
            const evt = events[0]!;
            
            // Verify this is the completion event
            expect(evt.type).toBe(
              weightedAverageContract.metadata.completeEventType,
            );
            
            /**
             * Validate Mathematical Correctness
             */
            const expectedAvg = TEST_INPUT.reduce(
              (acc, [value, weight]) => acc + (value * weight), 
              0
            ) / TEST_INPUT.length;
            
            // Use toFixed to avoid floating point precision issues
            expect(evt.data.output.toFixed(1)).toBe(expectedAvg.toFixed(1));
            return true;
          },
        },
      ],
    },
  ],
};

/**
 * Test Execution
 * 
 * runArvoTestSuites is framework-agnostic and works with any test runner
 * (Vitest, Jest, Deno, etc.) through adapters.
 */
runArvoTestSuites([
resumableIntegrationTest,
], {
  test: test,
  describe: describe,
  beforeEach: beforeEach,
});

`,
    },
  ],
};
