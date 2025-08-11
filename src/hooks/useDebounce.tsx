import { useRef } from 'react';

export const useDebounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const funcRef = useRef(func);
  funcRef.current = func;
  const invoke = (...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => funcRef.current(...args), delay);
  };

  return invoke;
};
