import { Dispatch, JSX, memo, SetStateAction, useState } from 'react';
import { FollowDetails, FollowRequest, SocialCounts } from '../../../../../../../types/socialTypes';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../../../hooks/useHandleAsyncError';
import usePopupMessage from '../../../../../../../hooks/usePopupMessage';
import Button from '../../../../../../../components/Button/Button';
import { Link } from 'react-router-dom';
import { getFullDateString } from '../../../../../../../utils/globalUtils';
import { acceptFollowRequestService, declineFollowRequestService } from '../../../../../../../services/socialServices';
import useInfoModal from '../../../../../../../hooks/useInfoModal';

type FollowRequestCardProps = {
  followRequest: FollowRequest;

  setFollowRequests: Dispatch<SetStateAction<FollowRequest[]>>;
  setFollowers: Dispatch<SetStateAction<FollowDetails[]>>;
  setSocialCounts: Dispatch<SetStateAction<SocialCounts>>;
};

export default memo(FollowRequestCard);
function FollowRequestCard({ followRequest, setFollowRequests, setFollowers }: FollowRequestCardProps): JSX.Element {
  const { request_id, public_account_id, username, display_name, request_timestamp } = followRequest;

  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  async function acceptFollowRequest(): Promise<void> {
    try {
      const { follow_id, follow_timestamp } = (await acceptFollowRequestService({ requestId: request_id })).data;

      const newFollowerDetails: FollowDetails = {
        follow_id,
        follow_timestamp,
        public_account_id,
        display_name,
        username,
      };

      setFollowRequests((prev) => prev.filter((followRequest: FollowRequest) => followRequest.request_id !== request_id));
      setFollowers((prev) => [newFollowerDetails, ...prev]);

      displayPopupMessage('Request accepted.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      setActionLoading(false);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status === 404) {
        setFollowRequests((prev) => prev.filter((followRequest: FollowRequest) => followRequest.request_id !== request_id));
        return;
      }

      if (status !== 409) {
        return;
      }

      if (errReason === 'alreadyAccepted') {
        setFollowRequests((prev) => prev.filter((followRequest: FollowRequest) => followRequest.request_id !== request_id));
        displayPopupMessage(errMessage, 'success');

        return;
      }

      if (errReason !== 'followersLimitReached') {
        return;
      }

      displayInfoModal({
        title: errMessage,
        description: `You'll have to remove some of your existing followers before accepting new ones.`,
        btnTitle: 'Okay',
        onClick: removeInfoModal,
      });
    }
  }

  async function declineFollowRequest(): Promise<void> {
    try {
      await declineFollowRequestService(request_id);
      setFollowRequests((prev) => prev.filter((followRequest: FollowRequest) => followRequest.request_id !== request_id));

      displayPopupMessage('Requested declined.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status } = handleAsyncError(err);

      setActionLoading(false);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status === 404) {
        setFollowRequests((prev) => prev.filter((followRequest: FollowRequest) => followRequest.request_id !== request_id));
      }
    }
  }

  return (
    <div className='p-1 bg-primary rounded text-description text-sm flex flex-col justify-between items-start sm:flex-row sm:items-end gap-2'>
      <div>
        <div
          className='mb-[1.4rem]'
          style={{ wordBreak: 'break-word' }}
        >
          <p className='text-title leading-[1] mb-[4px]'>{display_name}</p>
          <Link
            to={`/account/view/${public_account_id}`}
            className='block leading-[1] underline transition-colors hover:text-cta'
          >
            {username}
          </Link>
        </div>
        <div className='text-description/50 text-xs'>
          <p className='leading-[1] mb-[4px]'>Requested on {getFullDateString(request_timestamp)}</p>
          <p className='leading-[1]'>{public_account_id}</p>
        </div>
      </div>

      {actionLoading ? (
        <div className='p-1 w-full sm:w-fit grid place-items-center'>
          <div className='spinner w-[2.4rem] h-[2.4rem]'></div>
        </div>
      ) : (
        <div className='flex justify-start items-center gap-1 w-full sm:w-fit'>
          <Button
            className='bg-primary border-danger text-danger text-sm !leading-[1.2] w-full sm:w-fit'
            onClick={async () => {
              setActionLoading(true);
              await declineFollowRequest();
            }}
          >
            Decline
          </Button>

          <Button
            className='bg-description border-description text-dark text-sm !leading-[1.2] w-full sm:w-fit'
            onClick={async () => {
              setActionLoading(true);
              await acceptFollowRequest();
            }}
          >
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}
