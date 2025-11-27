import { JSX } from 'react';
import AccountSidebarButton from './components/AccountSidebarButton';
import useAccountLocation from '../hooks/useAccountLocation';

export default function AccountSidebar(): JSX.Element {
  const { accountLocation, setAccountLocation } = useAccountLocation();

  return (
    <nav className='bg-secondary rounded-sm hidden md:grid md:col-span-3 text-description overflow-hidden font-medium text-sm'>
      <h3
        className='p-2 text-base text-title font-normal break-words'
        style={{ wordBreak: 'break-word' }}
      >
        Hi, John Doe
      </h3>

      <div className='h-line'></div>

      <AccountSidebarButton
        isSelected={accountLocation === 'overview'}
        onClick={() => setAccountLocation('overview')}
      >
        Overview
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={accountLocation === 'social'}
        onClick={() => setAccountLocation('social')}
      >
        Social
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={accountLocation === 'details'}
        onClick={() => setAccountLocation('details')}
      >
        My details
      </AccountSidebarButton>
    </nav>
  );
}
