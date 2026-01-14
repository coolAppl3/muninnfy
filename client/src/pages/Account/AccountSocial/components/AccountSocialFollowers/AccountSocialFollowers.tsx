import { ChangeEvent, JSX, useCallback, useEffect, useMemo, useState } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import FollowCard from '../FollowCard/FollowCard';
import { FollowDetails } from '../../../../../types/socialTypes';
import { getFollowersBatchService, searchFollowersService } from '../../../../../services/socialServices';
import { SOCIAL_FETCH_BATCH_SIZE, SOCIAL_RENDER_BATCH_SIZE } from '../../../../../utils/constants/socialConstants';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateSearchQuery } from '../../../../../utils/validation/socialValidation';
import { debounce } from '../../../../../utils/debounce';
import { CanceledError } from 'axios';

export default function AccountSocialFollowers(): JSX.Element {
  const { followers, socialCounts, setFollowers, setFetchDetails } = useAccountSocialDetails();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [renderMode, setRenderMode] = useState<'local' | 'query'>('local');
  const [renderLimit, setRenderLimit] = useState<number>(SOCIAL_RENDER_BATCH_SIZE);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryResults, setSearchQueryResults] = useState<FollowDetails[]>(followers);
  const [allSearchQueryResultsFetched, setAllSearchQueryResultsFetched] = useState<boolean>(false);

  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  const renderArray: FollowDetails[] = renderMode === 'local' ? followers : searchQueryResults;
  const allFollowersRendered: boolean = renderMode === 'local' ? renderLimit >= socialCounts.followers_count : allSearchQueryResultsFetched;

  const searchFollowers = useCallback(
    async (searchQuery: string, offset: number, abortSignal: AbortSignal) => {
      try {
        const followersBatch: FollowDetails[] = (await searchFollowersService(searchQuery, offset, abortSignal)).data.followersBatch;
        offset === 0 ? setSearchQueryResults(followersBatch) : setSearchQueryResults((prev) => [...prev, ...followersBatch]);

        followersBatch.length < SOCIAL_FETCH_BATCH_SIZE ? setAllSearchQueryResultsFetched(true) : setAllSearchQueryResultsFetched(false);
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        console.log(err);
        const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

        if (isHandled) {
          return;
        }

        if (status !== 400) {
          return;
        }

        if (errReason === 'invalidOffset') {
          displayPopupMessage('Something went wrong.', 'error');
          return;
        }

        setErrorMessage(errMessage);
      }
    },
    [handleAsyncError, displayPopupMessage]
  );

  useEffect(() => {
    setRenderLimit(SOCIAL_RENDER_BATCH_SIZE);

    if (searchQuery === '') {
      return;
    }

    const abortController: AbortController = new AbortController();
    searchFollowers(searchQuery, 0, abortController.signal);

    return () => abortController.abort();
  }, [searchQuery, searchFollowers]);

  useEffect(() => {
    setRenderLimit(SOCIAL_RENDER_BATCH_SIZE);
  }, [renderMode]);

  async function getFollowersBatch(): Promise<void> {
    try {
      const followersBatch: FollowDetails[] = (await getFollowersBatchService(followers.length)).data.followersBatch;
      setFollowers((prev) => [...prev, ...followersBatch]);

      if (followers.length + followersBatch.length >= socialCounts.followers_count) {
        setFetchDetails((prev) => ({ ...prev, allFollowersFetched: true }));
      }
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
      }
    }
  }

  const debouncedSetSearchQuery = useMemo(() => debounce((searchQuery: string) => setSearchQuery(searchQuery), 300), []);

  return (
    <>
      <div className='h-line my-1'></div>

      <DefaultFormGroup
        id='search-followers'
        label='Search followers'
        autoComplete='off'
        className='mb-2'
        value={value}
        errorMessage={errorMessage}
        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;
          const newErrorMessage: string | null = validateSearchQuery(newValue);

          setValue(newValue);
          setErrorMessage(newErrorMessage);

          if (newValue === '') {
            setSearchQuery('');
            setRenderMode('local');

            return;
          }

          if (newErrorMessage) {
            return;
          }

          debouncedSetSearchQuery(newValue);
          setRenderMode('query');
        }}
      ></DefaultFormGroup>

      <div className='grid md:grid-cols-2 gap-1 items-start'>
        {renderArray.slice(0, renderLimit).map((followDetails: FollowDetails) => (
          <FollowCard
            key={followDetails.follow_id}
            isFollowerCard={true}
            followDetails={followDetails}
          />
        ))}

        {allFollowersRendered || (
          <button
            type='button'
            className='link text-sm sm:col-span-2 w-fit mx-auto'
            onClick={async () => {
              if (allFollowersRendered) {
                return;
              }

              if (renderMode === 'local') {
                renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length && (await getFollowersBatch());

                return;
              }

              renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length &&
                (await searchFollowers(searchQuery, renderArray.length, new AbortController().signal));
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
