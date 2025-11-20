import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  ArvoEventFactoryLearn,
  ArvoEventHandlerLearn,
  ArvoMachineLearn,
  EventRoutingAndBrokerInArvoLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';
import { ExecutionDiagram } from './executionDiagram';

export const ArvoEventHandlerPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoEventHandlerLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                The foundational event handler in Arvo that mimics the request-response paradigm within event-driven
                systems
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoEventHandler.html'
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
            src='/arvo-event-handler.png'
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
              Every system requires functional components to perform transformations 
              and actions that deliver value. In Arvo, the \`ArvoEventHandler\` serves 
              as the fundamental unit of functionality, processing incoming \`ArvoEvent\` 
              instances, executing business logic, and emitting response events.

              The \`ArvoEventHandler\` is a TypeScript class that binds directly to an 
              \`ArvoContract\`, which establishes the handler's input and output interface 
              along with its unique identifier (\`handler.source\`) within the event-driven 
              system (see [${EventRoutingAndBrokerInArvoLearn.name}](${EventRoutingAndBrokerInArvoLearn.link}) 
              for more information). Furthermore, it accepts versioned execution functions 
              corresponding to contract versions, enabling the system to support multiple 
              interface specifications simultaneously during the system lifecycle.

              Handler instances provide comprehensive automation, including distributed 
              routing logic, contract-based event validation, version-aware function 
              selection based on event \`dataschema\` versions, and contract-compliant 
              event creation. This design eliminates manual routing and validation 
              concerns, allowing you to focus exclusively on your business logic.

              Throughout the development lifecycle, the handler delivers full TypeScript 
              integration with compile-time type safety, comprehensive IntelliSense support, 
              and runtime validation, ensuring correctness at every stage.
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
              # For Advanced Engineers Only

              <br/>

              The \`ArvoEventHandler\` is a sophisticated component that streamlines event-driven 
              development by automating request-response patterns, validation, routing, and contract 
              enforcement. To help you understand its internal execution lifecycle, the detailed 
              sequence diagram below visualizes every phase—from event validation and contract resolution 
              through handler execution and response broadcasting. This diagram serves as an essential 
              reference for system design and debugging, allowing you to trace exactly how events flow 
              through the handler, understand error propagation paths, identify validation checkpoints, 
              and diagnose execution failures. When building complex workflows or troubleshooting production 
              issues, this diagram helps you map theoretical contract definitions to concrete runtime behavior, 
              making it invaluable for both initial architecture design and long-term system maintenance.

              > **Pro Tip:** Click the copy button below to extract the diagram definition. Paste 
               it into any AI chat interface (ChatGPT, Claude, etc.) to ask questions like "What happens when 
               validation fails?", "Where are OpenTelemetry spans created?", or "How does version resolution 
               work?". This makes the diagram interactive—you can query specific execution paths, understand 
               error flows, or get explanations of complex decision points without manually parsing the 
               entire sequence.

              <br/>
              <br/>

              \`\`\`mermaid
            ${ExecutionDiagram}
              \`\`\`

              <br/>
              <br/>

              ## Error Handling Strategies

              Arvo's \`ArvoEventHandler\` implements a dual-path error handling strategy 
              that separates **violation errors** from **error events**. Violation errors 
              throw exceptions for external infrastructure to handle (dead letter queues, 
              external retry mechanisms, monitoring systems), while error events become 
              part of the workflow itself, flowing through the system as events for orchestrators 
              and handlers to process. This dual-path approach provides a comprehensive error 
              handling vocabulary that enables flexible implementation strategies tailored to 
              your system's requirements. Arvo manages default error behavior automatically, 
              while maintaining extensibility for custom error handling patterns when needed.

              ### Violation Errors

              Violation errors can indicate problems with event structure, contract compliance, or 
              configuration. These errors throw exceptions that must be handled by infrastructure 
              outside Arvo—whether through retry mechanisms for transient issues or dead letter 
              queues for permanent failures.

              <br/>

              | When It Occurs | Error Type |
              |----------------|------------|
              | Incoming event type doesn't match the contract's expected type | \`ConfigViolation\` |
              | Requested contract version doesn't exist in the handler | \`ConfigViolation\` |
              | Event references a different contract URI than the handler expects | \`ContractViolation\` |
              | Event payload fails input schema validation | \`ContractViolation\` |
              | Handler returns data that fails output schema validation | \`ContractViolation\` |
              | Handler explicitly throws a violation for business rule enforcement | \`ExecutionViolation\` |

              <br/>

              ### Error Events

              Error events occur when handlers encounter operational failures during execution. Unlike 
              violations, these errors become system error events that flow through the event-driven 
              architecture as part of the workflow, allowing orchestrators and handlers to process 
              them within the business logic.

              <br/>

              | When It Occurs | Result |
              |----------------|--------|
              | Handler throws any non-violation error (database failures, network timeouts, external service errors, business logic failures, etc.) | System error events (\`sys.*.error\`) are generated and emitted as part of the workflow for downstream processing |

              <br/>
              
              Violations require external handling mechanisms outside the workflow, while error events 
              integrate into the workflow itself, enabling orchestrators to implement fallback 
              behaviors and compensating transactions as designed business logic.
              
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
          heading: ArvoEventFactoryLearn.name,
          link: ArvoEventFactoryLearn.link,
          content: ArvoEventFactoryLearn.summary,
        }}
        next={{
          heading: ArvoMachineLearn.name,
          link: ArvoMachineLearn.link,
          content: ArvoMachineLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
