import { JSX } from 'react';
import StatisticItem from '../../../../components/StatisticItem/StatisticItem';
import { ViewAccountDetailsType } from '../../../../types/accountTypes';
import { getFullDateString } from '../../../../utils/globalUtils';
import useAccountLocation from '../../../Account/hooks/useAccountLocation';
import useAccountSocial from '../../../Account/hooks/useAccountSocial';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '../../../../components/Button/Button';
import { useViewAccountDetails } from '../../hooks/useViewAccountDetails';

type ViewAccountProfileProps = {
  viewAccountDetails: ViewAccountDetailsType;
};

export default function ViewAccountProfile({
  viewAccountDetails,
}: ViewAccountProfileProps): JSX.Element {
  const { accountCounts } = useViewAccountDetails();

  const { followers_count, following_count, wishlists_count } = accountCounts;
  const { public_account_id, username, display_name, created_on_timestamp, is_following } =
    viewAccountDetails;

  const { setAccountLocation } = useAccountLocation();
  const { setSocialSection } = useAccountSocial();
  const navigate: NavigateFunction = useNavigate();

  return (
    <section>
      <div className='mb-1'>
        <h3 className='text-title font-normal wrap-break-word'>{display_name}</h3>
        <h3 className='text-description text-sm font-normal wrap-break-word'>@{username}</h3>
      </div>

      <div className='grid grid-cols-3 gap-1 text-sm text-description relative z-0 h-fit mb-2'>
        <button
          className='w-fit text-start cursor-pointer hover:text-cta'
          onClick={() => navigate(`/view/wishlists/${public_account_id}`)}
        >
          <StatisticItem
            title='Wishlists'
            value={wishlists_count}
          />
        </button>

        <button
          className='w-fit text-start cursor-pointer hover:text-cta'
          onClick={() => setAccountLocation('social')}
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

      {is_following ? (
        <Button
          className='bg-secondary border-title text-title w-full sm:w-fit mb-1'
          onClick={() => {
            /** TODO: continue implementation */
          }}
        >
          Unfollow
        </Button>
      ) : (
        <Button
          className='bg-cta border-cta text-dark w-full sm:w-fit mb-1'
          onClick={() => {
            /** TODO: continue implementation */
          }}
        >
          Follow
        </Button>
      )}

      <div className='text-description/50 text-xs'>
        <p className='leading-none mb-[4px]'>
          Created on {getFullDateString(created_on_timestamp)}
        </p>
        <p className='leading-none'>{public_account_id}</p>
      </div>
    </section>
  );
}
