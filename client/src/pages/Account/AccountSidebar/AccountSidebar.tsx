import { JSX } from 'react';
import AccountSidebarButton from './components/AccountSidebarButton';
import useAccountLocation from '../hooks/useAccountLocation';
import { Link } from 'react-router-dom';
import RedirectIcon from '../../../assets/svg/RedirectIcon.svg?react';

export default function AccountSidebar(): JSX.Element {
  const { accountLocation, setAccountLocation } = useAccountLocation();

  return (
    <nav className='sticky top-7 bg-secondary rounded-sm hidden md:grid md:col-span-3 text-description overflow-hidden font-medium text-sm shadow-simple-tiny'>
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

      <Link
        to='/account/wishlists'
        className='flex justify-between items-center px-2 py-[1.6rem] text-start bg-secondary border-b-1 border-b-light-gray cursor-pointer transition-[filter] hover:brightness-90 last:border-b-secondary'
      >
        <span>Wishlists</span>
        <RedirectIcon className='w-[1.6rem] h-[1.6rem]' />
      </Link>
    </nav>
  );
}
