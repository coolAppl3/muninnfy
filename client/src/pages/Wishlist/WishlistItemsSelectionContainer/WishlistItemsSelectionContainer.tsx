import { JSX, useState } from 'react';
import useWishlist from '../context/useWishlist';
import Container from '../../../components/Container/Container';
import Button from '../../../components/Button/Button';
import useConfirmModal from '../../../hooks/useConfirmModal';
import CheckIcon from '../../../assets/svg/CheckIcon.svg?react';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

type SelectedActionType = 'mark_as_purchased' | 'mark_as_unpurchased' | 'delete';

export default function WishlistItemsSelectionContainer(): JSX.Element {
  const [selectedAction, setSelectedAction] = useState<SelectedActionType>('mark_as_purchased');

  const { selectionModeActive, setSelectionModeActive, selectedItemsSet, setSelectedItemsSet, wishlistItems } = useWishlist();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  const allItemsSelected: boolean = wishlistItems.length === selectedItemsSet.size;
  const btnClassname: string = 'bg-secondary p-1 rounded cursor-pointer transition-[filter] hover:brightness-75 border-1 border-secondary';

  async function bulkUpdateWishlistItemIsPurchased(): Promise<void> {
    // TODO: continue implementation
  }

  async function bulkDeleteWishlistItems(): Promise<void> {
    // TODO: continue implementation
  }

  if (!selectionModeActive) {
    return <></>;
  }

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
                  await bulkUpdateWishlistItemIsPurchased();
                  return;
                }

                displayConfirmModal({
                  description: `Are you sure you want to delete the${
                    selectedItemsSet.size === 1 ? '' : ` ${selectedItemsSet.size}`
                  } selected ${selectedItemsSet.size === 1 ? 'item' : 'items'}?`,
                  isDangerous: true,
                  confirmBtnTitle: `Delete ${selectedItemsSet.size === 1 ? 'item' : 'items'}`,
                  cancelBtnTitle: 'Cancel',
                  onConfirm: async () => await bulkDeleteWishlistItems(),
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
                setSelectedItemsSet(new Set<number>());
              }}
            >
              Cancel selection
            </Button>
          </div>
        </div>

        <div className='h-line my-2'></div>

        <div className='flex justify-start items-center gap-1 w-fit relative cursor-pointer transition-[filter] hover:brightness-75 '>
          <button
            type='button'
            id='select-all-items-btn'
            aria-label={allItemsSelected ? 'Unselect all items' : 'Select all items'}
            className='bg-[#555] p-[4px] rounded-[1px] ml-1 after:absolute after:top-0 after:left-0 after:w-full after:h-full  cursor-pointer z-2'
            onClick={() => {
              if (allItemsSelected) {
                setSelectedItemsSet(new Set<number>());
                return;
              }

              setSelectedItemsSet(new Set<number>(wishlistItems.map((item: WishlistItemType) => item.item_id)));
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
