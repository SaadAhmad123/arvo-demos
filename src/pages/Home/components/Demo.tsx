import React from 'react';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { ContentContainer } from '../../../components/ContentContainer';
import { Separator } from '../../../components/Separator';
import { TabView } from '../../../components/TabView';
import CodeBlock from '../../../components/CodeBlock';

export const Demo: React.FC = () => {
  return (
    <>
      <ContentContainer content>
        <div className={`${Md3Cards.inner.content} pb-0!`}>
          <h1 className={Md3Typography.headline.large} id='getting-started'>
            Arvo in Your Stack
          </h1>
          <Separator padding={12} />
          <p className={Md3Typography.body.large}>
            Once you have installed the required dependencies in your project, you can start leveraging Arvo's
            comprehensive feature set. Arvo is designed to be <strong>minimally invasive</strong>, enabling seamless
            integration with <strong>any TypeScript framework</strong>. Whether you're building console applications,
            web servers using Hono or ExpressJS with HTTP, Server-Sent Events, or WebSocket support, AWS Lambda
            functions, or even frontend applications with ReactJS and VueJS,{' '}
            <strong>Arvo adapts to your architecture</strong>. The only requirements are providing an{' '}
            <strong>Arvo-compatible event broker and memory management solution</strong>. As you'll discover, Arvo's
            flexible design philosophy ensures <strong>broad plugable compatibility</strong> across diverse event
            brokers and memory management systems.
          </p>
        </div>
        <Separator padding={36} />
        <TabView
          tabs={[
            {
              label: 'Console',
              content: () => (
                <CodeBlock tabs={[{ title: 'index.ts', lang: 'ts', code: '// code comming soon\nconsole.log()' }]} />
              ),
            },
            {
              label: 'Server',
              content: () => (
                <CodeBlock tabs={[{ title: 'index.ts', lang: 'ts', code: '// code comming soon\nconsole.log()' }]} />
              ),
            },
            {
              label: 'Frontend',
              content: () => (
                <CodeBlock
                  tabs={[
                    {
                      title: 'index.tsx',
                      lang: 'ts',
                      code: '// code comming soon\nexport const Hello = () => <>Hello World</>',
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </ContentContainer>
    </>
  );
};
