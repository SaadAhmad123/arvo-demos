import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Hero } from './components/Hero';
import { Installation } from './components/Installation';
import { Pillers } from './components/Pillars';
import { Demo } from './components/Demo';
import { UnderConstruction } from './UnderConstruction';
import { Md3ContentPadding } from '../../classNames';
import { Comparison } from './components/Comparison';
import { PageNavigation } from '../../components/PageNavigation';

export const HomePage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
        <UnderConstruction />
        <Separator padding={8} />
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
            A toolkit for reliable event-driven systems
          </h1>
          <Separator padding={8} />
          <p className={`${Md3Typography.body.large}`}>
            Arvo provides TypeScript-native primitives for event-driven applications. Write type-safe, observable
            business logic that integrates with any cloud provider, event broker, or messaging system. Arvo is not a
            broker or messaging platform—it's the application layer that makes distributed systems predictable and
            maintainable.
          </p>
        </div>
      </ContentContainer>

      <Separator padding={18} />
      <Pillers />
      <Separator padding={18} />
      <Comparison />
      <Separator padding={18} />
      <Installation />
      <Separator padding={18} />
      <Demo />
      <Separator padding={18} />
      <PageNavigation
        next={{
          link: '/learn',
          heading: 'Learn Arvo',
          content: "Let's learn more about Arvo and how to build your next application with it.",
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
