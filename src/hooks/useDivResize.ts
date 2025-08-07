import React, { useEffect } from 'react';

export const useDivResize = (
  ref: React.RefObject<HTMLDivElement | null>,
  onChange?: (param: {
    ref: React.RefObject<HTMLDivElement | null>;
    entry: ResizeObserverEntry;
  }) => void,
  dependencies?: unknown[],
) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: It must only run on mount
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((enteries) => {
      for (const entry of enteries) {
        onChange?.({ ref, entry });
      }
    });

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, dependencies ?? []);
};
