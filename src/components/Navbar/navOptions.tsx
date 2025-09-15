import type { NavOption } from './types';
import { MdHome } from 'react-icons/md';
import { FaLightbulb, FaPuzzlePiece } from 'react-icons/fa6';

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
];
