import { useState, useEffect, useCallback, useRef } from 'react';

type URLStateValue = string | number | boolean;
type UseUrlStateReturn<T extends URLStateValue> = [T, (value: T | ((prev: T) => T)) => void];

const defaultSerialize = <T extends URLStateValue>(value: T): string => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const defaultDeserialize = <T extends URLStateValue>(value: string, defaultValue: T): T => {
  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as T;
  }

  if (typeof defaultValue === 'number') {
    const num = Number(value);
    return (Number.isNaN(num) ? defaultValue : num) as T;
  }

  return value as T;
};

/**
 * A React hook that synchronizes component state with URL search parameters.
 *
 * @template T - The type of the state value (string, number, or boolean)
 * @param key - The URL search parameter key to sync with
 * @param defaultValue - The default value to use when the URL parameter is not present
 * @param serialize - Optional custom serialization function to convert the value to a string
 * @param deserialize - Optional custom deserialization function to convert the string back to the value
 * @returns A tuple containing the current state value and a setter function
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useUrlState('q', '');
 * const [page, setPage] = useUrlState('page', 1);
 * const [isActive, setIsActive] = useUrlState('active', false);
 * ```
 */
export const useUrlState = <T extends URLStateValue>(
  key: string,
  defaultValue: T,
  serialize: (value: T) => string = defaultSerialize,
  deserialize: (value: string) => T = (value) => defaultDeserialize(value, defaultValue),
): UseUrlStateReturn<T> => {
  const isUpdatingRef = useRef(false);

  const getCurrentUrlValue = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }, [key]);

  const [state, setState] = useState<T>(() => {
    const urlValue = getCurrentUrlValue();

    if (urlValue !== null) {
      try {
        return deserialize(urlValue);
      } catch {
        return defaultValue;
      }
    }

    return defaultValue;
  });

  const updateUrl = useCallback(
    (newValue: T) => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);

      if (newValue === defaultValue || newValue === '' || newValue === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, serialize(newValue));
      }

      isUpdatingRef.current = true;
      window.history.replaceState(null, '', url.toString());
      // Reset flag after a microtask to allow other hooks to process
      Promise.resolve().then(() => {
        isUpdatingRef.current = false;
      });
    },
    [key, defaultValue, serialize],
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        updateUrl(newValue);
        return newValue;
      });
    },
    [updateUrl],
  );

  useEffect(() => {
    const handleUrlChange = () => {
      // Prevent updates during our own URL changes
      if (isUpdatingRef.current) return;

      const urlValue = getCurrentUrlValue();

      if (urlValue !== null) {
        try {
          const deserializedValue = deserialize(urlValue);
          setState((prev) => {
            if (serialize(prev) !== urlValue) {
              return deserializedValue;
            }
            return prev;
          });
        } catch {
          setState(defaultValue);
        }
      } else {
        setState((prev) => {
          if (serialize(prev) !== serialize(defaultValue)) {
            return defaultValue;
          }
          return prev;
        });
      }
    };

    // Use setTimeout to defer the URL change handling to the next tick
    const deferredHandleUrlChange = () => {
      setTimeout(handleUrlChange, 0);
    };

    window.addEventListener('popstate', handleUrlChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      originalPushState.apply(window.history, args);
      deferredHandleUrlChange();
    };

    window.history.replaceState = (...args) => {
      originalReplaceState.apply(window.history, args);
      deferredHandleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [getCurrentUrlValue, defaultValue, deserialize, serialize]);

  return [state, setValue];
};

const serializeObject = <T extends object>(value: T): string => {
  try {
    const jsonString = JSON.stringify(value);
    return btoa(jsonString);
  } catch {
    throw new Error('Failed to serialize object');
  }
};

const deserializeObject = <T extends object>(value: string, defaultValue: T): T => {
  try {
    const jsonString = atob(value);
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as T;
    }

    return defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * A React hook that synchronizes complex object state with URL search parameters.
 * The object is automatically serialized to a base64-encoded JSON string for URL storage.
 *
 * @template T - The type of the object state (must extend object)
 * @param key - The URL search parameter key to sync with
 * @param defaultValue - The default object value to use when the URL parameter is not present
 * @returns A tuple containing the current object state and a setter function
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useUrlStateComplex('filters', {
 *   category: 'all',
 *   priceRange: { min: 0, max: 1000 },
 *   tags: ['popular']
 * });
 *
 * // Update the entire object
 * setFilters({ category: 'electronics', priceRange: { min: 50, max: 500 }, tags: [] });
 *
 * // Update using a function
 * setFilters(prev => ({ ...prev, category: 'books' }));
 * ```
 */
export const useUrlStateComplex = <T extends object>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [_state, _setState] = useUrlState<string>(key, serializeObject(defaultValue));
  const [state, setState] = useState<T>(() => {
    try {
      return deserializeObject(_state, defaultValue);
    } catch {
      return defaultValue;
    }
  });
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = typeof value === 'function' ? value(prev) : value;
        _setState(serializeObject(newValue));
        return newValue;
      });
    },
    [_setState],
  );
  return [state, setValue];
};
