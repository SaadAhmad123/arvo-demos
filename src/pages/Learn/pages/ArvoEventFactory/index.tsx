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
import {
  ArvoContractLearn,
  ArvoEventDataFieldDeepDiveLearn,
  ArvoEventHandlerLearn,
} from '../../../../components/LearningTiles/data';

export const ArvoEventFactoryPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>The Event Factory</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Build events with confidence, reliability, and less boilerplate code
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-core/documents/ArvoEventFactory.html'
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
            src='/arvo-event-factory.png'
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
              In Arvo, \`ArvoEvent\` serves as the primary communication unit, with services 
              maintaining cohesion through the \`ArvoContract\` system. While the \`ArvoEvent\` 
              data structure is comprehensive and powerful, its complexity makes manual creation 
              and maintenance challenging. The \`arvo-core\` package solves this through 
              \`ArvoEventFactory\`, a sophisticated utility that transforms event creation into 
              an intuitive and reliable process.

              This utility significantly reduces boilerplate code while ensuring strict 
              compatibility between events and their contracts. It simplifies contract evolution 
              and maintenance by automatically inferring contractual information, eliminating the 
              need for detailed manual inspection. The factory's deep integration with TypeScript 
              provides compile-time error prevention and comprehensive IntelliSense support, 
              catching compatibility issues before they reach runtime.

              
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
              # Automatic Event Subject Management
                
              The [\`subject\` field](${ArvoEventDataFieldDeepDiveLearn.link}) in \`ArvoEvent\` 
              serves as a critical identifier that links all events within a specific process. 
              This unique string enables event handlers to maintain context across distributed 
              operations while allowing orchestrators (namely, \`ArvoOrchestrator\` and \`ArvoResumable\`) 
              to preserve process state throughout the event lifecycle.

              \`ArvoEventFactory\` handles subject generation and management automatically, 
              treating it as an internal implementation detail that developers shouldn't need 
              to manage manually. While the factory manages this complexity by default, it 
              maintains flexibility by allowing custom subject values when specific use cases 
              require them.

              <br/>

              > **Note:** The following details Arvo's internal mechanics. Most developers 
              > can skip this section as the framework handles these complexities automatically.

              ## Orchestration Nesting and Subject Management

              In Arvo's event-driven architecture, orchestration events coordinate complex 
              distributed workflows. These specialized events initiate orchestrators or signal 
              completion, utilizing the \`event.data.parentSubject$$\` field to establish 
              relationships between orchestration processes and create interconnected workflows 
              spanning multiple services. The \`ArvoOrchestratorEventFactory\` manages the 
              complexity of creating these events within the framework.

              The orchestration system implements sophisticated parent-child relationship 
              management through the \`event.subject\` and \`event.data.parentSubject$$\` fields:

              - Root orchestrations establish identity through a subject created by 
              \`ArvoOrchestrationSubject.new\`, serving as the anchor point for the entire 
              workflow chain. These initial events are created using \`ArvoEventFactory\` 
              (recommended) or \`ArvoOrchestratorEventFactory\`.
              
              - Child orchestrations maintain lineage through the \`event.data.parentSubject$$\` 
              field, with subjects derived using \`ArvoOrchestrationSubject.from()\`. This tracking 
              ensures clear ancestral connections even in complex, nested workflows.
              
              - Completion events maintain context continuity by referencing either the 
              \`parentSubject$$\` from the initiation event or matching the initial event's 
              subject (indicating root workflow completion). This systematic approach enables 
              effective execution flow tracking across distributed processes while maintaining 
              clear workflow boundaries.

              This design balances sophistication with usability. While subject management 
              and relationship tracking are complex, developers rarely interact with these 
              details directly. The \`ArvoOrchestrator\` event handler 
              automatically manages relationships, abstracting subject chaining and context 
              management complexities. This allows developers to focus on workflow logic while 
              the system handles execution context and relationship maintenance. Understanding 
              these mechanisms remains valuable for designing custom orchestration patterns or 
              troubleshooting complex workflows, providing insights into how Arvo maintains 
              consistency in distributed orchestration scenarios.
            `)}
          />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} pt-0!`}>
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
          heading: ArvoContractLearn.name,
          link: ArvoContractLearn.link,
          content: ArvoContractLearn.summary,
        }}
        next={{
          heading: ArvoEventHandlerLearn.name,
          link: ArvoEventHandlerLearn.link,
          content: ArvoEventHandlerLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
