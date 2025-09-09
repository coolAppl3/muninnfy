import { ChangeEvent, FormEvent, JSX, useState } from 'react';
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
} from '../../utils/constants/wishlistConstants';
import Button from '../../components/Button/Button';
import { validateWishlistTitle } from '../../utils/validation/wishlistValidation';
import usePopupMessage from '../../hooks/usePopupMessage';
import { createWishlistAsAccountService } from '../../services/wishlistServices';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';

export default function NewWishlist(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [privacyLevelValue, setPrivacyLevelValue] = useState<number>(FOLLOWERS_WISHLIST_PRIVACY_LEVEL);
  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const navigate: NavigateFunction = useNavigate();
  const { setAuthStatus } = useAuth();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function handleSubmit(): Promise<void> {
    const title: string = titleValue;
    const privacyLevel: number = privacyLevelValue;

    try {
      const wishlistId: string = (await createWishlistAsAccountService({ title, privacyLevel })).data.wishlistId;

      displayPopupMessage('Wishlist created.', 'success');
      navigate(`/wishlist/${wishlistId}`);
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (errReason && [400, 409].includes(status)) {
        errReason !== 'invalidPrivacyLevel' && setTitleErrorMessage(errMessage);
      }
    }
  }

  function allFieldsValid(): boolean {
    const titleErrorMessage: string | null = validateWishlistTitle(titleValue);
    setTitleErrorMessage(titleErrorMessage);

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

                  setTitleErrorMessage(validateWishlistTitle(newValue));
                  setTitleValue(newValue);
                }}
                errorMessage={titleErrorMessage}
              ></DefaultFormGroup>

              <div id='wishlist-privacy-level'>
                <span>Privacy level</span>

                <div className='btn-container'>
                  <button
                    type='button'
                    className={privacyLevelValue === PRIVATE_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => setPrivacyLevelValue(PRIVATE_WISHLIST_PRIVACY_LEVEL)}
                  >
                    Private
                  </button>
                  <button
                    type='button'
                    className={privacyLevelValue === FOLLOWERS_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => setPrivacyLevelValue(FOLLOWERS_WISHLIST_PRIVACY_LEVEL)}
                  >
                    Followers
                  </button>
                  <button
                    type='button'
                    className={privacyLevelValue === PUBLIC_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
                    onClick={() => setPrivacyLevelValue(PUBLIC_WISHLIST_PRIVACY_LEVEL)}
                  >
                    Public
                  </button>
                </div>

                <p className='text-description text-sm m'>Privacy settings can be changed later if needed.</p>
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
