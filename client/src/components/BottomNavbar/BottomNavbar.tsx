import './BottomNavbar.css';
import { FocusEvent, JSX, useState } from 'react';
import { Link, NavLink, Location, useLocation } from 'react-router-dom';
import HomeIcon from '../../assets/svg/HomeIcon.svg?react';
import SignInIcon from '../../assets/svg/SignInIcon.svg?react';
import AddIcon from '../../assets/svg/AddIcon.svg?react';
import ChevronIcon from '../../assets/svg/ChevronIcon.svg?react';
import useAuth from '../../hooks/useAuth';
import useConfirmModal from '../../hooks/useConfirmModal';
import useAuthSession from '../../hooks/useAuthSession';

export function BottomNavbar(): JSX.Element {
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
    return <AccountMenu />;
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

function AccountMenu(): JSX.Element {
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
