import { ChangeEvent, FormEvent, JSX, useEffect, useState } from 'react';
import { Head } from '../../components/Head/Head';
import './NewWishlist.css';
import Container from '../../components/Container/Container';
import DefaultFormGroup from '../../components/FormGroups/DefaultFormGroup';
import useAuth from '../../hooks/useAuth';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import {
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../../utils/clientConstants';
import Button from '../../components/Button/Button';
import { validateWishlistTitle } from '../../utils/validation/wishlistValidation';
import usePopupMessage from '../../hooks/usePopupMessage';
import { createWishlistAsAccountService, createWishlistAsGuestService } from '../../services/wishlistServices';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import useInfoModal from '../../hooks/useInfoModal';

export default function NewWishlist(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [privacyLevelValue, setPrivacyLevelValue] = useState<number>(FOLLOWERS_WISHLIST_PRIVACY_LEVEL);
  const [titleValue, setTitleValue] = useState<string>('');
  const [titleError, setTitleError] = useState<string | null>(null);

  const navigate: NavigateFunction = useNavigate();
  const { isSignedIn, setIsSignedIn } = useAuth();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  useEffect(() => {
    if (isSignedIn) {
      return;
    }

    setPrivacyLevelValue(PUBLIC_WISHLIST_PRIVACY_LEVEL);
  }, [isSignedIn]);

  async function handleSubmit(): Promise<void> {
    if (isSignedIn) {
      await createWishlistAsAccount();
      return;
    }

    await createWishlistAsGuest();
  }

  async function createWishlistAsAccount(): Promise<void> {
    const title: string = titleValue;
    const privacyLevel: number = privacyLevelValue;

    try {
      const wishlistId: string = (await createWishlistAsAccountService({ title, privacyLevel })).data.wishlistId;

      displayPopupMessage('Wishlist created.', 'success');
      navigate(`/wishlist?id=${wishlistId}`);
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status !== 401) {
        return;
      }

      setIsSignedIn(false);
      displayInfoModal({
        title: errMessage,
        description: 'You can either sign in and try again, or create a wishlist as a guest.',
        btnTitle: 'Okay',
        onClick: removeInfoModal,
      });
    }
  }

  async function createWishlistAsGuest(): Promise<void> {
    const title: string = titleValue;

    try {
      const wishlistId: string = (await createWishlistAsGuestService({ title })).data.wishlistId;

      displayPopupMessage('Wishlist created.', 'success');
      displayInfoModal({
        title: 'Wishlist created as a guest.',
        description: 'Make sure to store the wishlist link to view the list later if needed.',
        btnTitle: 'Proceed to wishlist',
        onClick: () => navigate(`/wishlist?id=${wishlistId}`),
      });
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status !== 403) {
        return;
      }

      setIsSignedIn(true);
      displayInfoModal({
        title: errMessage,
        description: `Sign in status wasn't detected earlier.\nChoose a suitable privacy level before proceeding.`,
        btnTitle: 'Okay',
        onClick: removeInfoModal,
      });
    }
  }

  function allFieldsValid(): boolean {
    const titleErrorMessage: string | null = validateWishlistTitle(titleValue);
    setTitleError(titleErrorMessage);

    if (titleErrorMessage) {
      displayPopupMessage(titleErrorMessage, 'error');
      return false;
    }

    return true;
  }

  return (
    <>
      <Head title='New Wishlist - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <h1 className='text-title text-xl 3xs:text-2xl font-bold text-center'>New wishlist</h1>
            <div className='h-line my-2'></div>

            <form
              id='wishlist-form'
              className='grid grid-cols-1 gap-2'
              onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (isSubmitting || !allFieldsValid()) {
                  return;
                }

                setIsSubmitting(true);
                displayLoadingOverlay();

                await handleSubmit();

                setIsSubmitting(false);
                removeLoadingOverlay();
              }}
            >
              <DefaultFormGroup
                id='wishlist-title'
                label='Title'
                autoComplete='name'
                value={titleValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newValue: string = e.target.value;

                  setTitleError(validateWishlistTitle(newValue));
                  setTitleValue(newValue);
                }}
                errorMessage={titleError}
              ></DefaultFormGroup>

              <div id='wishlist-privacy-level'>
                <span>Privacy level</span>

                <div className={`btn-container ${isSignedIn ? '' : 'guest'}`}>
                  <button
                    type='button'
                    disabled={!isSignedIn}
                    className={privacyLevelValue === PRIVATE_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => {
                      isSignedIn && setPrivacyLevelValue(PRIVATE_WISHLIST_PRIVACY_LEVEL);
                    }}
                  >
                    Private
                  </button>
                  <button
                    type='button'
                    disabled={!isSignedIn}
                    className={privacyLevelValue === FOLLOWERS_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => {
                      isSignedIn && setPrivacyLevelValue(FOLLOWERS_WISHLIST_PRIVACY_LEVEL);
                    }}
                  >
                    Followers
                  </button>
                  <button
                    type='button'
                    disabled={!isSignedIn}
                    className={privacyLevelValue === PUBLIC_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => {
                      isSignedIn && setPrivacyLevelValue(PUBLIC_WISHLIST_PRIVACY_LEVEL);
                    }}
                  >
                    Public
                  </button>
                </div>

                <p className='text-description text-sm m'>
                  {isSignedIn
                    ? 'Privacy settings can be changed later if needed.'
                    : 'As a guest, you can only create public wishlists, with some feature limitations.'}
                </p>
              </div>

              <Button
                isSubmitBtn={true}
                className='bg-cta border-cta'
              >
                Create wishlist
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}
