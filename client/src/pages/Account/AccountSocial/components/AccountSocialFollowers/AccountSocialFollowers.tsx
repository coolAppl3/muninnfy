import { JSX } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import FollowCard from '../FollowCard/FollowCard';
import { FollowDetails } from '../../../../../types/accountTypes';

export default function AccountSocialFollowers(): JSX.Element {
  const { followers } = useAccountSocialDetails();

  return (
    <>
      <div className='h-line mt-1 mb-2'></div>
      <div className='grid md:grid-cols-2 gap-1 items-start'>
        {followers.map((followDetails: FollowDetails) => (
          <FollowCard
            key={followDetails.follow_id}
            isFollowerCard={true}
            followDetails={followDetails}
          />
        ))}
      </div>
    </>
  );
}
