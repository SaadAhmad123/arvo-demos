import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import { Separator } from '../../components/Separator';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { Md3Buttons } from '../../classNames/buttons';

export const UnderConstruction = () => (
  <div className={`${Md3Cards.filled} p-6 `}>
    <div className='flex items-center gap-3'>
      <HiExclamationTriangle className='text-amber-600 text-2xl flex-shrink-0' />
      <h1 className={Md3Typography.title.large}>Site Under Development</h1>
    </div>
    <Separator />
    <div className='space-y-4'>
      <p className={Md3Typography.body.medium}>
        This website is currently under development. While we work on improving the user experience, please refer to our
        comprehensive technical documentation for complete information about Arvo.
      </p>
      <div className='flex flex-col sm:flex-row gap-3 pt-2'>
        <a
          href='https://saadahmad123.github.io/arvo-event-handler/documents/ArvoEventHandler.html'
          target='_blank'
          rel='noopener noreferrer'
          className={Md3Buttons.outlined}
        >
          Arvo Event Handler Documentation
        </a>
        <a
          href='https://saadahmad123.github.io/arvo-core/index.html'
          target='_blank'
          rel='noopener noreferrer'
          className={Md3Buttons.outlined}
        >
          Arvo Core Documentation
        </a>
      </div>
      <p className={`${Md3Typography.body.small} text-on-surface-variant/70 italic`}>
        Thank you for your patience as we build something great.
      </p>
    </div>
  </div>
);
