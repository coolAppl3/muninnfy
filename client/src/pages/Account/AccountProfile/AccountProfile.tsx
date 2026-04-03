import { ComponentType, JSX } from 'react';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import AccountProfileHeader from './components/AccountProfileHeader/AccountProfileHeader';
import AccountProfilePrivacy from './components/AccountProfilePrivacy/AccountProfilePrivacy';
import useAccountDetails from '../hooks/useAccountDetails';
import { getFullDateString } from '../../../utils/globalUtils';
import { AccountProfileSection } from '../contexts/AccountProfileContext';
import useAccountProfile from '../hooks/useAccountProfile';
import AccountOngoingRequests from './components/AccountOngoingRequests/AccountOngoingRequests';
import AccountChangeDisplayName from './components/AccountChangeDisplayName/AccountChangeDisplayName';
import AccountChangePassword from './components/AccountChangePassword/AccountChangePassword';
import AccountChangeEmail from './components/AccountChangeEmail/AccountChangeEmail';
import AccountDeletion from './components/AccountDeletion/AccountDeletion';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useAccountLocation from '../hooks/useAccountLocation';
import useAccountSocial from '../hooks/useAccountSocial';

export function AccountProfile(): JSX.Element {
  const { accountDetails } = useAccountDetails();
  const {
    public_account_id,
    created_on_timestamp,
    display_name,
    username,
    followers_count,
    following_count,
    wishlists_count,
  } = accountDetails;
  const { profileSection } = useAccountProfile();
  const { setAccountLocation } = useAccountLocation();
  const { setSocialSection } = useAccountSocial();

  const navigate: NavigateFunction = useNavigate();

  const MappedComponent: ComponentType | null =
    profileSection && componentRecord[profileSection];

  return (
    <section>
      <AccountProfileHeader />

      <div className='mb-1'>
        <h3 className='text-title font-normal wrap-break-word'>{display_name}</h3>
        <h3 className='text-description text-sm font-normal wrap-break-word'>@{username}</h3>
      </div>

      <div className='grid grid-cols-3 gap-1 text-sm text-description mb-1'>
        <button
          className='w-fit text-start cursor-pointer hover:text-cta'
          onClick={() => navigate('/wishlists')}
        >
          <StatisticItem
            title='Wishlists'
            value={wishlists_count}
          />
        </button>

        <button
          className='w-fit text-start cursor-pointer hover:text-cta'
          onClick={() => {
            setAccountLocation('social');
            setSocialSection('followers');
          }}
        >
          <StatisticItem
            title='Followers'
            value={followers_count}
          />
        </button>

        <button
          className='w-fit text-start cursor-pointer hover:text-cta'
          onClick={() => {
            setAccountLocation('social');
            setSocialSection('following');
          }}
        >
          <StatisticItem
            title='Following'
            value={following_count}
          />
        </button>
      </div>

      <div className='text-description/50 text-xs relative z-0 mb-auto'>
        <p className='leading-none mb-[4px]'>
          Created on {getFullDateString(created_on_timestamp)}
        </p>
        <p className='leading-none'>{public_account_id}</p>
      </div>

      {MappedComponent && (
        <>
          <div className='h-line mt-2 mb-[1rem]'></div>
          <MappedComponent />
        </>
      )}

      {profileSection ? null : <AccountOngoingRequests />}
    </section>
  );
}

const componentRecord: Record<AccountProfileSection, ComponentType> = {
  privacySettings: AccountProfilePrivacy,
  changeDisplayName: AccountChangeDisplayName,
  changeEmail: AccountChangeEmail,
  changePassword: AccountChangePassword,
  deleteAccount: AccountDeletion,
};
