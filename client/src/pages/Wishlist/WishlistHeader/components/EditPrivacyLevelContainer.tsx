import { JSX } from 'react';
import { changeWishlistPrivacyLevelService } from '../../../../services/wishlistServices';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useConfirmModal from '../../../../hooks/useConfirmModal';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import { getWishlistPrivacyLevelName } from '../../../../utils/wishlistUtils';
import useWishlistHeader from '../useWishlistHeader';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../../../../utils/constants/wishlistConstants';
import useWishlist from '../../useWishlist';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../hooks/useAsyncErrorHandler';

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
    <div className='privacy-level'>
      <span>Privacy level</span>
      <div className='btn-container'>
        <button
          type='button'
          className={wishlistDetails?.privacy_level === PRIVATE_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
          onClick={() => handlePrivacyLevelBtnClick(PRIVATE_WISHLIST_PRIVACY_LEVEL)}
        >
          Private
        </button>
        <button
          type='button'
          className={wishlistDetails?.privacy_level === FOLLOWERS_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
          onClick={() => handlePrivacyLevelBtnClick(FOLLOWERS_WISHLIST_PRIVACY_LEVEL)}
        >
          Followers
        </button>
        <button
          type='button'
          className={wishlistDetails?.privacy_level === PUBLIC_WISHLIST_PRIVACY_LEVEL ? 'selected' : ''}
          onClick={() => handlePrivacyLevelBtnClick(PUBLIC_WISHLIST_PRIVACY_LEVEL)}
        >
          Public
        </button>
      </div>

      <button
        className='link'
        onClick={() => {
          setEditMode(null);
          setMenuIsOpen(false);
        }}
      >
        Collapse
      </button>
    </div>
  );
}
