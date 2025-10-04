import { JSX } from 'react';
import { Link, NavLink, NavigateFunction, useNavigate, Location, useLocation } from 'react-router-dom';
import Button from '../Button/Button';
import Container from '../Container/Container';
import Logo from '../../assets/svg/Logo.svg';
import useAuth from '../../hooks/useAuth';
import NavbarAccountMenu from '../NavbarAccountMenu/NavbarAccountMenu';

const navLinkClassname: string =
  'relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[3px] after:rounded-pill after:bg-cta/0 hover:after:bg-cta/100 after:transition-[background]';

export default function TopNavbar(): JSX.Element {
  const { authStatus } = useAuth();
  const { pathname }: Location = useLocation();

  return (
    <nav className='sticky top-0 left-0 w-full h-6 bg-dark border-b-1 border-b-cta/40 text-title z-15'>
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

        <div className='font-bold hidden md:flex justify-center items-center absolute w-fit h-fit left-0 right-0 mx-auto'>
          <NavLink
            to='/home'
            className={({ isActive }) =>
              isActive || pathname === '/' ? `mr-2 after:bg-cta/100 ${navLinkClassname}` : `mr-2 ${navLinkClassname}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to={authStatus === 'authenticated' ? '/wishlist/new' : '/guest/wishlist/new'}
            className={({ isActive }) => (isActive ? `after:bg-cta/100 ${navLinkClassname}` : navLinkClassname)}
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
