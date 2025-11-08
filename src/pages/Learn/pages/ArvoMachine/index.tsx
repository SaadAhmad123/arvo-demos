import { Md3ContentPadding } from '../../../../classNames';
import { Md3Buttons } from '../../../../classNames/buttons';
import { Md3Cards } from '../../../../classNames/cards';
import { Md3Typography } from '../../../../classNames/typography';
import { ContentContainer } from '../../../../components/ContentContainer';
import {
  ArvoEventHandlerLearn,
  ArvoMachineLearn,
  ArvoOrchestratorLearn,
} from '../../../../components/LearningTiles/data';
import { withNavBar } from '../../../../components/Navbar/withNavBar';
import { PageNavigation } from '../../../../components/PageNavigation';
import { ReMark } from '../../../../components/ReMark';
import { Separator } from '../../../../components/Separator';
import { cleanString } from '../../../../utils';

export const ArvoMachinePage = withNavBar(() => {
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
              <h1 className={`${Md3Typography.display.large} text-on-surface`}>{ArvoMachineLearn.name}</h1>
              <Separator padding={24} />
              <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
                Declarative state machine definition for orchestrating event-driven multi-step workflows
              </p>
              <Separator padding={16} />
              <a
                href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoMachine__Core_Components_and_Event_Emission.html'
                target='_blank'
                rel='noreferrer'
                className={Md3Buttons.filled}
              >
                Read Technical Documentation
              </a>
            </div>
          </div>
          <img
            alt='arvo event factory illustration'
            src='/ArvoMachineImage.png'
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
              Docs coming soon...
            `)}
          />
        </div>
      </ContentContainer>
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
          heading: ArvoEventHandlerLearn.name,
          link: ArvoEventHandlerLearn.link,
          content: ArvoEventHandlerLearn.summary,
        }}
        next={{
          heading: ArvoOrchestratorLearn.name,
          link: ArvoOrchestratorLearn.link,
          content: ArvoOrchestratorLearn.summary,
        }}
      />
      <Separator padding={54} />
    </main>
  );
});
