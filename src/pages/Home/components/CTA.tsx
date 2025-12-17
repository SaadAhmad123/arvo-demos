import { MdArrowForward, MdAutoStories } from 'react-icons/md';
import { Link } from 'react-router';
import { Md3Cards } from '../../../classNames/cards';
import { FaRobot } from 'react-icons/fa6';
import { AgenticResumableDesignLearn } from '../../../components/LearningTiles/data';

export const CTA = () => (
  <div className={`${Md3Cards.filled} flex flex-col w-full overflow-hidden`}>
    <a
      href='#getting-started'
      className='flex-1 flex flex-col items-center justify-center text-center px-6 py-8 bg-primary-container text-on-primary-container hover:brightness-110 transition-all duration-200 min-h-[160px] cursor-pointer'
    >
      <div className='mb-3 p-3 bg-on-primary-container/10 rounded-xl'>
        <MdArrowForward className='text-2xl' />
      </div>
      <span className='text-xl font-medium'>Get Started</span>
      <span className='text-sm opacity-80 mt-1'>Begin your journey with Arvo</span>
    </a>

    <Link
      to='/learn'
      className='flex-1 flex flex-col items-center justify-center text-center px-6 py-8 bg-primary text-on-primary hover:brightness-110 transition-all duration-200 min-h-[160px] cursor-pointer'
    >
      <div className='mb-3 p-3 bg-on-primary/10 rounded-xl'>
        <MdAutoStories className='text-2xl' />
      </div>
      <span className='text-xl font-medium'>Documentation</span>
      <span className='text-sm opacity-80 mt-1'>Explore guides & API reference</span>
    </Link>

    <Link
      to={AgenticResumableDesignLearn.link}
      className='flex-1 flex flex-col items-center justify-center text-center px-6 py-8 bg-tertiary-container text-on-tertiary-container hover:brightness-110 transition-all duration-200 min-h-[160px] cursor-pointer'
    >
      <div className='mb-3 p-3 bg-on-tertiary-container/10 rounded-xl'>
        <FaRobot className='text-2xl' />
      </div>
      <span className='text-xl font-medium'>Agentic Paradigm</span>
      <span className='text-sm opacity-80 mt-1'>Learn about event-driven agentic systems</span>
    </Link>
  </div>
);
