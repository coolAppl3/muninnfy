import { JSX } from 'react';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import { Location, useLocation } from 'react-router-dom';
import Logo from '../../assets/logo.svg';
import Button from '../Button/Button';
import Container from '../Container/Container';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar(): JSX.Element {
  const routerLocation: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();

  return (
    <>
      <TopNavbar
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
