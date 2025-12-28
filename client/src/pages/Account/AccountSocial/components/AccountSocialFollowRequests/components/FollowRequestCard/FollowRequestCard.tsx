import { JSX, useState } from 'react';
import { FollowRequest } from '../../../../../../../types/accountTypes';
import useAccountSocialDetails from '../../../../../hooks/useAccountSocialDetails';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../../../hooks/useHandleAsyncError';
import usePopupMessage from '../../../../../../../hooks/usePopupMessage';
import Button from '../../../../../../../components/Button/Button';
import { Link } from 'react-router-dom';
import { getFullDateString } from '../../../../../../../utils/globalUtils';

type FollowRequestCardProps = {
  followRequest: FollowRequest;
};

export default function FollowRequestCard({ followRequest }: FollowRequestCardProps): JSX.Element {
  const { request_id, public_account_id, username, display_name, request_timestamp } = followRequest;
  const { setFollowRequests } = useAccountSocialDetails();

  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();

  async function acceptFollowRequest(): Promise<void> {
    // TODO: continue implementation
  }

  async function declineFollowRequest(): Promise<void> {
    // TODO: continue implementation
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
