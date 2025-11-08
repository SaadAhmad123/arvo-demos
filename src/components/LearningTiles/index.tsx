import { Link } from 'react-router';
import { Md3Cards } from '../../classNames/cards';
import { Md3Typography } from '../../classNames/typography';
import type { LearningTileData } from './data';

export const LearningTiles: React.FC<{ data: LearningTileData[] }> = ({ data }) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {data.map((item, index) => (
        <Link to={item.link} key={index.toString()} className={`${Md3Cards.hoverable_filled} cursor-pointer`}>
          <div className={Md3Cards.inner.content}>
            <div className={`mb-4 ${Md3Typography.headline.large}`}>{item.name}</div>
            <div className={`${Md3Typography.body.medium} opacity-75`}>{item.summary}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};
