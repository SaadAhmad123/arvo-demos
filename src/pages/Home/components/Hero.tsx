import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { Separator } from '../../../components/Separator';
import { HiCheckCircle, HiLightningBolt, HiCube } from 'react-icons/hi';

export const Hero = () => (
  <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
    <div className={`${Md3Cards.inner.content}`}>
      <h1 className={`${Md3Typography.display.large} font-bold tracking-tight text-on-surface`}>Arvo</h1>
      <Separator padding={2} />
      <p className={`${Md3Typography.headline.medium} text-on-surface-variant font-light`}>
        A toolkit for service choreography
      </p>
      <Separator padding={24} />
      <p className={`${Md3Typography.body.large} text-on-surface-variant leading-relaxed`}>
        Arvo provides essential primitives at the <strong>application layer</strong> for event-driven systems. Write
        reliable, observable, portable business logic that integrates with any cloud, event broker, or messaging system.{' '}
        <strong>Arvo is not a broker or messaging platform</strong>—it helps you craft scalable, adaptable architectures
        that leverage your existing ecosystem.
      </p>
      <Separator padding={24} />
      <div className='flex flex-wrap items-center justify-center sm:justify-start gap-6'>
        {[
          [HiCheckCircle, 'Production Ready'],
          [HiCube, 'Typescript Native'],
          [HiLightningBolt, 'Built to Scale'],
        ].map(([Icon, text], index) => (
          <div
            key={index.toString()}
            className='text-xs flex items-center justify-center gap-2 text-sm text-on-surface-variant'
          >
            <Icon className='w-5 h-5' />
            <span className='font-medium'>{text as string}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
