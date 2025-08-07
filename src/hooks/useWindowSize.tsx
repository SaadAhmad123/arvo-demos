import { useEffect, useState } from 'react';

/**
 * Describes the shape of the window size.
 */
export type WindowSize = {
  height: number;
  width: number;
};

/**
 * Custom hook to get the window's size on resize.
 * This hook listens to the window's resize event and updates the width and height accordingly.
 *
 * @param defaultWindowSize - Default window size to be used if the actual size cannot be determined.
 * @returns - The current window size.
 *
 * @example
 * const { width, height } = useWindowResize({ width: 800, height: 600 });
 */
export const useWindowSize = (
  defaultWindowSize: WindowSize = {
    height: 800,
    width: 600,
  },
): WindowSize => {
  const [ws, setWs] = useState<WindowSize>(defaultWindowSize);

  /**
   * Handler for window resize.
   * Updates the state with the current window size.
   */
  const onResize = () => {
    try {
      setWs({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    } catch (e) {
      console.warn('Failed to get window size. Using default values.', e);
      setWs(defaultWindowSize);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: It should just run once
  useEffect(() => {
    onResize();
    try {
      window.addEventListener('resize', onResize);
      // Ensure the listener is removed when the component is unmounted
      return () => window.removeEventListener('resize', onResize);
    } catch (e) {
      console.warn('Failed to add window resize listener.', e);
    }
  }, []);

  return ws;
};
