import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';

export const ArvoEventPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>ArvoEvent</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                A general-purpose self-describing event structure{' '}
                <strong>
                  extending the{' '}
                  <a
                    href='http://cloudevents.io/'
                    target='_blank'
                    rel='noreferrer'
                    className='underline hover:text-blue-600'
                  >
                    CloudEvent
                  </a>
                </strong>{' '}
                specification; designed to serve as the backbone for an <strong>evolutionary &amp; reliable</strong>{' '}
                event-drive architecture.
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
              Event-driven architectures excel at scalability but face challenges in evolution and reliability due to
              inconsistent event semantics and formats across teams. While practices like [Event Storming](https://www.eventstorming.com/) help identify
              event flows and data requirements, the actual implementation often becomes fragmented as teams create
              incompatible event structures optimised for their specific domains, leading to complex integration
              challenges and reduced system maintainability as the architecture grows.
              
              To address these challenges Arvo enforces a standard event structure, called \`ArvoEvent\`, across all event handlers. It builds this stardard 
              by basing it upon the standardised [CNCF CloudEvent](https://cloudevents.io/) specification. This approach leverages existing industry knowledge and tooling while adding
              targeted extensions that support Arvo's enterprise requirements, enabling you to maintain consistent event
              semantics and structure across your systems without sacrificing the flexibility needed for diverse business needs.
            `)}
          />
          <Separator padding={18} />

          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Anatomy of ArvoEvent

              \`ArvoEvent\` extends the \`CloudEvent\` specification with additional fields necessary for enterprise-grade
              event-driven systems. Every event must include standard \`CloudEvent\` fields and incorporates Arvo-specific 
              extensions for enhanced functionality and routing. Furthermore, just like the \`CloudEvent\`, \`ArvoEvent\` 
              allows for extensions in the event structure.

              The following table provides a comprehensive overview of \`ArvoEvent\` fields, their classification, and 
              the rationale behind their inclusion in the event structure.
            `)}
          />
          <Separator padding={8} />
          <ReMark
            content={cleanString(`
              | Field Name          | Classification              | Description                                                                                                                                                                                                                                                                                                                                     |
              | ------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
              | \`id\`                | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#id)            | Unique event identifier generated as UUID by default. Ensures global uniqueness across distributed systems for event tracking, deduplication, and correlation. **Implement idempotency checks using this field to handle duplicate event processing gracefully.**                                                                              |
              | \`source\`            | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#source-1)            | Event origin identifier (e.g., \`com.order.service\`, \`com.payment.processor\`). Critical for event tracing and routing within Arvo's event handling system. Maps directly to \`handler.source\` and matches the \`event.type\` of the initiating event in the workflow chain.                                                                      |
              | \`type\`              | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#type)            | Event type specification (e.g., \`com.order.created\`, \`evt.payment.completed\`). Determines the operation event handlers should perform in response to this event. Essential for proper event routing and processing logic.                                                                                                                       |
              | \`specversion\`       | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#specversion)            | The version of the CloudEvents specification which the event uses. This enables the interpretation of the context. Compliant event producers MUST use a value of 1.0 when referring to this version of the specification. |
              | \`subject\`           | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#subject)            | Workflow process identifier that uniquely links related events throughout their distributed execution lifecycle. Acts as a correlation key for maintaining stateful context across service boundaries, enabling event handlers to retrieve and persist workflow state consistently. See, the [technical documentation](https://saadahmad123.github.io/arvo-core/documents/ArvoEvent.html) to learn more about it. |
              | \`data\`              | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#event-data)            | JSON-serializable payload containing business-specific event data. Structure validated against \`ArvoContract\` specifications and correlated with \`type\` and \`dataschema\` fields. Contains the core business information being transmitted between services.                                                                                      |
              | \`time\`              | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#time)            | Event timestamp in ISO 8601 format. Allows for event ordering, temporal relationships, audit trails, and debugging distributed workflows.                                                                                                                                                                     |
              | \`datacontenttype\`   | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#datacontenttype)            | Content type of the data field (typically \`application/cloudevents+json;charset=UTF-8;profile=arvo\` in Arvo). Ensures proper payload parsing and enables content negotiation between services.                                                                                                                                                                                                  |
              | \`dataschema\`        | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#dataschema)            | URI reference to the version-specific \`ArvoContract\` validating the data payload. Enforces data integrity, schema compatibility, and supports contract-driven development practices across service boundaries. The versioning will be discussed further in \`ArvoContract\` documentation                                                                                                                                 |
              | \`to\`                | Arvo Extension              | The target event consumer specification (which corresponds to a specific Arvo event handler's \`handler.source\`). Enables direct event routing by the message broker.|
              | \`redirectto\`        | Arvo Extension              | **[Legacy/Deprecated]** Dynamic routing destination for complex workflow scenarios. Allows runtime event redirection based on business rules, conditions, or orchestration requirements.                                                                                                                                                                                  |
              | \`accesscontrol\`     | Arvo Extension              | Event-level access control metadata supporting multiple authentication mechanisms (user IDs, RBAC, claims). Provides fine-grained security controls for sensitive events and restricts event handler scope of system access based on originator permissions.                                                                                                 |
              | \`executionunits\`    | Arvo Extension              | Computational cost tracking metric for event processing operations. Enables system optimization, capacity planning, resource allocation analysis, and performance monitoring across the event-driven architecture.                                                                                                                                 |
              | \`parentid\`          | Arvo Extension              | Direct parent event identifier establishing causal relationships within the Arvo ecosystem. Essential for event lineage tracking, workflow orchestration debugging, and understanding process flow dependencies in complex distributed systems.                                                                                                   |
              | \`domain\`            | Arvo Extension              | A domain specification for specialized event routing and workflow execution. Enable advanced routing patterns including human-in-the-loop operations, third-party integrations, and custom processing pipelines while maintaining clear operational boundaries.                                                             |
              | \`traceparent\`       | [OpenTelemetry Extension](https://github.com/cloudevents/spec/blob/main/cloudevents/extensions/distributed-tracing.md#traceparent)     | Distributed tracing context header compliant with W3C Trace Context specification. Enables end-to-end request tracing across service boundaries and supports comprehensive observability in microservices architectures.                                                                                                                         |
              | \`tracestate\`        | [OpenTelemetry Extension](https://github.com/cloudevents/spec/blob/main/cloudevents/extensions/distributed-tracing.md#tracestate)     | Vendor-specific tracing metadata supporting extended observability capabilities. Maintains compatibility with various APM tools and monitoring platforms while preserving custom tracing information throughout the distributed event flow.                                                                                                       |
            `)}
          />
          <Separator padding={8} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The combination of CloudEvent core fields and Arvo extensions creates a robust event structure. 
              The core fields provide essential event identification and payload management, while the extensions 
              enable sophisticated routing, security, monitoring, and cost tracking capabilities.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <Demo />
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Self-Describing Event, Decentralized Routing & Event Brokers

              Arvo, as an event-driven toolkit that facilitates complex coordination and orchestration, requires a mechanism to
              route events appropriately to their destinations. Traditionally, this logic is encapsulated in the event broker or 
              the orchestrator. As a result, the broker ends up performing both orchestration and routing, creating a central 
              bottleneck—if it fails or cannot scale, the entire system is impacted. This also couples participating services 
              tightly to the orchestrator or broker, which undermines the goal of building an evolvable, scalable event-driven system.

              Arvo introduces an approach that aligns more closely with EDA philosophy by leveraging the \`ArvoEvent\` as much as possible. 
              This is a self-describing event containing enough information to instruct the broker where to send it for handling. The routing information is encapsulated
              in the event's \`to\` field. In addition, metadata includes the source, contract schema, distributed telemetry, and a \`subject\` 
              representing the overall workflow process. These elements are detailed further in the documentation. Arvo event handlers use
              this metadata and a deterministic algorithm to decide where to send response events. The algorithm itself is described in each
              handler's documentation.

              This model transforms the event broker into a lightweight routing service that requires no complex logic or state management. 
              It simply performs string matching to route events based on the \`to\` field, while event handlers manage the routing logic themselves.
              The Arvo event handlers abstracts most routing complexity - developers rarely need to implement custom routing as the event
              handlers automatically determine response destinations using deterministic algorithms. When custom routing is required, Arvo 
              event handlers provide powerful mechanisms for implementation, which are detailed in their respective documentation.

              ## The Centralized Event Broker

              Arvo employs a **centralized event broker** architecture that requires only a single topic to function effectively. 
              While the system can scale to multiple topics, brokers, or environments, its fundamental design operates through one 
              shared communication channel. All event handlers subscribe to this topic and listen for events. When the broker 
              encounters an event, it routes it to the appropriate handler by matching \`event.to\` with \`handler.source\`. Handlers
              process events and emit responses back to the same topic, creating a continuous flow of event-driven communication.

              This architecture supports advanced patterns through the \`event.domain\` field, which enables broadcasting events across 
              different topics, brokers, or environments. These patterns provide flexibility for complex enterprise scenarios while
              maintaining the simplicity of the core routing mechanism. Further details on these advanced patterns are covered in 
              subsequent sections.

              The broker-centric model eliminates direct service-to-service dependencies. Each service evolves independently within 
              its bounded context, enhancing both maintainability and scalability.

              > **Note:** While centralization may initially appear to create a potential bottleneck, this concern is mitigated by 
              > several key factors. Modern event brokers are engineered to handle massive throughput and can scale horizontally to
              > meet enterprise demands. Arvo further optimizes performance by requiring only lightweight string-based routing operations
              > (\`event.to\` = \`handler.source\`), eliminating the computational overhead associated with complex routing logic 
              > or stateful broker operations. Additionally, contemporary event broker implementations include mechanisms that deliver
              > only relevant events to subscribed handlers (based on the matching criteria), ensuring handlers as well as the network are not
              > overwhelmed by irrelevant traffic while the broker efficiently manages its core responsibility of high-performance 
              > message routing.

              ## Exploring ArvoEvent Discovery, Tracing & Evolution 

              Arvo's centralized event broker pattern might initially raise concerns about event discovery and tracing, 
              given that all events flow through a single topic. However, this perspective overlooks how Arvo fundamentally 
              reimagines these challenges through its contract-first architecture.

              Traditional event-driven systems struggle with discovery because events are defined at the broker level - 
              developers must navigate broker configurations, topic structures, and message formats to understand system 
              communication patterns. Arvo shifts this paradigm entirely. Event discovery becomes a compile-time and 
              development-time concern rather than a runtime exploration problem. Through \`ArvoContract\`, every service
              explicitly declares what events it accepts and emits, with full type safety and schema validation. These contracts
              exist as JavaScript/TypeScript objects that are directly bound to event handlers, making the entire communication
              structure explicit and discoverable through code rather than broker inspection.

              This approach transforms event discovery from a documentation challenge into an enforceable specification. 
              Arvo envisions that when developers need to understand what events a service processes or produces, they examine
              its contract - not the broker. The contract provides complete type definitions, schema validations, and 
              versioning information. This information isn't merely descriptive; it's enforced at both compile-time through 
              TypeScript's type system and runtime through Zod validation. The result is a self-documenting system where 
              the code itself becomes the source of truth for event discovery.

              Regarding event tracing, Arvo's native integration with OpenTelemetry distributed tracing ensures that even 
              with all events flowing through a single topic, the complete event flow remains observable. Every \`ArvoEvent\` 
              carries \`traceparent\` and \`tracestate\` fields that maintain distributed tracing context across service 
              boundaries. This means that regardless of how events are routed through the broker, the causal chain of events 
              remains traceable from initiation through to completion. The \`subject\` field further enhances traceability by 
              providing a workflow-level correlation identifier that links related events throughout their distributed execution
              lifecycle. This is further enhanced by event's \`parentid\` field which establishes a direct causal link between
              events in the system.

              Event evolution, traditionally a complex broker configuration challenge, becomes a contract versioning concern in
              Arvo. When services need to handle new event types or modified schemas, these changes are managed through the 
              contract's semantic versioning system rather than broker reconfiguration. The \`dataschema\` field in each event 
              explicitly identifies which contract version it conforms to, enabling services to handle multiple versions simultaneously
              during migration periods. This approach decouples event evolution from broker infrastructure, making it a development
              concern rather than an operational one.

              > **Note:** The shift from broker-centric to contract-centric event management represents a fundamental rethinking
              > of event-driven architecture. By making contracts the primary mechanism for discovery, validation, and evolution,
              > Arvo creates a system where the complexity of event management scales with code complexity rather than infrastructure
              > complexity. For detailed information on how contracts enable this transformation, see the [ArvoContract documentation](/learn/arvo-contract).

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
