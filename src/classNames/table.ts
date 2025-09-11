type TableClassConfig = {
  size?: 'compact' | 'comfortable' | 'spacious';
  variant?: 'default' | 'outlined' | 'elevated';
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
};

const getTableClasses = (config: TableClassConfig = {}): string => {
  const { size = 'comfortable', variant = 'default', stickyHeader = false } = config;
  const baseClasses = 'w-full border-collapse bg-surface text-on-surface';
  const sizeClasses = {
    compact: 'text-sm',
    comfortable: 'text-base',
    spacious: 'text-lg',
  };
  const variantClasses = {
    default: '',
    outlined: 'border border-outline rounded-lg overflow-hidden',
    elevated: 'shadow-md rounded-lg overflow-hidden',
  };
  return [baseClasses, sizeClasses[size], variantClasses[variant], stickyHeader ? 'relative' : '']
    .filter(Boolean)
    .join(' ');
};

const getTableHeaderClasses = (config: TableClassConfig = {}): string => {
  const { size = 'comfortable', stickyHeader = false } = config;

  const sizeClasses = {
    compact: 'px-3 py-2',
    comfortable: 'px-4 py-3',
    spacious: 'px-6 py-4',
  };

  return [
    'bg-surface-container-highest text-on-surface-variant font-medium text-left',
    'border-b border-outline-variant',
    sizeClasses[size],
    stickyHeader ? 'sticky top-0 z-10' : '',
  ]
    .filter(Boolean)
    .join(' ');
};

const getTableCellClasses = (config: TableClassConfig = {}): string => {
  const { size = 'comfortable' } = config;

  const sizeClasses = {
    compact: 'px-3 py-2',
    comfortable: 'px-4 py-3',
    spacious: 'px-6 py-4',
  };

  return [sizeClasses[size]].filter(Boolean).join(' ');
};

const getTableRowClasses = (config: TableClassConfig = {}): string => {
  const { striped = false, hoverable = true } = config;

  return [
    striped ? 'odd:bg-surface-container-lowest' : '',
    hoverable ? 'bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200' : '',
    'group border-b border-outline-variant last:border-b-0',
  ]
    .filter(Boolean)
    .join(' ');
};

export const Md3Table = {
  variants: {
    default: {
      table: getTableClasses(),
      header: getTableHeaderClasses(),
      cell: getTableCellClasses(),
      row: getTableRowClasses(),
    },
    compact: {
      table: getTableClasses({ size: 'compact' }),
      header: getTableHeaderClasses({ size: 'compact' }),
      cell: getTableCellClasses({ size: 'compact' }),
      row: getTableRowClasses(),
    },
    elevated: {
      table: getTableClasses({ variant: 'elevated', striped: true }),
      header: getTableHeaderClasses(),
      cell: getTableCellClasses({ striped: true }),
      row: getTableRowClasses({ striped: true }),
    },
    stickyHeader: {
      table: getTableClasses({ stickyHeader: true }),
      header: getTableHeaderClasses({ stickyHeader: true }),
      cell: getTableCellClasses(),
      row: getTableRowClasses(),
    },
  },
};
