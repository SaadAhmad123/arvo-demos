import React from 'react';
import { Link, useLocation } from 'react-router';
import type { NavOption } from './types';

export const NavButton: React.FC<NavOption> = ({ title, icon, link, isSelected }) => {
  const location = useLocation();

  return (
    <Link to={link} className={'group size-[56px] flex flex-col items-center justify-center'}>
      <span
        className={`flex items-center justify-center w-[56px] h-[32px] group-hover:bg-surface-variant rounded-[16px] transition-all duration-400 ${isSelected(location) ? 'bg-secondary-container' : ''} mb-[4px]`}
      >
        {icon}
      </span>
      <span className='text-[12px]'>{title}</span>
    </Link>
  );
};
