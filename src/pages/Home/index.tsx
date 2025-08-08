import { Md3Typography } from '../../classNames/typography';
import { ContentContainer } from '../../components/ContentContainer';
import { withNavBar } from '../../components/Navbar/withNavBar';
import { Separator } from '../../components/Separator';
import { CTA } from './components/CTA';
import { Hero } from './components/Hero';

export const HomePage = withNavBar(() => {
  return (
    <>
      <Separator padding={8} />
      <ContentContainer>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-[600px] lg:min-h-[500px]'>
          <Hero />
          <CTA />
        </div>

        {/* Optional: Add a subtle hint below */}
        <div className='mt-8 text-center'>
          <p className={`${Md3Typography.body.medium} text-on-surface-variant/60`}>
            Start simple, scale naturally • No infrastructure required to begin
          </p>
        </div>
      </ContentContainer>
      <Separator padding={8} />
    </>
  );
});
