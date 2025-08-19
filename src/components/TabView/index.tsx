import { useEffect, useMemo, useState } from 'react';
import type { Tab, TabPanelProps, TabViewProps } from './types';
import { v4 as uuid4 } from 'uuid';
import { Md3Tabs } from './Tabs';
import { Md3TabPanel } from './Panel';

export const TabView: React.FC<TabViewProps> = ({
  tabs,
  variant = 'primary',
  size = 'medium',
  selectorClassName = 'mb-6',
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const _tabs = useMemo(
    () =>
      tabs.map<{
        info: Tab;
        panel: Omit<TabPanelProps, 'activeTab'>;
      }>((item) => {
        const _id = uuid4();
        return {
          info: {
            id: _id,
            label: item.label,
            icon: item.icon ? <item.icon /> : <></>,
            disabled: item.disabled,
          },
          panel: {
            tabId: _id,
            className: item.panelClassName,
            children: <item.content />,
          },
        };
      }),
    [tabs],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only trigger on tab change
  useEffect(() => {
    if (!_tabs.length) return;
    if (_tabs.map((item) => item.info.id).includes(activeTab ?? '')) return;
    setActiveTab(_tabs[0].info.id);
  }, [_tabs]);

  return (
    <>
      <Md3Tabs
        tabs={_tabs.map((item) => item.info)}
        activeTab={activeTab ?? ''}
        onTabChange={setActiveTab}
        variant={variant}
        size={size}
        className={selectorClassName}
      />

      {_tabs.map((item) => (
        <Md3TabPanel
          key={item.panel.tabId}
          tabId={item.panel.tabId}
          activeTab={activeTab ?? ''}
          className={item.panel.className}
        >
          {item.panel.children}
        </Md3TabPanel>
      ))}
    </>
  );
};
