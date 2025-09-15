import { Md3ContentPadding } from '../../../classNames';
import { Md3Buttons } from '../../../classNames/buttons';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { ContentContainer } from '../../../components/ContentContainer';
import { withNavBar } from '../../../components/Navbar/withNavBar';
import { ReMark } from '../../../components/ReMark';
import { Separator } from '../../../components/Separator';
import { cleanString } from '../../../utils';

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
              
              To address these challenges, Arvo builds upon the standardised [CNCF CloudEvent](https://cloudevents.io/) specification rather than
              creating a new standard. This approach leverages existing industry knowledge and tooling while adding
              targeted extensions that support enterprise requirements, enabling teams to maintain consistent event
              semantics and structure across their distributed systems without sacrificing the flexibility needed for
              diverse business needs.
            `)}
          />
          <Separator padding={18} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Self-Describing Event, Decentralized Routing & Event Brokers

              Arvo, as an event-driven pattern that facilitates complex coordination and orchestration, requires a mechanism to
              route events appropriately to their destinations. Traditionally, this logic is encapsulated in the event broker or 
              the orchestrator. As a result, the broker ends up performing both orchestration and routing, creating a central 
              bottleneck—if it fails or cannot scale, the entire system is impacted. This also couples participating services 
              tightly to the orchestrator or broker, which undermines the goal of building an evolvable, scalable event-driven system.

              Arvo introduces a simpler approach that aligns more closely with EDA philosophy—the \`ArvoEvent\`. This is a self-describing
              event containing enough information to instruct the broker where to send it for handling. The routing information is encapsulated
              in the event's \`to\` field. In addition, metadata includes the source, contract schema, distributed telemetry, and a \`subject\` 
              representing the overall workflow process. These elements are detailed further in the documentation. Arvo event handlers use
              this metadata and a deterministic algorithm to decide where to send response events. The algorithm itself is described in each
              handler's documentation.

              With this model, the event broker requires no complex logic or state management. It simply performs lightweight string 
              matching to route events, while the handlers manage the routing logic. Developers rarely need to implement custom routing
              themselves.

              ## Centralized Event Broker

              Arvo leverages a **centralized event broker** that maintains clean separation between services while enabling efficient
              communication. A a very high level:

              - Services register with the broker, declaring their source ids
              - Incoming events are routed to the right handlers based on registration information
              - Services process events and emit responses through the broker
              - The cycle continues, maintaining a steady flow of event-driven communication

              This broker-centric model removes direct service-to-service dependencies. Each service can evolve independently within its
              bounded context, supporting maintainability and scalability.              


              > **Note:** While centralization may seem like a potential bottleneck, modern event brokers are designed to handle massive 
              > scale. Arvo further reduces overhead by requiring only simple string-based routing (\`event.to = handler.source\`), 
              > eliminating the need for complex broker logic or heavy state tracking.
            `)}
          />
          <Separator padding={18} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # The Anatomy of ArvoEvent

              \`ArvoEvent\` extends the \`CloudEvent\` specification with additional fields necessary for enterprise-grade
              event-driven systems. Every event must include standard \`CloudEvent\` fields and incorporates Arvo-specific 
              extensions for enhanced functionality and routing.

              The following table provides a comprehensive overview of ArvoEvent fields, their classification, and 
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
              | \`subject\`           | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#subject)            | Workflow process identifier linking related events together. Serves as the storage key for workflow state management in event handlers. Enables context preservation and state retrieval across distributed workflow execution steps.                                                                                                            |
              | \`data\`              | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#event-data)            | JSON-serializable payload containing business-specific event data. Structure validated against \`ArvoContract\` specifications and correlated with \`type\` and \`dataschema\` fields. Contains the core business information being transmitted between services.                                                                                      |
              | \`time\`              | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#time)            | Event timestamp in ISO 8601 format. Auto-generated if not provided. Essential for event ordering, temporal relationships, audit trails, and debugging distributed workflows.                                                                                                                                                                     |
              | \`datacontenttype\`   | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#datacontenttype)            | Content type of the data field (typically \`application/cloudevents+json;charset=UTF-8;profile=arvo\` in Arvo). Ensures proper payload parsing and enables content negotiation between services.                                                                                                                                                                                                  |
              | \`dataschema\`        | [CloudEvents Core](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md#dataschema)            | URI reference to the version-specific \`ArvoContract\` validating the data payload. Enforces data integrity, schema compatibility, and supports contract-driven development practices across service boundaries.                                                                                                                                    |
              | \`to\`                | Arvo Extension              | The Target event consumer specification (\`handler.source\`). Enables direct event routing by the message broker, supporting point-to-point communication patterns within the event mesh.                                                                                                                                                                                 |
              | \`redirectto\`        | Arvo Extension              | Dynamic routing destination for complex workflow scenarios. Allows runtime event redirection based on business rules, conditions, or orchestration requirements.                                                                                                                                                                                  |
              | \`accesscontrol\`     | Arvo Extension              | Event-level access control metadata supporting multiple authentication mechanisms (user IDs, RBAC, claims). Provides fine-grained security controls for sensitive event data and restricts event handler access based on originator permissions.                                                                                                 |
              | \`executionunits\`    | Arvo Extension              | Computational cost tracking metric for event processing operations. Enables system optimization, capacity planning, resource allocation analysis, and performance monitoring across the event-driven architecture.                                                                                                                                 |
              | \`parentid\`          | Arvo Extension              | Direct parent event identifier establishing causal relationships within the Arvo ecosystem. Essential for event lineage tracking, workflow orchestration debugging, and understanding process flow dependencies in complex distributed systems.                                                                                                   |
              | \`domain\`            | Arvo Extension              | Processing domain specification for specialized event routing and workflow execution. Supports domain-specific processing patterns including human-in-the-loop operations, third-party integrations, and custom processing pipelines while maintaining clear operational boundaries.                                                             |
              | \`traceparent\`       | [OpenTelemetry Extension](https://github.com/cloudevents/spec/blob/main/cloudevents/extensions/distributed-tracing.md#traceparent)     | Distributed tracing context header compliant with W3C Trace Context specification. Enables end-to-end request tracing across service boundaries and supports comprehensive observability in microservices architectures.                                                                                                                         |
              | \`tracestate\`        | [OpenTelemetry Extension](https://github.com/cloudevents/spec/blob/main/cloudevents/extensions/distributed-tracing.md#tracestate)     | Vendor-specific tracing metadata supporting extended observability capabilities. Maintains compatibility with various APM tools and monitoring platforms while preserving custom tracing information throughout the distributed event flow.                                                                                                       |
            `)}
          />
          <Separator padding={8} />
          <ReMark
            content={cleanString(`
              The combination of CloudEvent core fields and Arvo extensions creates a robust event structure. 
              The core fields provide essential event identification and payload management, while the extensions 
              enable sophisticated routing, security, monitoring, and cost tracking capabilities.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={54} />
    </main>
  );
});
