import { JSX, memo, useState } from 'react';
import { FollowDetails } from '../../../../../types/socialTypes';
import { getFullDateString } from '../../../../../utils/globalUtils';
import RemoveIcon from '../../../../../assets/svg/RemoveIcon.svg?react';
import Button from '../../../../../components/Button/Button';
import { Link } from 'react-router-dom';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import { removeFollowerService, unfollowService } from '../../../../../services/socialServices';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';

type FollowCardProps = {
  isFollowerCard: boolean;
  followDetails: FollowDetails;
};

export default memo(FollowCard);
function FollowCard({ isFollowerCard, followDetails }: FollowCardProps): JSX.Element {
  const { follow_id, public_account_id, username, display_name, follow_timestamp } = followDetails;
  const { setFollowing, setFollowers } = useAccountSocialDetails();

  const [cardMode, setCardMode] = useState<'view' | 'confirm' | 'loading'>('view');

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();

  async function unfollow(): Promise<void> {
    try {
      await unfollowService(follow_id);
      setFollowing((prev) => prev.filter((followDetails: FollowDetails) => followDetails.follow_id !== follow_id));

      displayPopupMessage('Unfollowed.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { status } = handleAsyncError(err);

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
      }

      setCardMode('view');
    }
  }

  async function removeFollower(): Promise<void> {
    try {
      await removeFollowerService(follow_id);
      setFollowers((prev) => prev.filter((followDetails: FollowDetails) => followDetails.follow_id !== follow_id));

      displayPopupMessage('Unfollowed.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { status } = handleAsyncError(err);

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
      }
      setCardMode('view');
    }
  }

  if (cardMode === 'loading') {
    return (
      <div className='p-1 bg-primary rounded min-h-[9.4rem] grid place-items-center'>
        <div className='spinner w-[2.4rem] h-[2.4rem]'></div>
      </div>
    );
  }

  if (cardMode === 'confirm') {
    return (
      <div className='p-1 bg-primary rounded text-description text-sm'>
        <p
          style={{ wordBreak: 'break-word' }}
          className='text-description mb-1 font-medium'
        >
          {isFollowerCard
            ? `Are you sure you want to remove ${display_name} from your followers?`
            : `Are you sure you want to unfollow ${display_name}?`}
        </p>

        <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
          <Button
            className='bg-danger border-danger text-dark order-1 sm:order-2 w-full sm:w-fit text-sm !leading-[1.2]'
            onClick={async () => {
              setCardMode('loading');
              isFollowerCard ? await removeFollower() : await unfollow();
            }}
          >
            Confirm
          </Button>

          <Button
            className='bg-primary border-title text-title order-2 sm:order-1 w-full sm:w-fit text-sm !leading-[1.2]'
            onClick={() => setCardMode('view')}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-1 bg-primary rounded text-description text-sm'>
      <div className='flex justify-between items-start mb-[1.4rem]'>
        <div style={{ wordBreak: 'break-word' }}>
          <p className='text-title leading-[1] mb-[4px]'>{display_name}</p>
          <Link
            to={`/account/view/${public_account_id}`}
            className='block leading-[1] underline transition-colors hover:text-cta'
          >
            {username}
          </Link>
        </div>

        <button
          type='button'
          title={isFollowerCard ? 'Remove follower' : 'Unfollow'}
          aria-label={isFollowerCard ? 'Remove follower' : 'Unfollow'}
          className='ml-[4px] cursor-pointer group'
          onClick={() => setCardMode('confirm')}
        >
          <RemoveIcon className='w-[1.4rem] h-[1.4rem] transition-colors group-hover:text-danger' />
        </button>
      </div>

      <div className='text-description/50 text-xs'>
        <p className='leading-[1] mb-[4px]'>Since {getFullDateString(follow_timestamp)}</p>
        <p className='leading-[1]'>{public_account_id}</p>
      </div>
    </div>
  );
}
