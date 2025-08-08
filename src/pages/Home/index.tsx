import { ContentContainer } from '../../components/ContentContainer';
import { HiArrowRight, HiDocumentText, HiCheckCircle, HiLightningBolt, HiCube, HiSparkles } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

export const HomePage = () => {
  return (
    <>
      <ContentContainer>
        <div className='min-h-[80vh] px-4 py-16 md:py-24 flex flex-col justify-center items-center text-center max-w-5xl mx-auto'>
          {/* Main heading with MD3 typography scale */}
          <h1 className='text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-4 text-on-surface'>ARVO</h1>

          {/* MD3 Display Small for tagline */}
          <p className='text-2xl md:text-4xl font-normal text-on-surface-variant mb-8'>
            A toolkit for service choreography
          </p>

          {/* MD3 Body Large for description */}
          <p className='text-base md:text-lg text-on-surface-variant max-w-3xl mb-12 leading-relaxed font-normal'>
            Build reliable, evolutionary event-driven applications that scale from simple microservices to complex
            distributed workflows and intelligent agents
          </p>

          {/* MD3 styled buttons - Filled, Outlined, and Tonal */}
          <div className='flex flex-col sm:flex-row gap-4 mb-16'>
            {/* Filled button - primary action */}
            <button className='relative px-6 py-3 bg-primary text-on-primary rounded-full font-medium text-sm tracking-wide hover:shadow-md transition-all duration-200 hover:bg-primary-container flex items-center gap-2 justify-center'>
              Get Started
              <HiArrowRight className='w-4 h-4' />
            </button>

            {/* Outlined button */}
            <button className='px-6 py-3 border border-outline text-primary rounded-full font-medium text-sm tracking-wide hover:bg-surface-variant/10 transition-all duration-200 flex items-center gap-2 justify-center'>
              <HiDocumentText className='w-4 h-4' />
              Documentation
            </button>

            {/* Tonal button */}
            <button className='px-6 py-3 bg-secondary-container text-on-secondary-container rounded-full font-medium text-sm tracking-wide hover:shadow-sm transition-all duration-200 flex items-center gap-2 justify-center'>
              <FaGithub className='w-4 h-4' />
              GitHub
            </button>
          </div>

          {/* MD3 Surface Container with trust indicators */}
          <div className='flex flex-wrap justify-center gap-6 md:gap-8 p-4 rounded-2xl bg-surface-variant/30'>
            <span className='flex items-center gap-2 text-sm text-on-surface-variant'>
              <HiCheckCircle className='w-5 h-5 text-primary' />
              <span className='font-medium'>Production Ready</span>
            </span>
            <span className='flex items-center gap-2 text-sm text-on-surface-variant'>
              <HiSparkles className='w-5 h-5 text-primary' />
              <span className='font-medium'>Contract-First</span>
            </span>
            <span className='flex items-center gap-2 text-sm text-on-surface-variant'>
              <HiLightningBolt className='w-5 h-5 text-primary' />
              <span className='font-medium'>Built for Scale</span>
            </span>
            <span className='flex items-center gap-2 text-sm text-on-surface-variant'>
              <HiCube className='w-5 h-5 text-primary' />
              <span className='font-medium'>Infrastructure Agnostic</span>
            </span>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};
