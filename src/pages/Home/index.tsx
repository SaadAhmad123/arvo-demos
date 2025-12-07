import { Md3ContentPadding } from '../../classNames';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { ArvoLearn, ArvoMentalModelLearn } from '../../components/LearningTiles/data';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { PageNavigation } from '../../components/PageNavigation';
import { ReMark } from '../../components/ReMark';
import { Separator } from '../../components/Separator';
import { cleanString } from '../../utils';
import { CTA } from './components/CTA';
import { Demo } from './components/Demo';
import { Hero } from './components/Hero';
import { Installation } from './components/Installation';
import { Pillers } from './components/Pillars';

export const HomePage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <Hero />
          <CTA />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <h1 className={`${Md3Typography.headline.large} text-on-surface-variant font-light`}>
            Build systems where AI, agents, humans, workflows, and business logic collaborate seamlessly.
          </h1>
        </div>
      </ContentContainer>
      <Pillers />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              Arvo is an **application-layer TypeScript toolkit** for writing 
              event-driven, distributed systems-compliant business logic.

              **Arvo is not infrastructure.** It's not an event broker, 
              messaging system, or deployment platform. Those solutions already 
              exist (RabbitMQ, Kafka, Redis, AWS, GCP, Dapr) and Arvo lets 
              you integrate them without coupling your business logic to 
              any specific one.

              **Arvo is not a framework.** It doesn't control your code's 
              execution or impose rigid constraints. Your Arvo logic can 
              live in a REST API, be exposed as endpoints, then move to 
              different modalities (console app, AWS SQS + Lambda) without 
              changing your business logic. You swap infrastructure integration 
              code, not domain logic.

              ## The Core Idea

              Arvo embodies one simple principle applied consistently. Almost 
              all business logic can be modeled as independent services that 
              coordinate by passing contract-compliant events. A handler 
              accepts events defined by its contract, emits events according 
              to that contract, and manages state via a uniform interface. 
              The handler doesn't know where it runs, what broker delivers 
              its events, or what database stores its state. It only knows 
              its boundaries.

              This uniformity means the same primitives apply whether you're 
              building simple services, complex orchestrators, AI-driven agents, 
              or human-in-the-loop workflows.

              ## Why Arvo?

              Traditional tools are infrastructure-focused and lock you 
              into specific technologies. Workflow engines, agent 
              frameworks, message brokers, and service meshes each require 
              different mental models and deployment approaches.

              Arvo treats these as expressions of the same pattern — event 
              handlers communicating through contracts. You learn one way 
              of structuring logic that naturally expresses all of them. 
              Write your business logic once, deploy anywhere, and 
              swap infrastructure without rewrites.

              For a deeper exploration of these concepts, see 
              [${ArvoMentalModelLearn.name}](${ArvoMentalModelLearn.link}).
              
            `)}
          />
        </div>
      </ContentContainer>
      <Installation />
      <Separator padding={18} />
      <Demo />
      <Separator padding={18} />
      <PageNavigation
        next={{
          link: ArvoLearn.link,
          heading: ArvoLearn.name,
          content: ArvoLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
