import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Hero } from './components/Hero';
import {} from 'react-icons/hi';
import { Installation } from './components/Installation';
import { useMount } from '../../hooks/useMount';
import { runPhase3 } from '../../examples/simplicity_through_composition';
import { Pillers } from './components/Pillars';
import { Demo } from './components/Demo';

export const HomePage = withNavBar(() => {
  useMount(() => {
    // runPhase1();
    // runPhase2();
    runPhase3();
    //runPhase4();
  });

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
        <section aria-labelledby='core-message'>
          <div className={Md3Cards.inner.content}>
            <h1 id='core-message' className={`${Md3Typography.headline.large} leading-12`}>
              An enterprise-grade toolkit for building event-driven
              <strong> AI agentic systems and workflows</strong> that are composable, reliable, observable, evolvable,
              and scalable.
            </h1>
          </div>
        </section>
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
