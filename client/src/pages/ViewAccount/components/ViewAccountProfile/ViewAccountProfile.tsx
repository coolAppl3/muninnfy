import { JSX } from 'react';
import StatisticItem from '../../../../components/StatisticItem/StatisticItem';
import { ViewAccountDetailsType } from '../../../../types/accountTypes';
import { getFullDateString } from '../../../../utils/globalUtils';
import useAccountLocation from '../../../Account/hooks/useAccountLocation';
import useAccountSocial from '../../../Account/hooks/useAccountSocial';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '../../../../components/Button/Button';

type ViewAccountProfileProps = {
  viewAccountDetails: ViewAccountDetailsType;
};

export default function ViewAccountProfile({
  viewAccountDetails,
}: ViewAccountProfileProps): JSX.Element {
  const {
    public_account_id,
    username,
    display_name,
    created_on_timestamp,
    is_following,
    follow_request_sent,
    followers_count,
    following_count,
    wishlists_count,
  } = viewAccountDetails;

  const { setAccountLocation } = useAccountLocation();
  const { setSocialSection } = useAccountSocial();
  const navigate: NavigateFunction = useNavigate();

  async function sendFollowRequest(): Promise<void> {
    // TODO: continue implementation
  }

  async function cancelFollowRequest(): Promise<void> {
    // TODO: continue implementation
  }

  async function unfollow(): Promise<void> {
    // TODO: continue implementation
  }

  async function handleOnClick(): Promise<void> {
    if (is_following) {
      await unfollow();
      return;
    }

    if (follow_request_sent) {
      await cancelFollowRequest();
      return;
    }

    await sendFollowRequest();
  }

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

      <Button
        className={`${!is_following && !follow_request_sent ? 'bg-cta border-cta text-dark' : 'bg-description border-description text-dark'} w-full sm:w-fit mb-1`}
        onClick={handleOnClick}
      >
        {is_following ? 'Unfollow' : follow_request_sent ? 'Cancel follow request' : 'Follow'}
      </Button>

      <div className='text-description/50 text-xs'>
        <p className='leading-none mb-[4px]'>
          Created on {getFullDateString(created_on_timestamp)}
        </p>
        <p className='leading-none'>{public_account_id}</p>
      </div>
    </section>
  );
}
