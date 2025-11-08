import { HiPuzzle, HiShieldCheck, HiTrendingUp } from 'react-icons/hi';
import { Md3ContentPadding } from '../../../classNames';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { ContentContainer } from '../../../components/ContentContainer';
import { Separator } from '../../../components/Separator';

export const Pillers: React.FC = () => {
  return (
    <ContentContainer content>
      <section aria-labelledby='pillars' className={Md3ContentPadding}>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch'>
          {[
            {
              title: 'Contract-First Development',
              icon: HiShieldCheck,
              content: (
                <span>
                  Define your service interfaces as TypeScript contracts with automatic validation, type inference, and
                  semantic versioning. Every event is validated at compile-time and runtime.
                </span>
              ),
            },
            {
              title: 'Deploy & Scale with Flexibility',
              icon: HiPuzzle,
              content: (
                <span>
                  Write business logic once, deploy anywhere. The same handlers run in Node.js, browsers, serverless
                  functions, or distributed clusters without modification.
                </span>
              ),
            },
            {
              title: 'Enterprise-Grade Orchestration',
              icon: HiTrendingUp,

              content: (
                <span>
                  Coordinate complex workflows using state machines or imperative handlers. Built-in OpenTelemetry
                  tracing, error boundaries, and cost tracking from day one.
                </span>
              ),
            },
          ].map((item, index) => (
            <div key={index.toString()} className={`${Md3Cards.filled} ${Md3Cards.inner.content} flex flex-col h-full`}>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-on-surface/10'>
                  <item.icon className='w-8 h-8' />
                </div>
                <h3 className={`${Md3Typography.title.large} flex-1`}>{item.title}</h3>
              </div>
              <Separator padding={16} />
              <p className={Md3Typography.body.medium}>{item.content}</p>
            </div>
          ))}
        </div>
      </section>
    </ContentContainer>
  );
};
