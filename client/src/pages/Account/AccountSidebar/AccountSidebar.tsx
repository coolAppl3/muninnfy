import { JSX } from 'react';
import AccountSidebarButton from './components/AccountSidebarButton';
import useAccountLocation from '../hooks/useAccountLocation';

export default function AccountSidebar(): JSX.Element {
  const { accountLocation, setAccountLocation } = useAccountLocation();

  return (
    <nav className='bg-secondary rounded-sm hidden md:grid md:col-span-3 text-description overflow-hidden font-medium text-sm shadow-simple-tiny'>
      <AccountSidebarButton
        isSelected={accountLocation === 'profile'}
        onClick={() => setAccountLocation('profile')}
      >
        Profile
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={accountLocation === 'social'}
        onClick={() => setAccountLocation('social')}
      >
        Social
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={accountLocation === 'notifications'}
        onClick={() => setAccountLocation('notifications')}
      >
        Notifications
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={accountLocation === 'wishlists'}
        onClick={() => setAccountLocation('wishlists')}
      >
        Wishlists
      </AccountSidebarButton>
    </nav>
  );
}
