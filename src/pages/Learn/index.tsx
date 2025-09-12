import { Md3ContentPadding } from '../../classNames';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { Hero } from './components/Hero';

export const LearnPage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <section
          className='grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'
          aria-labelledby='hero-title'
        >
          <Hero />
          <img alt='learning illustration' src='/learning.png' className='rounded-3xl object-cover' />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <p className={`${Md3Typography.body.large} text-on-surface-variant`}>
            Arvo makes event-driven development clear, fast, and powerful. With just a handful of core concepts, you can
            create workflows that are reliable, observable, and easy to evolve. It’s simple enough to learn in an
            afternoon, yet robust enough to support enterprise-scale systems.
          </p>
        </div>
      </ContentContainer>
      <Separator padding={18} />
    </main>
  );
});
