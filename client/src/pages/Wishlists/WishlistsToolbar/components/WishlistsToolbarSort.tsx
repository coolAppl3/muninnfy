import { FocusEvent, JSX, useState } from 'react';
import useWishlists from '../../hooks/useWishlists';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import SortIcon from '../../../../assets/svg/SortIcon.svg?react';
import { WishlistsSortingMode } from '../../contexts/WishlistsContext';

export default function WishlistsToolbarSort(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { wishlistsSortingMode, setWishlistsSortingMode, sortWishlists } = useWishlists();
  const { displayPopupMessage } = usePopupMessage();

  function handleSortBtnClick(sortingMode: WishlistsSortingMode): void {
    setWishlistsSortingMode(sortingMode);
    sortWishlists(sortingMode);

    setIsOpen(false);
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
          className={`context-menu-btn ${wishlistsSortingMode === 'newest_first' ? 'text-cta' : ''}`}
          onClick={() => handleSortBtnClick('newest_first')}
        >
          Newest first
        </button>

        <button
          type='button'
          className={`context-menu-btn ${wishlistsSortingMode === 'oldest_first' ? 'text-cta' : ''}`}
          onClick={() => handleSortBtnClick('oldest_first')}
        >
          Oldest first
        </button>

        <button
          type='button'
          className={`context-menu-btn ${wishlistsSortingMode === 'largest_first' ? 'text-cta' : ''}`}
          onClick={() => handleSortBtnClick('largest_first')}
        >
          Largest first
        </button>

        <button
          type='button'
          className={`context-menu-btn ${wishlistsSortingMode === 'smallest_first' ? 'text-cta' : ''}`}
          onClick={() => handleSortBtnClick('smallest_first')}
        >
          Smallest first
        </button>

        <button
          type='button'
          className={`context-menu-btn ${wishlistsSortingMode === 'lexicographical' ? 'text-cta' : ''}`}
          onClick={() => handleSortBtnClick('lexicographical')}
        >
          Sort alphabetically
        </button>
      </div>
    </div>
  );
}
