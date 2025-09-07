import { FocusEvent, JSX, useState } from 'react';
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
import useConfirmModal from '../../hooks/useConfirmModal';
import useAuthSession from '../../hooks/useAuthSession';

export default function Navbars(): JSX.Element {
  return (
    <>
      <TopNavbar />
      <BottomNavbar />
    </>
  );
}

function TopNavbar(): JSX.Element {
  const { authStatus } = useAuth();
  const { pathname }: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();

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

        {authStatus === 'authenticated' ? (
          <TopNavbarAccountMenu />
        ) : (
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
        )}
      </Container>
    </nav>
  );
}

function TopNavbarAccountMenu(): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { signOut } = useAuthSession();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  function handleClick(): void {
    setIsVisible((prev) => !prev);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen((prev) => !prev);
      });
    });
  }

  return (
    <div
      className={`account-menu ${isVisible ? 'visible' : ''} ${isOpen ? 'open' : ''}`}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget) {
          return;
        }

        setIsVisible(false);
        setIsOpen(false);
      }}
    >
      <button
        type='button'
        className='account-menu-btn'
        onClick={handleClick}
      >
        <span>Menu</span>
        <ChevronIcon />
      </button>

      <div className='account-menu-container'>
        <Link
          to='/account'
          onClick={() => {
            setIsVisible(false);
            setIsOpen(false);
          }}
        >
          My account
        </Link>
        <Link
          to='/account/wishlists'
          onClick={() => {
            setIsVisible(false);
            setIsOpen(false);
          }}
        >
          Wishlists
        </Link>

        <button
          type='button'
          onClick={async () => {
            displayConfirmModal({
              title: 'Are you sure you want to sign out?',
              confirmBtnTitle: 'Confirm',
              cancelBtnTitle: 'Cancel',
              isDangerous: true,
              onConfirm: async () => {
                removeConfirmModal();

                setIsVisible(false);
                setIsOpen(false);

                await signOut();
              },
              onCancel: removeConfirmModal,
            });
          }}
          className='!text-danger'
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function BottomNavbar(): JSX.Element {
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

        {authStatus === 'authenticated' ? (
          <BottomNavbarAccountMenu />
        ) : (
          <NavLink
            to='/sign-in'
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

function BottomNavbarAccountMenu(): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { signOut } = useAuthSession();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  function handleClick(): void {
    setIsVisible((prev) => !prev);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen((prev) => !prev);
      });
    });
  }

  return (
    <div
      className={`account-menu ${isVisible ? 'visible' : ''} ${isOpen ? 'open' : ''}`}
      tabIndex={0}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget) {
          return;
        }

        setIsVisible(false);
        setIsOpen(false);
      }}
    >
      <button
        type='button'
        className='account-menu-btn'
        onClick={handleClick}
      >
        <span>Menu</span>
        <ChevronIcon />
      </button>

      <div className='account-menu-container'>
        <Link
          to='/account'
          onClick={() => {
            setIsVisible(false);
            setIsOpen(false);
          }}
        >
          My account
        </Link>
        <Link
          to='/account/wishlists'
          onClick={() => {
            setIsVisible(false);
            setIsOpen(false);
          }}
        >
          Wishlists
        </Link>

        <button
          type='button'
          onClick={async () => {
            displayConfirmModal({
              title: 'Are you sure you want to sign out?',
              confirmBtnTitle: 'Confirm',
              cancelBtnTitle: 'Cancel',
              isDangerous: true,
              onConfirm: async () => {
                removeConfirmModal();

                setIsVisible(false);
                setIsOpen(false);

                await signOut();
              },
              onCancel: removeConfirmModal,
            });
          }}
          className='!text-danger'
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
