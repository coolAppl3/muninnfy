import { ChangeEvent, JSX, useCallback, useEffect, useMemo, useState } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import FollowCard from '../FollowCard/FollowCard';
import { FollowDetails } from '../../../../../types/socialTypes';
import { getSocialBatchService, searchSocialService } from '../../../../../services/socialServices';
import { SOCIAL_FETCH_BATCH_SIZE, SOCIAL_RENDER_BATCH_SIZE } from '../../../../../utils/constants/socialConstants';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateSearchQuery } from '../../../../../utils/validation/socialValidation';
import { debounce } from '../../../../../utils/debounce';
import { CanceledError } from 'axios';
import Button from '../../../../../components/Button/Button';

export default function AccountSocialFollowing(): JSX.Element {
  const { following, socialCounts, setFollowing, setFollowers, setSocialCounts, setFetchDetails } = useAccountSocialDetails();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [renderMode, setRenderMode] = useState<'local' | 'query'>('local');
  const [renderLimit, setRenderLimit] = useState<number>(SOCIAL_RENDER_BATCH_SIZE);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryResults, setSearchQueryResults] = useState<FollowDetails[]>(following);
  const [allSearchQueryResultsFetched, setAllSearchQueryResultsFetched] = useState<boolean>(false);

  const [fetchingSearchQueryResults, setFetchingSearchQueryResults] = useState<boolean>(false);
  const [fetchingAdditionalFollowing, setFetchingAdditionalFollowing] = useState<boolean>(false);

  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  const renderArray: FollowDetails[] = renderMode === 'local' ? following : searchQueryResults;
  const allFollowingRendered: boolean = renderMode === 'local' ? renderLimit >= socialCounts.following_count : allSearchQueryResultsFetched;

  const searchFollowing = useCallback(
    async (searchQuery: string, offset: number, abortSignal: AbortSignal) => {
      try {
        const followingBatch: FollowDetails[] = (await searchSocialService('following', searchQuery, offset, abortSignal)).data.batch;

        offset === 0 ? setSearchQueryResults(followingBatch) : setSearchQueryResults((prev) => [...prev, ...followingBatch]);
        followingBatch.length < SOCIAL_FETCH_BATCH_SIZE ? setAllSearchQueryResultsFetched(true) : setAllSearchQueryResultsFetched(false);

        setFetchingSearchQueryResults(false);
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          setFetchingSearchQueryResults(false);
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
    searchFollowing(searchQuery, 0, abortController.signal);

    return () => abortController.abort();
  }, [searchQuery, searchFollowing]);

  useEffect(() => {
    setRenderLimit(SOCIAL_RENDER_BATCH_SIZE);
  }, [renderMode]);

  async function getFollowingBatch(): Promise<void> {
    try {
      const followingBatch: FollowDetails[] = (await getSocialBatchService('following', following.length)).data.batch;
      setFollowing((prev) => [...prev, ...followingBatch]);

      if (following.length + followingBatch.length >= socialCounts.following_count) {
        setFetchDetails((prev) => ({ ...prev, allFollowingFetched: true }));
      }

      setFetchingAdditionalFollowing(false);
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
        id='search-following'
        label='Search following'
        placeholder='Username or display name'
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

          if (newValue === searchQuery) {
            return;
          }

          setFetchingSearchQueryResults(true);
          debouncedSetSearchQuery(newValue);
          setRenderMode('query');
        }}
      />

      {fetchingSearchQueryResults ? (
        <div className='spinner w-[2.4rem] h-[2.4rem] mx-auto mt-2'></div>
      ) : (
        <div className='grid md:grid-cols-2 gap-1 items-start'>
          {renderArray.length === 0 ? (
            <p className='text-sm text-description w-fit mx-auto sm:col-span-2'>No users found</p>
          ) : (
            renderArray.slice(0, renderLimit).map((followDetails: FollowDetails) => (
              <FollowCard
                key={followDetails.follow_id}
                isFollowerCard={false}
                followDetails={followDetails}
                setSearchQueryResults={setSearchQueryResults}
                setFollowers={setFollowers}
                setFollowing={setFollowing}
                setSocialCounts={setSocialCounts}
              />
            ))
          )}

          {fetchingAdditionalFollowing ? (
            <div className='spinner w-[2.4rem] h-[2.4rem] mx-auto mt-1 sm:col-span-2'></div>
          ) : (
            allFollowingRendered || (
              <Button
                className='bg-description border-description text-dark text-sm py-[4px] w-full sm:w-fit sm:col-span-2 mx-auto rounded-pill'
                onClick={async () => {
                  if (allFollowingRendered) {
                    return;
                  }

                  setFetchingAdditionalFollowing(true);

                  if (renderMode === 'local') {
                    renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length && (await getFollowingBatch());

                    setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
                    setFetchingAdditionalFollowing(false);

                    return;
                  }

                  renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length &&
                    (await searchFollowing(searchQuery, renderArray.length, new AbortController().signal));

                  setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
                  setFetchingAdditionalFollowing(false);
                }}
              >
                Load more
              </Button>
            )
          )}
        </div>
      )}
    </>
  );
}
