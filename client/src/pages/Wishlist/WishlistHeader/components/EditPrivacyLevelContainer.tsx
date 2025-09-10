import { Dispatch, JSX, SetStateAction } from 'react';
import { changeWishlistPrivacyLevelService, WishlistDetails } from '../../../../services/wishlistServices';
import useAuth from '../../../../hooks/useAuth';
import useHistory from '../../../../hooks/useHistory';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useConfirmModal from '../../../../hooks/useConfirmModal';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../../hooks/useLoadingOverlay';
import { AsyncErrorData, getAsyncErrorData } from '../../../../utils/errorUtils';
import { getWishlistPrivacyLevelName } from '../../../../utils/wishlistUtils';
import useWishlistHeader from '../useWishlistHeader';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../../../../utils/constants/wishlistConstants';

export default function EditPrivacyLevelContainer({
  wishlistId,
  wishlistDetails,
  setWishlistDetails,
}: {
  wishlistId: string;
  wishlistDetails: WishlistDetails;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetails | null>>;
}): JSX.Element {
  const { setEditMode, setMenuIsOpen } = useWishlistHeader();

  const { setAuthStatus } = useAuth();
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

      displayPopupMessage(`Privacy level changed to ${getWishlistPrivacyLevelName(newPrivacyLevel).toLocaleLowerCase()}.`, 'success');
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

      if (status === 400 && errReason === 'invalidWishlistId') {
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

  function handlePrivacyLevelBtnClick(newPrivacyLevel: number): void {
    if (newPrivacyLevel === wishlistDetails.privacy_level) {
      return;
    }

    displayConfirmModal({
      description: `Are you sure you want to set the privacy level to ${getWishlistPrivacyLevelName(newPrivacyLevel).toLocaleLowerCase()}?`,
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
