import { JSX } from 'react';
import useAccountLocation from '../hooks/useAccountLocation';
import AccountNotifications from '../AccountNotifications/AccountNotifications';
import { AccountProfile } from '../AccountProfile/AccountProfile';
import AccountSocial from '../AccountSocial/AccountSocial';
import { AccountLocation } from '../contexts/AccountLocationContext';
import AccountWishlists from '../AccountWishlists/AccountWishlists';
import AccountProfileProvider from '../providers/AccountProfileProvider';
import AccountSocialProvider from '../providers/AccountSocialProvider';
import AccountSocialDetailsProvider from '../providers/AccountSocialDetailsProvider';

export default function AccountContent(): JSX.Element {
  const { accountLocation } = useAccountLocation();

  return (
    <div className='p-2 bg-secondary rounded-sm col-span-12 md:col-span-9 shadow-simple-tiny min-h-full'>
      {contentRecord[accountLocation]}
    </div>
  );
}

const contentRecord: Record<AccountLocation, JSX.Element> = {
  profile: (
    <AccountProfileProvider>
      <AccountProfile />
    </AccountProfileProvider>
  ),

  social: (
    <AccountSocialProvider>
      <AccountSocialDetailsProvider>
        <AccountSocial />
      </AccountSocialDetailsProvider>
    </AccountSocialProvider>
  ),

  notifications: <AccountNotifications />,
  wishlists: <AccountWishlists />,
};
