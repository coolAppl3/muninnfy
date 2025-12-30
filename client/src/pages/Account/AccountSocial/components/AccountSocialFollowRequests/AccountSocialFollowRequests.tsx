import { JSX } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import { FollowRequest } from '../../../../../types/accountTypes';
import FollowRequestCard from './components/FollowRequestCard/FollowRequestCard';

export default function AccountSocialFollowRequests(): JSX.Element {
  const { followRequests } = useAccountSocialDetails();

  return (
    <>
      <div className='h-line mt-1 mb-2'></div>
      <div className='grid gap-1 items-start'>
        {followRequests.map((followDetails: FollowRequest) => (
          <FollowRequestCard
            key={followDetails.request_id}
            followRequest={followDetails}
          />
        ))}
      </div>
    </>
  );
}
