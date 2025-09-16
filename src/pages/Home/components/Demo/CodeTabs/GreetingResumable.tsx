import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const GreetingResumableTab: DemoCodePanel = {
  heading: 'Imperative Orchestration for Agentic Workflows',
  description: cleanString(`
  State machines and state charts bring clarity and structure to event-driven architectures, but they often fall
  short when workflows need to adapt dynamically. Scenarios where outcomes depend on both prior transitions and
  evolving runtime conditions can lead to "state explosion," making charts hard to manage and reason about.

  To address this, Arvo introduces \`ArvoResumable\`: an imperative orchestration model that lets you express workflow
  logic in a familiar programming style while still operating within Arvo’s event-driven framework. Resumables give
  you the freedom to handle dynamic state transitions, integrate external APIs (such as large language models), and
  orchestrate workflows imperatively—without compromising reliability or composability.

  This example demonstrates two of Arvo's most powerful capabilities:
  - **ArvoResumable** — Write workflows imperatively, giving you flexibility to model dynamic state and make decisions
    at runtime (e.g., based on API or LLM responses). This avoids state explosion while still preserving all of Arvo’s
    guarantees like contract validation and observability.  
  - **Nested Orchestration** — A workflow can trigger and coordinate other workflows as first-class participants. This
    enables modular system design, where complex processes are broken into reusable units. It also allows hybrid
    approaches (declarative + imperative) in the same architecture, something most orchestration systems cannot do.

  Resumables are especially powerful in modern **Agentic AI** scenarios. An LLM can be invoked directly within a handler
  to decide which events to raise, turning AI agents into standard participants in the event-driven system. Service
  contracts can be exposed to LLMs as tool calls, and those tool calls naturally translate into dynamic event emissions.
  The resumable context ensures workflow state is tracked across these interactions, enabling collaborative AI agents
  and resilient distributed processes.

  You will explore these concepts—resumables, nested orchestration, and agentic workflows—in more depth in the detailed
  documentation.
`),
  tabs: [
    {
      title: 'handlers/greeting.resumable.ts',
      lang: 'ts',
      code: `
import {
  ArvoErrorSchema,
  createArvoOrchestratorContract,
  type ArvoErrorType,
} from 'arvo-core';
import {
  createArvoResumable,
  type EventHandlerFactory,
  ExecutionViolation,
  type IMachineMemory,
} from 'arvo-event-handler';
import { z } from 'zod';
import { addContract } from './add.handler.ts';
import { greetingContract } from './greeting.handler.ts';
import { greetingOrchestratorContract } from './greeting.orchestrator.ts';

// Define the contract for the greeting resumable workflow.
// Each orchestrator contract must have a globally unique URI and name.
export const greetingResumableContract = createArvoOrchestratorContract({
  uri: '#/demo/resumable/greeting',
  name: 'greeting.resumable',
  versions: {
    '1.0.0': {
      init: z.object({
        name: z.string(),
        age: z.number(),
      }),
      complete: z.object({
        errors: ArvoErrorSchema.array().min(1).nullable(),
        result: z.string().nullable(),
        sameResultFromWorkflow: z.boolean(),
      }),
    },
  },
});

// ArvoResumable is an imperative orchestrator event handler.
// From an event perspective it behaves like any orchestrator,
// but its workflow logic is defined imperatively.
export const greetingResumable: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoResumable({
    contracts: {
      self: greetingResumableContract,
      services: {
        greeting: greetingContract.version('1.0.0'),
        adder: addContract.version('1.0.0'),
        greetingOrchestrator: greetingOrchestratorContract.version('1.0.0'),
      },
    },
    memory,
    executionunits: 0,
    types: {
      context: {} as {
        name: string;
        age: number;
        greeting: string | null;
        updatedAge: number | null;
        errors: ArvoErrorType[];
        /**
         * Tracks the process ID (subject) of this orchestration.
         * Required when this resumable delegates work to another orchestrator,
         * ensuring proper context tracking across nested workflows.
         */
        selfSubject$$: string;
      },
    },
    handler: {
      '1.0.0': async ({ input, service, context, collectedEvents }) => {
        /**
         * This getting-started example demonstrates core features of ArvoResumable
         * using simple if/else conditions to decide which events to emit.
         *
         * In real-world scenarios, the same pattern could be powered by an AI agent.
         * For example, an LLM handler could analyze context and dynamically choose
         * which events to raise—turning this into an agentic workflow without
         * changing the underlying orchestration model.
         */
        if (
          service?.type === 'sys.com.calculator.add.error' ||
          service?.type === 'sys.com.greeting.create.error' ||
          service?.type === 'sys.arvo.orc.greeting.error'
        ) {
          // Propagate service errors as system errors for the resumable.
          throw new Error(\`Service execution failed: \${service.data.errorMessage}\`);
        }

        if (input) {
          if (context) {
            /**
             * Violation: init event received after context was already initialized.
             * This indicates a race condition or event deduplication issue.
             *
             * Violation errors differ from system errors: they are thrown directly,
             * not emitted as events. This gives developers explicit control over
             * error boundaries.
             *
             * The ViolationError category will be covered in more detail in future docs.
             */
            throw new ExecutionViolation(
              '[Critical Error] Init event consumed after context initialization. Possible race condition or deduplication error.'
            );
          }

          return {
            context: {
              name: input.data.name,
              age: input.data.age,
              greeting: null,
              updatedAge: null,
              errors: [],
              selfSubject$$: input.subject, // Subjects act as workflow IDs; nested orchestrations each have their own subject.
            },
            services: [
              {
                type: 'com.calculator.add' as const,
                data: { numbers: [input.data.age, 7] },
              },
              {
                type: 'com.greeting.create' as const,
                data: { name: input.data.name },
              },
              {
                type: 'arvo.orc.greeting' as const,
                data: {
                  name: input.data.name,
                  age: input.data.age,
                  parentSubject$$: input.subject, // Automatically included in contracts created via createArvoOrchestratorContract.
                },
              },
            ],
          };
        }

        if (!context) {
          // Fatal violation: service event received without initialized context.
          throw new ExecutionViolation(
            '[Critical Error] Service event consumed without context. Possible state persistence issue.'
          );
        }

        // Final aggregation: check if all dependent service results are available.
        if (
          (collectedEvents?.['evt.calculator.add.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['evt.greeting.create.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['arvo.orc.greeting.done']?.length ?? 0) > 0
        ) {
          const orchestratorString = collectedEvents['arvo.orc.greeting.done']?.[0]?.data?.result;
          const lowLevelGeneratedString =
            \`Greeting -> \${collectedEvents['evt.greeting.create.success']?.[0]?.data?.greeting}, Updated Age -> \${collectedEvents['evt.calculator.add.success']?.[0]?.data?.result}\`;

          return {
            output: {
              errors: null,
              sameResultFromWorkflow: lowLevelGeneratedString === orchestratorString,
              result: lowLevelGeneratedString,
            },
          };
        }
      },
    },
  });
  
`,
    },
  ],
};
