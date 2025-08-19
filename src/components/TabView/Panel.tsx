import React from 'react';
import { Md3Typography } from '../../classNames/typography';
import type { TabPanelProps } from './types';

export const Md3TabPanel: React.FC<TabPanelProps> = ({ tabId, activeTab, children, className = '' }) => {
  const isActive = tabId === activeTab;
  if (!isActive) return null;
  return (
    <div
      className={`${Md3Typography.body.medium} ${className}`}
      role='tabpanel'
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
    >
      {children}
    </div>
  );
};
