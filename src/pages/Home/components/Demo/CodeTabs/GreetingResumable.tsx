import { cleanString } from '../../../../../utils';
import type { DemoCodePanel } from '../../../../types';

export const GreetingResumableTab: DemoCodePanel = {
  heading: 'Imperative Orchestration for Agentic Workflows',
  description: cleanString(`
  State machines excel at bringing clarity to event-driven architectures, but struggle when workflows must 
  adapt dynamically based on runtime conditions. As decision trees grow complex, state charts become 
  unwieldy—a problem known as "state explosion."

  Arvo addresses this with \`ArvoResumable\` which is an imperative orchestration model that lets you express 
  workflow logic in familiar programming constructs while maintaining Arvo's event-driven guarantees. 
  Write dynamic conditionals, integrate external APIs, and make runtime decisions without sacrificing 
  reliability or composability.

  This example demonstrates two powerful capabilities working together:

  **ArvoResumable** — Express workflows imperatively with full programming flexibility. Handle dynamic 
  state transitions, integrate LLM responses, or invoke external services while preserving contract 
  validation and observability. This eliminates state explosion while maintaining the benefits of 
  event-driven architecture.

  **Nested Orchestration** — Workflows can invoke other workflows as first-class participants, enabling 
  modular system design where complex processes decompose into reusable units. This allows hybrid 
  approaches where declarative state machines and imperative resumables coexist in the same architecture.

  ## Understanding This Example

  This resumable orchestrator processes a name and age through multiple handlers simultaneously. Upon 
  initialization, it emits three events in parallel: one to the greeting handler with the name, another 
  to the addition handler to calculate age plus seven, and a third to the declarative state machine 
  orchestrator from the previous example. The imperative handler uses simple conditional logic to check 
  when all three responses have arrived, then compares the output from the nested orchestrator against 
  its own directly-generated result. This pattern demonstrates how resumables coordinate both individual 
  handlers and nested workflows through straightforward programming logic rather than explicit state 
  definitions, while also showcasing the interoperability between declarative and imperative orchestration 
  styles within the same system.

  ## Architectural Significance

  The introduction of \`ArvoResumable\` alongside \`ArvoOrchestrator\` represents a pragmatic solution to a 
  fundamental trade-off in workflow orchestration. Declarative state machines provide visual clarity and 
  formal verification but become brittle when facing dynamic runtime conditions. Traditional imperative 
  approaches offer flexibility but often sacrifice observability and type safety.

  Arvo resolves this tension by treating both models as equivalent event handlers within the same 
  framework. A resumable orchestrator maintains identical event contracts, lifecycle management, and 
  observability as its state machine counterpart—the only difference is how workflow logic is expressed 
  internally. This means you can choose the right tool for each workflow: state machines for well-defined 
  processes with clear transitions, resumables for dynamic scenarios requiring conditional logic or 
  external integrations.

  The nested orchestration capability further amplifies this flexibility. Because orchestrators are simply 
  event handlers, they compose naturally—a resumable can invoke a state machine, which can invoke another 
  resumable, creating hierarchical workflows where each level uses the most appropriate orchestration 
  model. This compositional approach is particularly powerful for agentic AI systems, where LLM-driven 
  decision-making (naturally imperative) must coordinate with deterministic business processes (naturally 
  declarative). Rather than forcing everything into one paradigm, Arvo lets you leverage the strengths of 
  each approach while maintaining architectural consistency across the entire system.

  Resumables are particularly valuable for **Agentic AI workflows**. An LLM can be invoked directly within 
  a handler to decide which events to emit, turning AI agents into standard event-driven participants. 
  Service contracts naturally translate into LLM tool calls, while the resumable context tracks workflow 
  state across these interactions—enabling collaborative AI agents and resilient distributed processes.

  These concepts—resumables, nested orchestration, and agentic workflows—are explored in depth in the 
  detailed documentation.
`),
  tabs: [
    {
      title: 'handlers/greeting.resumable.ts',
      lang: 'ts',
      code: `
import { ArvoErrorSchema, createArvoOrchestratorContract, type ArvoErrorType } from 'arvo-core';
import {
  createArvoResumable,
  type EventHandlerFactory,
  ExecutionViolation,
  type IMachineMemory,
} from 'arvo-event-handler';
import { z } from 'zod';
import { addContract } from './add.handler.js';
import { greetingContract } from './greeting.handler.js';
import { greetingOrchestratorContract } from './greeting.orchestrator.js';

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
        toolUseId$$: z.string().optional(),
      }),
      complete: z.object({
        errors: ArvoErrorSchema.array().min(1).nullable(),
        result: z.string().nullable(),
        sameResultFromWorkflow: z.boolean(),
        toolUseId$$: z.string().optional(),
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
        toolUseId: string | null;
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
              '[Critical Error] Init event consumed after context initialization. Possible race condition or deduplication error.',
            );
          }

          return {
            context: {
              name: input.data.name,
              age: input.data.age,
              greeting: null,
              updatedAge: null,
              errors: [],
              toolUseId: input.data.toolUseId$$ ?? null,
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
            '[Critical Error] Service event consumed without context. Possible state persistence issue.',
          );
        }

        // Final aggregation: check if all dependent service results are available.
        if (
          (collectedEvents?.['evt.calculator.add.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['evt.greeting.create.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['arvo.orc.greeting.done']?.length ?? 0) > 0
        ) {
          const orchestratorString = collectedEvents['arvo.orc.greeting.done']?.[0]?.data?.result;
          const lowLevelGeneratedString = \`Greeting -> \${collectedEvents['evt.greeting.create.success']?.[0]?.data?.greeting}, Updated Age -> \${collectedEvents['evt.calculator.add.success']?.[0]?.data?.result}\`;

          return {
            output: {
              errors: null,
              sameResultFromWorkflow: lowLevelGeneratedString === orchestratorString,
              result: lowLevelGeneratedString,
              toolUseId$$: context.toolUseId ?? undefined,
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
