import React, { useState, useRef, useEffect } from 'react';
import { Md3Typography } from '../../classNames/typography';
import type { Tab, TabsProps } from './types';

export const Md3Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'primary',
  size = 'medium',
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || tabs[0]?.id || '');
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const [focusedTab, setFocusedTab] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const currentActiveTab = activeTab || internalActiveTab;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs.current[currentActiveTab];
    if (activeTabElement && tabsRef.current) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
        transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      });
    }
  }, [currentActiveTab, tabs]);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const tabIds = tabs.filter((tab) => !tab.disabled).map((tab) => tab.id);
    const currentIndex = tabIds.indexOf(tabId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % tabIds.length;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? tabIds.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabIds.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabClick(tabId);
        return;
      default:
        return;
    }

    const nextTabId = tabIds[nextIndex];
    tabRefs.current[nextTabId]?.focus();
    setFocusedTab(nextTabId);
  };

  const getTabClasses = (tab: Tab, isActive: boolean, isFocused: boolean) => {
    const baseClasses = `
      relative
      inline-flex
      items-center
      justify-center
      gap-2
      px-4
      transition-all
      duration-200
      border-none
      bg-transparent
      cursor-pointer
      disabled:cursor-not-allowed
      outline-none
      rounded-t-lg
      font-medium
      tracking-wide
      overflow-hidden
    `;

    const sizeClasses =
      size === 'small'
        ? `h-12 min-w-[90px] ${Md3Typography.label.medium}`
        : `h-12 min-w-[90px] ${Md3Typography.label.large}`;

    const colorClasses =
      variant === 'primary'
        ? isActive
          ? 'text-primary'
          : 'text-on-surface-variant'
        : isActive
          ? 'text-secondary'
          : 'text-on-surface-variant';

    const stateClasses = tab.disabled
      ? 'text-on-surface/38 cursor-not-allowed'
      : isActive
        ? 'hover:bg-primary/8 active:bg-primary/12'
        : 'hover:bg-on-surface/8 active:bg-on-surface/12';

    const focusClasses = isFocused && !tab.disabled ? 'ring-2 ring-primary/50 ring-inset' : '';

    const iconClasses = tab.icon ? '[&>svg]:w-5 [&>svg]:h-5 [&>svg]:flex-shrink-0' : '';

    return `${baseClasses} ${sizeClasses} ${colorClasses} ${stateClasses} ${focusClasses} ${iconClasses}`.trim();
  };

  const getIndicatorClasses = () => {
    const baseClasses = `
      absolute
      bottom-0
      h-[3px]
      transition-all
      duration-300
      ease-out
      rounded-t-full
    `;

    // MD3 uses rounded corners on the indicator
    const colorClasses = variant === 'primary' ? 'bg-primary' : 'bg-secondary';

    return `${baseClasses} ${colorClasses}`.trim();
  };

  // Get the first non-disabled tab for initial focus
  const getInitialFocusableTab = () => {
    return tabs.find((tab) => !tab.disabled)?.id || '';
  };

  return (
    <div className={`relative ${className}`} role='tablist' aria-label='Tab navigation'>
      <div
        ref={tabsRef}
        className='relative flex items-end border-b border-outline-variant bg-surface overflow-x-auto '
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentActiveTab;
          const isFocused = tab.id === focusedTab;
          const isFirstFocusableTab = tab.id === getInitialFocusableTab();

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
                if (isActive) {
                  activeTabRef.current = el;
                }
              }}
              className={getTabClasses(tab, isActive, isFocused)}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              onFocus={() => setFocusedTab(tab.id)}
              onBlur={() => setFocusedTab(null)}
              disabled={tab.disabled}
              role='tab'
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive || (!currentActiveTab && isFirstFocusableTab) ? 0 : -1}
              type='button'
            >
              {tab.icon && <span className='flex-shrink-0 flex items-center justify-center'>{tab.icon}</span>}
              <span className='truncate'>{tab.label}</span>
            </button>
          );
        })}

        {/* MD3 Active Indicator */}
        <div className={getIndicatorClasses()} style={indicatorStyle} aria-hidden='true' />
      </div>
    </div>
  );
};
