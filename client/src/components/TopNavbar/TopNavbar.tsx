import './TopNavbar.css';
import { JSX } from 'react';
import { Link, NavLink, NavigateFunction, useNavigate, Location, useLocation } from 'react-router-dom';
import Button from '../Button/Button';
import Container from '../Container/Container';
import Logo from '../../assets/svg/Logo.svg';
import useAuth from '../../hooks/useAuth';
import NavbarAccountMenu from '../NavbarAccountMenu/NavbarAccountMenu';

export default function TopNavbar(): JSX.Element {
  const { authStatus } = useAuth();
  const { pathname }: Location = useLocation();

  return (
    <nav className='top-navbar'>
      <Container className='flex justify-between items-center'>
        <Link to='/home'>
          <div className='flex justify-start items-center gap-1'>
            <img
              className='w-4 h-4'
              src={Logo}
            />
            <h2 className='font-bold text-3xl'>Muninnfy</h2>
          </div>
        </Link>

        <div className='links-container'>
          <NavLink
            to='/home'
            className={({ isActive }) => (isActive || pathname === '/' ? 'isActive' : '')}
          >
            Home
          </NavLink>

          <NavLink
            to={authStatus === 'authenticated' ? '/wishlist/new' : '/guest/wishlist/new'}
            className={({ isActive }) => (isActive ? 'isActive' : '')}
          >
            New wishlist
          </NavLink>
        </div>

        <AdditionalLinks />
      </Container>
    </nav>
  );
}

function AdditionalLinks(): JSX.Element {
  const { authStatus } = useAuth();
  const { pathname } = useLocation();
  const navigate: NavigateFunction = useNavigate();

  if (authStatus === 'loading') {
    return <></>;
  }

  if (authStatus === 'authenticated') {
    return <NavbarAccountMenu navbarType='top' />;
  }

  return (
    <div className='hidden md:flex justify-center items-end gap-1'>
      {pathname === '/sign-in' || (
        <Button
          className='bg-description border-description text-dark'
          onClick={() => navigate('/sign-in')}
        >
          Sign in
        </Button>
      )}

      {pathname === '/sign-up' || (
        <Button
          className='bg-cta border-cta text-dark'
          onClick={() => navigate('/sign-up')}
        >
          Sign up
        </Button>
      )}
    </div>
  );
}
