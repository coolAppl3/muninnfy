import { FocusEvent, JSX, useState } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import useWishlist from '../../context/useWishlist';
import { WishlistItemType } from '../../../../types/wishlistItemTypes';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import { collapseAllWishlistItems, expandAllWishlistItems, useWishlistItemsExpansionSet } from '../../stores/wishlistItemsExpansionStore';

export default function WishlistItemsToolbarOptions(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { wishlistItems, selectionModeActive, setSelectionModeActive } = useWishlist();
  const { displayPopupMessage } = usePopupMessage();

  const expandedItemsSet: Set<number> = useWishlistItemsExpansionSet();
  const allItemsExpanded: boolean = expandedItemsSet.size === wishlistItems.length;

  return (
    <div
      className='relative'
      onBlur={(e: FocusEvent) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn')) {
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
          className='context-menu-btn'
          onClick={() => {
            setIsOpen(false);

            if (!selectionModeActive) {
              setSelectionModeActive(true);
              return;
            }

            setSelectionModeActive(false);
            collapseAllWishlistItems();
          }}
        >
          {selectionModeActive ? 'Cancel item selection' : 'Select items'}
        </button>

        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            setIsOpen(false);

            if (allItemsExpanded) {
              collapseAllWishlistItems();
              displayPopupMessage('Items collapsed.', 'success');

              return;
            }

            expandAllWishlistItems(wishlistItems.map((item: WishlistItemType) => item.item_id));
            displayPopupMessage('Items expanded.', 'success');
          }}
        >
          {`${allItemsExpanded ? 'Collapse' : 'Expand'} all items`}
        </button>
      </div>
    </div>
  );
}
