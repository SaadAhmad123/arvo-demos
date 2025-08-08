type ContentContainerProps = {
  children?: React.ReactNode | React.ReactNode[];
};

export const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return (
    <section className='flex items-start'>
      <div className='mx-auto max-w-[1600px] w-full px-2 sm:px-4'>{children}</div>
    </section>
  );
};
