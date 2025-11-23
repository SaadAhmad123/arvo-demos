import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  ArvoMachineLearn,
  ArvoMentalModelLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';
import { ExecutionDiagram } from './ExecutionDiagram';

export const ArvoOrchestratorPage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 xl:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
            <div className={`${Md3Cards.inner.content}`}>
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoOrchestratorLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                An execution engine that brings state machines to life in Arvo's event-driven ecosystem
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoOrchestrator.html'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read Technical Documentation
              </a>
            </div>
          </div>
          <img
            alt='arvo orchestrator illustration'
            src='/arvo-orchestrator.png'
            className='rounded-3xl object-cover lg:h-full'
          />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The \`ArvoMachine\` is a declarative piece of code which defines how the workflow 
              looks and what it should do—but it needs an execution engine that can take this 
              definition and act on it in an Arvo-compliant, event-driven format. 
              That execution engine is \`ArvoOrchestrator\`. It's a sophisticated runtime that 
              transforms declarative state machine definitions into production-ready, Arvo-compliant, 
              event-driven orchestrations. By bridging the gap between your workflow logic and the distributed 
              infrastructure underneath, it handles all operational complexity—event routing, state 
              persistence, version management, and error handling—so your workflow logic stays clean
              and declarative.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <Demo />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              > Note: The following documentation is designed for production deployments or scaling requirements. These 
              > concepts are essential for reliability engineering but unnecessary for initial exploration. If you're learning Arvo, 
              > feel free to skip to [the next topic](${ArvoResumableLearn.link}), which covers imperative orchestration using familiar 
              > async/await patterns. Return here when you're ready to optimize for deployment, fault tolerance, or state persistence 
              > in databases.

              <br/>
              <br/>

              # The Lifecycle

              When an event arrives at the \`ArvoOrchestrator\`, it first determines whether the event is 
              relevant by examining its type and subject. The event's \`subject\` field acts as a unique 
              identifier that remains constant across all events belonging to the same workflow instance, 
              following the CNCF CloudEvents specification. For relevant events, the orchestrator attempts 
              to acquire an exclusive lock on the workflow state stored in the memory backend as a key-value pair, 
              where the event's \`subject\` serves as the key. This locking mechanism prevents multiple 
              instances from processing the same workflow simultaneously, ensuring consistency in distributed 
              environments.

              Once the lock is successfully acquired, the orchestrator reads the stored state to determine 
              how to proceed. If no state exists, the event is treated as an initialization request and 
              validated against the \`init\` schema defined in the bound \`ArvoOrchestratorContract\`. Invalid 
              initialization events are ignored without further processing. For valid events, the orchestrator 
              extracts the appropriate machine version from the event's \`dataschema\` or \`subject\` (which is a 
              encoded unique string) field and begins execution. When state already exists, the orchestrator 
              enters resume mode, validating the incoming event as a legitimate resumption trigger before loading 
              the machine version encoded in the \`subject\` and continuing execution from where the workflow 
              previously stopped.

              After the state machine processes the event and produces output events, the orchestrator 
              constructs properly formatted events for emission. Events destined for parent orchestrations 
              use the initiating event's \`parentSubject$$\` field as their \`subject\` string, ensuring 
              they route correctly to the parent workflow. This \`parentSubject$$\` is stored in the 
              orchestration context via the memory backend so that it is persisted across event executions. 
              System error events follow the same routing pattern. All other events receive the current 
              orchestration's subject before being returned for emission, and the updated state is persisted 
              to the memory backend. When the next event arrives for this workflow instance, the entire process 
              repeats, creating a continuous cycle of event reception, state machine execution, and state 
              persistence that enables long-running workflows to progress incrementally across distributed 
              infrastructure without maintaining persistent execution contexts between events.

              The complete execution lifecycle is illustrated in the following sequence diagram, which details 
              every phase from event reception through state persistence and cleanup.

              > **Pro Tip:** Copy the diagram definition and paste it into any AI assistant to explore specific scenarios 
               interactively. Ask questions like "What happens during lock contention?", "How are child orchestrations initialized?", 
               or "When do system error events get created?" to understand execution paths without manually tracing the entire flow.

              <br/>
              <br/>

              \`\`\`mermaid
              ${ExecutionDiagram}
              \`\`\`
              
              <br/>
              <br/>

              # The Memory Backend

              Arvo's execution model for orchestrations (state machine based and imperative) is operationally 
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
            
            
            `)}
          />
          <Separator padding={32} />
          <ReMark
            content={`
\`\`\`typescript
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
\`\`\`
              `}
          />
          <Separator padding={32} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Error Handling Strategies

              The \`ArvoOrchestrator\` implements a sophisticated multi-layered error handling strategy that 
              distinguishes between different types of failures and their appropriate handling mechanisms. The 
              orchestrator manages two distinct categories of errors. **Violation errors** indicate fundamental 
              problems with system configuration, contract compliance, lock acquisition, or state management 
              operations that require external intervention. **Non-violation errors** represent operational 
              failures during execution that become part of the workflow as system error events. 
              
              This comprehensive approach ensures that each error type receives appropriate treatment. Violations throw exceptions for
              infrastructure handling, while non-violation errors generate system error events that flow through the 
              workflow and enable orchestrators to implement fallback behaviors and compensating transactions. Arvo 
              handles default error behavior automatically while maintaining extensibility for implementing custom 
              error handling patterns tailored to your specific requirements.

              ## Violation Errors

              Violation errors indicate fundamental problems with orchestration configuration, subject validation, 
              contract compliance, or state consistency. These errors throw exceptions that must be handled by 
              infrastructure outside Arvo—typically through monitoring systems, dead letter queues, or administrative
              intervention.

              <br/>

              | When It Occurs | Error Type |
              |---------------|------------|
              | Lock acquisition fails (concurrent execution detected). Another execution instance has already acquired the lock for this orchestration instance. | \`TransactionViolation\` |
              | State read operation fails. Unable to retrieve orchestration state from the persistence layer. | \`TransactionViolation\` |
              | State write/persistence operation fails. Unable to save orchestration state to the persistence layer. | \`TransactionViolation\` |
              | Machine resolution fails to find appropriate state machine. No machine registered for the incoming event type or context. | \`ConfigViolation\` |
              | Contract resolution fails during input validation. Unable to resolve contract for validating the incoming event. | \`ConfigViolation\` |
              | Event payload fails input schema validation. Incoming event data doesn't conform to the machine's contract schema. | \`ContractViolation\` |
              | Event data fails schema validation during event creation. Emitted event data doesn't conform to the target contract's schema. | \`ContractViolation\` |
              | Invalid \`parentSubject$$\` provided for child orchestration. The \`parentSubject$$\` field fails \`ArvoOrchestrationSubject\` validation. | \`ExecutionViolation\` |
              | Subject creation fails during event processing. Unable to create valid \`ArvoOrchestrationSubject\` for child orchestration. | \`ExecutionViolation\` |

              <br/>

              ## Execution Errors

              Execution errors occur when machines encounter operational failures during state machine execution. Unlike violations, 
              these errors are converted into **system error events** (\`sys.<source>.error\`) that flow through the event-driven 
              architecture as part of the orchestration workflow. This enables parent orchestrators and handlers to process failures as business events.

              <br/>

              | When It Occurs | Result |
              |---------------|--------|
              | State machine throws any non-violation error (business logic failures, external service errors, etc.) | System error events are generated with failure state persisted. Events route to the orchestration initiator with parent subject context |
              | Machine execution encounters unexpected exception | Orchestration state marked as \`failure\`, system error events created and emitted to initiator |

              <br/>

              ## Error Handling Flow

              When a **violation error** occurs, execution terminates immediately. The error is thrown as an exception after releasing 
              any acquired locks and ending the telemetry span. Infrastructure outside Arvo must handle these exceptions through retry 
              mechanisms, dead letter queues, or monitoring and alerting systems. Orchestration state is not persisted in these cases.

              When a **non-violation execution error** occurs, the orchestrator catches the error and persists a failure state to prevent 
              further processing of that orchestration instance. System error events are created and routed to the orchestration initiator, 
              enabling parent orchestrators to handle failures as part of the workflow logic. The lock is released, the span is ended, 
              and the error events are returned as normal output for downstream processing.

              ### Special Cases

              When an event's orchestration subject doesn't match the expected orchestrator, execution completes silently without errors. 
              The span logs a warning about the mismatch, but no exception is thrown. The orchestrator returns an empty events array, 
              allowing unrelated events to be safely ignored. This behavior follows the tolerant reader pattern, ensuring that misrouted 
              or unrelated events don't impact orchestrator execution.

              Once an orchestration reaches failure status, all subsequent events for that orchestration instance return empty event 
              arrays. The span is marked with ERROR status, and no further state mutations occur. Failed orchestrations require administrative 
              intervention to reset or clean up, as the system will not automatically process events for failed instances.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding}`}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Learn More

              Continue exploring additional concepts to deepen your understanding of Arvo and 
              its ecosystem.
            `)}
          />
        </div>
      </ContentContainer>
      <PageNavigation
        previous={{
          heading: ArvoMachineLearn.name,
          link: ArvoMachineLearn.link,
          content: ArvoMachineLearn.summary,
        }}
        next={{
          heading: ArvoResumableLearn.name,
          link: ArvoResumableLearn.link,
          content: ArvoResumableLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
