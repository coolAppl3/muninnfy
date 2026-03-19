import { ComponentType, JSX } from 'react';
import useAccountLocation from '../hooks/useAccountLocation';
import AccountNotifications from '../AccountNotifications/AccountNotifications';
import { AccountProfile } from '../AccountProfile/AccountProfile';
import AccountSocial from '../AccountSocial/AccountSocial';
import { AccountLocation } from '../contexts/AccountLocationContext';
import AccountProfileProvider from '../providers/AccountProfileProvider';
import AccountSocialProvider from '../providers/AccountSocialProvider';

export default function AccountContent(): JSX.Element {
  const { accountLocation } = useAccountLocation();

  const MappedComponent: ComponentType = componentRecord[accountLocation];

  return (
    <div className='p-2 bg-secondary rounded-sm col-span-12 md:col-span-9 shadow-simple-tiny md:min-h-full'>
      <MappedComponent />
    </div>
  );
}

const componentRecord: Record<AccountLocation, ComponentType> = {
  profile: ProfileContent,
  social: SocialContent,
  notifications: AccountNotifications,
};

function ProfileContent(): JSX.Element {
  return (
    <AccountProfileProvider>
      <AccountProfile />
    </AccountProfileProvider>
  );
}

function SocialContent(): JSX.Element {
  return (
    <AccountSocialProvider>
      <AccountSocial />
    </AccountSocialProvider>
  );
}
