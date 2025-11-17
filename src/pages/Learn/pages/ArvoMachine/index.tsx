import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  ArvoEventHandlerLearn,
  ArvoMachineLearn,
  ArvoMentalModelLearn,
  ArvoOrchestratorLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';

export const ArvoMachinePage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoMachineLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Declarative state machine definition for orchestrating event-driven multi-step workflows
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoMachine__Core_Components_and_Event_Emission.html'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read Technical Documentation
              </a>
            </div>
          </div>
          <img
            alt='arvo event factory illustration'
            src='/ArvoMachineImage.png'
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
              Complex workflows require multiple event handlers to coordinate their efforts 
              effectively. These handlers must also interact with external systems—whether 
              receiving human input, integrating with third-party services, or managing 
              long-running processes. The event-driven paradigm naturally maps to these 
              coordination challenges, and Arvo provides the mechanisms and tools to harness 
              this paradigm for managing complexity.

              ### Virtual Orchestrations
              
              Arvo implements a choreographed mesh of event handlers at the infrastructure 
              layer. Building upon this foundation, the application layer enables sophisticated 
              handler coordination through virtual orchestrations—coordination logic that reacts 
              to and emits events based on encoded business rules, without directly controlling 
              the handlers themselves. This architectural pattern is explored in depth in the 
              [mental model documentation](${ArvoMentalModelLearn.link}).

              ### Dual Orchestration Models

              To ensure orchestration paradigm completeness, Arvo provides two complementary 
              approaches to virtual orchestration:

              - **ArvoResumable** handlers execute imperative code to define workflows through 
                procedural logic and control flow
              - **ArvoOrchestrator** handlers execute state machines to define workflows through 
                declarative state transitions

              This documentation explores state machine declarations using \`ArvoMachine\`, which 
              are executed by \`ArvoOrchestrator\` in an event-driven compliant manner. State 
              machines excel when workflows have well-defined states and transitions, enabling 
              visualization, formal verification, and explicit workflow logic that's accessible 
              to both technical and non-technical stakeholders.

              <br/>
              <br/>

              # ArvoMachine - Declarative State Machine Definition

              \`ArvoMachine\` is Arvo's declarative state machine definition layer built on XState. 
              It provides a TypeScript-native way to define workflow states, transitions, and event 
              emissions without implementing execution logic. Think of \`ArvoMachine\` as the 
              **blueprint** of your workflow—it declares what states exist, how they transition, 
              and what events to emit, but doesn't handle the actual event processing.

              State machines provide a fundamentally different approach to workflow definition 
              compared to execution graphs. Rather than specifying tasks, state machines 
              model the discrete states a system occupies and the transitions between them. This 
              state-centric perspective aligns naturally with event-driven architectures—a system 
              resides in a particular state, reacts to incoming events, and transitions to new states 
              accordingly.

              The state machine orchestration in Arvo follows a clear separation of concerns:

              - **ArvoMachine** declares the state machine definition using XState syntax extended 
                with Arvo-specific event emission capabilities. It defines states, transitions, guards, 
                and actions in a purely declarative manner.
              - **ArvoOrchestrator** serves as the event-driven execution runtime that brings 
                ArvoMachine definitions to life. It handles incoming Arvo events, translates them 
                into XState-compliant format, executes the state machine using XState's engine, 
                captures emitted events, and converts them back to Arvo events for distribution.

              This separation means \`ArvoMachine\` focuses solely on workflow logic—"what should 
              happen"—while \`ArvoOrchestrator\` manages the operational concerns—"how to make it 
              happen in an event-driven system." The machine definition remains pure and testable, 
              independent of event infrastructure.

              ## Why State Machines for Event-Driven Systems?

              The state machine model offers critical advantages for distributed systems. Between 
              events, the machine requires no active execution context—the current state is simply 
              a data point represented as JSON. When an event arrives, any \`ArvoOrchestrator\` 
              instance can load this state, execute the machine definition, and determine the 
              appropriate response. This stateless execution model enables the durable state 
              execution pattern central to Arvo's orchestration capabilities.

              \`ArvoMachine\`, leveraging XState's foundation, enables event emission during state 
              transitions. When the machine transitions between states or enters 
              a new state, it can declare events to emit for coordinating with other handlers. 
              Subsequent transitions can be defined based on expected response events from those 
              handlers, creating a declarative coordination model where workflow logic is expressed 
              purely as states, transitions, and event emissions.

              ## XState Foundation

              State machines and statecharts benefit from an established open standard: 
              [SCXML (State Chart XML)](https://www.w3.org/TR/scxml/), a W3C specification for 
              state machine representation. This standardization enables portable, well-defined 
              state machine implementations across platforms and tools.

              [XState](https://stately.ai/docs/xstate) provides a mature, production-ready SCXML 
              implementation for the JavaScript/TypeScript ecosystem. \`ArvoMachine\` leverages 
              XState's powerful state machine definition language and execution engine, providing 
              access to XState's robust tooling, visualization capabilities, and battle-tested 
              state machine semantics.

              > **Important**: This documentation focuses on how \`ArvoMachine\` integrates XState 
              into Arvo's event-driven paradigm. For comprehensive information about XState concepts, 
              syntax, guards, actions, and state machine patterns, please refer to the 
              [XState documentation](https://stately.ai/docs/xstate).

              ### Synchronous Subset and Design Constraints

              \`ArvoMachine\` implements a synchronous subset of XState's capabilities, deliberately 
              excluding asynchronous operations such as invoked services, actors, spawned processes, 
              and promise-based actions. This constraint ensures machine definitions remain free of 
              side effects and maintain predictable, deterministic behavior.

              The restriction doesn't limit expressive power—asynchronous coordination happens through 
              declarative event emission to other handlers. The state machine focuses purely on state 
              management, transition logic, and determining what events to emit. The actual asynchronous 
              event handling, delivery, and response collection is managed by \`ArvoOrchestrator\`, 
              maintaining a clean separation of concerns.

              This design creates a clear architecture in Arvo, where:
              - \`ArvoMachine\` handles declarative state machine definitions
              - \`ArvoOrchestrator\` provides event-driven execution runtime for those definitions
              - \`ArvoResumable\` addresses imperative asynchronous workflows

              These three components work together to provide complete orchestration capabilities 
              while maintaining conceptual clarity and operational simplicity.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <Demo />
      <Separator padding={18} />
      <Separator padding={18} />
      <ContentContainer content>
        <div className={`${Md3ContentPadding} py-0!`}>
          <a href='/state-machine-viz.png' target='_blank' rel='noreferrer'>
            <img alt='Demo state machine visualization' src='/state-machine-viz.png' className='rounded-3xl shadow' />
          </a>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              > **Note:** This is a screenshot of the state machine visualization using the [XState VSCode extension](https://stately.ai/docs/xstate-vscode-extension).

              The State Machine in Arvo represents a powerful paradigm for managing complex, multi-step 
              workflows in event-driven systems. By combining XState's mature state machine implementation 
              with Arvo's event-driven architecture, \`ArvoMachine\` provides a declarative approach to 
              workflow orchestration that is both visualizable and formally verifiable.

              This architectural pattern excels in scenarios requiring well-defined states and 
              transitions, enabling developers to express complex coordination logic through pure, 
              testable state definitions rather than imperative code. The clear separation between 
              \`ArvoMachine\` (declarative workflow definition) and \`ArvoOrchestrator\` (event-driven 
              execution runtime) ensures that workflow logic remains independent of infrastructure 
              concerns, while the synchronous subset design maintains predictability and determinism.

              Whether coordinating human-in-the-loop processes, orchestrating parallel service calls, 
              or managing long-running asynchronous workflows and much more, Arvo's state machine implementation 
              provides the tools needed to build robust and scalable workflows. The framework's comprehensive 
              testing capabilities—from isolated unit tests to full integration testing—combined with 
              contract-driven type safety, ensure that complex workflows can be developed with confidence 
              and maintained with clarity. As demonstrated in this tutorial, even deceptively simple workflows 
              reveal sophisticated patterns that scale to production-grade distributed systems, making the 
              state machine approach an essential tool in the Arvo ecosystem for building reliable, event-driven 
              applications.

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
          heading: ArvoEventHandlerLearn.name,
          link: ArvoEventHandlerLearn.link,
          content: ArvoEventHandlerLearn.summary,
        }}
        next={{
          heading: ArvoOrchestratorLearn.name,
          link: ArvoOrchestratorLearn.link,
          content: ArvoOrchestratorLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
