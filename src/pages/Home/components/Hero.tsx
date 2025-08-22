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
        A toolkit for event-driven applications
      </p>
      <Separator padding={24} />
      <p className={`${Md3Typography.headline.small} text-on-surface-variant`}>
        Build <strong>enterprise-grade</strong> event-driven services, <strong>Agentic AI</strong> systems and{' '}
        <strong>workflows</strong> that are <span className='underline'>composable</span>,{' '}
        <span className='underline'>reliable</span>, <span className='underline'>observable</span>,{' '}
        <span className='underline'>evolvable</span>, and <span className='underline'>scalable</span>.
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
