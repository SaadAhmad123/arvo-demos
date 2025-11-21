import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { ArvoMachineLearn, ArvoOrchestratorLearn, ArvoResumableLearn } from '../../../../components/LearningTiles/data';
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
                he execution engine that brings state machines to life in Arvo's event-driven ecosystem
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
              The \`ArvoOrchestrator\` is the execution engine that powers Arvo's workflow 
              system. It's a sophisticated runtime that transforms declarative state machine 
              definitions into production-ready, event-driven orchestrations. By bridging the 
              gap between your workflow logic and the distributed infrastructure underneath, it 
              handles all the operational complexity so you can focus on building reliable
              workflows. It handles event routing and management, state persistence, state machine 
              version management, and state machine execution error handling so your workflow 
              logic stays clean and declarative.
            `)}
          />
        </div>
      </ContentContainer>
      <Demo />
      <ContentContainer content>
        <div className={`${Md3ContentPadding} pt-0!`}>
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

              <br/>

              # Execution Flow

              The \`ArvoOrchestrator\` orchestrates complex, stateful workflows by managing state machines, enforcing contracts, 
              coordinating distributed locks, and maintaining execution context across multiple services. The sequence diagram 
              below maps the complete execution journey—from initial event reception and subject validation through state machine 
              execution, event creation, and state persistence. Use this diagram to understand how orchestrators handle concurrent 
              executions, propagate parent-child relationships, manage failure states, and route events across your distributed 
              system. Whether you're designing new orchestration patterns or debugging production workflows, this visualization 
              reveals the critical checkpoints where validation occurs, errors are caught, and state transitions happen.

              > **Pro Tip:** Copy the diagram definition and paste it into any AI assistant to explore specific scenarios 
               interactively. Ask questions like "What happens during lock contention?", "How are child orchestrations initialized?", 
               or "When do system error events get created?" to understand execution paths without manually tracing the entire flow.

              <br/>
              <br/>

              \`\`\`mermaid
              ${ExecutionDiagram}
              \`\`\`

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
