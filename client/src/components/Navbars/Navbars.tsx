import { JSX } from 'react';
import { Link, NavLink, NavigateFunction, useNavigate, Location, useLocation } from 'react-router-dom';
import Button from '../Button/Button';
import Container from '../Container/Container';
import Logo from '../../assets/svg/Logo.svg';
import HomeIcon from '../../assets/svg/HomeIcon.svg?react';
import SignInIcon from '../../assets/svg/SignInIcon.svg?react';
import AddIcon from '../../assets/svg/AddIcon.svg?react';
import './Navbars.css';

export default function Navbars(): JSX.Element {
  const routerLocation: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();

  return (
    <>
      <TopNavbar
        routerLocation={routerLocation}
        navigate={navigate}
      />

      <BottomNavbar
        routerLocation={routerLocation}
        navigate={navigate}
      />
    </>
  );
}

function TopNavbar({ routerLocation, navigate }: { routerLocation: Location; navigate: NavigateFunction }): JSX.Element {
  const navLinkBaseClassname: string =
    'mr-1 relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[3px] after:rounded-pill hover:after:bg-cta/100 after:transition-[background]';

  return (
    <nav className='sticky top-0 left-0 w-full h-6 bg-dark border-b-1 border-b-cta text-title'>
      <Container className='flex justify-between items-center'>
        <Link to={'/home'}>
          <div className='flex justify-start items-center gap-1'>
            <img
              className='w-4 h-4'
              src={Logo}
            />
            <h1 className='font-bold text-3xl'>Muninnfy</h1>
          </div>
        </Link>

        <div className='font-bold flex justify-center items-center absolute w-fit h-fit left-0 right-0 mx-auto'>
          <NavLink
            to='/home'
            className={({ isActive }) => `${navLinkBaseClassname} ${isActive ? 'after:bg-cta/100' : 'after:bg-cta/0'}`}
          >
            Home
          </NavLink>

          <NavLink
            to='/wishlists'
            className={({ isActive }) => `${navLinkBaseClassname} ${isActive ? 'after:bg-cta/100' : 'after:bg-cta/0'}`}
          >
            Wishlists
          </NavLink>
        </div>

        <div className='flex justify-center items-end gap-1'>
          {routerLocation.pathname === '/signIn' || (
            <Button
              className='bg-description border-description text-dark'
              onClick={() => navigate('/signIn')}
            >
              Sign in
            </Button>
          )}

          {routerLocation.pathname === '/signUp' || (
            <Button
              className='bg-cta border-cta text-dark'
              onClick={() => navigate('/signUp')}
            >
              Sign up
            </Button>
          )}
        </div>
      </Container>
    </nav>
  );
}

function BottomNavbar({ routerLocation, navigate }: { routerLocation: Location; navigate: NavigateFunction }): JSX.Element {
  return (
    <nav className='BottomNavbar'>
      <div>
        <NavLink
          to='/home'
          className={({ isActive }) => (isActive ? 'isActive' : '')}
        >
          <HomeIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>Home</span>
        </NavLink>

        <NavLink
          to='/new-wishlist'
          className={({ isActive }) => (isActive ? 'isActive' : '')}
        >
          <AddIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>New wishlist</span>
        </NavLink>

        <NavLink
          to='sign-in'
          className={({ isActive }) => (isActive ? 'isActive' : '')}
        >
          <SignInIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>Sign in</span>
        </NavLink>
      </div>
    </nav>
  );
}
