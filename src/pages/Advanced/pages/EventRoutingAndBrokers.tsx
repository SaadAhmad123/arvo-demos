import { cleanString } from 'arvo-core';
import { Md3ContentPadding } from '../../../classNames';
import { ContentContainer } from '../../../components/ContentContainer';
import { withNavBar } from '../../../components/Navbar/withNavBar';
import { ReMark } from '../../../components/ReMark';
import { Separator } from '../../../components/Separator';
import { LearningTiles } from '../../../components/LearningTiles';
import { ArvoContractLearn, ArvoEventHandlerLearn, ArvoEventLearn } from '../../../components/LearningTiles/data';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';

export const EventRoutingAndBrokersPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>Broker Design in Arvo</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Self-describing events, created by intelligent event handlers, route themselves through lightweight
                brokers using deterministic algorithms.
              </p>
            </div>
          </div>
          <img
            alt='arvo event illustration'
            src='/broker-design-image.png'
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
              Arvo fundamentally reimagines how event-driven systems handle routing and coordination by shifting
              intelligence from the broker to the events and event handlers themselves. Traditional event architectures
              create bottlenecks by centralizing routing logic within brokers or orchestrators, forcing these
              components to understand business context and manage complex state. When these central points fail or
              reach capacity limits, entire systems become unavailable. This coupling between infrastructure and 
              business logic also makes systems harder to evolve as requirements change.
            `)}
          />
          <Separator padding={18} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Self Describing Event

              Arvo leverages \`ArvoEvent\` as the fundamental unit of communication between event handlers. 
              These events are engineered to carry comprehensive routing and context information within their 
              structure, enabling both the event broker and recipient handlers to determine proper destinations 
              and subsequent actions without external configuration. The \`to\` field contains the destination 
              handler's identifier (\`handler.source\`), providing the event broker with complete information 
              needed for accurate routing. 

              > **Note:** This design puts a requirement of the architecture that during system initialization (or at some stage), 
              > all handlers register their unique identifiers (\`handler.source\`) with the broker, which must support filtering
              > and delivery capabilities based on these identifiers.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Beyond the \`to\` field, Arvo event handlers require additional metadata to determine the routing 
              of resultant events. Handlers leverage their bound \`ArvoContract\` along with event fields including
              \`subject\`, \`redirectto\`, and \`source\` to calculate next destinations through deterministic algorithms. 
              Each handler type—\`ArvoEventHandler\`, \`ArvoOrchestrator\`, and \`ArvoResumable\`—implements specific routing
              logic (appropriate for its scope) internally while providing mechanisms for custom routing behavior when needed. 
              These algorithms are detailed in each handler's respective documentation, though typical usage scenarios
              rarely require direct interaction with this routing logic.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Arvo's distributed-first architecture includes native OpenTelemetry integration for comprehensive
              observability. Distributed tracing information travels within each \`ArvoEvent\` through the 
              \`traceparent\` and \`tracestate\` fields, enabling handlers to maintain telemetry continuity 
              and establish proper trace relationships with parent executions. This embedded tracing context 
              ensures that OpenTelemetry observability functions correctly regardless of deployment patterns, 
              infrastructure choices, or distribution of services.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} px-0!`}>
          <a href='/arvo-basic-concept-architecture.png' target='_blank' rel='noreferrer'>
            <img
              alt='Basic Arvo Architecture Diagram'
              src='/arvo-basic-concept-architecture.png'
              className='rounded-3xl shadow'
            />
          </a>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Centralized Event Broker

              Arvo employs a **centralized event broker** architecture that requires only a single topic to function effectively. 
              While the system can scale to multiple topics, brokers, or environments, its fundamental design operates through one 
              shared communication channel. All event handlers subscribe to this topic and listen for events. When the broker 
              encounters an event, it routes it to the appropriate handler by matching \`event.to\` with \`handler.source\`. Handlers
              process events and emit responses back to the same topic, creating a continuous flow of event-driven communication.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              This architecture supports advanced patterns through the [\`event.domain\`](/advanced/arvo-event-data-field-deep-dive) field, which enables broadcasting events across 
              different topics, brokers, or environments. These patterns provide flexibility for complex enterprise scenarios while
              maintaining the simplicity of the core routing mechanism. Further details on these advanced patterns are covered in 
              subsequent sections.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The broker-centric model eliminates direct service-to-service dependencies. Each service evolves independently within 
              its bounded context, enhancing both maintainability and scalability.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              > **Note:** While centralization may initially appear to create a potential bottleneck, this concern is mitigated by 
              > several key factors. Modern event brokers are engineered to handle massive throughput and can scale horizontally to
              > meet enterprise demands. Arvo further optimizes performance by requiring only lightweight string-based routing operations
              > (\`event.to\` = \`handler.source\`), eliminating the computational overhead associated with complex routing logic 
              > or stateful broker operations. Additionally, contemporary event broker implementations include mechanisms that deliver
              > only relevant events to subscribed handlers (based on the matching criteria), ensuring handlers as well as the network are not
              > overwhelmed by irrelevant traffic while the broker efficiently manages its core responsibility of high-performance 
              > message routing.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              ## Exploring Event Discovery, Tracing & Evolution 

              Arvo's centralized event broker pattern might initially raise concerns about event discovery and tracing, 
              given that all events flow through a single topic. However, this perspective overlooks how Arvo fundamentally 
              reimagines these challenges through its contract-first architecture.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Traditional event-driven systems struggle with discovery because events are defined at the broker level - 
              developers must navigate broker configurations, topic structures, and message formats to understand system 
              communication patterns. Arvo shifts this paradigm entirely. Event discovery becomes a compile-time and 
              development-time concern rather than a runtime exploration problem. Through [\`ArvoContract\`](/learn/arvo-contract), every service
              explicitly declares what events it accepts and emits, with full type safety and schema validation. These contracts
              exist as JavaScript/TypeScript objects that are directly bound to event handlers, making the entire communication
              structure explicit and discoverable through code rather than broker inspection.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              This approach transforms event discovery from a documentation challenge into an enforceable specification. 
              Arvo envisions that when developers need to understand what events a service processes or produces, they examine
              its contract - not the broker. The contract provides complete type definitions, schema validations, and 
              versioning information. This information isn't merely descriptive; it's enforced at both compile-time through 
              TypeScript's type system and runtime through Zod validation. The result is a self-documenting system where 
              the code itself becomes the source of truth for event discovery.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Regarding event tracing, Arvo's native integration with OpenTelemetry distributed tracing ensures that even 
              with all events flowing through a single topic, the complete event flow remains observable. Every \`ArvoEvent\` 
              carries \`traceparent\` and \`tracestate\` fields that maintain distributed tracing context across service 
              boundaries. This means that regardless of how events are routed through the broker, the causal chain of events 
              remains traceable from initiation through to completion. The \`subject\` field further enhances traceability by 
              providing a workflow-level correlation identifier that links related events throughout their distributed execution
              lifecycle. This is further enhanced by event's \`parentid\` field which establishes a direct causal link between
              events in the system.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Event evolution, traditionally a complex broker configuration challenge, becomes a contract versioning concern in
              Arvo. When services need to handle new event types or modified schemas, these changes are managed through the 
              contract's semantic versioning system rather than broker reconfiguration. The \`dataschema\` field in each event 
              explicitly identifies which contract version it conforms to, enabling services to handle multiple versions simultaneously
              during migration periods. This approach decouples event evolution from broker infrastructure, making it a development
              concern rather than an operational one.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              > **Note:** The shift from broker-centric to contract-centric event management represents a fundamental rethinking
              > of event-driven architecture. By making contracts the primary mechanism for discovery, validation, and evolution,
              > Arvo creates a system where the complexity of event management scales with code complexity rather than infrastructure
              > complexity. For detailed information on how contracts enable this transformation, see the [ArvoContract documentation](/learn/arvo-contract).
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The contract-first approach doesn't eliminate the need for observability tools or monitoring - it complements them.
              While traditional monitoring focuses on what's happening at runtime, Arvo's contracts tell you what should happen
              by design. The combination of compile-time contract enforcement, runtime validation, and distributed tracing creates
              multiple layers of visibility into your event-driven system, each serving a distinct purpose in maintaining system 
              reliability and understanding.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} pb-8!`}>
          <ReMark content={'# Related Topics'} />
        </div>
        <LearningTiles data={[ArvoEventLearn, ArvoContractLearn, ArvoEventHandlerLearn]} />
      </ContentContainer>
      <Separator padding={72} />
    </main>
  );
});
