import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const Orchestrator: DemoCodePanel = {
  singlePanel: true,
  heading: 'The Execution Engine',
  description: cleanString(`
    An \`ArvoMachine\` declares workflow structure but cannot execute independently. The \`ArvoOrchestrator\` 
    provides the runtime that transforms these declarations into executable workflows, handling event 
    emission, state persistence, and handler coordination. While comprehensive documentation covers 
    advanced features, this section demonstrates the essential binding—connecting machine definitions 
    to a pluggable memory interface through a factory pattern that works identically in development and 
    production.
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
} from 'arvo-event-handler';
import { demoMachineV100 } from './machine.V100.js';

export const demoOrchestrator: EventHandlerFactory<{ memory: IMachineMemory }> = ({
  memory,
}) =>
  createArvoOrchestrator({
    memory,
    executionunits: 0,
    machines: [demoMachineV100],
  });


     `,
    },
  ],
};
