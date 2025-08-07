export default function retryPromise<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  retries: number,
  _delay: number,
): (...args: T) => Promise<R> {
  function delay(timeInMs = 1000) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeInMs);
    });
  }

  return async (...args: T) => {
    const attempt = async (): Promise<R> => {
      for (let i = 1; i < retries; i++) {
        try {
          return await fn(...args);
        } catch (err) {
          await delay(_delay);
        }
      }
      return await fn(...args);
    };
    return await attempt();
  };
}
