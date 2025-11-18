import { FocusEvent, JSX, useMemo, useState } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useConfirmModal from '../../../../hooks/useConfirmModal';
import { deleteEmptyWishlistsService } from '../../../../services/wishlistServices';
import useWishlists from '../../hooks/useWishlists';
import { ExtendedWishlistDetailsType } from '../../../../types/wishlistTypes';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../../hooks/useAsyncErrorHandler';

export default function WishlistsToolbarOptions(): JSX.Element {
  const { wishlists, setWishlists } = useWishlists();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const { displayPopupMessage } = usePopupMessage();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  const emptyWishlistsCount: number = useMemo(
    () => wishlists.reduce((acc: number, cur: ExtendedWishlistDetailsType) => (cur.items_count > 0 ? acc : acc + 1), 0),
    [wishlists]
  );

  async function deleteEmptyWishlists(): Promise<void> {
    try {
      await deleteEmptyWishlistsService();
      setWishlists((prev) => prev.filter((wishlist: ExtendedWishlistDetailsType) => wishlist.items_count > 0));

      displayPopupMessage(emptyWishlistsCount === 1 ? 'Wishlist deleted.' : 'Wishlists deleted.', 'success');
    } catch (err: unknown) {
      console.log(err);
      handleAsyncError(err);
    }
  }

  return (
    <div
      className='relative'
      onBlur={(e: FocusEvent) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn') || e.target.getAttribute('disabled')) {
          return;
        }

        setIsOpen(false);
      }}
    >
      <button
        type='button'
        className='bg-dark p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
        onClick={() => setIsOpen((prev) => !prev)}
        title={`${isOpen ? 'Hide' : 'View'} context menu`}
        aria-label={`${isOpen ? 'Hide' : 'View'} context menu`}
      >
        <TripleDotMenuIcon className={`w-2 h-2 transition-colors ${isOpen ? 'text-cta' : ''}`} />
      </button>

      <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${isOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className='context-menu-btn text-danger'
          onClick={() => {
            setIsOpen(false);

            if (emptyWishlistsCount === 0) {
              displayPopupMessage('No empty wishlists to delete.', 'success');
              return;
            }

            displayConfirmModal({
              title: 'Are you sure you want to delete all empty wishlists?',
              description: `This action will delete ${emptyWishlistsCount === 1 ? '1 wishlist.' : `${emptyWishlistsCount} wishlists.`}`,
              confirmBtnTitle: 'Delete wishlists',
              cancelBtnTitle: 'Cancel',
              isDangerous: true,
              onCancel: removeConfirmModal,
              onConfirm: async () => {
                removeConfirmModal();
                await deleteEmptyWishlists();
              },
            });
          }}
        >
          Delete empty wishlists
        </button>
      </div>
    </div>
  );
}
