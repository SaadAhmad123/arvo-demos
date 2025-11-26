import { Md3ContentPadding } from '../../classNames';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
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
            Build reliable &amp; platform-agnostic event-driven systems
          </h1>
          <Separator padding={8} />
          <p className={`${Md3Typography.body.large}`}>
            Arvo is an application-layer TypeScript toolkit designed to abstract infrastructure concerns, not replace
            them. It is neither infrastructure, an event broker, nor a messaging system—those solutions already exist
            and Arvo enables their integration into your application. Arvo provides code primitives and concepts for
            writing application logic that is compatible with distributed systems while leveraging the properties of
            event-driven architectures.
          </p>
        </div>
      </ContentContainer>
      <Pillers />
      <ContentContainer content>
        <div className={`${Md3ContentPadding} pb-0!`}>
          <ReMark
            content={cleanString(`
              # What is Arvo?

              Before getting into Arvo you should understand what it is all about. Arvo is an **application-layer 
              programming paradigm** for writing event-driven and distributed systems-compliant business logic, 
              expressed as a **TypeScript toolkit**.

              **Arvo is not infrastructure.** It's not an event broker, not a messaging system, not a deployment 
              platform. Those solutions already exist (RabbitMQ, Kafka, Redis, AWS, GCP, Dapr) and Arvo enables you to 
              integrate them into your application without coupling your business logic to any specific infrastructure.

              **Arvo is also not a framework** in sense that it doesn't control your code's execution or impose rigid architectural 
              constraints on your application. You use Arvo's primitives to structure your logic, but the code you write remains 
              fully integrable with your existing TypeScript stack. Your Arvo logic can live in your REST API (ExpressJS,
              HonoJS, etc.) and be exposed as endpoints without needing event queue infrastructure, then be moved to different 
              modalities (console app, AWS SQS + Lambda) without changing your business logic. You swap infrastructure integrations 
              code, not the business logic you write.

              ## The Core Paradigm

              Arvo embodies one simple principle applied consistently. Almost all business logic can be modeled as 
              independent services. These services coordinate with each other by passing contract-compliant events, 
              making them event handlers that transform events. Within an event handler, complexity is unrestricted.

              A handler accepts events defined by its contract and emits events according to that same contract. 
              It manages its state via a memory manager class governed by a uniform interface. The handler doesn't 
              know where it runs, what broker delivers its events, what database stores its state, or which other handlers 
              exist in the system. It only knows its boundaries. What events it accepts, what events it emits, and the 
              business logic in between.

              As you will explore across this documentation. This uniformity means the same primitives apply to almost 
              every type of business logic.

              - **Simple services** are handlers that accept requests and emit responses
              - **Complex service coordinators** are handlers that coordinate other handlers by accepting and emitting events
              - **AI-driven agents** are handlers that use AI to decide which events to emit
              - **Orchestrators** are handlers that internally execute and manage state machines or imperative coordination logic, deciding what events to emit and how to react to received events
              - **External systems and human interactions** can be modeled as event handlers that listen to events emitted by the system via different channels (Arvo calls these domains) and send data back via events.

              For all these patterns and more, the same interface, testing approach, deployment flexibility, 
              and observability patterns apply.

              ## Why This Gives You Everything

              Traditional event driven and distributed systems tools are infrastructure-focused and lock you into specific 
              technologies and operational modes. Frameworks optimize for narrow problems. Workflow engines for orchestration. 
              Agent frameworks for AI. Message brokers for eventing. Service meshes for distribution. Each requires different 
              mental models, different tooling, different deployment approaches.

              Arvo treats these as expressions of the same underlying pattern. Event handlers communicating through contracts. 
              You're not learning separate systems for workflows versus agents versus services. You're learning one way of 
              structuring application logic that naturally expresses all of them.

              This coherence emerges from treating event-driven architecture not as infrastructure you deploy, but 
              as the application programming model itself. Your business logic is event handlers. Infrastructure 
              integration (with brokers, state stores, queues, etc) becomes a configurable part of you application code and does 
              not couple with your business logic (In Arvo's opinion, this where a lot of the issues come from).

              When you write a handler in Arvo, you're writing domain logic. When you deploy that handler, you're configuring 
              infrastructure. The separation is complete. Business logic engineers focus on contracts, validation rules, 
              and coordination patterns. Platform engineers focus on routing, persistence, scaling, and operational 
              concerns. Both layers evolve independently.

              ## Infrastructure Independence

              The Arvo event handlers you write work with any infrastructure integrating with Arvo's simple interfaces.

              - Event routing through any broker (RabbitMQ, Kafka, SQS, Redis, or in-memory queues)
              - State persistence through any store (DynamoDB, PostgreSQL, Redis, or local memory)  
              - Deployment in any environment (serverless functions, containers, VMs, edge devices, or your laptop)

              Arvo want to help you write your business logic once. Change infrastructure without touching that logic. Start development 
              with in-memory components, move to managed services in production, migrate providers without rewrites. 
              Your handlers remain unchanged because they depend on contracts and interfaces, not concrete implementations.

              This separation means platform engineers can optimize infrastructure for operational requirements 
              (cost, latency, compliance, geographic distribution) while application engineers write handlers expressing 
              domain logic. The layers evolve independently without much coordination overhead.

              ## What Makes Arvo Different

              Arvo isn't an incremental improvement on existing tools. It's a different way of thinking about 
              business logic implementation that scales as much as needed, across various deployment topologies, 
              giving you the ability to leverage the powerful properties of event-driven applications to deliver 
              user experiences that are hard to model in other architectures without requiring you to commit 
              entirely to event-driven infrastructure.

              Most tools and frameworks started from a specific problem. How do we orchestrate workflows? How 
              do we build AI agents? How do we handle events? Then they expanded from there. The original 
              paradigm constrains what's architecturally possible. 

              Arvo started from a different question. How do we write application logic that leverages all the 
              properties and flexibility of event-driven systems without forcing infrastructure lock-in, while 
              remaining scalable to a great degree and deployable however needed? The answer Arvo provides is a 
              set of well-engineered primitives that help you write business logic in an event-driven, 
              distributed systems-compliant manner.

              Arvo isn't about choosing between workflows or agents or event meshes. It's about expressing all 
              of them and more through one coherent programming model where composition is natural, testing is straightforward, 
              and production-grade properties emerge from the architecture rather than being added as features.
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
          link: '/learn',
          heading: 'Learn Arvo',
          content: "Let's learn more about Arvo and how to build your next application with it.",
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
