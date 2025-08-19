import type React from 'react';
import { Md3Typography } from '../classNames/typography';

export const Label: React.FC<{ content: string }> = ({ content }) => (
  <p className={`${Md3Typography.label.small} bg-tertiary! text-on-tertiary! px-3 py-2 rounded-3xl inline-block mb-2!`}>
    {content}
  </p>
);
