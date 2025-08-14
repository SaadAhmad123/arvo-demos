type ContentContainerProps = {
  content?: boolean;
  children?: React.ReactNode | React.ReactNode[];
};

export const ContentContainer: React.FC<ContentContainerProps> = ({ children, content }) => {
  return (
    <section className='flex items-start'>
      <div className={`mx-auto ${content ? 'max-w-[1200px]' : 'max-w-[1600px]'} w-full px-2`}>{children}</div>
    </section>
  );
};
