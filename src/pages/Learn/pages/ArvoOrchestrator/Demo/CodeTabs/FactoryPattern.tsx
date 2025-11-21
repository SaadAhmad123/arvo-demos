import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const FactoryPattern: DemoCodePanel = {
  heading: 'Arvo Recommended Pattern',
  description: cleanString(`
    Orchestrator instantiation requires a memory instance. The examples here use 
    \`SimpleMachineMemory\`, Arvo's in-memory implementation, which enables rapid 
    prototyping during development. You can seamlessly transition to production-grade 
    backends (Redis, DynamoDB, Postgres) when deploying.

    In production systems with multiple orchestrators sharing the same memory backend, 
    direct instantiation becomes difficult to manage. To address this, Arvo recommends 
    a dependency injection approach using the \`EventHandlerFactory\` pattern. This 
    pattern decouples orchestrators from their operational dependencies—not just memory, 
    but also custom logging, metrics, and other infrastructure concerns.

    The factory pattern provides several benefits:
    - **Centralized Configuration**: Swap dependencies across all handlers from a single location
    - **Type Safety**: Generic interfaces narrow to specific types where needed
    - **Consistency**: Uniform dependency injection across all Arvo event handlers
    - **Testability**: Easy mocking of dependencies for unit tests

    In this example, the factory accepts a generic \`IMachineMemory<Record<string, unknown>>\` 
    interface, which is then safely cast to the more specific \`IMachineMemory<MachineMemoryRecord>\` 
    type required by the orchestrator. This type-casting is safe because \`MachineMemoryRecord\` 
    is a specialized subset of \`Record<string, unknown>\`, and TypeScript's structural typing 
    ensures compatibility.
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

/**
 * Factory function for creating the demo orchestrator.
 * 
 * This pattern enables dependency injection of infrastructure components
 * like memory backends, allowing you to:
 * - Use SimpleMachineMemory during development or testing the orchestrator logic
 * - Swap to Redis/DynamoDB/Postgres in production
 * - Mock memory implementations in tests (only do this to test custom memory implementation)
 * 
 * @param dependencies - Infrastructure dependencies
 * @returns Configured ArvoOrchestrator instance
 * 
 * @example
 * \`\`\`typescript
 * // Development
 * const devOrch = demoOrchestrator({ 
 *   memory: new SimpleMachineMemory() 
 * });
 * 
 * // Production
 * const prodOrch = demoOrchestrator({ 
 *   memory: new RedisMachineMemory(redisClient) 
 * });
 * \`\`\`
 */
export const demoOrchestrator: EventHandlerFactory<{
  memory: IMachineMemory<Record<string, unknown>>;
}> = ({ memory }) =>
  createArvoOrchestrator({
    // Type-safe narrowing from generic Record to specific MachineMemoryRecord
    memory: memory as IMachineMemory<MachineMemoryRecord>,
    executionunits: 0,
    machines: [demoMachineV100],
  });



  
`,
    },
  ],
};
