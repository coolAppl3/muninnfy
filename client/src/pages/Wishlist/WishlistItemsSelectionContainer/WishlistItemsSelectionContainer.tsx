import { JSX, useState } from 'react';
import useWishlist from '../context/useWishlist';
import Container from '../../../components/Container/Container';
import Button from '../../../components/Button/Button';
import useConfirmModal from '../../../hooks/useConfirmModal';

type SelectedActionType = 'mark_as_purchased' | 'mark_as_unpurchased' | 'delete';

export default function WishlistItemsSelectionContainer(): JSX.Element {
  const { selectionModeActive, setSelectionModeActive, selectedItemsSet, setSelectedItemsSet } = useWishlist();
  const [selectedAction, setSelectedAction] = useState<SelectedActionType>('mark_as_purchased');

  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

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

        {/* TODO: implement a select/deselect all checkbox */}
      </Container>
    </div>
  );
}
