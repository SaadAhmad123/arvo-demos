import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { Md3ContentPadding } from '../../classNames';
import { LearningTiles } from '../../components/LearningTiles';
import {
  AgenticResumableDesignLearn,
  AgenticSystemExampleLearn,
  ArvoEventDataFieldDeepDiveLearn,
  ErrorBoundariesLearn,
  EventRoutingAndBrokerInArvoLearn,
  MultiDomainBroadcastingLearn,
} from '../../components/LearningTiles/data';

export const AdvancedPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>Advanced</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Master enterprise-grade patterns for scalable, observable, and resilient event-driven architectures
              </p>
            </div>
          </div>
          <img alt='advanced illustration' src='/advanced.png' className='rounded-3xl object-cover lg:h-full' />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <p className={Md3Typography.body.large}>
            Arvo's foundational components—events, contracts, and handlers—compose into sophisticated architectural
            patterns that address enterprise-scale challenges. While the core concepts remain straightforward, their
            orchestration enables complex workflows, distributed coordination, and resilient system design.
            Understanding these patterns empowers you to build systems that scale horizontally, maintain observability
            across distributed boundaries, and evolve gracefully as business requirements change.
          </p>
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <LearningTiles
          data={[
            EventRoutingAndBrokerInArvoLearn,
            ArvoEventDataFieldDeepDiveLearn,
            AgenticResumableDesignLearn,
            AgenticSystemExampleLearn,
            ErrorBoundariesLearn,
            MultiDomainBroadcastingLearn,
          ]}
        />
      </ContentContainer>
      <Separator padding={72} />
    </main>
  );
});
