import { JSX } from 'react';
import useAccountLocation from '../hooks/useAccountLocation';
import AccountNotifications from '../AccountNotifications/AccountNotifications';
import { AccountProfile } from '../AccountProfile/AccountProfile';
import AccountSocial from '../AccountSocial/AccountSocial';
import { AccountLocation } from '../contexts/AccountLocationContext';
import AccountWishlists from '../AccountWishlists/AccountWishlists';

export default function AccountContent(): JSX.Element {
  const { accountLocation } = useAccountLocation();

  return <div className='p-2 bg-secondary rounded-sm col-span-12 md:col-span-9 shadow-simple-tiny'>{ContentRecord[accountLocation]}</div>;
}

const ContentRecord: Record<AccountLocation, JSX.Element> = {
  profile: <AccountProfile />,
  social: <AccountSocial />,
  notifications: <AccountNotifications />,
  wishlists: <AccountWishlists />,
};
