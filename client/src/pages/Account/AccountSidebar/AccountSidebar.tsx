import { JSX } from 'react';
import AccountSidebarButton from './components/AccountSidebarButton';

export default function AccountSidebar(): JSX.Element {
  return (
    <nav className='bg-secondary rounded-sm grid col-span-3 text-description overflow-hidden font-medium text-sm'>
      <h3
        className='p-2 text-base text-title font-normal break-words'
        style={{ wordBreak: 'break-word' }}
      >
        Hi, John Doe
      </h3>

      <div className='h-line'></div>

      <AccountSidebarButton
        isSelected={true}
        onClick={() => {}}
      >
        Overview
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={false}
        onClick={() => {}}
      >
        My details
      </AccountSidebarButton>

      <AccountSidebarButton
        isSelected={false}
        onClick={() => {}}
      >
        Social
      </AccountSidebarButton>
    </nav>
  );
}
