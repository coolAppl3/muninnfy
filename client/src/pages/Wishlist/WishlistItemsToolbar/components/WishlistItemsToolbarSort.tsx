import { FocusEvent, JSX, useState } from 'react';
import SortIcon from '../../../../assets/svg/SortIcon.svg?react';
import useWishlist from '../../context/useWishlist';
import { ItemsSortingMode } from '../../context/WishlistContext';
import usePopupMessage from '../../../../hooks/usePopupMessage';

export default function WishlistItemsToolbarSort(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { itemsSortingMode, setItemsSortingMode } = useWishlist();
  const { displayPopupMessage } = usePopupMessage();

  function sortWishlistItems(sortingMode: ItemsSortingMode): void {
    setIsOpen(false);
    setItemsSortingMode(sortingMode);
    displayPopupMessage('Items sorted.', 'success');
  }

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
        title={`${isOpen ? 'Hide' : 'View'} sort menu`}
        aria-label={`${isOpen ? 'Hide' : 'View'} sort menu`}
      >
        <SortIcon className={`w-2 h-2 transition-colors ${isOpen ? 'text-cta' : ''}`} />
      </button>

      <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${isOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className={`context-menu-btn ${itemsSortingMode === 'newest_first' ? 'text-cta' : ''}`}
          onClick={() => sortWishlistItems('newest_first')}
        >
          Sort by newest
        </button>

        <button
          type='button'
          className={`context-menu-btn ${itemsSortingMode === 'oldest_first' ? 'text-cta' : ''}`}
          onClick={() => sortWishlistItems('oldest_first')}
        >
          Sort by oldest
        </button>

        <button
          type='button'
          className={`context-menu-btn ${itemsSortingMode === 'alphabetical' ? 'text-cta' : ''}`}
          onClick={() => sortWishlistItems('alphabetical')}
        >
          Sort alphabetically
        </button>
      </div>
    </div>
  );
}
