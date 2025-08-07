import { useEffect } from 'react';
import { useReactiveRef } from './useReactiveRef';

/**
 * This hook runs only when the component is mounted
 */
export const useMount = (callback: () => void, dependencies?: React.DependencyList) => {
  const { get, set } = useReactiveRef(false);
  useEffect(() => {
    if (get()) return;
    set(true);
    callback();
  }, [get, set, callback, ...(dependencies ?? [])]);
};
