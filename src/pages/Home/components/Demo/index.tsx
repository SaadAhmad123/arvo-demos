import React from 'react';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { Separator } from '../../../../components/Separator';
import { Md3ContentPadding } from '../../../../classNames';
import { ExecuteTab } from './CodeTabs/Execute';
import { TestExecuteTab } from './CodeTabs/TestExecute';
import { SimpleHandlersTab } from './CodeTabs/SimpleHandlers';
import { GreetingOrchestratorTab } from './CodeTabs/GreetingOrchestrator';
import { Md3Cards } from '../../../../classNames/cards';
import { ReMark } from '../../../../components/ReMark';
import CodeBlock from '../../../../components/CodeBlock';
import { GreetingResumableTab } from './CodeTabs/GreetingResumable';

export const Demo: React.FC = () => {
  //useMount(testArvoDemo);

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
              <strong>Agentic Orchestrator:</strong> An imperative orchestrator (powered by ArvoResumable) that
              coordinates workflows in a step-by-step programming style. It's especially useful for agentic AI use
              cases, where workflow decisions depend on dynamic inputs such as LLM outputs, API responses, or human
              feedback.
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
      <ContentContainer>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {[ExecuteTab, TestExecuteTab, SimpleHandlersTab, GreetingOrchestratorTab, GreetingResumableTab].map(
            (item, index) => (
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
            ),
          )}
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding} ${Md3Typography.body.large} !pb-0`}>
          <h1 className={Md3Typography.headline.large}>Nature of Orchestration in Arvo</h1>
          <Separator padding={9} />
          <p>
            Orchestration in Arvo is designed to feel natural within the broader event-driven model. Rather than relying
            on a centralized workflow engine, <strong>orchestrators are just specialized event handlers</strong> that
            manage state, emit events, and coordinate other handlers. This allows orchestration logic to run anywhere
            your handlers run—locally, in serverless environments, or across distributed clusters.
          </p>
          <Separator padding={9} />
          <p>Two orchestration styles are available out of the box:</p>
          <Separator />
          <ul className='ml-6 space-y-2 list-disc'>
            <li>
              <strong>State-Machine Orchestrators:</strong> Declarative workflows built on XState, ideal for
              well-defined, predictable processes that benefit from visualization and strong guarantees.
            </li>
            <li>
              <strong>Resumable (Imperative) Orchestrators:</strong> Step-by-step workflows written in a familiar coding
              style, perfect for <em>agentic AI scenarios</em> or dynamic processes where the next step depends on
              runtime inputs such as LLM responses, API calls, or human-in-the-loop actions.
            </li>
          </ul>
          <Separator padding={9} />
          <p>
            A key characteristic of Arvo’s execution model is its <strong>start–stop nature</strong>. Orchestrators do
            not run as long-lived threads; instead, they process an incoming event, emit the next set of events, persist
            their state, and then pause. When responses or follow-up events arrive, the orchestrator resumes from where
            it left off. This design delivers several benefits:
          </p>
          <Separator />
          <ul className='ml-6 space-y-2 list-disc'>
            <li>
              <strong>Resource Efficiency:</strong> No CPU or memory is consumed while waiting—thousands of workflows
              can be in flight without heavy infrastructure costs.
            </li>
            <li>
              <strong>Horizontal Scalability:</strong> Since orchestrators are stateless between events, new instances
              can be spun up easily to handle load without coordination overhead.
            </li>
            <li>
              <strong>Resiliency:</strong> If a process crashes mid-orchestration, another instance can pick up
              seamlessly using the persisted state in <code>IMachineMemory</code>.
            </li>
          </ul>
          <Separator padding={9} />
          <p>
            This dual approach—<em>structured state machines</em> plus <em>imperative resumables</em>—combined with the
            start–stop execution model means you can model both predictable workflows and adaptive AI-driven processes
            in the same system. All orchestrators use contracts for type-safety and observability, making them easy to
            evolve, compose, and test without central bottlenecks.
          </p>
        </div>
      </ContentContainer>
    </>
  );
};
