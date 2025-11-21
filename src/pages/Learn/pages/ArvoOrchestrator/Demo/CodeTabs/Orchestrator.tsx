import { ArvoMachineLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const Orchestrator: DemoCodePanel = {
  heading: 'Getting Started',
  description: cleanString(`
    This builds directly on the demo machine from [the state machine documentation](${ArvoMachineLearn.link}). 
    If you haven't read that yet, start there—it shows how to build the state machine definition this 
    orchestrator will execute.

    The orchestrator requires three things. It needs a memory implementation for state persistence, 
    a default execution value for cost tracking, and your machine definitions. Once you provide these, 
    the orchestrator handles everything else.

    The memory parameter accepts any implementation of \`IMachineMemory\`, which means you can use 
    in-memory storage during testing and switch to Redis, DynamoDB, Postgres, or any other backend 
    for production. The machines array supports multiple versions of your state machine, allowing 
    old and new workflows to run side by side during deployments.

    > **Note:** The following documentation is only relevant if you are implementing a production system 
    > with state management, locking, error handling and other life-cycle requirements. 
 `),
  tabs: [
    {
      title: 'orchestrator.demo/index.ts',
      lang: 'ts',
      code: `
import {
  createArvoOrchestrator,
  type EventHandlerFactory,
  type IMachineMemory,
  type MachineMemoryRecord,
} from 'arvo-event-handler';
import { demoMachineV100 } from './machine.V100.js';

export const demoOrchestrator: EventHandlerFactory<{ memory: IMachineMemory<Record<string, unknown>> }> = ({
  memory,
}) =>
  createArvoOrchestrator({
    memory: memory as IMachineMemory<MachineMemoryRecord>,
    executionunits: 0,
    machines: [demoMachineV100],
  });


     `,
    },
  ],
};
