import { ArvoMachineLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const Orchestrator: DemoCodePanel = {
  heading: 'Getting Started',
  description: cleanString(`
    The \`ArvoOrchestrator\` is an execution engine that brings state machine 
    definitions to life. It encapsulates significant complexity while providing
    an API that complies with the \`IArvoEventHandler\` interface—the universal
    interface for all event handlers in Arvo. Its internal workings are explored 
    later in this document. To create an \`ArvoOrchestrator\`, use the 
    \`createArvoOrchestrator\` factory provided by Arvo.

    This example builds directly on the demo machine from [the state machine 
    documentation](${ArvoMachineLearn.link}). If you haven't read that yet, 
    start there—it demonstrates how to build the state machine definition this 
    orchestrator will execute.

    The \`ArvoOrchestrator\` requires three main components: a memory implementation 
    for state persistence, a default execution value for cost tracking, and your 
    machine definitions. The memory parameter accepts any implementation of 
    \`IMachineMemory\`, enabling you to use in-memory storage during testing and 
    seamlessly switch to Redis, DynamoDB, Postgres, or any other backend for 
    production. The machines array must include all machine versions defined by 
    the orchestrator's contract and supports multiple versions of your state machine, 
    allowing legacy and current workflows to run concurrently during deployments.
  `),
  tabs: [
    {
      title: 'orchestrator.demo/index.ts',
      lang: 'ts',
      code: `
import {
  createArvoOrchestrator,
  SimpleMachineMemory,
} from 'arvo-event-handler';
import { demoMachineV100 } from './machine.V100.js';

/**
 * Create the demo orchestrator with in-memory state persistence.
 * 
 * Configuration:
 * - memory: SimpleMachineMemory for development/testing
 * - executionunits: Initial execution cost set to 0
 * - machines: Array of state machine versions to support
 */
export const demoOrchestrator = createArvoOrchestrator({
  memory: new SimpleMachineMemory(),
  executionunits: 0,
  machines: [demoMachineV100],
});

/**
 * Usage Example:
 * 
 * The orchestrator can be invoked directly without event-driven infrastructure:
 * 
 * \`\`\`typescript
 * const result = await demoOrchestrator.execute(arvoEvent);
 * console.log(result.events);
 * \`\`\`
 * 
 * For production use, integrate with your event handling infrastructure
 * to process events asynchronously.
 */
`,
    },
  ],
};
