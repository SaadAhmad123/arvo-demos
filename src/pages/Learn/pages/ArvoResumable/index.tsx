import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  AdvancedLearnPattern,
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

export const ArvoResumablePage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.medium} text-on-surface`}>{ArvoResumableLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Imperative orchestration for dynamic workflows that need runtime decisions, not state charts.
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoResumable.html'
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
            src='/arvo-resumable.png'
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
              The event-driven paradigm excels when different handlers collaborate to deliver 
              sophisticated functionality. Arvo provides robust orchestration through 
              [\`ArvoMachine\`](${ArvoMachineLearn.link}) and [\`ArvoOrchestrator\`](${ArvoOrchestratorLearn.link}), 
              leveraging virtual orchestration concepts discussed in 
              [${ArvoMentalModelLearn.name}](${ArvoMentalModelLearn.link}) to deliver flexibility 
              and control in your applications.

              However, state charts fall short in specific scenarios:
              
              - **State explosion** - workflows with numerous conditional branches and decision points 
              create bloated, unmaintainable state definitions where the number of required states 
              grows exponentially with each new condition
              - **Complex looping logic** - iterative processes that require dynamic loop conditions, 
              variable iteration counts, or nested loops produce convoluted state charts with 
              artificial counter states and complex transition guards
              - **Runtime-dependent workflows** - orchestrations where the next step fundamentally 
              depends on accumulated execution state and incoming event data cannot be predetermined 
              at design time, such as agentic AI coordinators that dynamically adapt their behavior 
              based on LLM responses, tool execution results, and environmental feedback

              For these scenarios, Arvo provides \`ArvoResumable\`, a complementary virtual orchestrator 
              that lets you express coordination logic as imperative TypeScript code with full access to 
              async operations, API calls, and business logic. The handler executes completely—performing 
              any necessary computations, external calls, or data transformations—then returns the updated 
              state and events to emit before terminating. The workflow consumes zero resources between 
              executions, resuming only when the next event arrives. This dual approach, with declarative state 
              machines for well-defined workflows and imperative handlers for dynamic orchestrations, makes Arvo 
              a complete event-driven paradigm capable of orchestrating any complexity without architectural 
              compromises.

              <br/>
              <br/>

              # Getting Started

              The \`ArvoResumable\` is a superset of \`ArvoMachine\` and \`ArvoOrchestrator\`. It 
              handles everything state machines can do, plus dynamic workflows where the execution 
              path depends on conditions that can't be predetermined at design time.

              
              This tutorial builds on the examples from 
              [${ArvoMachineLearn.name}](${ArvoMachineLearn.link}), reusing the product and addition 
              services as well as the human approval contract you've already seen. It adds 
              a weighted average calculator that demonstrates ArvoResumable's key capabilities. The 
              calculation itself is trivial and would never require this level of orchestration 
              in production. It is purely used as a teaching example to explore patterns without 
              getting lost in complex business logic. In real systems, always follow the simplest path 
              that solves your problem.


              **In the following content, you will learn:**

              - **Dynamic parallelism**: Emit N events based on runtime input. If you have 
              3 items, you emit 3 events. With 100 items, you emit 100 events. The workflow 
              adapts automatically.
              - **Human in the loop**: Request approval from a human, suspend the orchestration 
              completely (consuming zero resources), then resume execution when the approval 
              is granted.
              - **Event aggregation**: Coordinate parallel operations by waiting until all expected 
              responses arrive before proceeding to the next step.
              - **Start-stop execution**: None of the orchestrators across Arvo run continuously. The executes, 
              emits events, persists state, and terminates. When responses arrive, they loads
              state and resumes exactly where it left off.
              - **Multi-step coordination**: Chain together sequential operations (approval, 
              calculation, aggregation, averaging) while preserving state between each phase.

              These patterns form the foundation of complex workflows involving AI agents, 
              external services, human interactions, and business logic working together.
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
              # Lock Duration and the Collect-Before-Process Pattern

              When \`ArvoResumable\` eventually get deployed and executes in distributed environments, it 
              acquires an optimistic lock to ensure consistent state during event processing. This lock is 
              held from the moment your handler begins execution until state is persisted. Operations 
              with high or unpredictable latency like external API requests, very complex database queries, or complex 
              computations can hold this lock for extended periods, causing other events for the same workflow to queue up, 
              timeout, and fail.

              Consider a workflow where each service response triggers an immediate expensive computation. 
              If that computation takes 15 seconds and you have three services executing in parallel, each 
              result holds the lock for those 15 seconds. The second service result arrives while the first 
              computation is still processing and must wait. The third result waits even longer. This creates 
              cascading delays where events timeout waiting for the lock, triggering retries that further 
              increase contention. The operational complexity becomes significant as you need sophisticated 
              retry logic, timeout tuning, and monitoring to handle these failures.

              The weighted average example demonstrates Arvo's recommended pattern by collecting all 
              required data through fast operations before performing expensive processing. When a product 
              calculation completes, the handler simply checks if all results have arrived. This check 
              takes milliseconds. The lock is acquired, the event is registered in the collected events 
              map, and the lock is immediately released. The handler returns nothing, entering the implicit 
              wait state. Only when the final product result arrives and the handler detects all data is 
              ready does it proceed to the aggregation step. At this point no more events are expected, 
              so performing the expensive addition and averaging calculations holds the lock without risk 
              of contention.

              This collect-before-process approach transforms lock hold times from potentially tens of 
              seconds per event to mere milliseconds for data collection, with expensive operations only 
              executing once all required data is available. The result is dramatically reduced operational 
              complexity, improved throughput across your distributed system, and elimination of timeout 
              related failures that would otherwise require complex retry mechanisms.

              <br/>
              <br/>

              # Internal Architecture

              \`ArvoResumable\` shares the same foundational architecture as \`ArvoOrchestrator\`—both use 
              identical memory backends, event handling strategies, and lifecycle management. The key 
              difference lies in how they execute handler logic. While ArvoOrchestrator runs declarative 
              state machines, ArvoResumable executes imperative async functions directly.

              For comprehensive details on memory management, event lifecycle, distributed locking, and 
              observability patterns, see the [${ArvoOrchestratorLearn.name}](${ArvoOrchestratorLearn.link}) 
              documentation. These concepts apply identically to both orchestration approaches.

              ### Execution Flow

              The diagram below illustrates ArvoResumable's internal execution model, showing how events 
              trigger handler execution, state persistence, and service emission in the start-stop pattern:
              
              <br/>
              <br/>

              \`\`\`mermaid
              ${ExecutionDiagram}
              \`\`\`

              <br/>
              <br/>

              **Key Differences from ArvoOrchestrator:**

              - **Handler Resolution**: \`ArvoOrchestrator\` resolves XState machine transitions; \`ArvoResumable\` 
                executes your async function directly
              - **State Management**: \`ArvoOrchestrator\` maintains machine state internally; \`ArvoResumable\` 
                persists whatever context object you return
              - **Execution Model**: Both start-stop, but \`ArvoResumable\` gives you explicit control over 
                what happens at each resume point

              Everything else—memory persistence, distributed locking, event validation, telemetry, error 
              boundaries—works identically between the two orchestration primitives.
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
          heading: ArvoOrchestratorLearn.name,
          link: ArvoOrchestratorLearn.link,
          content: ArvoOrchestratorLearn.summary,
        }}
        next={{
          link: AdvancedLearnPattern.link,
          heading: AdvancedLearnPattern.name,
          content: AdvancedLearnPattern.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
