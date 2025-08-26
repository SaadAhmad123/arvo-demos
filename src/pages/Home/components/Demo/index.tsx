import React from 'react';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { Separator } from '../../../../components/Separator';
import { GreetingTab } from './CodeTabs/Greeting';
import CodeBlock from '../../../../components/CodeBlock';
import { AdderTab } from './CodeTabs/Adder';
import { ExecuteTab } from './CodeTabs/Execute';
import { TestExecuteTab } from './CodeTabs/TestExecute';

export const Demo: React.FC = () => {
  return (
    <>
      <ContentContainer content>
        <div className={Md3Cards.inner.content}>
          <h1 className={Md3Typography.headline.large}>Arvo in your Stack - Say, Hello World!</h1>
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
            We'll start by creating portable core business logic, then show you how to deploy it across different
            platforms. The beauty of Arvo is that <strong>the same business logic runs everywhere</strong> – from
            Node.js scripts and servers to React apps to AWS Lambda functions.
            <br />
            <br />
            These platform examples represent just a fraction of what's possible. Arvo works with any TypeScript
            environment, event broker (Redis, RabbitMQ, AWS SQS, etc.), or database.{' '}
            <strong>Arvo encourages you to build the execution environment the way you see fit</strong> and provides
            clean interfaces to implement functionality for state persistence and event brokering within your existing
            architecture.
          </p>
          <Separator padding={18} />
          <h1 className={Md3Typography.headline.small}>Architecture - What Are We Building?</h1>
          <Separator padding={12} />
          <p className={`${Md3Typography.body.large}`}>
            This example demonstrates a simple event-driven system with three core components:
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
              <strong>Orchestrator:</strong> Coordinates both handlers by taking a name and age, then returning both a
              greeting and the age plus 7
            </li>
          </ul>
          <Separator padding={9} />
          <p className={Md3Typography.body.large}>
            This architecture showcases how Arvo enables you to compose simple, focused handlers into more complex
            workflows while maintaining clean separation of concerns and full observability.
          </p>
        </div>

        <CodeBlock tabs={[ExecuteTab, TestExecuteTab, GreetingTab, AdderTab]} />
      </ContentContainer>
    </>
  );
};
