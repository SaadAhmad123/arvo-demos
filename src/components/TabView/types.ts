export type Tab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
};

export type TabPanelProps = {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
};

export type TabViewProps = {
  tabs: {
    label: string;
    content: React.FC;
    icon?: React.FC;
    panelClassName?: string;
    disabled?: boolean;
  }[];
  variant?: NonNullable<TabsProps['variant']>;
  size?: NonNullable<TabsProps['size']>;
  selectorClassName?: string;
};
