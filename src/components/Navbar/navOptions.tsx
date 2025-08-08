import type { NavOption } from './types';
import { MdHome } from 'react-icons/md';

export const navOptions: NavOption[] = [
  {
    title: 'Home',
    icon: <MdHome size={24} />,
    link: '/',
    isSelected: (location) => location.pathname === '/',
  },
];
