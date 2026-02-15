import { FocusEvent, JSX, useState } from 'react';
import HamMenuIcon from '../../../assets/svg/HamMenuIcon.svg?react';
import CrossIcon from '../../../assets/svg/CrossIcon.svg?react';
import useAccountLocation from '../hooks/useAccountLocation';
import AccountNavMenuButton from './components/AccountNavMenuButton';

export default function AccountNavMenu(): JSX.Element {
  const { accountLocation, setAccountLocation } = useAccountLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className='fixed bottom-0 z-10'
      onBlur={(e: FocusEvent) => {
        if (e.relatedTarget?.classList.contains('nav-menu-btn')) {
          return;
        }

        setIsOpen(false);
      }}
    >
      <button
        type='button'
        className='nav-menu-btn md:hidden fixed bottom-7 right-1 z-11 text-title p-1 bg-cta/20 shadow-simple-tiny rounded-[50%]'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <CrossIcon className='rotate-45 w-2 h-2 scale-85' /> : <HamMenuIcon className='w-2 h-2' />}
      </button>

      <nav
        className={`md:hidden fixed bottom-6 left-0 w-full bg-secondary grid text-title text-sm font-medium border-t-1 border-t-cta/50 shadow-simple-tiny transform-gpu ${
          isOpen ? 'transition-all opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}
      >
        <AccountNavMenuButton
          isSelected={accountLocation === 'profile'}
          onClick={() => {
            setAccountLocation('profile');
            setIsOpen(false);
          }}
        >
          Profile
        </AccountNavMenuButton>

        <AccountNavMenuButton
          isSelected={accountLocation === 'social'}
          onClick={() => {
            setAccountLocation('social');
            setIsOpen(false);
          }}
        >
          Social
        </AccountNavMenuButton>

        <AccountNavMenuButton
          isSelected={accountLocation === 'notifications'}
          onClick={() => {
            setAccountLocation('notifications');
            setIsOpen(false);
          }}
        >
          Notifications
        </AccountNavMenuButton>

        <AccountNavMenuButton
          isSelected={accountLocation === 'wishlists'}
          onClick={() => {
            setAccountLocation('wishlists');
            setIsOpen(false);
          }}
        >
          Wishlists
        </AccountNavMenuButton>
      </nav>
    </div>
  );
}
