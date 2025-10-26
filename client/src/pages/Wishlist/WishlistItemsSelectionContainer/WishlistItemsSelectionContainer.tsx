import { JSX, useState } from 'react';
import useWishlist from '../hooks/useWishlist';
import Container from '../../../components/Container/Container';
import Button from '../../../components/Button/Button';
import useConfirmModal from '../../../hooks/useConfirmModal';
import CheckIcon from '../../../assets/svg/CheckIcon.svg?react';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import { bulkDeleteWishlistItemsService, bulkSetWishlistItemIsPurchasedService } from '../../../services/wishlistItemServices';
import usePopupMessage from '../../../hooks/usePopupMessage';
import useInfoModal from '../../../hooks/useInfoModal';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../hooks/useAsyncErrorHandler';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useHistory from '../../../hooks/useHistory';
import useWishlistItems from '../hooks/useWishlistItems';
import { useShallow } from 'zustand/react/shallow';
import useWishlistItemsSelectionStore from '../stores/wishlistItemsSelectionStore';

type SelectedActionType = 'mark_as_purchased' | 'mark_as_unpurchased' | 'delete';

export default function WishlistItemsSelectionContainer(): JSX.Element {
  const [selectedAction, setSelectedAction] = useState<SelectedActionType>('mark_as_purchased');

  const { wishlistId } = useWishlist();
  const { selectionModeActive, setSelectionModeActive, wishlistItems, setWishlistItems, itemMatchesFilterConfig } = useWishlistItems();

  const { selectedItemsSet, selectAllWishlistItems, unselectAllWishlistItems } = useWishlistItemsSelectionStore(
    useShallow((store) => ({
      selectedItemsSet: store.selectedItemsIdsSet,
      selectAllWishlistItems: store.selectAllWishlistItems,
      unselectAllWishlistItems: store.unselectAllWishlistItems,
    }))
  );

  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  async function bulkSetWishlistItemIsPurchased(): Promise<void> {
    if (selectedAction === 'delete') {
      return;
    }

    if (selectedItemsSet.size === 0) {
      displayPopupMessage('No items selected.', 'error');
      return;
    }

    const markAsPurchased: boolean = selectedAction === 'mark_as_purchased' ? true : false;
    const expectedUpdatesCount: number = selectedItemsSet.size;

    displayLoadingOverlay();

    try {
      const { newPurchasedOnTimestamp, updatedItemsCount } = (
        await bulkSetWishlistItemIsPurchasedService({ wishlistId, itemsIdArr: [...selectedItemsSet], markAsPurchased })
      ).data;

      if (updatedItemsCount === 0) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      setWishlistItems((prev) =>
        prev.map((item: WishlistItemType) =>
          selectedItemsSet.has(item.item_id) ? { ...item, purchased_on_timestamp: newPurchasedOnTimestamp } : item
        )
      );

      setSelectionModeActive(false);
      setSelectedAction('mark_as_purchased');
      unselectAllWishlistItems();

      displayPopupMessage('Items updated.', 'success');

      updatedItemsCount < expectedUpdatesCount && displayIncompleteOperationModal('update', expectedUpdatesCount, updatedItemsCount);
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404 || (status === 400 && errReason === 'invalidWishlistId')) {
        navigate(referrerLocation || '/account');
        return;
      }
    } finally {
      removeLoadingOverlay();
    }
  }

  async function bulkDeleteWishlistItems(): Promise<void> {
    if (selectedAction !== 'delete') {
      return;
    }

    if (selectedItemsSet.size === 0) {
      displayPopupMessage('No items selected.', 'error');
      return;
    }

    const expectedUpdatesCount: number = selectedItemsSet.size;

    displayLoadingOverlay();

    try {
      const deletedItemsCount: number = (await bulkDeleteWishlistItemsService({ wishlistId, itemsIdArr: [...selectedItemsSet] })).data
        .deletedItemsCount;

      if (deletedItemsCount === 0) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      setWishlistItems((prev) => prev.filter((item: WishlistItemType) => !selectedItemsSet.has(item.item_id)));

      setSelectionModeActive(false);
      setSelectedAction('mark_as_purchased');
      unselectAllWishlistItems();

      displayPopupMessage('Items deleted.', 'success');

      deletedItemsCount < expectedUpdatesCount && displayIncompleteOperationModal('delete', expectedUpdatesCount, deletedItemsCount);
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404 || (status === 400 && errReason === 'invalidWishlistId')) {
        navigate(referrerLocation || '/account');
        return;
      }
    } finally {
      removeLoadingOverlay();
    }
  }

  function displayIncompleteOperationModal(
    actionType: 'update' | 'delete',
    expectedAffectedItems: number,
    actualAffectedItems: number
  ): void {
    displayInfoModal({
      title: 'Partial success.',
      description: `We couldn't ${actionType} ${
        expectedAffectedItems - actualAffectedItems
      } of the ${expectedAffectedItems} selected items.`,
      btnTitle: 'Okay',
      onClick: removeInfoModal,
    });
  }

  if (!selectionModeActive) {
    return <></>;
  }

  const allItemsSelected: boolean =
    wishlistItems.length > 0 &&
    wishlistItems.every((item: WishlistItemType) => selectedItemsSet.has(item.item_id) || !itemMatchesFilterConfig(item));

  const btnClassname: string = 'bg-secondary p-1 rounded cursor-pointer transition-[filter] hover:brightness-75 border-1 border-secondary';

  return (
    <div>
      <Container>
        <div className='p-2 bg-dark rounded-sm shadow-simple-tiny'>
          <p className='text-title text-sm font-medium mb-1'>
            {selectedItemsSet.size} {selectedItemsSet.size === 1 ? 'item' : 'items'} selected
          </p>

          <div className='text-description font-medium text-sm flex flex-col sm:flex-row justify-start items-start gap-1 mb-2'>
            <button
              type='button'
              className={`${btnClassname} ${selectedAction === 'mark_as_purchased' ? '!border-cta' : ''}`}
              onClick={() => setSelectedAction('mark_as_purchased')}
            >
              Mark as purchased
            </button>

            <button
              type='button'
              className={`${btnClassname} ${selectedAction === 'mark_as_unpurchased' ? '!border-cta' : ''}`}
              onClick={() => setSelectedAction('mark_as_unpurchased')}
            >
              Mark as unpurchased
            </button>

            <button
              type='button'
              className={`${btnClassname} text-danger ${selectedAction === 'delete' ? '!border-danger' : ''}`}
              onClick={() => setSelectedAction('delete')}
            >
              Delete selected
            </button>
          </div>

          <div className='h-line mb-2'></div>

          <div className='flex flex-col sm:flex-row gap-1'>
            <Button
              disabled={selectedItemsSet.size === 0}
              className={`bg-cta border-cta text-dark w-full sm:w-fit order-1 sm:order-2 ${selectedItemsSet.size === 0 ? 'disabled' : ''} ${
                selectedAction === 'delete' ? '!bg-danger !border-danger' : ''
              }`}
              onClick={async () => {
                if (selectedAction !== 'delete') {
                  await bulkSetWishlistItemIsPurchased();
                  return;
                }

                displayConfirmModal({
                  description: `Are you sure you want to delete the${
                    selectedItemsSet.size === 1 ? '' : ` ${selectedItemsSet.size}`
                  } selected ${selectedItemsSet.size === 1 ? 'item' : 'items'}?`,
                  isDangerous: true,
                  confirmBtnTitle: `Delete ${selectedItemsSet.size === 1 ? 'item' : 'items'}`,
                  cancelBtnTitle: 'Cancel',
                  onConfirm: async () => {
                    removeConfirmModal();
                    await bulkDeleteWishlistItems();
                  },
                  onCancel: removeConfirmModal,
                });
              }}
            >
              {selectedAction === 'delete' ? 'Delete' : 'Update'} {selectedItemsSet.size === 1 ? 'item' : 'items'}
            </Button>

            <Button
              className='bg-dark border-title text-title w-full sm:w-fit order-2 sm:order-1'
              onClick={() => {
                setSelectionModeActive(false);
                unselectAllWishlistItems();
              }}
            >
              Cancel selection
            </Button>
          </div>
        </div>

        <div className='h-line my-2'></div>

        <div className='flex justify-start items-center gap-1 w-fit relative cursor-pointer transition-[filter] hover:brightness-75'>
          <button
            type='button'
            id='select-all-items-btn'
            aria-label={`${allItemsSelected ? 'Unselect' : 'Select'} all items`}
            className='bg-[#555] p-[4px] rounded-[1px] ml-1 after:absolute after:top-0 after:left-0 after:w-full after:h-full  cursor-pointer z-2'
            onClick={() => {
              if (allItemsSelected) {
                unselectAllWishlistItems();
                return;
              }

              selectAllWishlistItems(wishlistItems.filter(itemMatchesFilterConfig).map((item: WishlistItemType) => item.item_id));
            }}
          >
            <CheckIcon
              className={`w-[1.2rem] h-[1.2rem] transition-transform text-cta ${
                allItemsSelected ? 'scale-100 rotate-0' : 'rotate-180 scale-0'
              }`}
            />
          </button>

          <label
            htmlFor='select-all-items-btn'
            className='text-sm text-title'
          >
            Select all items
          </label>
        </div>
      </Container>
    </div>
  );
}
