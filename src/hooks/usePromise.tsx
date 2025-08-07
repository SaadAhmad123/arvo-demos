import { useCallback, useState } from 'react';
import retryPromise from './helpers/retryPromise';
import { useReactiveState } from './useReactiveState';

export type UsePromiseState = 'idle' | 'error' | 'loading' | 'success';

/**
 * A hook that returns an object containing the state, error, and a retry function for a promise.
 * @param promiseFn - A promise-returning function to be retried.
 * @param dependencies - The promise function dependencies.
 * @param retryCount - The number of times to retry the promise function. Default is 3.
 * @param retryDelay - The delay in milliseconds between each retry. Default is 1000.
 * @returns An object containing the state, error, and a retry function for the promise.
 */
export const usePromise = <T extends unknown[], R>(
  promiseFn: (...args: T) => Promise<R>,
  dependencies: unknown[] = [],
  retryCount = 3,
  retryDelay = 1000,
  throwError = false,
) => {
  const state = useReactiveState<UsePromiseState>('idle');

  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<R | undefined>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Not an issue here
  const reset = useCallback(() => {
    state.set('idle');
    setError(undefined);
    setData(undefined);
  }, [state, setError, setData]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Not an issue here
  const retry = useCallback(
    async (...arg: T) => {
      state.set('loading');
      setError(undefined);
      let resp = undefined as R | undefined;
      try {
        resp = await retryPromise(promiseFn, retryCount, retryDelay)(...arg);
        state.set('success');
        setData(resp);
      } catch (e) {
        setError(e as Error);
        state.set('error');
        if (throwError) {
          throw e;
        }
      }
      return resp as R | undefined;
    },
    [state, ...dependencies],
  );

  return {
    state: state.state,
    getState: state.get,
    error,
    retry,
    data,
    reset,
  };
};
