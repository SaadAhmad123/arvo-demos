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
import { PageNavigation } from '../../../../components/PageNavigation';
import { LearningTiles } from '../../../../components/LearningTiles';
import {
  ArvoContractLearn,
  ArvoEventDataFieldDeepDiveLearn,
  ArvoEventLearn,
  EventRoutingAndBrokerInArvoLearn,
} from '../../../../components/LearningTiles/data';

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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoEventLearn.name}</h1>
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
              Modern software systems require reliable communication mechanisms between components to function effectively. While 
              traditional architectures rely on synchronous patterns like function calls or API requests, event-driven systems use 
              self-contained messages called events to enable asynchronous communication. These machine-readable data structures 
              flow through event brokers, allowing producers and consumers to operate independently and scale efficiently.

              Event-driven architecture offers significant advantages in resource utilization and scalability. Unlike synchronous 
              systems where components must wait for responses while holding open connections, event handlers can process messages 
              and immediately release computational resources. This design enables systems to scale horizontally and handle variable 
              workloads more effectively. However, this flexibility introduces substantial challenges in maintaining consistent event 
              structures across evolving systems, as different teams and components often develop incompatible formats optimized for 
              their specific needs.
            `)}
          />
          <Separator padding={18} />
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
            # The ArvoEvent

            Arvo addresses the standardization challenge through the \`ArvoEvent\` specification, which extends the
            [CNCF CloudEvent](https://cloudevents.io/) standard rather than introducing entirely new conventions. By 
            building on this widely-adopted foundation, \`ArvoEvent\` ensures compatibility with existing \`CloudEvents\`-compliant 
            infrastructure while adding essential capabilities for Arvo-based event routing and OpenTelemetry distributed tracing. 
            This approach allows Arvo-based systems to integrate seamlessly with the broader CloudEvents ecosystem while providing 
            the enhanced functionality needed for sophisticated event-driven architectures.              

            ## The Anatomy of ArvoEvent

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
              # Advanced Topics

              As the core communication unit of the Arvo ecosystem, \`ArvoEvent\` is a 
              powerful component. This documentation introduces its everyday usage, and 
              Arvo provides utilities that make working with \`ArvoEvent\` straightforward. 
              However, there are more advanced and nuanced features of this event 
              structure that can access when needed and are discussed in the advanced patterns documentation.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <LearningTiles data={[ArvoEventDataFieldDeepDiveLearn, EventRoutingAndBrokerInArvoLearn]} />
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Learn More

              Continue exploring additional concepts to deepen your understanding of Arvo and its ecosystem. The following sections build upon the foundations of \`ArvoEvent\` and introduce more advanced components and practices.
            `)}
          />
        </div>
      </ContentContainer>

      <PageNavigation
        next={{
          heading: ArvoContractLearn.name,
          link: ArvoContractLearn.link,
          content: ArvoContractLearn.summary,
        }}
        previous={{
          heading: 'Learn Arvo',
          link: '/learn',
          content: "Learn about Arvo's concepts and component to start building Arvo based event-driven systems",
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
