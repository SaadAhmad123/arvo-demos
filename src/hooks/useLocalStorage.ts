import { useCallback } from 'react';

/**
 * This hook is used to interact with the local storage of the
 * browser.
 * @param key - [Optional] Set this key to define the key of the value which
 * the hook will be responsible to manage. If no value is provided the functions returned will be
 * expecting a key to retrieve value
 */
export const useLocalStorage = <T>(key?: string) => {
  const get = useCallback(
    (_key?: string) => {
      if (!window?.localStorage) return undefined;
      const storageKey = key || _key || undefined;
      if (!storageKey) return undefined;
      try {
        return JSON.parse(window.localStorage.getItem(storageKey) as string).value as T;
      } catch {
        return undefined;
      }
    },
    [key],
  );
  const set = useCallback(
    (value: T, _key?: string) => {
      if (!window?.localStorage) return false;
      const storageKey = key || _key || undefined;
      if (!storageKey) return false;
      window.localStorage.setItem(storageKey, JSON.stringify({ value }));
      return true;
    },
    [key],
  );
  return { get, set } as {
    get: (_key?: string) => undefined | T;
    set: (value: T, _key?: string) => boolean;
  };
};
