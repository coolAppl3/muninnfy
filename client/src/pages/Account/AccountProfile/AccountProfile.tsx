import { JSX } from 'react';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import AccountProfileHeader from './components/AccountProfileHeader/AccountProfileHeader';
import AccountProfilePrivacy from './components/AccountProfilePrivacy/AccountProfilePrivacy';
import useAccountDetails from '../hooks/useAccountDetails';
import { getFullDateString } from '../../../utils/globalUtils';
import AccountProfileProvider from './context/AccountProfileProvider';

export function AccountProfile(): JSX.Element {
  const { accountDetails } = useAccountDetails();
  const { public_account_id, created_on_timestamp, display_name, username, email } = accountDetails;

  return (
    <AccountProfileProvider>
      <AccountProfileHeader />

      <div className='text-description/50 text-xs mb-[1.2rem]'>
        <p className='leading-[1] mb-[4px]'>{public_account_id}</p>
        <p className='leading-[1]'>Created on {getFullDateString(created_on_timestamp)}</p>
      </div>

      <div className='grid md:grid-cols-2 gap-1 text-sm text-description relative z-0'>
        <StatisticItem
          title='Display name'
          value={display_name}
        />

        <StatisticItem
          title='Username'
          value={username}
        />

        <StatisticItem
          title='Email address'
          value={email}
          className='md:col-span-2 break-all'
        />
      </div>

      <div className='h-line mt-2 mb-1'></div>
      <AccountProfilePrivacy />
    </AccountProfileProvider>
  );
}
