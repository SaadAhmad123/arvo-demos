import { useEffect, useRef } from 'react';

export type Theme = 'light' | 'dark';
export type Contrast = 'standard' | 'medium' | 'high';

export type SystemPreferences = {
  theme: Theme;
  contrast: Contrast;
};

type PreferenceCallback = (preferences: SystemPreferences) => void;

/**
 * Custom hook to detect system theme and contrast preferences via callback
 * @param callback - Function called when preferences change
 * @param callOnMount - Whether to call the callback immediately on mount (default: true)
 */
export const useSystemTheme = (
  callback: PreferenceCallback = ({ theme, contrast }) => {
    try {
      document.documentElement.className = `${theme}${contrast === 'medium' ? '-mc' : contrast === 'high' ? '-hc' : ''}`; // Get computed style from root element
      const rootStyles = getComputedStyle(document.documentElement);
      const primaryColor = rootStyles.getPropertyValue('--color-background').trim();
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');

      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', primaryColor);
      }
      const msApplicationTitleColor = document.querySelector('meta[name="msapplication-TileColor"]');
      if (msApplicationTitleColor) {
        msApplicationTitleColor.setAttribute('content', primaryColor);
      }
    } catch (e) {
      console.error(e);
    }
  },
  callOnMount = true,
): void => {
  const callbackRef = useRef<PreferenceCallback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handlePreferenceChange = () => {
      callbackRef.current(getCurrentPreferences());
    };

    if (callOnMount) {
      handlePreferenceChange();
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const mediumContrastQuery = window.matchMedia('(prefers-contrast: more)');

    darkModeQuery.addEventListener('change', handlePreferenceChange);
    highContrastQuery.addEventListener('change', handlePreferenceChange);
    mediumContrastQuery.addEventListener('change', handlePreferenceChange);

    return () => {
      darkModeQuery.removeEventListener('change', handlePreferenceChange);
      highContrastQuery.removeEventListener('change', handlePreferenceChange);
      mediumContrastQuery.removeEventListener('change', handlePreferenceChange);
    };
  }, [callOnMount]);
};

const getCurrentPreferences = (): SystemPreferences => ({
  theme: getSystemTheme(),
  contrast: getSystemContrast(),
});

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return darkModeQuery.matches ? 'dark' : 'light';
};

const getSystemContrast = (): Contrast => {
  if (typeof window === 'undefined') return 'standard';
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
  if (highContrastQuery.matches) return 'high';
  const mediumContrastQuery = window.matchMedia('(prefers-contrast: more)');
  if (mediumContrastQuery.matches) return 'medium';
  return 'standard';
};
