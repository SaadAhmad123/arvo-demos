import {} from '../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const TestOrchestratorTab: DemoCodePanel = {
  heading: 'Testing Event Handlers',
  description: cleanString(`
    Testing orchestrators and workflows traditionally requires simulating multi-step event sequences across time. 
    You need infrastructure to deliver events, mechanisms to maintain state between steps, and complex harnesses 
    to validate behavior across the entire sequence. Arvo eliminates this complexity through step-based testing 
    that works without infrastructure which is possible due to the fact that event handlers in Arvo are infrastructure
    agnostic.

    ### The Step-Based Pattern

    Tests define event sequences as steps. Each step specifies an input event and validates the emitted events. 
    The \`input\` function can reference previous step results, enabling you to build multi-event workflows naturally. 
    The \`expectedEvents\` callback receives emitted events for validation. This pattern lets you test workflows 
    spanning multiple events without any infrastructure.

    The unit test demonstrates the complete orchestrator lifecycle through steps. Initialize the workflow, verify 
    the orchestrator emits an addition event. Provide the addition result, verify it emits a product event. Provide 
    the product result, verify it emits the completion event. Each step builds on previous results, simulating the 
    complete event sequence the orchestrator expects.

    ### Event Context Stitching

    The examples demonstrate event context stitching, a fundamental skill when working with Arvo beyond just testing. 
    Arvo handlers automatically maintain event chain relationships when emitting events. However, when external systems 
    respond to events, such as humans providing approvals, third-party services sending results, or tests simulating responses,
    you must manually stitch context to maintain proper event correlation.

    Extract \`parentSubject$$\`, \`subject\`, \`id\`, and \`accesscontrol\` from incoming events and pass them when 
    constructing response events. The contract factory uses these values to establish parent-child relationships, 
    maintain workflow correlation, and preserve access control context across event chains. This same pattern appears 
    throughout Arvo whenever external systems participate in event-driven workflows.

    ### Unit and Integration Testing

    Unit tests validate orchestrator logic in isolation. You manually craft response events simulating handler 
    behavior without executing actual handlers. This tests state machine transitions, context updates, and event 
    emission logic independently. The unit test manually creates addition and product success events, verifying 
    the orchestrator transitions correctly and emits the expected next events.

    Integration tests run the orchestrator with actual handlers coordinating through \`SimpleEventBroker\`. The 
    broker routes events between handlers, handlers execute and emit responses, and the orchestrator processes 
    those responses. This validates complete end-to-end coordination while still running entirely in memory without 
    external infrastructure. The integration test initializes the workflow and receives the final completion event 
    after the broker coordinates all handlers.

    ### Universal Pattern

    The step-based pattern works with any event handler implementing \`IArvoEventHandler\` or any custom function 
    matching the signature \`(event: ArvoEvent) => Promise<{events: ArvoEvent[]}>\`. This flexibility enables testing 
    at any abstraction level. The integration test demonstrates this by wrapping \`SimpleEventBroker\` in a custom 
    function that coordinates the orchestrator with actual handlers. The test suite treats everything uniformly becuase
    it just needs events in and events out.

    The \`runArvoTestSuites\` function is framework-agnostic, working with Vitest, Jest, Mocha, or any test runner 
    through a simple adapter pattern. Pass your test framework's \`test\`, \`describe\`, and \`beforeEach\` functions 
    directly to \`runArvoTestSuites\`. Arvo uses these to register tests without depending on any specific testing 
    library. Test suite definitions remain pure data structures describing event sequences and expectations, enabling 
    you to switch test runners or use different frameworks across your system without changing test definitions.
  `),
  tabs: [
    {
      title: 'tests/average.workflow__unit_test.ts',
      lang: 'ts',
      code: `
import {
  ArvoTestSuite,
  runArvoTestSuites,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import {
  averageWorkflow,
  averageWorkflowContract,
} from '../handlers/average.workflow.ts';
import { createArvoEventFactory } from 'arvo-core';
import { beforeEach, describe, expect, test } from 'vitest';
import { addContract } from '../handlers/add.service.ts';
import { productContract } from '../handlers/product.service.ts';

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();

const TEST_DATA = [1, 2, 3, 4, 5];

const unitTest: ArvoTestSuite = {
  config: {
    handler: averageWorkflow({ memory }),
  },
  cases: [
    {
      name:
        'should emit the addition event, then the product event and then the final event',
      steps: [
        {
          input: () =>
            createArvoEventFactory(averageWorkflowContract.version('1.0.0'))
              .accepts({
                source: TEST_EVENT_SOURCE,
                data: {
                  parentSubject$$: null, // This is a requirement from the orchestrator contract.
                  numbers: TEST_DATA,
                },
              }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            expect(events[0].type).toBe(addContract.type);
            expect(JSON.stringify(events[0].data.numbers)).toBe(
              JSON.stringify(TEST_DATA),
            );
            return true;
          },
        },
        {
          input: (prev) =>
            createArvoEventFactory(addContract.version('1.0.0')).emits({
              // Stitching the context previous event
              subject: prev?.[0]?.data?.parentSubject$$ ?? prev?.[0]?.subject ??
                undefined,
              parentid: prev?.[0]?.id ?? undefined,
              to: prev?.[0]?.source ?? undefined,
              accesscontrol: prev?.[0]?.accesscontrol ?? undefined,
              // Defining the next event data
              source: TEST_EVENT_SOURCE,
              type: 'evt.calculator.add.success',
              data: {
                result: (prev?.[0]?.data?.numbers as number[])?.reduce(
                  (acc, cur) => acc + cur,
                  0,
                ),
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            expect(events[0].type).toBe(productContract.type);
            expect(JSON.stringify(events[0].data.numbers)).toBe(JSON.stringify([
              TEST_DATA.reduce((acc, cur) => acc + cur, 0),
              1 / TEST_DATA.length,
            ]));
            return true;
          },
        },
        {
          input: (prev) =>
            createArvoEventFactory(productContract.version('1.0.0')).emits({
              // Stitching the context previous event
              subject: prev?.[0]?.data?.parentSubject$$ ?? prev?.[0]?.subject ??
                undefined,
              parentid: prev?.[0]?.id ?? undefined,
              to: prev?.[0]?.source ?? undefined,
              accesscontrol: prev?.[0]?.accesscontrol ?? undefined,
              // Defining the next event data
              source: TEST_EVENT_SOURCE,
              type: 'evt.calculator.product.success',
              data: {
                result: (prev?.[0]?.data?.numbers as number[])?.reduce(
                  (acc, cur) => acc * cur,
                  1,
                ),
              },
            }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            expect(events[0].type).toBe(
              averageWorkflowContract.metadata.completeEventType,
            );
            expect(events[0].data.average).toBe(
              TEST_DATA.reduce((acc, cur) => acc + cur, 0) / TEST_DATA.length,
            );
            return true;
          },
        },
      ],
    },
  ],
};

runArvoTestSuites([
  unitTest,
], { test, describe, beforeEach });




`,
    },
    {
      title: 'tests/average.workflow__integration_test.ts',
      lang: 'ts',
      code: `
import {
  ArvoTestSuite,
  createSimpleEventBroker,
  runArvoTestSuites,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import {
  averageWorkflow,
  averageWorkflowContract,
} from '../handlers/average.workflow.ts';
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { beforeEach, describe, expect, test } from 'vitest';
import { addHandler } from '../handlers/add.service.ts';
import {
  productHandler,
} from '../handlers/product.service.ts';

const TEST_EVENT_SOURCE = 'test.test.test';
const memory = new SimpleMachineMemory();
const TEST_DATA = [1, 2, 3, 4, 5];

const integrationTest: ArvoTestSuite = {
  config: {
    fn: async (event: ArvoEvent) => {
      const response = await createSimpleEventBroker([
        addHandler(),
        averageWorkflow({ memory }),
        productHandler(),
      ]).resolve(event);
      return { events: response ? [response] : [] };
    },
  },
  cases: [
    {
      name: 'should emit the final event',
      steps: [
        {
          input: () =>
            createArvoEventFactory(averageWorkflowContract.version('1.0.0'))
              .accepts({
                source: TEST_EVENT_SOURCE,
                data: {
                  parentSubject$$: null, // This is a requirement from the orchestrator contract.
                  numbers: TEST_DATA,
                },
              }),
          expectedEvents: (events) => {
            expect(events.length).toBe(1);
            expect(events[0].type).toBe(
              averageWorkflowContract.metadata.completeEventType,
            );
            expect(events[0].data.average).toBe(
              TEST_DATA.reduce((acc, cur) => acc + cur, 0) / TEST_DATA.length,
            );
            return true;
          },
        },
      ],
    },
  ],
};

runArvoTestSuites([
  integrationTest,
], { test, describe, beforeEach });




      `,
    },
  ],
};
