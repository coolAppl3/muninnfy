import { JSX } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import FollowCard from '../FollowCard/FollowCard';
import { FollowDetails } from '../../../../../types/accountTypes';

export default function AccountSocialFollowing(): JSX.Element {
  const { following } = useAccountSocialDetails();

  return (
    <>
      <div className='h-line mt-1 mb-2'></div>
      <div className='grid md:grid-cols-2 gap-1 items-start'>
        {following.map((followDetails: FollowDetails) => (
          <FollowCard
            key={followDetails.follow_id}
            isFollowerCard={false}
            followDetails={followDetails}
          />
        ))}
      </div>
    </>
  );
}
