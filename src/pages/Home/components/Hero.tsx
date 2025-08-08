import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { Separator } from '../../../components/Separator';

export const Hero = () => (
  <div className={`${Md3Cards.filled} px-6 py-10 md:px-8 md:py-16 lg:px-10 lg:py-20 flex flex-col justify-center`}>
    <h1 className={`${Md3Typography.display.large} font-bold tracking-tight text-on-surface`}>Arvo</h1>

    <Separator padding={2} />

    <p className={`${Md3Typography.headline.medium} text-on-surface-variant font-light`}>
      A toolkit for service choreography
    </p>

    <Separator padding={24} />

    <p className={`${Md3Typography.body.large} text-on-surface-variant leading-relaxed`}>
      Build reliable, evolutionary event-driven applications that scale from simple microservices to complex distributed
      workflows and intelligent agents
    </p>
  </div>
);
