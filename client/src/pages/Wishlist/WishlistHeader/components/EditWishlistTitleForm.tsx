import { ChangeEvent, FormEvent, JSX, useEffect, useRef, useState } from 'react';
import { changeWishlistTitleService } from '../../../../services/wishlistServices';
import useWishlistHeader from '../useWishlistHeader';
import useAuth from '../../../../hooks/useAuth';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import { AsyncErrorData, getAsyncErrorData } from '../../../../utils/errorUtils';
import DefaultFormGroup from '../../../../components/FormGroups/DefaultFormGroup';
import { validateWishlistTitle } from '../../../../utils/validation/wishlistValidation';
import Button from '../../../../components/Button/Button';
import useWishlist from '../../useWishlist';

export function EditWishlistTitleForm(): JSX.Element {
  const { wishlistId, setWishlistDetails } = useWishlist();
  const { setEditMode, setMenuIsOpen, isSubmitting, setIsSubmitting } = useWishlistHeader();

  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  const titleRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => titleRef.current?.focus(), []);

  async function changeWishlistTitle(): Promise<void> {
    const newTitle: string = titleValue;

    try {
      await changeWishlistTitleService({ newTitle, wishlistId });
      setWishlistDetails(
        (prev) =>
          prev && {
            ...prev,
            title: newTitle,
          }
      );

      setTitleValue('');
      setEditMode(null);

      displayPopupMessage('Title updated.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (!errReason) {
        return;
      }

      if (status === 400) {
        if (errReason === 'invalidTitle') {
          setTitleErrorMessage(errMessage);
          return;
        }

        navigate(referrerLocation ? referrerLocation : '/account');
        return;
      }

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation ? referrerLocation : '/account');
      }
    }
  }

  return (
    <form
      className='grid gap-2 w-full'
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) {
          return;
        }

        const newTitleErrorMessage: string | null = validateWishlistTitle(titleValue);
        setTitleErrorMessage(newTitleErrorMessage);

        if (newTitleErrorMessage) {
          displayPopupMessage(newTitleErrorMessage, 'error');
          return;
        }

        setIsSubmitting(true);
        displayLoadingOverlay();

        await changeWishlistTitle();

        setIsSubmitting(false);
        removeLoadingOverlay();
      }}
    >
      <DefaultFormGroup
        ref={titleRef}
        id='wishlist-title'
        label='New wishlist title'
        autoComplete='name'
        value={titleValue}
        errorMessage={titleErrorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setTitleErrorMessage(validateWishlistTitle(newValue));
          setTitleValue(newValue);
        }}
      />

      <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
        <Button
          isSubmitBtn={true}
          className='bg-cta border-cta order-1 sm:order-2 w-full sm:w-fit'
        >
          Submit
        </Button>

        <Button
          className='bg-secondary border-title text-title order-2 sm:order-1 w-full sm:w-fit'
          onClick={() => {
            setEditMode(null);
            setMenuIsOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
