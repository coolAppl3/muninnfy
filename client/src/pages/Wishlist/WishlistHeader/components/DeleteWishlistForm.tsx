import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import { deleteWishlistService } from '../../../../services/wishlistServices';
import useWishlistHeader from '../useWishlistHeader';
import useAuth from '../../../../hooks/useAuth';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import DefaultFormGroup from '../../../../components/FormGroups/DefaultFormGroup';
import Button from '../../../../components/Button/Button';
import { AsyncErrorData, getAsyncErrorData } from '../../../../utils/errorUtils';
import useWishlist from '../../useWishlist';

export function DeleteWishlistForm(): JSX.Element {
  const { wishlistId, wishlistDetails } = useWishlist();
  const { editMode, setEditMode, setMenuIsOpen, isSubmitting, setIsSubmitting } = useWishlistHeader();

  const [confirmationTitleValue, setConfirmationTitleValue] = useState<string>('');

  const { setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  async function deleteWishlist(): Promise<void> {
    try {
      await deleteWishlistService(wishlistId);

      displayPopupMessage('Wishlist deleted.', 'success');
      navigate('/wishlists');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status === 400 && errReason === 'invalidWishlistId') {
        navigate(referrerLocation || '/account');
        return;
      }

      if (status === 401) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || '/account');
      }
    }
  }

  return (
    <form
      className='grid gap-2 w-full'
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting || confirmationTitleValue !== wishlistDetails.title) {
          return;
        }

        setIsSubmitting(true);
        displayLoadingOverlay();

        await deleteWishlist();

        setIsSubmitting(false);
        removeLoadingOverlay();
      }}
    >
      <div className='text-description'>
        <p className='font-medium mb-[6px]'>Are you sure you want to delete this wishlist?</p>
        <p className='text-sm'>
          <span className='text-danger'>This action is irreversible.</span> To proceed, confirm your wishlist title below:
        </p>
      </div>

      <DefaultFormGroup
        id='confirm-wishlist-title'
        label={`Enter "${wishlistDetails.title}"`}
        autoComplete='name'
        value={confirmationTitleValue}
        errorMessage={null}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmationTitleValue(e.target.value)}
      />

      <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
        <Button
          isSubmitBtn={true}
          className='bg-danger border-danger order-1 sm:order-2 w-full sm:w-fit'
          disabled={editMode === 'DELETE_WISHLIST' ? confirmationTitleValue !== wishlistDetails.title : true}
        >
          Delete wishlist
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
