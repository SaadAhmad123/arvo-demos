import { Link, useLocation } from 'react-router';
import { NavButton } from './button';
import { navOptions } from './navOptions';
import { Md3Typography } from '../../classNames/typography';
import { MdMenu, MdMenuOpen } from 'react-icons/md';
import { Md3Buttons } from '../../classNames/buttons';
import { SideBar } from '../SideBar';
import { useState } from 'react';

export const NavBar = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const toggleShow = () => {
    const newShow = !show;
    setShow(newShow);
  };

  return (
    <>
      <nav className='hidden md:block fixed top-0 left-0 left w-[88px] bg-surface-container-low text-on-surface h-screen z-50 overflow-y-auto'>
        <div className='flex flex-col items-center py-6 h-screen gap-2'>
          {navOptions.map((item, index) => (
            <NavButton key={index.toString()} {...item} />
          ))}
        </div>
      </nav>
      <nav className='flex md:hidden items-center justify-between sticky top-0 h-[56px] w-screen bg-surface-container-low text-on-surface px-4 z-50'>
        <div className='flex items-center gap-2'>
          <button type='button' className={Md3Buttons.icon} onClick={toggleShow}>
            <MdMenu />
          </button>
          <Link to={'/'} className={Md3Typography.headline.small}>
            ARVO
          </Link>
        </div>
        <SideBar show={show} toggle={toggleShow}>
          <div className='bg-surface-container-low text-on-surface h-full overflow-auto relative'>
            <div className='sticky top-0 bg-surface-container-low text-on-surface px-4 h-[56px] flex items-center gap-2'>
              <button type='button' onClick={toggleShow} className={Md3Buttons.icon}>
                <MdMenuOpen />
              </button>
              <p className={Md3Typography.headline.small}>ARVO</p>
            </div>
            <div className='px-3 flex flex-col items-start justify-start'>
              {navOptions.map((item, index) => (
                <Link
                  key={index.toString()}
                  to={item.link}
                  className={`${Md3Buttons.textWithIcon} ${item.isSelected(location) ? 'bg-surface-container-highest!' : ''}  w-full! justify-start!`}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </SideBar>
      </nav>
    </>
  );
};
