import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Hero } from './components/Hero';
import { Installation } from './components/Installation';
import { useMount } from '../../hooks/useMount';
import { Pillers } from './components/Pillars';
import { Demo } from './components/Demo';
import { UnderConstruction } from './UnderConstruction';
import { Md3ContentPadding } from '../../classNames';

export const HomePage = withNavBar(() => {
  useMount(() => {
    // runPhase1();
    // runPhase2();
    // runPhase3();
    // runPhase4();
  });

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
            A toolkit for event-driven applications
          </h1>
          <Separator padding={8} />
          <p className={`${Md3Typography.body.large}`}>
            Arvo provides essential primitives at the <strong>application layer</strong> for event-driven systems. Write
            reliable, observable, portable business logic that integrates with any cloud, event broker, or messaging
            system. <strong>Arvo is not a broker or messaging platform</strong>—it helps you craft scalable, adaptable
            architectures that leverage your existing ecosystem.
          </p>
        </div>
      </ContentContainer>

      <Separator padding={18} />
      <Pillers />
      <Separator padding={18} />
      <Installation />
      <Separator padding={18} />
      <Demo />
      <Separator padding={18} />
      <Separator padding={36} />
    </main>
  );
});
