import type { Location } from 'react-router';

export type NavOption = {
  title: string;
  link: string;
  icon: React.ReactNode;
  isSelected: (location: Location) => boolean;
};
