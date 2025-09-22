import { ArvoErrorSchema, createArvoOrchestratorContract, type ArvoErrorType } from 'arvo-core';
import { createArvoResumable, type EventHandlerFactory, ExecutionViolation } from 'arvo-event-handler';

import { z } from 'zod';
import { greetingContract } from './greeting.handler';
import { addContract } from './add.handler';
import { greetingOrchestratorContract } from './greeting.orchestrator';
import type { Persistable } from './types';

export const greetingResumableContract = createArvoOrchestratorContract({
  uri: '#/demo/resumable/greeting', // Must always be unique across all orchestrator contracts,
  name: 'greeting.resumable', // Must always be unique across all orchestrator contracts,
  description:
    'An imperative orchestrator function which can call the state chart based greeting orchestrator and imperatively performs similar operations and then compares the two outputs',
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

// ArvoResumable is an imperitive form of orchestrator event handler. From
// an event point of view it is an orchestrator. It is just that it implementation
// is imperitive
export const greetingResumable: EventHandlerFactory<Persistable> = ({ memory }) =>
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
         * This is to store the process id/subject of the current orchestration.
         * This is because this resumable (which is an imperitive orchestrator) will
         * be emitting an event to for an other workflow orchestrator and this field
         * communicated the required id for proper context process tracking.
         */
        selfSubject$$: string;
        toolUseId$$: string | null;
      },
    },
    handler: {
      '1.0.0': async ({ input, service, context, collectedEvents }) => {
        if (
          service?.type === 'sys.com.calculator.add.error' ||
          service?.type === 'sys.com.greeting.create.error' ||
          service?.type === 'sys.arvo.orc.greeting.error'
        ) {
          // This will cause emission of system error event for the resumable it will be sys.arvo.orc.greeting.error
          throw new Error(`Something went wrong in the service exection. ${service.data.errorMessage}`);
        }

        if (input) {
          if (context) {
            // This will result in a actual error being throw in the execution.
            // This is a fatal error and must be able to be bubbled up
            // This way the developers choose to handle error boundaries
            // and error handling becomes transparent.
            throw new ExecutionViolation(
              '[Critical Error]Init event consumed after context availability. This mean a race condition or a event de-duplication issue',
            );
          }

          return {
            context: {
              name: input.data.name,
              age: input.data.age,
              greeting: null,
              updatedAge: null,
              errors: [],
              selfSubject$$: input.subject, // ArvoEvent subjects are basically the process ids which remain same across the scope of a particular workflow carried out by a particular orchestrator. Nested orchestration will have different subject across different orchestrator
              toolUseId$$: input.data.toolUseId$$ ?? null,
            },
            services: [
              {
                type: 'com.calculator.add' as const,
                data: {
                  numbers: [input.data.age, 7],
                },
              },
              {
                type: 'com.greeting.create' as const,
                data: {
                  name: input.data.name,
                },
              },
              {
                type: 'arvo.orc.greeting' as const,
                data: {
                  name: input.data.name,
                  age: input.data.age,
                  parentSubject$$: input.subject, // This `parentSubject$$` is added automatically in the ArvoContract created by `createArvoOrchestratorContract`
                },
              },
            ],
          };
        }

        if (!context) {
          throw new ExecutionViolation(
            '[Critical Error] Service event consumed without context availability. This mean state storage issues.',
          );
        }

        if (
          (collectedEvents?.['evt.calculator.add.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['evt.greeting.create.success']?.length ?? 0) > 0 &&
          (collectedEvents?.['arvo.orc.greeting.done']?.length ?? 0) > 0
        ) {
          const orchestratorString = collectedEvents['arvo.orc.greeting.done']?.[0]?.data?.result;
          const lowLevelGeneratedString = `Greeting -> ${collectedEvents['evt.greeting.create.success']?.[0]?.data?.greeting}, Updated Age -> ${collectedEvents['evt.calculator.add.success']?.[0]?.data?.result}`;
          return {
            output: {
              errors: null,
              sameResultFromWorkflow: lowLevelGeneratedString === orchestratorString,
              result: lowLevelGeneratedString,
              toolUseId$$: context.toolUseId$$ ?? undefined,
            },
          };
        }
      },
    },
  });
