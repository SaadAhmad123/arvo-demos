import {} from 'react-icons/hi';
import { Md3Cards } from '../../../classNames/cards';
import { Md3Typography } from '../../../classNames/typography';
import { Separator } from '../../../components/Separator';

export const Hero = () => (
  <div className={`${Md3Cards.filled} flex flex-col justify-center`}>
    <div className={`${Md3Cards.inner.content}`}>
      <h1 className={`${Md3Typography.display.large} text-on-surface`}>Arvo</h1>
      <Separator padding={24} />
      <p className={`${Md3Typography.headline.medium} text-on-surface-variant`}>
        The TypeScript toolkit for enterprise-grade event-driven applications that are composable, reliable, observable,
        and scalable.
      </p>
    </div>
  </div>
);
