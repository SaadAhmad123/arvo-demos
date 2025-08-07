import { useCallback, useRef } from 'react';

export const useReactiveRef = <T>(initialValue: T, onChange?: (newValue: T, oldValue?: T) => void) => {
  const ref = useRef<T>(initialValue);
  const onChangeCallback = useRef<((newValue: T, oldValue?: T) => void) | undefined>(onChange);

  const get = () => {
    return ref.current;
  };

  const set = (value: T) => {
    const oldValue = ref.current;
    ref.current = value;
    onChangeCallback.current?.(value, oldValue);
  };

  const setOnChange = useCallback((cb: (newValue: T, oldValue?: T) => void) => {
    onChangeCallback.current = cb;
  }, []);

  return { get, set, onChange: setOnChange };
};
