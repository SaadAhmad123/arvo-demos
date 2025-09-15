import { Link } from 'react-router';
import { Md3ContentPadding } from '../../classNames';
import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { ReMark } from '../../components/ReMark';
import { Separator } from '../../components/Separator';
import { cleanString } from '../../utils';
import { PageNavigation } from '../../components/PageNavigation';

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
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {[
            {
              name: 'ArvoEvent',
              summary:
                'Self-describing event structure extending CloudEvents with enterprise-grade routing, observability, and validation capabilities for reliable distributed communication.',
              link: '/learn/arvo-event',
            },
            {
              name: 'ArvoContract',
              summary:
                'TypeScript-Zod contract system enabling contract-first development with compile-time type safety, runtime validation, and semantic versioning support.',
              link: '/learn/arvo-contract',
            },
            {
              name: 'ArvoEventFactory',
              summary:
                'Intelligent abstraction layer for creating contract-compliant ArvoEvents with automatic validation, OpenTelemetry integration, and streamlined event construction.',
              link: '/learn/arvo-event-factory',
            },
            {
              name: 'ArvoEventHandler',
              summary:
                'Basic event handler implementing request-response patterns with contract enforcement, comprehensive error handling, and consistent execution signatures.',
              link: '/learn/arvo-event-handler',
            },
            {
              name: 'ArvoMachine',
              summary:
                'Declarative state machine builder using XState for defining complex workflows with contract binding, synchronous execution, and domain-aware event emission.',
              link: '/learn/arvo-machine',
            },
            {
              name: 'ArvoOrchestrator',
              summary:
                'Specialized event handler providing robust execution environment for ArvoMachine with lifecycle management, telemetry integration, and distributed coordination.',
              link: '/learn/arvo-orchestrator',
            },
            {
              name: 'ArvoResumable',
              summary:
                'Imperative orchestration handler using familiar async/await patterns to manage distributed workflows with explicit control and simplified debugging.',
              link: '/learn/arvo-resumable',
            },
          ].map((item, index) => (
            <Link to={item.link} key={index.toString()} className={`${Md3Cards.elevated} cursor-pointer`}>
              <div className={Md3Cards.inner.content}>
                <div className={`mb-4 ${Md3Typography.headline.large}`}>{item.name}</div>
                <div className={`${Md3Typography.body.medium} opacity-75`}>{item.summary}</div>
              </div>
            </Link>
          ))}
        </div>
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
