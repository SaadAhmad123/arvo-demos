import { TbStack2 } from 'react-icons/tb';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { ContentContainer } from '../../../components/ContentContainer';
import { Separator } from '../../../components/Separator';
import { HiBolt } from 'react-icons/hi2';
import { BiUnite } from 'react-icons/bi';
import { Md3ContentPadding } from '../../../classNames';

export const Pillers: React.FC = () => {
  return (
    <ContentContainer content>
      <section className={`${Md3ContentPadding} px-0!`}>
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch'>
          {[
            {
              title: 'Write business logic without infrastructure lock-in',
              icon: TbStack2,
              content: (
                <span>
                  Organize your business logic with clean interfaces without referencing specific infrastructure. Deploy
                  the same code across console applications, web servers, or distributed event-driven architectures
                  without significant modification.
                </span>
              ),
            },
            {
              title: 'Enterprise capabilities that accelerate rather than constrain',
              icon: HiBolt,
              content: (
                <span>
                  Implement your logic with primitives which encapsulate enterprise-grade capablities enabling you to
                  write composable, reliable, observable and scalable code from day one. As your application grows you
                  can choose to leverage the capabilities however you like.
                </span>
              ),
            },
            {
              title: 'Simplicity that scales with coherence',
              icon: BiUnite,
              content: (
                <span>
                  Implement a unified model that remains consistent across all levels of complexity. Build quickly with
                  minimal architectural overhead while maintaining the same patterns from simple logic to complex use
                  cases. Master the fundamentals once and apply them across use cases, without relearning paradigms as
                  your needs evolve.
                </span>
              ),
            },
          ].map((item, index) => (
            <div key={index.toString()} className={`${Md3Cards.filled} ${Md3Cards.inner.content} flex flex-col h-full`}>
              <div className='flex items-center xl:items-start gap-3'>
                <div className='p-2 rounded-lg bg-on-surface/10 xl:mt-1'>
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

/**
 
**Write Business Logic Without Infrastructure Lock-in**

Write your business logic in event handlers with clean interfaces without
referencing specific infrastructure. Deploy and utilize the same logic across
any modality ranging from console applications, to web servers to distributed
clusters. You can defer your infrastructureal choices to the time when you need
to make those choices.

****


**Simplicity that scales with coherence**



 */
