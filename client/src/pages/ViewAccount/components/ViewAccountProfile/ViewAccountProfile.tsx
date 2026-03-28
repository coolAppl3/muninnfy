import { JSX } from 'react';
import StatisticItem from '../../../../components/StatisticItem/StatisticItem';
import { getFullDateString } from '../../../../utils/globalUtils';
import useAccountLocation from '../../../Account/hooks/useAccountLocation';
import useAccountSocial from '../../../Account/hooks/useAccountSocial';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '../../../../components/Button/Button';
import useViewAccountDetails from '../../hooks/useViewAccountDetails';
import useAuth from '../../../../hooks/useAuth';
import { cancelFollowRequestService } from '../../../../services/socialServices';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useHandleAsyncError, {
  HandleAsyncErrorFunction,
} from '../../../../hooks/useHandleAsyncError';

export default function ViewAccountProfile(): JSX.Element {
  const { setAccountLocation } = useAccountLocation();
  const { setSocialSection } = useAccountSocial();
  const { viewAccountDetails } = useViewAccountDetails();

  const { authStatus } = useAuth();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  const {
    public_account_id,
    username,
    display_name,
    created_on_timestamp,
    follow_id,
    follow_request_id,
    followers_count,
    following_count,
    wishlists_count,
  } = viewAccountDetails;

  const isFollowing: boolean = follow_id !== null;
  const followRequestSEnt: boolean = follow_request_id !== null;

  async function sendFollowRequest(): Promise<void> {
    // TODO: continue implementation
  }

  async function cancelFollowRequest(): Promise<void> {
    if (!follow_request_id) {
      displayPopupMessage('Follow request already sent.', 'success');
      return;
    }

    try {
      await cancelFollowRequestService(follow_request_id);
    } catch (err: unknown) {
      console.log(err);
      const { status } = handleAsyncError(err);

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
      }
    }
  }

  async function unfollow(): Promise<void> {
    // TODO: continue implementation
  }

  async function handleOnClick(): Promise<void> {
    if (isFollowing) {
      await unfollow();
      return;
    }

    if (followRequestSEnt) {
      await cancelFollowRequest();
      return;
    }

    if (authStatus !== 'authenticated') {
      navigate('/sign-in');
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
        className={`${!isFollowing && !followRequestSEnt ? 'bg-cta border-cta text-dark' : 'bg-description border-description text-dark'} w-full sm:w-fit mb-1`}
        onClick={handleOnClick}
      >
        {isFollowing ? 'Unfollow' : followRequestSEnt ? 'Cancel follow request' : 'Follow'}
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
