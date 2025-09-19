import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { LearningTiles } from '../../../../components/LearningTiles';
import { ArvoEventLearn, EventRoutingAndBrokerInArvoLearn } from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';

export const ArvoEventDataFieldDeepDivePage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>ArvoEvent — Deep Dive</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                ArvoEvent, being a self-describing event, contains various key data fields which can be leveraged to
                perfrom advanced customizations
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-core/documents/ArvoEvent.html'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read Technical Documentation
              </a>
            </div>
          </div>
          <img
            alt='arvo event illustration'
            src='/arvo-event-image.png'
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
              # The Event Subject

              The \`subject\` field in \`ArvoEvent\` serves as a persistent workflow identifier 
              that remains constant across all events within a single workflow execution. 
              This unique identifier establishes the connection between related events, 
              enabling \`ArvoOrchestrator\` and \`ArvoResumable\` handlers to manage workflow state and 
              coordinate progression across distributed service boundaries.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              This implementation aligns conceptually with the [CloudEvents specification](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#subject), 
              which defines the \`subject\` field as an identifier of the event within the context of the source. 
              Since all workflow events originate from the same initiating source, subsequent events within that workflow
              maintain the same \`subject\` identifier, creating a logical grouping that spans the entire execution lifecycle. 
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Nested orchestration scenarios introduce additional complexity when \`ArvoOrchestrator\` or \`ArvoResumable\` 
              handlers invoke each other. In these cases, the nested orchestration generates a new subject since it 
              represents a distinct workflow context. However, the initiating event must carry the parent subject to 
              maintain hierarchical relationships. Arvo addresses this through the \`createArvoOrchestratorContract\` factory, 
              which automatically includes a standard \`parentSubject$$\` nullable string field, allowing developers to 
              preserve parent workflow context when initializing nested orchestrations. This pattern is detailed in 
              the [\`ArvoContract\` documentation](/learn/arvo-contract).
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Role in orchestrations

              \`ArvoOrchestrator\` and \`ArvoResumable\` are specialized event handlers designed to coordinate 
              complex workflows spanning multiple handlers. They achieve this coordination by maintaining either 
              state machines (typically using XState variants) that define workflow steps and transitions, or 
              imperative functions that manage workflow progression programmatically.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              When workflow-related events arrive, these handlers use the \`subject\` field as a key to retrieve 
              the current workflow state from a key-value store. They process the event according to their internal 
              logic, determine the next state and any required response events, then store the updated state back 
              to the key-value store using the same \`subject\` key. This cycle repeats for each incoming event, with
              the handlers consistently using the \`subject\` to access and update the correct workflow instance state.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              This design enables reliable management of multiple concurrent workflow instances in an operationally stateless
              manner i.e. after the current execution and event emission the orchestrator and stop and release all the resources. 
              Each instance progresses independently through its execution stages, with handlers accurately retrieving and updating 
              instance-specific state regardless of concurrent execution or different completion stages across workflow instances.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Event Sourcing & Reliability
              
              The consistent \`subject\` identifier across workflow events enables comprehensive auditing and event sourcing
              capabilities. By storing events with identical \`subjects\` chronologically ordered by their \`time\` field, systems
              can replay entire workflow histories to orchestrators or resumable handlers. This capability supports detailed 
              auditing and state reconstruction, allowing handlers to rebuild workflow state at any point in the execution lifecycle. 
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Event sourcing provides robust foundations for debugging since issues can be reproduced through event replay. 
              This replay capability enhances the state persistence functionality of orchestrators and can be leveraged 
              to add additional system reliability through recovery and reconstruction mechanisms.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Creating a \`subject\` in Arvo
              
              Recognising the potential of the \`subject\` field, the \`arvo-core\` package 
              introduces the \`ArvoOrchestrationSubject\` utility, which enables the creation of 
              information-rich and unique subject strings. For creation of subject strings in Arvo 
              it is recommended to use only this utility.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Despite its name suggesting an orchestrator-specific purpose, the \`ArvoOrchestrationSubject\` 
              can be employed for all \`ArvoEvent\` types, including simple events that invoke a single service.
              This utility becomes particularly crucial for events destined for \`ArvoOrchestrator\` event 
              handlers. While high-level utilities like \`createArvoOrchestratorEventFactory\` abstract away 
              the complexities of \`subject\` creation, understanding the underlying mechanics can empower you
              to craft more nuanced and information-rich event subjects.

              > **Good to know:** The easiest way to figure out which event is going to ArvoOrchestrator 
              > event handler is by look at the event type and seeing if the event type is prefixed with \`arvo.orc\`.
            `)}
          />
        </div>
      </ContentContainer>

      <Demo />

      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Anti-patterns in \`Subject\` Usage

              While the \`subject\` field represents a powerful mechanism for contextual 
              tracking in Arvo's event-driven architecture, its flexibility can also lead to 
              potential misuse that undermines system design principles. You must exercise 
              careful restraint to prevent the subject from becoming an unintended catch-all 
              for system metadata.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The primary anti-pattern to avoid is transforming the \`subject\` into a bloated 
              information container. Despite its seemingly flexible nature, the \`subject\` should 
              remain focused on its core purpose: providing a unique, consistent identifier for 
              tracking workflow progression. Overloading the \`subject\` with excessive metadata quickly 
              leads to decreased system readability, increased complexity, and potential performance 
              overhead.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              A strict architectural guideline emerges from this consideration i.e. metadata should be 
              kept minimal and purposeful. If absolutely necessary, limit additional metadata to no 
              more than three string fields. However, the preferred approach is to store complex contextual 
              information elsewhere in the system architecture. For extensive metadata requirements, 
              developers should leverage alternative strategies such as:

              - Storing detailed information in a dedicated data plane and referencing it through a compact key
              - Utilizing the data field for comprehensive contextual information
              - Employing dedicated metadata management services that can be referenced through lightweight identifiers

              By maintaining a disciplined approach to \`subject\` creation, architects can preserve the 
              clean, focused design that makes Arvo's event handling so powerful and maintainable. The \`subject\` 
              should remain a precise, lightweight mechanism for tracking event lineage, not a dumping ground 
              for system-wide contextual information.
            `)}
          />
        </div>
      </ContentContainer>

      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Distributed Tracing & System Observability

              System observability in distributed event-driven architectures presents unique challenges, 
              particularly in tracing events as they flow between multiple services. Arvo addresses this 
              challenge through native integration with OpenTelemetry, implementing distributed tracing 
              through two critical event extensions: 

              - \`traceparent\` 
              - \`tracestate\`

              The \`traceparent\` field carries the core OpenTelemetry context, including **trace ID, span ID, and trace flags**, 
              maintaining the connection between different spans as events traverse service boundaries. 
              Meanwhile, the \`tracestate\` field supports vendor-specific tracing information, allowing 
              organisations to include additional context while remaining compatible with the OpenTelemetry 
              specification. This implementation ensures that when an event leaves one handler and moves to 
              another, the tracing context seamlessly transfers, maintaining an unbroken chain of observability 
              across the entire system.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              In Arvo event handlers and related components leverage these trace contexts automatically, 
              creating new spans for each event processing operation while preserving the broader trace context. 
              When a handler receives an event, it extracts the \`traceparent\` and \`tracestate\` information 
              to create a child span, executing its business logic within this context. Upon completion, any 
              emitted events inherit this tracing context, ensuring that the entire event chain remains observable
              and debuggable.
            `)}
          />
        </div>
      </ContentContainer>

      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Event Routing Fields

              Arvo implements an elegant and powerful event routing system leveraging the self describing 
              \`ArvoEvent\` that facilitate message distribution while maintaining service independence. 
              At its core, the routing mechanism revolves around three fundamental \`ArvoEvent\` fields: \`to\`, 
              \`source\`, and \`redirectto\`. These fields work in concert to create a flexible yet predictable
              event routing system
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## The \`to\` Field: Primary Destination Address
              
              The \`to\` field serves as the primary addressing mechanism in Arvo's routing system. 
              It uses a reverse-DNS format (e.g., \`com.company.service\`) to identify destination services. 
              While the \`to\` field should often match an event's type, they can differ to support more 
              sophisticated routing scenarios.
            `)}
          />

          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## The \`source\` Field: Event Origin and Default Return Path
              
              The \`source\` field identifies where an event originated and typically 
              serves as the return address for responses. Every handler in Arvo has a unique source 
              identifier that serves two purposes:

              - As a receiving address when matching against incoming events' \`to\` fields
              - As the default \`to\` field for any events the handler emits

              This dual role creates clear event trails and enables automatic response routing. 
              You can access a handler's source through the \`handler.source\` property, as all Arvo handlers 
              inherit from \`AbstractArvoEventHandler\` and have a consistent interface.

              > The Arvo event handlers will automatically populate the event \`source\` field for all the events
              > them emit based on \`this.<handler>.source\`.
              
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## The \`redirectto\` Field: Alternative Response Routing
              
              The \`redirectto\` field enables more sophisticated routing patterns by specifying 
              an alternative destination for responses. This is particularly valuable in multi-step 
              workflows where responses should flow to a different service than the original sender. 
            `)}
          />
        </div>
      </ContentContainer>

      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Best Practices for Event Routing

              The most important principle is knowing when and how to use Arvo's specialized components for complex workflows.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Use The Orchestration Event Handlers
              
              The \`ArvoOrchestrator\` and \`ArvoResumable\` stands as Arvo's primary solution for
              managing complex event flows, but it's crucial to understand that it differs significantly 
              from traditional orchestrators. Unlike conventional orchestrators that actively direct 
              traffic and maintain complex state machines, the \`ArvoOrchestrator\` functions as just another
              event handler within your system - one with a specific focus on coordination. 
              It maintains its own bounded context and follows the same event-handling patterns as any other 
              service, but its specialised purpose is implementing state machines that coordinate complex workflows.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              When you use \`ArvoOrchestrator\` or \`ArvoResumable\`, you're not creating a central point of control that could 
              become a bottleneck. Instead, you're defining a state machine (via xstate) or an imperitive function that responds to 
              events and emits new events based on its current state. This approach maintains the distributed nature of 
              your system while providing the coordination benefits typically associated with orchestration. The orchestrator 
              becomes just another participant in your event-driven architecture, albeit one focused on managing process flow.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Maintain clear service boundaries

              Service boundaries play a crucial role in effective event routing. Each service should have 
              clearly defined responsibilities and operate within its bounded context. This clarity makes 
              routing decisions more straightforward and helps prevent the creation of tangled dependencies 
              between services. When designing your services, think carefully about their boundaries and 
              ensure they align with your business domains.
            `)}
          />
        </div>
      </ContentContainer>

      <ContentContainer content>
        <div className={`${Md3ContentPadding} pb-8!`}>
          <ReMark content={'# Related Topics'} />
        </div>
        <LearningTiles data={[ArvoEventLearn, EventRoutingAndBrokerInArvoLearn]} />
      </ContentContainer>
      <Separator padding={72} />
    </main>
  );
});
