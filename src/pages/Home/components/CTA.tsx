import { Md3Cards } from '../../../classNames/cards';
import { Link } from 'react-router';
import { MdArrowForward, MdAutoStories } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';

export const CTA = () => (
  <div className={`${Md3Cards.filled} flex flex-col w-full overflow-hidden`}>
    <Link
      to='/getting-started'
      className='flex-1 flex flex-col items-center justify-center text-center px-6 py-8 bg-primary text-on-primary hover:brightness-110 transition-all duration-200 min-h-[160px] cursor-pointer'
    >
      <div className='mb-3 p-3 bg-on-primary/10 rounded-xl'>
        <MdArrowForward className='text-2xl' />
      </div>
      <span className='text-xl font-medium'>Get Started</span>
      <span className='text-sm opacity-80 mt-1'>Begin your journey with Arvo</span>
    </Link>

    <Link
      to='/docs'
      className='flex-1 flex flex-col items-center justify-center text-center px-6 py-8 bg-secondary text-on-secondary hover:brightness-110 transition-all duration-200 min-h-[160px] cursor-pointer'
    >
      <div className='mb-3 p-3 bg-on-secondary/10 rounded-xl'>
        <MdAutoStories className='text-2xl' />
      </div>
      <span className='text-xl font-medium'>Documentation</span>
      <span className='text-sm opacity-80 mt-1'>Explore guides & API reference</span>
    </Link>

    <a
      href='https://github.com/SaadAhmad123/arvo-core'
      target='_blank'
      rel='noopener noreferrer'
      className='flex-1 flex flex-col items-center justify-center text-center px-6 py-8 bg-tertiary text-on-tertiary hover:brightness-110 transition-all duration-200 min-h-[160px] cursor-pointer'
    >
      <div className='mb-3 p-3 bg-on-tertiary/10 rounded-xl'>
        <FaGithub className='text-2xl' />
      </div>
      <span className='text-xl font-medium'>GitHub</span>
      <span className='text-sm opacity-80 mt-1'>Star on GitHub</span>
    </a>
  </div>
);
