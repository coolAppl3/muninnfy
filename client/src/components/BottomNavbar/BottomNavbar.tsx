import './BottomNavbar.css';
import { JSX } from 'react';
import { NavLink, Location, useLocation } from 'react-router-dom';
import HomeIcon from '../../assets/svg/HomeIcon.svg?react';
import SignInIcon from '../../assets/svg/SignInIcon.svg?react';
import AddIcon from '../../assets/svg/AddIcon.svg?react';
import useAuth from '../../hooks/useAuth';
import NavbarAccountMenu from '../NavbarAccountMenu/NavbarAccountMenu';

export default function BottomNavbar(): JSX.Element {
  const { authStatus } = useAuth();
  const { pathname }: Location = useLocation();

  return (
    <nav className='bottom-navbar md:hidden'>
      <div>
        <NavLink
          to='/home'
          className={({ isActive }) => (isActive || pathname === '/' ? 'isActive' : '')}
        >
          <HomeIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>Home</span>
        </NavLink>

        <NavLink
          to={authStatus === 'authenticated' ? '/wishlist/new' : '/guest/wishlist/new'}
          className={({ isActive }) => (isActive ? 'isActive' : '')}
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
      className={({ isActive }) => (isActive ? 'isActive' : '')}
    >
      <SignInIcon className='w-[2.4rem] h-[2.4rem]' />
      <span>Sign in</span>
    </NavLink>
  );
}
