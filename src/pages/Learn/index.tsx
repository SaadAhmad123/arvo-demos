import { Md3ContentPadding } from '../../classNames';
import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { ReMark } from '../../components/ReMark';
import { Separator } from '../../components/Separator';
import { cleanString } from '../../utils';
import { PageNavigation } from '../../components/PageNavigation';
import {
  ArvoContractLearn,
  ArvoEventFactoryLearn,
  ArvoEventHandlerLearn,
  ArvoEventLearn,
  ArvoMachineLearn,
  ArvoOrchestratorLearn,
  ArvoResumableLearn,
} from '../../components/LearningTiles/data';
import { LearningTiles } from '../../components/LearningTiles';

export const LearnPage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
            <div className={`${Md3Cards.inner.content}`}>
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>Learn</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Arvo, with a{' '}
                <strong>
                  few{' '}
                  <a
                    href='https://www.freecodecamp.org/news/orthogonality-in-software-engineering/'
                    target='_blank'
                    rel='noreferrer'
                    className='underline hover:text-blue-600'
                  >
                    orthogonal
                  </a>{' '}
                  components
                </strong>
                , allows you to build event-driven business logic that <strong>integrate with your framework</strong>{' '}
                and <strong>scales when you need</strong>—no vendor lock-ins or major rewrites.
              </p>
              <Separator padding={16} />
              <p className={`${Md3Typography.body.medium} opacity-75`}>
                Currently available <strong>exclusively for TypeScript</strong> environments.
              </p>
            </div>
          </div>
          <img alt='learning illustration' src='/learning.png' className='rounded-3xl object-cover lg:h-full' />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <p className={Md3Typography.body.large}>
            Arvo is a TypeScript toolkit for building event-driven systems, following{' '}
            <strong>Jack Dorsey's philosophy of perfecting essential details while limiting their number</strong>.
            Rather than solving the entire event-driven paradigm,{' '}
            <strong>Arvo complements existing infrastructure ecosystem</strong> like brokers and resilience mechanisms
            by providing standards and coding primitives that abstract underlying infrastructural needs. This separation
            of concerns allows <strong>business logic engineers to focus on event handlers</strong> without worrying
            about event transport and scaling, while{' '}
            <strong>platform engineers can concentrate on operational properties and infrastructure</strong> without
            needing to understand business logic.
          </p>
          <Separator padding={8} />
          <ReMark
            content={cleanString(`
            > **Note:** Though both teams must collaborate for optimal results, Arvo maximizes
              this decoupling to enable confident, flexible development within the broader event-driven ecosystem.
            `)}
          />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <LearningTiles
          data={[
            ArvoEventLearn,
            ArvoContractLearn,
            ArvoEventFactoryLearn,
            ArvoEventHandlerLearn,
            ArvoMachineLearn,
            ArvoOrchestratorLearn,
            ArvoResumableLearn,
          ]}
        />
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <p className={Md3Typography.body.large}>
            These foundational components work in harmony to create{' '}
            <strong>sophisticated event-driven architectures</strong> that adapt to your business requirements and
            enable you to build evolving, scalable systems. Arvo event handlers achieve{' '}
            <strong>full composability</strong> through their <strong>shared event structure and interface</strong>,
            ensuring seamless integration across the entire system. They maintain cohesion through Arvo's{' '}
            <strong>sophisticated contract system</strong>, which governs all event communication and guarantees{' '}
            <strong>type safety</strong>. This architecture enables you to declare <strong>complex workflows</strong>{' '}
            and implement <strong>intelligent agentic systems</strong> with confidence.
            <br />
            <br />
            The distributed design ensures no single point of control—all event handlers communicate as peers in a{' '}
            <strong>decentralized mesh</strong> that offers <strong>exceptional deployment flexibility</strong>, from a
            single server with an in-memory event broker to a full-scale distributed architecture with dedicated
            brokers, message queues, and enterprise infrastructure. The routing remains{' '}
            <strong>elegantly simple</strong>—event brokers need only examine each event's metadata to deliver it to the
            appropriate handler, creating a <strong>resilient and scalable foundation</strong> that grows with your
            business automation needs while maintaining operational simplicity.
          </p>
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <PageNavigation
        previous={{
          link: '/',
          heading: 'Getting Started',
          content: 'Set up your environment to start building with Arvo. See a getting started example to get inspired',
        }}
        next={{
          link: '/advanced',
          heading: 'Advanced Patterns',
          content:
            'Learn about advanced Arvo patterns which will enable you to understand operational and scalability aspect of Arvo',
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
