import { JSX } from 'react';
import { NavLink, Location, useLocation } from 'react-router-dom';
import HomeIcon from '../../assets/svg/HomeIcon.svg?react';
import SignInIcon from '../../assets/svg/SignInIcon.svg?react';
import AddIcon from '../../assets/svg/AddIcon.svg?react';
import useAuth from '../../hooks/useAuth';
import NavbarAccountMenu from '../NavbarAccountMenu/NavbarAccountMenu';

const navLinkClassname: string =
  'border-r-1 border-r-light-gray last:border-r-transparent flex flex-col justify-center items-center shrink-0 gap-[4px]';

export default function BottomNavbar(): JSX.Element {
  const { authStatus } = useAuth();
  const { pathname }: Location = useLocation();

  return (
    <nav className='fixed bottom-0 left-0 w-full h-6 bg-dark border-t-1 border-t-cta/49 text-title font-medium text-sm z-15 md:hidden'>
      <div className='h-full w-full grid grid-cols-3'>
        <NavLink
          to='/home'
          className={({ isActive }) => (isActive || pathname === '/' ? `text-cta ${navLinkClassname}` : navLinkClassname)}
        >
          <HomeIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>Home</span>
        </NavLink>

        <NavLink
          to={authStatus === 'authenticated' ? '/wishlist/new' : '/guest/wishlist/new'}
          className={({ isActive }) => (isActive ? `text-cta ${navLinkClassname}` : navLinkClassname)}
        >
          <AddIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>New wishlist</span>
        </NavLink>

        <AdditionalLinks />
      </div>
    </nav>
  );
}

function AdditionalLinks(): JSX.Element {
  const { authStatus } = useAuth();

  if (authStatus === 'loading') {
    return <div></div>;
  }

  if (authStatus === 'authenticated') {
    return <NavbarAccountMenu navbarType='bottom' />;
  }

  return (
    <NavLink
      to='/sign-in'
      className={({ isActive }) => (isActive ? `text-cta ${navLinkClassname}` : navLinkClassname)}
    >
      <SignInIcon className='w-[2.4rem] h-[2.4rem]' />
      <span>Sign in</span>
    </NavLink>
  );
}
