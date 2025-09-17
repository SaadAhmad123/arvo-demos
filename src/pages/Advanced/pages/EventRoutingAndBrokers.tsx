import { cleanString } from 'arvo-core';
import { Md3ContentPadding } from '../../../classNames';
import { ContentContainer } from '../../../components/ContentContainer';
import { withNavBar } from '../../../components/Navbar/withNavBar';
import { ReMark } from '../../../components/ReMark';
import { Separator } from '../../../components/Separator';

export const EventRoutingAndBrokersPage = withNavBar(() => {
  return (
    <main>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Self-Describing ArvoEvent, Decentralized Routing & Event Brokers

              Arvo, as an event-driven toolkit that facilitates complex coordination and orchestration, requires a mechanism to
              route events appropriately to their destinations. Traditionally, this logic is encapsulated in the event broker or 
              the orchestrator. As a result, the broker ends up performing both orchestration and routing, creating a central 
              bottleneck—if it fails or cannot scale, the entire system is impacted. This also couples participating services 
              tightly to the orchestrator or broker, which undermines the goal of building an evolvable, scalable event-driven system.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Arvo introduces an approach that aligns more closely with EDA philosophy by leveraging the [\`ArvoEvent\`](/learn/arvo-event) as much as possible. 
              This is a self-describing event containing enough information to instruct the broker where to send it for handling. The routing information is encapsulated
              in the event's \`to\` field. In addition, metadata includes the source, contract schema, distributed telemetry, and a [\`subject\`](/advanced/arvo-event-data-field-deep-dive) 
              representing the overall workflow process. These elements are detailed further in the documentation. [Arvo event handlers](/learn) use
              this metadata and a deterministic algorithm to decide where to send response events. The algorithm itself is described in each
              handler's documentation.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              This model transforms the event broker into a lightweight routing service that requires no complex logic or state management. 
              It simply performs string matching to route events based on the \`to\` field, while event handlers manage the routing logic themselves.
              The Arvo event handlers abstracts most routing complexity - developers rarely need to implement custom routing as the event
              handlers automatically determine response destinations using deterministic algorithms. When custom routing is required, Arvo 
              event handlers provide powerful mechanisms for implementation, which are detailed in their respective documentation.
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
      <Separator padding={54} />
    </main>
  );
});
