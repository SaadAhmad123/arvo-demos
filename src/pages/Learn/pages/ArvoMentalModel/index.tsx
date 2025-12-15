import { useMemo } from 'react';
import { Md3ContentPadding } from '../../../../classNames';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { Label } from '../../../../components/Label';
import { ArvoEventLearn, ArvoMentalModelLearn } from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString, getReadingStats } from '../../../../utils';
import { ArvoMentalModelContent } from './content';

export const ArvoMentalModelPage = withNavBar(() => {
  const readingStats = useMemo(() => {
    return getReadingStats(ArvoMentalModelContent);
  }, []);

  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 xl:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
            <div className={`${Md3Cards.inner.content}`}>
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoMentalModelLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Learn how Arvo let's you express your application logic that naturally leverages the event-driven system
                capabilities.
              </p>
            </div>
          </div>
          <img
            alt='arvo event factory illustration'
            src='/arvo-mental-model.png'
            className='rounded-3xl object-cover lg:h-full'
          />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <Label content={`${readingStats.wordCount} words · ${readingStats.estimatedMinutes} min read`} />
          <Separator padding={16} />
          <h1 className={Md3Typography.headline.small}>
            Arvo is <strong>not an infrastructure layer</strong>—it's an application-layer TypeScript toolkit that{' '}
            <strong>
              embodies a functional, event-driven programming paradigm which is distributed system compliant
            </strong>
            . It abstracts infrastructure concerns, enabling you to integrate existing solutions into your application.
            It provides code primitives and concepts for writing application logic that is compatible with distributed
            systems and leverages event-driven architecture properties.
          </h1>
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark bodyTextSize='large' content={ArvoMentalModelContent} />
        </div>
      </ContentContainer>
      <ContentContainer content>
        <div className={`${Md3ContentPadding}`}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              # Learn More

              Continue exploring additional concepts to deepen your understanding of Arvo and 
              its ecosystem.
            `)}
          />
        </div>
      </ContentContainer>
      <PageNavigation
        next={{
          heading: ArvoEventLearn.name,
          link: ArvoEventLearn.link,
          content: ArvoEventLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
