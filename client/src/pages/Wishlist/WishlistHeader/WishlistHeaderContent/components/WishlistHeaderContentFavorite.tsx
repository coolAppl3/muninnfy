import { JSX, useState } from 'react';
import useWishlist from '../../../hooks/useWishlist';
import { setWishlistFavoriteService } from '../../../../../services/wishlistServices';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../../hooks/useLoadingOverlay';
import useConfirmModal from '../../../../../hooks/useConfirmModal';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useHistory from '../../../../../hooks/useHistory';

export default function WishlistHeaderContentFavorite(): JSX.Element {
  const { wishlistId, wishlistDetails, setWishlistDetails } = useWishlist();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const navigate: NavigateFunction = useNavigate();
  const { referrerLocation } = useHistory();

  async function setWishlistFavorite(): Promise<void> {
    if (isSubmitting) {
      return;
    }

    displayLoadingOverlay();
    setIsSubmitting(true);

    const newIsFavorited: boolean = !wishlistDetails.is_favorited;

    try {
      await setWishlistFavoriteService({ wishlistId, newIsFavorited });
      setWishlistDetails((prev) => ({
        ...prev,
        is_favorited: !wishlistDetails.is_favorited,
      }));

      displayPopupMessage(newIsFavorited ? 'Added to favorites.' : 'Removed from favorites.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404 || (status === 400 && errReason === 'invalidWishlistId')) {
        navigate(referrerLocation || '/account');
      }
    } finally {
      removeLoadingOverlay();
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type='button'
      className='context-menu-btn border-t-1 border-t-description/50'
      onClick={async () =>
        isSubmitting ||
        displayConfirmModal({
          title: `Are you sure you want to ${
            wishlistDetails.is_favorited ? 'remove this wishlist from favorites?' : 'add this wishlist to favorites?'
          }`,
          confirmBtnTitle: 'Confirm',
          cancelBtnTitle: 'Cancel',
          onConfirm: async () => {
            removeConfirmModal();
            await setWishlistFavorite();
          },
          onCancel: removeConfirmModal,
          isDangerous: false,
        })
      }
    >
      {wishlistDetails.is_favorited ? 'Unfavorite' : 'Favorite'}
    </button>
  );
}
