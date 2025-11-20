import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import { ArvoMachineLearn, ArvoOrchestratorLearn, ArvoResumableLearn } from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';
import { Demo } from './Demo';

export const ArvoOrchestratorPage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoOrchestratorLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                he execution engine that brings state machines to life in Arvo's event-driven ecosystem
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoOrchestrator.html'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read Technical Documentation
              </a>
            </div>
          </div>
          <img
            alt='arvo orchestrator illustration'
            src='/arvo-orchestrator.png'
            className='rounded-3xl object-cover lg:h-full'
          />
        </section>
      </ContentContainer>
      <Separator padding={18} />
      <ContentContainer content>
        <div className={Md3ContentPadding}>
          <ReMark
            bodyTextSize='large'
            content={cleanString(`
              The \`ArvoOrchestrator\` is the execution engine that powers Arvo's workflow 
              system. It's a sophisticated runtime that transforms declarative state machine 
              definitions into production-ready, event-driven orchestrations. By bridging the 
              gap between your workflow logic and the distributed infrastructure underneath, it 
              handles all the operational complexity so you can focus on building reliable
              workflows. It handles event routing and management, state persistence, state machine 
              version management, and state machine execution error handling so your workflow 
              logic stays clean and declarative.
            `)}
          />
        </div>
      </ContentContainer>
      <Demo />
      <Separator padding={18} />
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
        previous={{
          heading: ArvoMachineLearn.name,
          link: ArvoMachineLearn.link,
          content: ArvoMachineLearn.summary,
        }}
        next={{
          heading: ArvoResumableLearn.name,
          link: ArvoResumableLearn.link,
          content: ArvoResumableLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
