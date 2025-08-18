import React from 'react';

type DividerProps = {
  inset?: boolean; // Indented divider (like list dividers)
  vertical?: boolean; // Vertical divider
  padding?: number; // Optional spacing
  className?: string; // Extra classes
};

export const Divider: React.FC<DividerProps> = ({ inset, vertical, padding = 8, className = '' }) => {
  if (vertical) {
    return (
      <div
        aria-orientation='vertical'
        className={`self-stretch w-px bg-outline-variant ${inset ? 'ml-4' : ''} ${className}`}
        style={{ margin: `0 ${padding}px` }}
      />
    );
  }

  return (
    <hr
      className={`border-0 h-px bg-outline-variant ${inset ? 'ml-4' : ''} ${className}`}
      style={{ margin: `${padding}px 0` }}
    />
  );
};
