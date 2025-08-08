import { NavBar } from '.';

export const withNavBar = (Component: React.FC) => {
  return () => (
    <div className='block md:flex items-start justify-start w-screen'>
      <NavBar />
      <div className='w-[88px] hidden md:block' />
      <div className='flex-1 block'>
        <Component />
      </div>
    </div>
  );
};
