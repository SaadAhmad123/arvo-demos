import { Link } from 'react-router';
import { ContentContainer } from './ContentContainer';
import { Md3Cards } from '../classNames/cards';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { Separator } from './Separator';
import { Md3Typography } from '../classNames/typography';

type PageNavigationItem = {
  link: string;
  heading: string;
  content: string;
};

type PageNavigationProps = {
  previous?: PageNavigationItem;
  next?: PageNavigationItem;
};

export const PageNavigation: React.FC<PageNavigationProps> = ({ previous, next }) => (
  <ContentContainer content>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {previous ? (
        <Link to={previous.link} className={`${Md3Cards.hoverable_filled} w-full block`}>
          <div className={Md3Cards.inner.content}>
            <p className='flex items-center gap-2'>
              <FaArrowLeft />
              <span>Previous</span>
            </p>
            <Separator padding={8} />
            <h1 className={Md3Typography.headline.medium}>{previous.heading}</h1>
            <Separator />
            <p className={Md3Typography.body.medium}>{previous.content}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link to={next.link} className={`${Md3Cards.hoverable_filled} w-full block`}>
          <div className={Md3Cards.inner.content}>
            <p className='flex items-center gap-2'>
              <span>Up Next</span>
              <FaArrowRight />
            </p>
            <Separator padding={8} />
            <h1 className={Md3Typography.headline.medium}>{next.heading}</h1>
            <Separator />
            <p className={Md3Typography.body.medium}>{next.content}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  </ContentContainer>
);
