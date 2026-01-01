import { FaLightbulb, FaPuzzlePiece } from 'react-icons/fa6';
import { MdHome, MdGavel } from 'react-icons/md';
import type { NavOption } from './types';

export const navOptions: NavOption[] = [
  {
    title: 'Home',
    icon: <MdHome size={24} />,
    link: '/',
    isSelected: (location) => location.pathname === '/',
  },
  {
    title: 'Learn',
    icon: <FaPuzzlePiece size={18} />,
    link: '/learn',
    isSelected: (location) => location.pathname.startsWith('/learn'),
  },
  {
    title: 'Advanced',
    icon: <FaLightbulb size={18} />,
    link: '/advanced',
    isSelected: (location) => location.pathname.startsWith('/advanced'),
  },
  {
    title: 'License',
    icon: <MdGavel size={20} />,
    link: '/license',
    isSelected: (location) => location.pathname === '/license',
  },
];
