import { Dispatch, FocusEvent, JSX, memo, SetStateAction, useState } from 'react';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../../hooks/useAsyncErrorHandler';
import useHistory from '../../../../../hooks/useHistory';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import useLoadingOverlay from '../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useConfirmModal from '../../../../../hooks/useConfirmModal';
import { WishlistItemType } from '../../../../../types/wishlistItemTypes';
import TripleDotMenuIcon from '../../../../../assets/svg/TripleDotMenuIcon.svg?react';
import CheckIcon from '../../../../../assets/svg/CheckIcon.svg?react';
import { deleteWishlistItemService, setWishlistItemIsPurchasedService } from '../../../../../services/wishlistItemServices';

type WishlistItemButtonContainerProps = {
  wishlistItem: WishlistItemType;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setWishlistItems: Dispatch<SetStateAction<WishlistItemType[]>>;
};

export default memo(WishlistItemButtonContainer);
function WishlistItemButtonContainer({ wishlistItem, setIsEditing, setWishlistItems }: WishlistItemButtonContainerProps): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [updatingPurchaseStatus, setUpdatingPurchaseStatus] = useState<boolean>(false);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  // workaround to avoid consuming WishlistProvider
  const locationParams = useParams();
  const wishlistId = locationParams.wishlistId as string;

  async function setWishlistItemIsPurchased(): Promise<void> {
    setUpdatingPurchaseStatus(true);

    try {
      await setWishlistItemIsPurchasedService({ wishlistId, itemId: wishlistItem.item_id, newPurchaseStatus: !wishlistItem.is_purchased });
      setWishlistItems((prev) =>
        prev.map((item: WishlistItemType) => {
          if (item.item_id !== wishlistItem.item_id) {
            return item;
          }

          return {
            ...item,
            is_purchased: !wishlistItem.is_purchased,
          };
        })
      );
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status !== 404) {
        return;
      }

      if (errReason === 'wishlistNotFound') {
        navigate(referrerLocation || '/account');
        return;
      }

      setWishlistItems((prev) => prev.filter((item: WishlistItemType) => item.item_id !== wishlistItem.item_id));
    } finally {
      setUpdatingPurchaseStatus(false);
    }
  }

  async function removeWishlistItem(): Promise<void> {
    displayLoadingOverlay();

    try {
      await deleteWishlistItemService(wishlistId, wishlistItem.item_id);
      setWishlistItems((prev) => prev.filter((item: WishlistItemType) => item.item_id !== wishlistItem.item_id));

      displayPopupMessage('Item removed.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (status === 404) {
        navigate(referrerLocation || '/account');
      }
    } finally {
      removeLoadingOverlay();
    }
  }

  return (
    <div
      className='grid gap-1 mr-[-1rem] relative place-items-center'
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn')) {
          return;
        }

        setMenuIsOpen(false);
      }}
    >
      <button
        type='button'
        className={`p-1 rounded-[50%] transition-colors cursor-pointer hover:bg-dark mt-[-8px] ${
          menuIsOpen ? 'bg-dark text-cta' : 'text-title'
        }`}
        title={`${menuIsOpen ? 'Hide' : 'View'} item menu`}
        aria-label={`${menuIsOpen ? 'Hide' : 'View'} item menu`}
        onClick={() => setMenuIsOpen((prev) => !prev)}
      >
        <TripleDotMenuIcon className='w-[1.6rem] h-[1.6rem] rotate-180' />
      </button>

      {updatingPurchaseStatus ? (
        <div className='spinner w-[2.6rem] h-[2.6rem] my-[5px]'></div>
      ) : (
        <button
          type='button'
          className={`p-1 rounded-[50%] transition-colors cursor-pointer  ${
            wishlistItem.is_purchased ? 'bg-cta hover:bg-cta/75' : 'bg-light/50 hover:bg-light'
          }`}
          title={`Mark as ${wishlistItem.is_purchased ? 'purchased' : 'unpurchased'}`}
          aria-label={`Mark as ${wishlistItem.is_purchased ? 'purchased' : 'unpurchased'}`}
          onClick={async () => await setWishlistItemIsPurchased()}
        >
          <CheckIcon className='w-[1.6rem] h-[1.6rem] text-dark' />
        </button>
      )}

      {menuIsOpen && (
        <div className='absolute block top-[-1rem] right-4 rounded-sm overflow-hidden shadow-centered-tiny'>
          <button
            type='button'
            className='context-menu-btn'
            onClick={() => {
              setMenuIsOpen(false);
              setIsEditing(true);
            }}
          >
            Edit
          </button>

          <button
            type='button'
            className='context-menu-btn danger'
            onClick={() =>
              displayConfirmModal({
                title: 'Are you sure you want to remove this item:',
                description: wishlistItem.title,
                confirmBtnTitle: 'Remove item',
                cancelBtnTitle: 'Cancel',
                isDangerous: true,
                onConfirm: async () => {
                  removeConfirmModal();
                  setMenuIsOpen(false);

                  await removeWishlistItem();
                },
                onCancel: removeConfirmModal,
              })
            }
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
