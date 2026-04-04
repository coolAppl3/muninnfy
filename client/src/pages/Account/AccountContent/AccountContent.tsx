import { JSX } from 'react';
import useAccountLocation from '../hooks/useAccountLocation';
import AccountNotifications from '../AccountNotifications/AccountNotifications';
import { AccountProfile } from '../AccountProfile/AccountProfile';
import AccountSocial from '../AccountSocial/AccountSocial';
import AccountProfileProvider from '../providers/AccountProfileProvider';
import AccountSocialProvider from '../providers/AccountSocialProvider';
import useAccountDetails from '../hooks/useAccountDetails';

export default function AccountContent(): JSX.Element {
  return (
    <div className='p-2 bg-secondary rounded-sm col-span-12 md:col-span-9 shadow-simple-tiny md:min-h-full'>
      <AccountSocialProvider>
        <MappedComponent />
      </AccountSocialProvider>
    </div>
  );
}

function MappedComponent(): JSX.Element {
  const { accountLocation } = useAccountLocation();
  const { setAccountDetails } = useAccountDetails();

  if (accountLocation === 'profile') {
    return (
      <AccountProfileProvider>
        <AccountProfile />
      </AccountProfileProvider>
    );
  }

  if (accountLocation === 'notifications') {
    return <AccountNotifications />;
  }

  return <AccountSocial setAccountDetails={setAccountDetails} />;
}
