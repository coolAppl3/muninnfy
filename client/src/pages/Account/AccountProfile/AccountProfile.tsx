import { JSX } from 'react';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import AccountProfileHeader from './components/AccountProfileHeader/AccountProfileHeader';
import AccountProfilePrivacy from './components/AccountProfilePrivacy/AccountProfilePrivacy';
import useAccountDetails from '../hooks/useAccountDetails';
import { getFullDateString } from '../../../utils/globalUtils';
import { AccountProfileSection } from '../contexts/AccountProfileContext';
import useAccountProfile from '../hooks/useAccountProfile';
import AccountOngoingRequests from './components/AccountOngoingRequests/AccountOngoingRequests';
import AccountChangeDisplayName from './components/AccountChangeDisplayName/AccountChangeDisplayName';

export function AccountProfile(): JSX.Element {
  const { profileSection } = useAccountProfile();
  const { accountDetails } = useAccountDetails();
  const { public_account_id, created_on_timestamp, display_name, username, email } = accountDetails;

  return (
    <>
      <AccountProfileHeader />

      <div className='text-description/50 text-xs mb-[1.2rem]'>
        <p className='leading-[1] mb-[4px]'>{public_account_id}</p>
        <p className='leading-[1]'>Created on {getFullDateString(created_on_timestamp)}</p>
      </div>

      <div className={`grid transition-[grid] ${profileSection ? 'grid-rows-[auto_1fr]' : 'grid-rows-[auto_0fr]'}`}>
        <div className='grid md:grid-cols-2 gap-1 text-sm text-description relative z-0 h-fit'>
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

        <div className='z-0 overflow-hidden'>
          <div className='h-line mt-2 mb-[1rem]'></div>
          {profileSection && contentRecord[profileSection]}
        </div>
      </div>

      {profileSection ? null : <AccountOngoingRequests />}
    </>
  );
}

const contentRecord: Record<AccountProfileSection, JSX.Element> = {
  PRIVACY_SETTINGS: <AccountProfilePrivacy />,
  CHANGE_DISPLAY_NAME: <AccountChangeDisplayName />,
  CHANGE_EMAIL: <></>, // TODO: implement
  CHANGE_PASSWORD: <></>, // TODO: implement
  DELETE_ACCOUNT: <></>, // TODO: implement
};
