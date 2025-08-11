import { Link } from 'react-router';
import { Md3Buttons } from '../../classNames/buttons';
import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Hero } from './components/Hero';
import {
  HiCheckCircle,
  HiLightningBolt,
  HiCube,
  HiPuzzle,
  HiShieldCheck,
  HiTrendingUp,
  HiArrowRight,
} from 'react-icons/hi';
import { runPhase3 } from '../../examples/simplicity_through_composition';
import { useMount } from '../../hooks/useMount';

export const HomePage = withNavBar(() => {
  useMount(() => {
    // runPhase1();
    // runPhase2();
    runPhase3();
    //runPhase4();
  });

  return (
    <>
      <Separator padding={8} />
      <ContentContainer>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'>
          <Hero />
          <CTA />
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer>
        <div className='flex flex-wrap items-center justify-center gap-2'>
          {[
            [HiCheckCircle, 'Production Ready'],
            [HiLightningBolt, 'Built for Scale'],
            [HiCube, 'Infrastructure Agnostic'],
          ].map(([Icon, text], index) => (
            <div
              key={index.toString()}
              className={`${Md3Cards.outlined} p-4 flex items-center justify-center gap-2 text-sm text-on-surface-variant w-full sm:w-auto`}
            >
              <Icon className='w-5 h-5' />
              <span className='font-medium'>{text as string}</span>
            </div>
          ))}
        </div>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer>
        <p className={`${Md3Typography.body.large} text-center text-on-surface sm:px-4 xl:px-16`}>
          Arvo is an enterprise-grade toolkit that provides essential primitives for building event-driven applications
          at the <strong>application layer</strong>. It enables you to write reliable, observable, and portable business
          logic that seamlessly interfaces with any cloud infrastructure, event broker, or messaging system.{' '}
          <strong>Arvo is not another event broker or messaging platform</strong> – instead, it empowers you to create
          scalable, adaptable application architectures that leverage existing technologies within the event-driven
          ecosystem.
        </p>
      </ContentContainer>
      <Separator padding={36} />
      {/* TODO - This strucutre is fine. Now make the content of each card better */}
      <ContentContainer>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {[
            {
              title: 'Simplicity Through Composition',
              icon: HiPuzzle,
              link: '/',
              content: (
                <span>
                  Build complex event-driven systems using simple, reusable primitives. Start small, scale seamlessly
                  without architectural rewrites.
                </span>
              ),
              cta: 'Learn About Composition',
            },
            {
              title: 'Built-in Reliability',
              icon: HiShieldCheck,
              link: '/',
              content: (
                <span>
                  Contract-validated interactions, distributed tracing, and event sourcing built-in. Eliminate
                  integration bugs before they reach production.
                </span>
              ),
              cta: 'Explore Reliability Features',
            },
            {
              title: 'Evolutionary Architecture',
              icon: HiTrendingUp,
              link: '/',
              content: (
                <span>
                  Semantic contract versioning enables safe system evolution. Deploy, migrate, and rollback service
                  changes with complete confidence.
                </span>
              ),
              cta: 'Discover Evolution Strategies',
            },
          ].map((item, index) => (
            <div key={index.toString()} className={`${Md3Cards.filled} p-4`}>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-on-surface/10'>
                  <item.icon className='w-6 h-6' />
                </div>
                <h1 className={`${Md3Typography.title.large} flex-1`}>{item.title}</h1>
              </div>
              <Separator padding={16} />
              <p className={`${Md3Typography.body.medium}`}>{item.content}</p>
              <Separator padding={16} />
              <Link to={item.link} className={`${Md3Buttons.filledWithIcon} w-full sm:w-64`}>
                <span>{item.cta}</span>
                <HiArrowRight />
              </Link>
              <Separator padding={8} />
            </div>
          ))}
        </div>
      </ContentContainer>
      <Separator padding={36} />
      <Separator padding={8} />
    </>
  );
});
