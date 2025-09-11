import React from 'react';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { Separator } from '../../../../components/Separator';
import { useMount } from '../../../../hooks/useMount';
import { testArvoDemo } from '../../../../examples/execute.test';
import { Md3Buttons } from '../../../../classNames/buttons';
import { HiLightningBolt } from 'react-icons/hi';
import { Md3ContentPadding } from '../../../../classNames';
import { ExecuteTab } from './CodeTabs/Execute';
import { TestExecuteTab } from './CodeTabs/TestExecute';
import { SimpleHandlersTab } from './CodeTabs/SimpleHandlers';
import { GreetingOrchestratorTab } from './CodeTabs/GreetingOrchestrator';
import { Md3Cards } from '../../../../classNames/cards';
import { ReMark } from '../../../../components/ReMark';
import CodeBlock from '../../../../components/CodeBlock';

export const Demo: React.FC = () => {
  useMount(testArvoDemo);

  return (
    <>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <h1 className={Md3Typography.headline.large}>Explore Arvo in your Stack</h1>
          <Separator padding={12} />
          <p className={Md3Typography.body.large}>
            Let's build a "Hello World" example to demonstrate Arvo's core capabilities. This interactive example will
            show you how to:
          </p>
          <Separator padding={9} />
          <ul className={`${Md3Typography.body.large} ml-6 space-y-2 list-disc`}>
            <li>
              <strong>Build business logic</strong> using Arvo's event-driven patterns
            </li>
            <li>
              <strong>Enable event brokering</strong> through in-memory brokers
            </li>
            <li>
              <strong>Run the same logic</strong> across console, server, and frontend environments
            </li>
          </ul>
          <Separator padding={9} />
          <p className={`${Md3Typography.body.large}`}>
            We'll start by creating portable core business logic, then later explore how to deploy it across different
            platforms. The beauty of Arvo is that <strong>the same business logic runs everywhere</strong> - from
            Node.js scripts and servers to React apps to AWS Lambda functions. Arvo works with any TypeScript{' '}
            <strong>Arvo encourages you to build the execution environment the way you see fit</strong> and provides
            clean interfaces to implement functionality for state persistence and event brokering within your existing
            architecture.
          </p>
          <Separator padding={18} />
          <h1 className={Md3Typography.headline.small}>Architecture - What Are We Building?</h1>
          <Separator padding={12} />
          <p className={`${Md3Typography.body.large}`}>
            This example demonstrates a simple event-driven system with four core components:
          </p>
          <Separator padding={9} />
          <ul className={`${Md3Typography.body.large} ml-6 space-y-2 list-disc`}>
            <li>
              <strong>Greeting Handler:</strong> Receives a name and returns a personalized "Hello World" message
            </li>
            <li>
              <strong>Math Handler:</strong> Takes two numbers and returns their sum
            </li>
            <li>
              <strong>Orchestration Handler:</strong> A state-machine based orchestration handler which coordinates both
              handlers by taking a name and age, then returning both a greeting and the age plus seven
            </li>
            <li>
              <strong>Event Broker:</strong> Routes events seamlessly between handlers using an in-memory broker that
              runs in any JavaScript runtime without requiring external message brokers
            </li>
          </ul>
          <Separator padding={9} />
          <p className={Md3Typography.body.large}>
            This architecture showcases how Arvo enables you to compose simple, focused handlers into more complex
            workflows while maintaining clean separation of concerns and full observability.
          </p>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {[ExecuteTab, TestExecuteTab, SimpleHandlersTab, GreetingOrchestratorTab].map((item, index) => (
            <React.Fragment key={index.toString()}>
              <div className={Md3Cards.filled}>
                <div className={Md3Cards.inner.content}>
                  <h2 className={Md3Typography.headline.large}>{item.heading}</h2>
                  <Separator padding={8} />
                  <ReMark content={item.description} />
                </div>
              </div>
              <CodeBlock tabs={item.tabs} />
            </React.Fragment>
          ))}
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} ${Md3Typography.body.large} !pb-0`}>
          <h1 className={Md3Typography.headline.large}>Nature of Orchestration in Arvo</h1>
          <Separator padding={9} />
          <p>
            It can be observed that Arvo's orchestrators represent a fundamental shift in event-driven architecture
            design. Unlike traditional systems where orchestrators act as centralized coordinators that own entire
            workflows, <strong>Arvo treats orchestrators as specialized event handlers</strong> that can receive and
            emit multiple event types while maintaining persistent internal state. This architectural approach offers
            several key advantages over conventional orchestration patterns:
          </p>
          <Separator padding={9} />
          <ul className='ml-6 space-y-2 list-disc'>
            <li>
              <strong>Eliminates Single Points of Failure:</strong> Orchestrators function as distributed event handlers
              rather than centralized bottlenecks
            </li>
            <li>
              <strong>Enables Horizontal Scaling:</strong> Multiple orchestrator instances can process events
              concurrently without coordination overhead
            </li>
            <li>
              <strong>Distributed Event Routing:</strong> Built-in routing intelligence with Arvo Event Handlers removes
              the need for complex broker-level routing logic
            </li>
          </ul>
          <Separator padding={9} />
          <p>
            Whether using state-machine-based or imperative orchestration patterns, Arvo orchestrators follow the same
            event handler contract: they consume events and produce arrays of output events. This consistency enables{' '}
            <strong>seamless composition, testing, and deployment</strong> across your entire event-driven system while
            maintaining the flexibility to handle complex workflow requirements.
          </p>
          <Separator padding={18} />
          <button type='button' className={Md3Buttons.filledWithIcon}>
            <HiLightningBolt className='w-4 h-4' />
            Learn About Routing Intelligence
          </button>
        </div>
      </ContentContainer>
    </>
  );
};
