import { useState } from 'react';
import { useReactiveRef } from './useReactiveRef';

export const useReactiveState = <T>(initialValue: T, onChange?: (newValue?: T, oldValue?: T) => void) => {
  const [state, setState] = useState<T>(initialValue);
  const stateReactiveRef = useReactiveRef<T>(initialValue, (newVal, oldVal) => {
    setState(newVal as T);
    onChange?.(newVal, oldVal);
  });

  return {
    state,
    get: stateReactiveRef.get,
    set: stateReactiveRef.set,
  };
};
