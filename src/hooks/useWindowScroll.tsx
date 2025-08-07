import { useEffect, useState } from 'react';

/**
 * Describes the shape of the window scroll position.
 */
export type WindowScroll = {
  x: number;
  y: number;
};

/**
 * Custom hook to get the window's scroll position.
 * This hook listens to the window's scroll event and updates the x and y coordinates accordingly.
 *
 * @param defaultWindowScroll - Default scroll position to be used if the actual position cannot be determined.
 * @returns - The current window scroll position.
 *
 * @example
 * const { x, y } = useWindowScroll({ x: 0, y: 0 });
 */
export const useWindowScroll = (
  defaultWindowScroll: WindowScroll = {
    x: 0,
    y: 0,
  },
): WindowScroll => {
  const [scroll, setScroll] = useState<WindowScroll>(defaultWindowScroll);

  /**
   * Handler for window scroll.
   * Updates the state with the current scroll position.
   */
  const onScroll = () => {
    try {
      setScroll({
        x: window.scrollX,
        y: window.scrollY,
      });
    } catch (e) {
      console.warn('Failed to get scroll position. Using default values.', e);
      setScroll(defaultWindowScroll);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: It should just run once
  useEffect(() => {
    onScroll();
    try {
      window.addEventListener('scroll', onScroll);
      // Ensure the listener is removed when the component is unmounted
      return () => window.removeEventListener('scroll', onScroll);
    } catch (e) {
      console.warn('Failed to add window scroll listener.', e);
    }
  }, []);

  return scroll;
};
