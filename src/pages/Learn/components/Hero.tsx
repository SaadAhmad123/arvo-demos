import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { Separator } from '../../../components/Separator';
import {} from 'react-icons/hi';

export const Hero = () => (
  <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
    <div className={`${Md3Cards.inner.content}`}>
      <h1 className={`${Md3Typography.display.large} text-on-surface`}>Learn</h1>
      <Separator padding={24} />
      <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
        Whether you’re experimenting with your first project or building mission-critical services, Arvo{' '}
        <strong>plugs into your framework</strong> and <strong>scales with you</strong>—without rewrites or lock-in.
      </p>
    </div>
  </div>
);
