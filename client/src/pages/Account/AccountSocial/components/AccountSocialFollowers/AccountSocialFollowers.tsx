import { ChangeEvent, JSX, useCallback, useEffect, useMemo, useState } from 'react';
import useAccountSocialDetails from '../../../hooks/useAccountSocialDetails';
import FollowCard from '../FollowCard/FollowCard';
import { FollowDetails } from '../../../../../types/socialTypes';
import {
  getSocialBatchService,
  searchSocialService,
} from '../../../../../services/socialServices';
import {
  SOCIAL_FETCH_BATCH_SIZE,
  SOCIAL_RENDER_BATCH_SIZE,
} from '../../../../../utils/constants/socialConstants';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, {
  HandleAsyncErrorFunction,
} from '../../../../../hooks/useHandleAsyncError';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateSocialSearchQuery } from '../../../../../utils/validation/socialValidation';
import { debounce } from '../../../../../utils/debounce';
import { CanceledError } from 'axios';
import Button from '../../../../../components/Button/Button';
import ContentLoadingSkeleton from '../../../components/ContentLoadingSkeleton/ContentLoadingSkeleton';
import useViewMode from '../../../../../hooks/useViewMode';
import useAccountLocation from '../../../hooks/useAccountLocation';
import useAuth from '../../../../../hooks/useAuth';
import useHistory from '../../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { DisplayPopupMessageFunction } from '../../../../../contexts/PopupMessageContext';

export default function AccountSocialFollowers(): JSX.Element {
  const {
    followers,
    socialCounts,
    fetchDetails,
    setFollowers,
    setFollowing,
    setSocialCounts,
    setFetchDetails,
  } = useAccountSocialDetails();
  const { inViewMode, publicAccountId } = useViewMode();
  const { setAccountLocation } = useAccountLocation();

  const { authStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [renderMode, setRenderMode] = useState<'local' | 'query'>('local');
  const [renderLimit, setRenderLimit] = useState<number>(SOCIAL_RENDER_BATCH_SIZE);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryResults, setSearchQueryResults] = useState<FollowDetails[]>(followers);
  const [allSearchQueryResultsFetched, setAllSearchQueryResultsFetched] =
    useState<boolean>(false);

  const [fetchingSearchQueryResults, setFetchingSearchQueryResults] = useState<boolean>(false);
  const [fetchingAdditionalFollowers, setFetchingAdditionalFollowers] =
    useState<boolean>(false);

  const displayPopupMessage: DisplayPopupMessageFunction = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  const renderArray: FollowDetails[] = renderMode === 'local' ? followers : searchQueryResults;
  const allFollowersRendered: boolean =
    renderMode === 'local'
      ? renderLimit >= socialCounts.followers_count
      : allSearchQueryResultsFetched;

  const searchFollowers = useCallback(
    async (searchQuery: string, offset: number, abortSignal: AbortSignal) => {
      try {
        const followersBatch: FollowDetails[] = (
          await searchSocialService(
            'followers',
            searchQuery,
            offset,
            abortSignal,
            publicAccountId
          )
        ).data;

        offset === 0
          ? setSearchQueryResults(followersBatch)
          : setSearchQueryResults((prev) => [...prev, ...followersBatch]);
        followersBatch.length < SOCIAL_FETCH_BATCH_SIZE
          ? setAllSearchQueryResultsFetched(true)
          : setAllSearchQueryResultsFetched(false);

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

        if (status === 400) {
          if (errReason === 'invalidOffset') {
            displayPopupMessage('Something went wrong.', 'error');
            return;
          }

          setErrorMessage(errMessage);
          return;
        }

        if (!inViewMode) {
          return;
        }

        if (status === 404) {
          navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
          return;
        }

        if (status === 401 && errReason === 'privateAccount') {
          setAccountLocation('profile');
        }
      }
    },
    [
      inViewMode,
      publicAccountId,
      referrerLocation,
      authStatus,
      navigate,
      setAccountLocation,
      handleAsyncError,
      displayPopupMessage,
    ]
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
      const followersBatch: FollowDetails[] = (
        await getSocialBatchService('followers', followers.length, publicAccountId)
      ).data;
      setFollowers((prev) => [...prev, ...followersBatch]);

      if (followers.length + followersBatch.length >= socialCounts.followers_count) {
        setFetchDetails((prev) => ({ ...prev, allFollowersFetched: true }));
      }

      setFetchingAdditionalFollowers(false);
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (!inViewMode) {
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
        return;
      }

      if (status === 401 && errReason === 'privateAccount') {
        setAccountLocation('profile');
      }
    }
  }

  const debouncedSetSearchQuery = useMemo(
    () => debounce((searchQuery: string) => setSearchQuery(searchQuery), 300),
    []
  );

  return (
    <section>
      <div className='h-line my-1'></div>

      <DefaultFormGroup
        id='search-followers'
        label='Search followers'
        autoComplete='off'
        placeholder='Username or display name'
        className='mb-2'
        value={value}
        errorMessage={errorMessage}
        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;
          const newErrorMessage: string | null = validateSocialSearchQuery(newValue);

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
        <ContentLoadingSkeleton className='sm:grid-cols-2' />
      ) : (
        <div className='grid md:grid-cols-2 gap-1 items-start'>
          {renderArray.length === 0 ? (
            <p className='text-sm text-description font-medium w-fit mx-auto sm:col-span-2'>
              No users found
            </p>
          ) : (
            renderArray.slice(0, renderLimit).map((followDetails: FollowDetails) => (
              <FollowCard
                key={followDetails.follow_id}
                isFollowerCard={true}
                followDetails={followDetails}
                setSearchQueryResults={setSearchQueryResults}
                setFollowers={setFollowers}
                setFollowing={setFollowing}
                setSocialCounts={setSocialCounts}
              />
            ))
          )}

          {fetchingAdditionalFollowers ? (
            <ContentLoadingSkeleton className='sm:grid-cols-2 sm:col-span-2' />
          ) : (
            allFollowersRendered || (
              <Button
                className='bg-description border-description text-dark text-sm py-[4px] w-full sm:w-fit sm:col-span-2 mx-auto rounded-pill'
                onClick={async () => {
                  if (allFollowersRendered) {
                    return;
                  }

                  setFetchingAdditionalFollowers(true);

                  if (renderMode === 'local') {
                    const nextRenderOverflowsFetchedData: boolean =
                      renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length;
                    if (nextRenderOverflowsFetchedData && !fetchDetails.allFollowersFetched) {
                      await getFollowersBatch();
                    }

                    setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
                    setFetchingAdditionalFollowers(false);

                    return;
                  }

                  renderLimit + SOCIAL_RENDER_BATCH_SIZE > renderArray.length &&
                    (await searchFollowers(
                      searchQuery,
                      renderArray.length,
                      new AbortController().signal
                    ));

                  setRenderLimit((prev) => prev + SOCIAL_RENDER_BATCH_SIZE);
                  setFetchingAdditionalFollowers(false);
                }}
              >
                Load more
              </Button>
            )
          )}
        </div>
      )}
    </section>
  );
}
