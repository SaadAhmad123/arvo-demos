type SideBarProp = {
  show?: boolean;
  toggle?: () => void;
  children?: React.ReactNode | React.ReactNode[];
};

export const SideBar: React.FC<SideBarProp> = ({ children, toggle, show }) => {
  return (
    <>
      {/* Desktop Side Panel */}
      <aside
        className={`
          hidden lg:block
          fixed h-screen top-0 
          transition-all duration-300 ease-in-out
          pointer-events-none z-40
          ${show ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className='h-[72px]' />
        <div className='pointer-events-auto w-[300px] bg-background h-full border-r border-gray-400'>{children}</div>
      </aside>

      {/* Mobile Drawer - Always rendered but positioned off-screen */}
      {/* Backdrop */}
      <div
        className={`
            lg:hidden fixed inset-0 bg-black z-40
            transition-opacity duration-300 ease-in-out z-[10001]
            ${show ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
        onClick={toggle}
        onKeyDown={(e) => e.key === 'Escape' && toggle?.()}
        role='button'
        tabIndex={0}
        aria-label='Close drawer'
      />

      {/* Drawer */}
      <aside
        className={`
            lg:hidden fixed inset-y-0 left-0 z-50 w-[300px] bg-background
            transform transition-transform duration-300 ease-in-out 
            z-[10002]
            ${show ? 'translate-x-0' : '-translate-x-full'}
          `}
      >
        {children}
      </aside>
    </>
  );
};
