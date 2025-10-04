import { ChangeEvent, FormEvent, JSX, useEffect, useRef, useState } from 'react';
import { changeWishlistTitleService } from '../../../../services/wishlistServices';
import useWishlistHeader from '../context/useWishlistHeader';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import DefaultFormGroup from '../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateWishlistTitle } from '../../../../utils/validation/wishlistValidation';
import Button from '../../../../components/Button/Button';
import useWishlist from '../../context/useWishlist';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../hooks/useAsyncErrorHandler';

export default function EditWishlistTitleForm(): JSX.Element {
  const { wishlistId, wishlistDetails, setWishlistDetails } = useWishlist();
  const { setEditMode, setMenuIsOpen, isSubmitting, setIsSubmitting } = useWishlistHeader();

  const [titleValue, setTitleValue] = useState<string>('');
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | null>(null);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
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
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || '/account');
        return;
      }

      if (errReason && status === 400) {
        if (errReason === 'invalidTitle') {
          setTitleErrorMessage(errMessage);
          return;
        }

        navigate(referrerLocation || '/account');
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

        const newTitleErrorMessage: string | null =
          validateWishlistTitle(titleValue) || (titleValue === wishlistDetails.title ? 'Wishlist already has this title.' : null);

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
