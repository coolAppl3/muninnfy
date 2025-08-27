import { JSX, useState } from 'react';
import { Link, NavLink, NavigateFunction, useNavigate, Location, useLocation } from 'react-router-dom';
import Button from '../Button/Button';
import Container from '../Container/Container';
import Logo from '../../assets/svg/Logo.svg';
import HomeIcon from '../../assets/svg/HomeIcon.svg?react';
import SignInIcon from '../../assets/svg/SignInIcon.svg?react';
import AddIcon from '../../assets/svg/AddIcon.svg?react';
import ChevronIcon from '../../assets/svg/ChevronIcon.svg?react';
import './Navbars.css';
import useAuth from '../../hooks/useAuth';
import usePopupMessage from '../../hooks/usePopupMessage';
import { signOutService } from '../../services/authServices';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import useConfirmModal from '../../hooks/useConfirmModal';

export default function Navbars(): JSX.Element {
  const routerLocation: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();

  const { isSignedIn, setIsSignedIn } = useAuth();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  async function handleSignOut(): Promise<void> {
    if (!isSignedIn) {
      displayPopupMessage('Already signed out.', 'success');
      return;
    }

    displayConfirmModal({
      title: 'Are you sure you want to sign out?',
      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      isDangerous: true,
      onConfirm: async () => {
        await signOut();
        removeConfirmModal();
      },
      onCancel: removeConfirmModal,
    });
  }

  async function signOut(): Promise<void> {
    displayLoadingOverlay();

    try {
      await signOutService();
      setIsSignedIn(false);

      displayPopupMessage('Signed out.', 'success');
      routerLocation.pathname.startsWith('/account') && navigate('/home');
    } catch (err: unknown) {
      console.log(err);
      displayPopupMessage('Sign out failed.', 'success');
    } finally {
      removeLoadingOverlay();
    }
  }

  return (
    <>
      <TopNavbar
        routerLocation={routerLocation}
        navigate={navigate}
        isSignedIn={isSignedIn}
        handleSignOut={handleSignOut}
      />

      <BottomNavbar
        routerLocation={routerLocation}
        navigate={navigate}
        isSignedIn={isSignedIn}
        handleSignOut={handleSignOut}
      />
    </>
  );
}

function TopNavbar({
  routerLocation,
  navigate,
  isSignedIn,
  handleSignOut,
}: {
  routerLocation: Location;
  navigate: NavigateFunction;
  isSignedIn: boolean;
  handleSignOut: () => Promise<void>;
}): JSX.Element {
  return (
    <nav className='top-navbar'>
      <Container className='flex justify-between items-center'>
        <Link to={'/home'}>
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
            className={({ isActive }) => (isActive || routerLocation.pathname === '/' ? 'isActive' : '')}
          >
            Home
          </NavLink>

          <NavLink
            to={isSignedIn ? '/account/new-wishlist' : '/guest/new-wishlist'}
            className={({ isActive }) => (isActive ? 'isActive' : '')}
          >
            New wishlist
          </NavLink>
        </div>

        {isSignedIn ? (
          <TopNavbarAccountMenu handleSignOut={handleSignOut} />
        ) : (
          <div className='hidden md:flex justify-center items-end gap-1'>
            {routerLocation.pathname === '/sign-in' || (
              <Button
                className='bg-description border-description text-dark'
                onClick={() => navigate('/sign-in')}
              >
                Sign in
              </Button>
            )}

            {routerLocation.pathname === '/sign-up' || (
              <Button
                className='bg-cta border-cta text-dark'
                onClick={() => navigate('/sign-up')}
              >
                Sign up
              </Button>
            )}
          </div>
        )}
      </Container>
    </nav>
  );
}

function TopNavbarAccountMenu({ handleSignOut }: { handleSignOut: () => Promise<void> }): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className={`account-menu ${isOpen ? 'open' : ''}`}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type='button'
        className='account-menu-btn'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Menu</span>
        <ChevronIcon />
      </button>

      <div className='account-menu-container'>
        <Link to='/account'>My account</Link>
        <Link to='/account/wishlists'>Wishlists</Link>
        <button
          type='button'
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function BottomNavbar({
  routerLocation,
  navigate,
  isSignedIn,
  handleSignOut,
}: {
  routerLocation: Location;
  navigate: NavigateFunction;
  isSignedIn: boolean;
  handleSignOut: () => Promise<void>;
}): JSX.Element {
  return (
    <nav className='bottom-navbar md:hidden'>
      <div>
        <NavLink
          to='/home'
          className={({ isActive }) => (isActive || routerLocation.pathname === '/' ? 'isActive' : '')}
        >
          <HomeIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>Home</span>
        </NavLink>

        <NavLink
          to={isSignedIn ? '/account/new-wishlist' : '/guest/new-wishlist'}
          className={({ isActive }) => (isActive ? 'isActive' : '')}
        >
          <AddIcon className='w-[2.4rem] h-[2.4rem]' />
          <span>New wishlist</span>
        </NavLink>

        {isSignedIn ? (
          <BottomNavbarAccountMenu handleSignOut={handleSignOut} />
        ) : (
          <NavLink
            to='sign-in'
            className={({ isActive }) => (isActive ? 'isActive' : '')}
          >
            <SignInIcon className='w-[2.4rem] h-[2.4rem]' />
            <span>Sign in</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}

function BottomNavbarAccountMenu({ handleSignOut }: { handleSignOut: () => Promise<void> }): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className={`account-menu ${isOpen ? 'open' : ''}`}
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type='button'
        className='account-menu-btn'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Menu</span>
        <ChevronIcon />
      </button>

      <div className='account-menu-container'>
        <Link to='/account'>My account</Link>
        <Link to='/account/wishlists'>Wishlists</Link>
        <button
          type='button'
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
