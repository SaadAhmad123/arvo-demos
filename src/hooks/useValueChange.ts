import { useEffect, useRef } from 'react';

/**
 * A React hook that executes a callback function whenever a value changes.
 * Uses deep comparison to detect changes and provides both the new and previous values.
 *
 * @template T - The type of the value being watched
 * @param value - The value to watch for changes. Make sure it is JSON serialisable.
 * @param func - Callback function executed when the value changes, receives new and old values
 *
 * @example
 * ```tsx
 * const [user, setUser] = useState({ name: 'John', age: 30 });
 *
 * useChange(user, (newUser, oldUser) => {
 *   console.log('User changed from', oldUser, 'to', newUser);
 *   // Track analytics, sync with server, etc.
 * });
 * ```
 */
export const useValueChange = <T>(value: T, func: (newVal: T, oldValue: T | null) => void) => {
  const ref = useRef<T | null>(null);
  const funcRef = useRef(func);

  // Preventing stale closures
  funcRef.current = func;

  useEffect(() => {
    if (JSON.stringify(ref.current) === JSON.stringify(value)) return;
    funcRef.current(value, ref.current);
    ref.current = value;
  }, [value]);
};
