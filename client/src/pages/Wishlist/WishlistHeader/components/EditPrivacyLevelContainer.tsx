import { JSX } from 'react';
import { changeWishlistPrivacyLevelService } from '../../../../services/wishlistServices';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useConfirmModal from '../../../../hooks/useConfirmModal';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import { getWishlistPrivacyLevelName } from '../../../../utils/wishlistUtils';
import useWishlistHeader from '../context/useWishlistHeader';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../../../../utils/constants/wishlistConstants';
import useWishlist from '../../hooks/useWishlist';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../hooks/useAsyncErrorHandler';
import Button from '../../../../components/Button/Button';

export default function EditPrivacyLevelContainer(): JSX.Element {
  const { wishlistId, wishlistDetails, setWishlistDetails } = useWishlist();
  const { setEditMode, setMenuIsOpen } = useWishlistHeader();

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  async function changeWishlistPrivacyLevel(newPrivacyLevel: number): Promise<void> {
    try {
      await changeWishlistPrivacyLevelService({ wishlistId, newPrivacyLevel });
      setWishlistDetails(
        (prev) =>
          prev && {
            ...prev,
            privacy_level: newPrivacyLevel,
          }
      );

      setEditMode(null);
      displayPopupMessage(`Privacy level changed to ${getWishlistPrivacyLevelName(newPrivacyLevel).toLowerCase()}.`, 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404 || (status === 400 && errReason === 'invalidWishlistId')) {
        navigate(referrerLocation || '/account');
      }
    }
  }

  function handlePrivacyLevelBtnClick(newPrivacyLevel: number): void {
    if (newPrivacyLevel === wishlistDetails.privacy_level) {
      return;
    }

    displayConfirmModal({
      description: `Are you sure you want to set the privacy level to ${getWishlistPrivacyLevelName(newPrivacyLevel).toLowerCase()}?`,
      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      isDangerous: true,
      onConfirm: async () => {
        removeConfirmModal();
        displayLoadingOverlay();

        await changeWishlistPrivacyLevel(newPrivacyLevel);
        removeLoadingOverlay();
      },
      onCancel: removeConfirmModal,
    });
  }

  return (
    <div className='grid gap-[6px]'>
      <span className='text-sm font-medium text-title'>Privacy level</span>

      <div className='grid grid-cols-3 sm:max-w-[40rem] rounded-sm overflow-hidden'>
        <button
          type='button'
          onClick={() => handlePrivacyLevelBtnClick(PRIVATE_WISHLIST_PRIVACY_LEVEL)}
          className={`w-full text-sm text-center py-1 transition-[filter] cursor-pointer z-0 focus:z-1 ${
            wishlistDetails?.privacy_level === PRIVATE_WISHLIST_PRIVACY_LEVEL
              ? 'bg-light text-dark font-bold'
              : 'bg-dark text-title font-medium hover:brightness-60'
          }`}
        >
          Private
        </button>
        <button
          type='button'
          onClick={() => handlePrivacyLevelBtnClick(FOLLOWERS_WISHLIST_PRIVACY_LEVEL)}
          className={`w-full text-sm text-center py-1 transition-[filter] cursor-pointer z-0 focus:z-1 ${
            wishlistDetails?.privacy_level === FOLLOWERS_WISHLIST_PRIVACY_LEVEL
              ? 'bg-light text-dark font-bold'
              : 'bg-dark text-title font-medium hover:brightness-60'
          }`}
        >
          Followers
        </button>
        <button
          type='button'
          onClick={() => handlePrivacyLevelBtnClick(PUBLIC_WISHLIST_PRIVACY_LEVEL)}
          className={`w-full text-sm text-center py-1 transition-[filter] cursor-pointer z-0 focus:z-1 ${
            wishlistDetails?.privacy_level === PUBLIC_WISHLIST_PRIVACY_LEVEL
              ? 'bg-light text-dark font-bold'
              : 'bg-dark text-title font-medium hover:brightness-60'
          }`}
        >
          Public
        </button>
      </div>

      <Button
        className='bg-secondary border-title text-title mt-[1.4rem] sm:w-fit'
        onClick={() => {
          setEditMode(null);
          setMenuIsOpen(false);
        }}
      >
        Cancel
      </Button>
    </div>
  );
}
