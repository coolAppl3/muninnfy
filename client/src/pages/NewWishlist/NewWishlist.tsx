import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import DefaultFormGroup from '../../components/DefaultFormGroup/DefaultFormGroup';
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
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../hooks/useAsyncErrorHandler';

export default function NewWishlist(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [privacyLevelValue, setPrivacyLevelValue] = useState<number>(FOLLOWERS_WISHLIST_PRIVACY_LEVEL);
  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const navigate: NavigateFunction = useNavigate();
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
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (errReason && [400, 409].includes(status)) {
        errReason === 'invalidPrivacyLevel' || setTitleErrorMessage(errMessage);
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
              className='grid grid-cols-1 gap-2'
              onSubmit={async (e: FormEvent) => {
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

              <div className='grid gap-[6px]'>
                <span className='text-sm font-medium text-title'>Privacy level</span>

                <div className='grid grid-cols-3 rounded-sm overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => setPrivacyLevelValue(PRIVATE_WISHLIST_PRIVACY_LEVEL)}
                    className={`w-full text-sm text-center py-1 transition-[filter] cursor-pointer z-0 focus:z-1 ${
                      privacyLevelValue === PRIVATE_WISHLIST_PRIVACY_LEVEL
                        ? 'bg-light text-dark font-bold'
                        : 'bg-dark text-title font-medium hover:brightness-60'
                    }`}
                  >
                    Private
                  </button>

                  <button
                    type='button'
                    onClick={() => setPrivacyLevelValue(FOLLOWERS_WISHLIST_PRIVACY_LEVEL)}
                    className={`w-full text-sm text-center py-1 transition-[filter] cursor-pointer z-0 focus:z-1 ${
                      privacyLevelValue === FOLLOWERS_WISHLIST_PRIVACY_LEVEL
                        ? 'bg-light text-dark font-bold'
                        : 'bg-dark text-title font-medium hover:brightness-60'
                    }`}
                  >
                    Followers
                  </button>

                  <button
                    type='button'
                    onClick={() => setPrivacyLevelValue(PUBLIC_WISHLIST_PRIVACY_LEVEL)}
                    className={`w-full text-sm text-center py-1 transition-[filter] cursor-pointer z-0 focus:z-1 ${
                      privacyLevelValue === PUBLIC_WISHLIST_PRIVACY_LEVEL
                        ? 'bg-light text-dark font-bold'
                        : 'bg-dark text-title font-medium hover:brightness-60'
                    }`}
                  >
                    Public
                  </button>
                </div>

                <p className='text-description text-sm'>Privacy settings can be changed later if needed.</p>
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
