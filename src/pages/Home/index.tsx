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
            Build enterprise-grade applications and systems where AI, agents, humans, workflows, and business logic can
            collaborate seamlessly to deliver valuable &amp; transformative solutions.
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
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={`
# \`@arvo-tools\` — Arvo's Standard Library

Once you've mastered Arvo's core paradigm, explore the 
[\`@arvo-tools\`](https://github.com/SaadAhmad123/arvo-tools/tree/main/packages) 
ecosystem which is Arvo's standard library providing production-ready 
infrastructure implementations. These packages help you deploy 
applications across various modalities and infrastructure 
configurations without changing your business logic.

## Leveraging JavaScript Concurrency

For example, the \`@arvo-tools/concurrent\` package provides 
concurrent in-process event routing and state management, enabling 
you to maximize JavaScript's concurrency capabilities within 
a single Node.js process.

<br/>

\`\`\`bash
pnpm add @arvo-tools/concurrent
\`\`\`

<br/>

Integrating concurrent infrastructure into the previous example 
requires minimal changes to \`main.ts\`:

<br/>

\`\`\`typescript
import { confirm } from '@inquirer/prompts';
import { ArvoEvent, createArvoEventFactory } from 'arvo-core';
import { addHandler } from './handlers/add.service.ts';
import { productHandler } from './handlers/product.service.ts';
import { averageWorkflow } from './handlers/average.workflow.ts';
import {
  weightedAverageContract,
  weightedAverageResumable,
} from './handlers/weighted.average.resumable.ts';
import {
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { humanApprovalContract } from './handlers/human.approval.contract.ts';
import {
  ConcurrentMachineMemory,
  createConcurrentEventBroker,
} from '@arvo-tools/concurrent';


const tracer = trace.getTracer('main-agent-tracer');
const TEST_EVENT_SOURCE = 'test.test.test';

// Replace SimpleMachineMemory with concurrent implementation
const memory = new ConcurrentMachineMemory();

export const executeHandlers = async (
  event: ArvoEvent,
): Promise<ArvoEvent[]> => {
  const domainedEvents: ArvoEvent[] = [];
  
  // Replace SimpleEventBroker with concurrent implementation
  // Each handler gets independent concurrency control via prefetch limits
  const { resolve, broker } = createConcurrentEventBroker([
    { handler: addHandler(), prefetch: 2 },
    { handler: productHandler(), prefetch: 2 },
    { handler: averageWorkflow({ memory }), prefetch: 3 },
    { handler: weightedAverageResumable({ memory }), prefetch: 2 },
  ], {
    onDomainedEvents: async ({ event }) => {
      domainedEvents.push(event);
    },
  });
  const response = await resolve(event);
  broker.clear();
  return response ? [response, ...domainedEvents] : domainedEvents;
};

// Rest of the code remains unchanged
\`\`\`

<br/>

The concurrent broker maintains per-handler concurrency limits 
through independent queue management, enabling optimal throughput 
for I/O-bound handlers while preventing resource exhaustion. 
\`ConcurrentMachineMemory\` adds atomic locking with automatic 
expiration, preventing race conditions when multiple handlers 
access the same workflow state.

Additional \`@arvo-tools\` packages supporting various deployment 
modalities and infrastructure integrations will continue expanding 
the ecosystem.
          `}
          />
        </div>
      </ContentContainer>
      <Separator padding={36} />
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
