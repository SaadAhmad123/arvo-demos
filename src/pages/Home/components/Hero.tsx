import { HiCodeBracket, HiCube, HiShieldCheck } from 'react-icons/hi2';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { Separator } from '../../../components/Separator';

export const Hero = () => (
  <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
    <div className={`${Md3Cards.inner.content}`}>
      <h1 className={`${Md3Typography.display.large} text-on-surface`}>Arvo</h1>
      <Separator padding={24} />
      <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
        A foundational toolkit for building the next-generation of transformative applications.
      </p>
      <Separator padding={24} />
      <div className='flex flex-wrap gap-2'>
        {[
          { label: 'TypeScript Native', icon: HiCodeBracket },
          { label: 'Infrastructure Agnostic', icon: HiCube },
          { label: 'Enterprise-Grade', icon: HiShieldCheck },
        ].map((tag) => (
          <div key={tag.label} className='flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20'>
            <tag.icon className='w-4 h-4 text-primary' />
            <span className={`${Md3Typography.label.small} text-primary`}>{tag.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
