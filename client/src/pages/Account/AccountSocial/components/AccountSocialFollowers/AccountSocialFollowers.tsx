import { JSX, useState } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import FollowCard from '../FollowCard/FollowCard';
import { FollowDetails } from '../../../../../types/socialTypes';
import { getFollowersBatchService } from '../../../../../services/socialServices';
import { SOCIAL_FETCH_BATCH_SIZE, SOCIAL_RENDER_BATCH_SIZE } from '../../../../../utils/constants/socialConstants';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';

export default function AccountSocialFollowers(): JSX.Element {
  const { followers, setFollowers, fetchDetails, setFetchDetails } = useAccountSocialDetails();

  const [renderLimit, setRenderLimit] = useState<number>(SOCIAL_RENDER_BATCH_SIZE);
  const allFollowersRendered: boolean = renderLimit >= followers.length && fetchDetails.allFollowersFetched;

  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  async function getFollowersBatch(): Promise<void> {
    try {
      const followersBatch: FollowDetails[] = (await getFollowersBatchService(followers.length)).data.followersBatch;

      setFollowers((prev) => [...prev, ...followersBatch]);
      followersBatch.length < SOCIAL_FETCH_BATCH_SIZE && setFetchDetails((prev) => ({ ...prev, allFollowersFetched: true }));
    } catch (err: unknown) {
      console.log(err);
      const { status } = handleAsyncError(err);

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
      }
    }
  }

  return (
    <>
      <div className='h-line mt-1 mb-2'></div>
      <div className='grid md:grid-cols-2 gap-1 items-start'>
        {followers.slice(0, renderLimit).map((followDetails: FollowDetails) => (
          <FollowCard
            key={followDetails.follow_id}
            isFollowerCard={true}
            followDetails={followDetails}
          />
        ))}

        {!allFollowersRendered && (
          <button
            type='button'
            className='link text-sm max-w-fit mx-auto sm:col-span-2'
            onClick={async () => {
              if (allFollowersRendered) {
                return;
              }

              renderLimit + SOCIAL_RENDER_BATCH_SIZE > followers.length && (await getFollowersBatch());
              setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
            }}
          >
            Load more
          </button>
        )}
      </div>
    </>
  );
}
