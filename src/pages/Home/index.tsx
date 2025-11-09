import { Md3ContentPadding } from '../../classNames';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { PageNavigation } from '../../components/PageNavigation';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Demo } from './components/Demo';
import { Hero } from './components/Hero';
import { Installation } from './components/Installation';
import { Pillers } from './components/Pillars';

export const HomePage = withNavBar(() => {
  return (
    <main>
      <Separator padding={8} />
      <ContentContainer>
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
            Build reliable &amp; platform-agnostic event-driven systems
          </h1>
          <Separator padding={8} />
          <p className={`${Md3Typography.body.large}`}>
            Arvo is an application-layer TypeScript toolkit designed to abstract infrastructure concerns, not replace
            them. It is neither infrastructure, an event broker, nor a messaging system—those solutions already exist
            and Arvo enables their integration into your application. Arvo provides code primitives and concepts for
            writing application logic that is compatible with distributed systems while leveraging the properties of
            event-driven architectures.
          </p>
        </div>
      </ContentContainer>

      <Pillers />
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
