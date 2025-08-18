import { Md3Buttons } from '../../classNames/buttons';
import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Hero } from './components/Hero';
import { HiPuzzle, HiShieldCheck, HiTrendingUp, HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router';
import { Installation } from './components/Installation';
import { useMount } from '../../hooks/useMount';
import { runPhase3 } from '../../examples/simplicity_through_composition';

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
      <ContentContainer content>
        <section aria-labelledby='pillars'>
          <h2 id='pillars' className='sr-only'>
            Platform pillars
          </h2>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch'>
            {[
              {
                title: 'Compose with Clarity',
                icon: HiPuzzle,
                link: '/composition',
                content: (
                  <span>
                    Break down complex processes into modular, reusable components. Design and build once, then apply
                    across use cases—from single interactions to workflows to AI-driven enterprise orchestrations.
                  </span>
                ),
                cta: 'Learn About Composition',
              },
              {
                title: 'Operate with Assurance',
                icon: HiShieldCheck,
                link: '/reliability',
                content: (
                  <span>
                    Contract-first design and clear error boundaries let you build with certainty. OpenTelemetry tracing
                    gives end-to-end visibility, and event sourcing enables robust replayability.
                  </span>
                ),
                cta: 'Explore Reliability Features',
              },
              {
                title: 'Evolve with Ease',
                icon: HiTrendingUp,
                link: '/evolution',
                content: (
                  <span>
                    Treat evolution as a first-class concern. Contract-driven semantic versioning enables changes with
                    minimal downtime and safe experimentation with new features.
                  </span>
                ),
                cta: 'Discover Evolution Strategies',
              },
            ].map((item, index) => (
              <div key={index.toString()} className={`${Md3Cards.filled} p-4 flex flex-col h-full`}>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-on-surface/10'>
                    <item.icon className='w-6 h-6' />
                  </div>
                  <h3 className={`${Md3Typography.title.large} flex-1`}>{item.title}</h3>
                </div>

                <Separator padding={16} />
                <p className={Md3Typography.body.medium}>{item.content}</p>
                <div className='mt-auto' />
                <Separator padding={16} />
                <Link to={item.link} className={`${Md3Buttons.filledWithIcon} w-full sm:w-64`} aria-label={item.cta}>
                  <span>{item.cta}</span>
                  <HiArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <Installation />
      <Separator padding={36} />
    </main>
  );
});
