import React from 'react';

type SeparatorProps = {
  padding?: number;
  horizontal?: boolean;
};

export const Separator: React.FC<SeparatorProps> = ({ padding = 4, horizontal }) => {
  if (horizontal) {
    return <div style={{ display: 'inline-block', padding: `0 ${padding}px` }} />;
  }
  return <div style={{ display: 'block', padding: `${padding}px 0` }} />;
};

export const BlockSeparator = () => <Separator padding={48} />;
export const HeadingSeparator = () => <Separator padding={16} />;
export const ParagraphSeparator = () => (
  <>
    <br />
    <br />
  </>
);
