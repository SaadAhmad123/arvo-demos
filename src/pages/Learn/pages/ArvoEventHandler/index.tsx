import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { LearningTiles } from '../../../../components/LearningTiles';
import {
  ArvoEventFactoryLearn,
  ArvoEventHandlerLearn,
  ArvoMachineLearn,
  ErrorBoundariesLearn,
  EventRoutingAndBrokerInArvoLearn,
  MultiDomainBroadcastingLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';

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
              # Advanced Topics

              Event handlers in Arvo support advanced features including error 
              boundaries for resilient failure handling and multi-domain event 
              emission for cross-system communication. The following sections 
              explore these capabilities.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <LearningTiles data={[ErrorBoundariesLearn, MultiDomainBroadcastingLearn]} />
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
