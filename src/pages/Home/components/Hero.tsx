import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { Separator } from '../../../components/Separator';

export const Hero = () => (
  <div className={`${Md3Cards.filled} px-4 py-8 md:px-8 md:py-16 lg:px-10 lg:py-20 flex flex-col justify-center`}>
    <h1 className={`${Md3Typography.display.large} font-bold tracking-tight text-on-surface`}>Arvo</h1>

    <Separator padding={2} />

    <p className={`${Md3Typography.headline.medium} text-on-surface-variant font-light`}>
      A toolkit for service choreography
    </p>

    <Separator padding={24} />

    <p className={`${Md3Typography.body.large} text-on-surface-variant leading-relaxed`}>
      Build reliable, scalable, and adaptable event-driven applications using an enterprise-grade Node.js toolkit.
      Develop sophisticated AI agents, automated workflows, and robust business applications with the flexibility to
      deploy anywhere and scale seamlessly as your needs evolve.
    </p>
  </div>
);
