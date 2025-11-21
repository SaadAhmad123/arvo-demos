import { ArvoMentalModelLearn } from '../../../../../../components/LearningTiles/data';
import { cleanString } from '../../../../../../utils';
import type { DemoCodePanel } from '../../../../../types';

export const MachineMemoryInterface: DemoCodePanel = {
  singlePanel: true,
  heading: 'The Memory Backend',
  description: cleanString(`
    Arvo's execution model for orchestrations (state machine based and imperative) is executionally 
    stateless with a start-stop pattern but logically stateful. This enables the [virtual orchestration 
    paradigm](${ArvoMentalModelLearn.link}) in Arvo. One of the bedrocks of this architecture
    is the memory backend which stores the 
    effective state of the orchestration. The effective state differs from the concept of a checkpoint 
    because this is not an execution state—rather it's just enough state data the orchestrator needs 
    to resume from where it stopped. It's a logical checkpoint.

    The [\`IMachineMemory\`](https://saadahmad123.github.io/arvo-event-handler/interfaces/index.IMachineMemory.html) 
    interface provides the contract for implementing this memory backend. It manages 
    state persistence and execution coordination for both \`ArvoOrchestrator\` and \`ArvoResumable\`, 
    implementing an optimistic locking strategy with a "fail fast on acquire, be tolerant on release" 
    philosophy. This interface abstracts storage concerns, enabling orchestrators to process events, 
    persist workflow state, release all resources, and resume later when new events arrive—consuming 
    zero resources between events.

    Arvo provides \`SimpleMachineMemory\` as an in-memory reference implementation for local development 
    and testing. For production deployments requiring durability, horizontal scalability, or distributed 
    coordination, implementation teams must provide their own backend tailored to their infrastructure 
    and application needs, meeting the interface contract.

    ## Core Operations

    - **\`read(id: string): Promise<T | null>\`** — Loads the workflow's saved state so it can continue 
    from where it left off. Returns \`null\` when starting a brand new workflow. If the storage system 
    has problems, it tries a few times (2-3 attempts over about a second) before throwing an error.

    - **\`write(id: string, data: T, prevData: T | null): Promise<void>\`** — Saves the workflow's 
    current state. The \`prevData\` parameter provides the previous state as additional context—useful 
    for implementing more sophisticated storage strategies like compare-and-swap or audit trails, though 
    the primary protection against concurrent updates comes from the locking mechanism.

    - **\`lock(id: string): Promise<boolean>\`** — Gets exclusive permission to work on an orchestration state, 
    preventing two instances from processing the same workflow simultaneously. Returns \`false\` if 
    another instance is already working on it. Should try getting the lock a few times before returning \`false\`.

    - **\`unlock(id: string): Promise<boolean>\`** — Releases the orchestration state so other instances can work 
    on it. If releasing fails, it's okay—**locks must automatically expire by implementing a TTL** after a set time 
    (typically 30 seconds to 5 minutes) to ensure workflows don't get permanently stuck if something 
    crashes or the network fails.

    ## Design Philosophy

    The interface implements **optimistic locking with asymmetric error tolerance**—strict when acquiring 
    resources, pragmatic when releasing them. This reflects Arvo's event-driven nature where workflows remain 
    dormant between events, making pessimistic locking impractical for long-running processes like human 
    approvals or batch operations.

    **Fail Fast on Acquire, Be Tolerant on Release** — Lock acquisition fails quickly after reasonable retries 
    to prevent duplicate execution and maintain consistency. Lock release tolerates failures because TTL-based 
    expiry provides automatic recovery, preventing transient network issues or infrastructure hiccups from 
    cascading into workflow failures. On lock acquisition failure, the orchestrator throws a \`TransactionViolation\` 
    error which can then be captured and either put into a retry queue or dead-letter queue based on your 
    implementation needs or it can just fail.

    **TTL as Safety Mechanism** — Lock expiry prevents permanent deadlocks from crashes, network partitions, 
    or failed unlock operations. Locks automatically release after configured lifetimes (tuned to workflow 
    execution patterns), transforming potential permanent blocks into temporary delays. If an orchestrator 
    crashes while holding a lock, the workflow pauses for the TTL duration but eventually resumes when another 
    instance acquires the expired lock.

    ## Implementation Strategy

    The pluggable architecture ensures orchestration logic remains portable across infrastructure choices. The 
    same orchestrator code runs locally with \`SimpleMachineMemory\` during development, then deploys to production 
    with distributed storage—no code changes required. Teams optimize storage for their operational requirements 
    while orchestrators remain infrastructure-agnostic.

    This separation enables gradual infrastructure evolution (start simple with in-memory storage, add distributed 
    backends as needed), multi-region flexibility with different backends per region, and testing strategies that 
    use \`SimpleMachineMemory\` locally while production uses persistent distributed stores.
  `),
  tabs: [
    {
      title: 'interface.ts',
      lang: 'ts',
      code: `
// // Already available in 'arvo-event-handler'
// export interface IMachineMemory<T extends Record<string, any>> {
//   read(id: string): Promise<T | null>;
//   write(id: string, data: T, prevData: T | null): Promise<void>;
//   lock(id: string): Promise<boolean>;
//   unlock(id: string): Promise<boolean>;
// }

import { IMachineMemory, SimpleMachineMemory } from 'arvo-event-handler';


// Arvo provides in-memory implementation for local development
const memory: IMachineMemory<Record<string, unknown>> = new SimpleMachineMemory();

// Production: implement custom backend based on your infrastructure
export class RedisMachineMemory implements IMachineMemory<Record<string, unknown>> {
  async read(id: string): Promise<Record<string, unknown> | null> {
    // Implement Redis GET with retry logic
  }
  
  async write(id: string, data: Record<string, unknown>, prevData: Record<string, unknown> | null): Promise<void> {
    // Implement Redis SET with compare-and-swap if needed
  }
  
  async lock(id: string): Promise<boolean> {
    // Implement Redis SETNX with TTL for distributed locking
  }
  
  async unlock(id: string): Promise<boolean> {
    // Implement Redis DEL to release lock
  }
}

export class PostgresMachineMemory implements IMachineMemory<Record<string, unknown>> {
  // ... PostgreSQL implementation using JSONB columns and advisory locks
}

export class DynamoDBMachineMemory implements IMachineMemory<Record<string, unknown>> {
  // ... DynamoDB implementation using conditional writes and TTL attributes
}
    `,
    },
  ],
};
