import { ChangeEvent, SubmitEvent, JSX, useEffect, useRef, useState } from 'react';
import { changeWishlistTitleService } from '../../../../services/wishlistServices';
import useWishlistHeader from '../context/useWishlistHeader';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import DefaultFormGroup from '../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateWishlistTitle } from '../../../../utils/validation/wishlistValidation';
import Button from '../../../../components/Button/Button';
import useWishlist from '../../hooks/useWishlist';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../hooks/useHandleAsyncError';

export default function EditWishlistTitleForm(): JSX.Element {
  const { wishlistId, wishlistDetails, setWishlistDetails } = useWishlist();
  const { setEditMode, setMenuIsOpen, isSubmitting, setIsSubmitting } = useWishlistHeader();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  const titleRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => titleRef.current?.focus(), []);

  async function changeWishlistTitle(): Promise<void> {
    const newTitle: string = value.trimEnd();

    try {
      await changeWishlistTitleService({ newTitle, wishlistId });
      setWishlistDetails(
        (prev) =>
          prev && {
            ...prev,
            title: newTitle,
          }
      );

      setValue('');
      setEditMode(null);

      displayPopupMessage('Title changed.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || '/account');
        return;
      }

      if (status === 409) {
        setErrorMessage(errMessage);
        return;
      }

      if (errReason && status === 400) {
        if (errReason === 'invalidTitle') {
          setErrorMessage(errMessage);
          return;
        }

        navigate(referrerLocation || '/account');
      }
    }
  }

  return (
    <form
      className='grid gap-2 w-full'
      onSubmit={async (e: SubmitEvent) => {
        e.preventDefault();

        if (isSubmitting) {
          return;
        }

        const newTitleErrorMessage: string | null =
          validateWishlistTitle(value) || (value.trimEnd() === wishlistDetails.title ? 'Wishlist already has this title.' : null);

        if (newTitleErrorMessage) {
          setErrorMessage(newTitleErrorMessage);
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
        value={value}
        errorMessage={errorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setValue(newValue);
          setErrorMessage(validateWishlistTitle(newValue));
        }}
      />

      <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
        <Button
          isSubmitBtn
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
