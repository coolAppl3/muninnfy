import { FocusEvent, JSX, useState } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import useWishlist from '../../context/useWishlist';

export default function WishlistItemsToolbarOptions(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { wishlistViewConfig, setWishlistViewConfig, selectionModeActive, setSelectionModeActive, setSelectedItemsSet } = useWishlist();
  const { expandAllWishlistItems } = wishlistViewConfig;

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
            setSelectedItemsSet(new Set<number>());
          }}
        >
          {selectionModeActive ? 'Cancel item selection' : 'Select items'}
        </button>

        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            setIsOpen(false);
            setWishlistViewConfig((prev) => ({ ...prev, expandAllWishlistItems: !prev.expandAllWishlistItems }));
          }}
        >
          {`${expandAllWishlistItems ? 'Collapse' : 'Expand'} all items`}
        </button>
      </div>
    </div>
  );
}
