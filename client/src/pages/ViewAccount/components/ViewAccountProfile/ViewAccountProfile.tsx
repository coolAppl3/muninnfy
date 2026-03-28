import { JSX, ReactNode, useState } from 'react';
import StatisticItem from '../../../../components/StatisticItem/StatisticItem';
import { getFullDateString } from '../../../../utils/globalUtils';
import useAccountLocation from '../../../Account/hooks/useAccountLocation';
import useAccountSocial from '../../../Account/hooks/useAccountSocial';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '../../../../components/Button/Button';
import useViewAccountDetails from '../../hooks/useViewAccountDetails';
import useAuth from '../../../../hooks/useAuth';
import {
  cancelFollowRequestService,
  sendFollowRequestService,
} from '../../../../services/socialServices';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useHandleAsyncError, {
  HandleAsyncErrorFunction,
} from '../../../../hooks/useHandleAsyncError';
import useHistory from '../../../../hooks/useHistory';
import useInfoModal from '../../../../hooks/useInfoModal';

export default function ViewAccountProfile(): JSX.Element {
  const { setAccountLocation } = useAccountLocation();
  const { setSocialSection } = useAccountSocial();
  const { viewAccountDetails, setViewAccountDetails } = useViewAccountDetails();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { authStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

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
  const followRequestSent: boolean = follow_request_id !== null;

  async function sendFollowRequest(): Promise<void> {
    try {
      const { followAutoApproved, insertId } = (
        await sendFollowRequestService({
          publicAccountId: public_account_id,
        })
      ).data;

      if (!followAutoApproved) {
        setViewAccountDetails((prev) => ({ ...prev, follow_request_id: insertId }));
        displayPopupMessage('Request sent.', 'success');

        return;
      }

      setViewAccountDetails((prev) => ({
        ...prev,
        follow_request_id: null,
        follow_id: insertId,
      }));
      displayPopupMessage('Followed successfully.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400 && !errReason) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
        return;
      }

      if (status !== 409) {
        return;
      }

      if (errReason === 'selfFollow') {
        navigate('/account');
        return;
      }

      if (errReason !== 'followingLimitReached') {
        return;
      }

      displayInfoModal({
        title: errMessage,
        description: 'Unfollow a few users to follow new users.',
        btnTitle: 'Okay',
        onClick: removeInfoModal,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function cancelFollowRequest(): Promise<void> {
    if (!follow_request_id) {
      displayPopupMessage('Follow request already sent.', 'success');
      setIsSubmitting(false);

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
    } finally {
      setIsSubmitting(false);
    }
  }

  async function unfollow(): Promise<void> {
    // TODO: continue implementation
  }

  async function handleOnClick(): Promise<void> {
    setIsSubmitting(true);

    if (isFollowing) {
      await unfollow();
      return;
    }

    if (followRequestSent) {
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

      {isSubmitting && <div className='spinner w-[2.8rem] h-[2.8rem] mb-1'></div>}

      {isSubmitting || (
        <Button
          className={`${!isFollowing && !followRequestSent ? 'bg-cta border-cta text-dark' : 'bg-description border-description text-dark'} w-full sm:w-fit mb-1 text-sm !leading-[1.2rem]`}
          onClick={handleOnClick}
        >
          {isFollowing ? 'Unfollow' : followRequestSent ? 'Follow requested' : 'Follow'}
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
