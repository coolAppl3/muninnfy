import { ChangeEvent, JSX, useCallback, useEffect, useMemo, useState } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import { FollowRequest } from '../../../../../types/socialTypes';
import FollowRequestCard from './components/FollowRequestCard/FollowRequestCard';
import { getFollowRequestsBatchService, searchFollowRequestsService } from '../../../../../services/socialServices';
import { SOCIAL_FETCH_BATCH_SIZE, SOCIAL_RENDER_BATCH_SIZE } from '../../../../../utils/constants/socialConstants';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateSearchQuery } from '../../../../../utils/validation/socialValidation';
import { debounce } from '../../../../../utils/debounce';
import { CanceledError } from 'axios';
import Button from '../../../../../components/Button/Button';

export default function AccountSocialFollowRequests(): JSX.Element {
  const { followRequests, socialCounts, setFollowRequests, setSocialCounts, setFollowers, setFetchDetails } = useAccountSocialDetails();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [renderMode, setRenderMode] = useState<'local' | 'query'>('local');
  const [renderLimit, setRenderLimit] = useState<number>(SOCIAL_RENDER_BATCH_SIZE);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryResults, setSearchQueryResults] = useState<FollowRequest[]>(followRequests);
  const [allSearchQueryResultsFetched, setAllSearchQueryResultsFetched] = useState<boolean>(false);

  const [fetchingSearchQueryResults, setFetchingSearchQueryResults] = useState<boolean>(false);
  const [fetchingAdditionalFollowRequests, setFetchingAdditionalFollowRequests] = useState<boolean>(false);

  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  const renderArray: FollowRequest[] = renderMode === 'local' ? followRequests : searchQueryResults;
  const allFollowRequestsRendered: boolean =
    renderMode === 'local' ? renderLimit >= socialCounts.follow_requests_count : allSearchQueryResultsFetched;

  const searchFollowRequests = useCallback(
    async (searchQuery: string, offset: number, abortSignal: AbortSignal) => {
      try {
        const followRequestsBatch: FollowRequest[] = (await searchFollowRequestsService(searchQuery, offset, abortSignal)).data.batch;

        offset === 0 ? setSearchQueryResults(followRequestsBatch) : setSearchQueryResults((prev) => [...prev, ...followRequestsBatch]);
        followRequestsBatch.length < SOCIAL_FETCH_BATCH_SIZE
          ? setAllSearchQueryResultsFetched(true)
          : setAllSearchQueryResultsFetched(false);

        setFetchingSearchQueryResults(false);
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
    searchFollowRequests(searchQuery, 0, abortController.signal);

    return () => abortController.abort();
  }, [searchQuery, searchFollowRequests]);

  useEffect(() => {
    setRenderLimit(SOCIAL_RENDER_BATCH_SIZE);
  }, [renderMode]);

  async function getFollowRequestsBatch(): Promise<void> {
    try {
      const followRequestsBatch: FollowRequest[] = (await getFollowRequestsBatchService(followRequests.length)).data.batch;
      setFollowRequests((prev) => [...prev, ...followRequestsBatch]);

      if (followRequests.length + followRequestsBatch.length >= socialCounts.follow_requests_count) {
        setFetchDetails((prev) => ({ ...prev, allFollowRequestsFetched: true }));
      }

      setFetchingAdditionalFollowRequests(false);
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
        id='search-follow-requests'
        label='Search follow requests'
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
        <div className='grid gap-1 items-start'>
          {renderArray.length === 0 ? (
            <p className='text-sm text-description w-fit mx-auto'>No users found</p>
          ) : (
            renderArray.slice(0, renderLimit).map((followDetails: FollowRequest) => (
              <FollowRequestCard
                key={followDetails.request_id}
                followRequest={followDetails}
                setFollowRequests={setFollowRequests}
                setFollowers={setFollowers}
                setSocialCounts={setSocialCounts}
              />
            ))
          )}

          {fetchingAdditionalFollowRequests ? (
            <div className='spinner w-[2.4rem] h-[2.4rem] mx-auto mt-1'></div>
          ) : (
            allFollowRequestsRendered || (
              <Button
                className='bg-description border-description text-dark text-sm py-[4px] w-full sm:w-fit mx-auto rounded-pill'
                onClick={async () => {
                  if (allFollowRequestsRendered) {
                    return;
                  }

                  setFetchingAdditionalFollowRequests(true);

                  if (renderMode === 'local') {
                    renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length && (await getFollowRequestsBatch());

                    setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
                    setFetchingAdditionalFollowRequests(false);

                    return;
                  }

                  renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length &&
                    (await searchFollowRequests(searchQuery, renderArray.length, new AbortController().signal));

                  setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
                  setFetchingAdditionalFollowRequests(false);
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
