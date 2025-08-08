import React from 'react';
import { ContentContainer } from '../components/ContentContainer';
import { Separator } from '../components/Separator';
import imageUrl from '/404.png';
import { Link } from 'react-router';

export const NotFoundPage: React.FC = () => {
  return (
    <ContentContainer>
      <div className='flex flex-col items-center justify-center'>
        <Separator padding={48} />
        <img src={imageUrl} alt='Page not found' className='max-w-[400px] h-auto' />
        <Separator padding={32} />
        <h1 className='text-2xl sm:text-3xl'>This page cannot be found</h1>
        <Separator padding={8} />
        <p className='text-normal sm:text-lg text-center'>
          Try a different destination or head back <br />
          to the{' '}
          <Link to='/' className='text-primary underline hover:text-blue-600'>
            homepage
          </Link>
          .
        </p>
        <Separator padding={24} />
        <p className='text-xs opacity-60'>
          Image sourced from{' '}
          <a
            href='https://m3.material.io/sadada'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-800 hover:underline'
          >
            Material Design
          </a>
          .
        </p>
      </div>
    </ContentContainer>
  );
};
