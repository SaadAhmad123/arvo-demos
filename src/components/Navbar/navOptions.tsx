import type { NavOption } from './types';
import { AiOutlineHome } from 'react-icons/ai';

export const navOptions: NavOption[] = [
  {
    title: 'Home',
    icon: <AiOutlineHome size={24} />,
    link: '/',
    isSelected: (location) => location.pathname === '/',
  },
];
