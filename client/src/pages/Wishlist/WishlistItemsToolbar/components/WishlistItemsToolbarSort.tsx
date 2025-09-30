import { FocusEvent, JSX, useState } from 'react';
import SortIcon from '../../../../assets/svg/SortIcon.svg?react';

export default function WishlistItemsToolbarSort(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className={`sort relative z-3 ${isOpen ? 'open' : ''}`}
      onBlur={(e: FocusEvent) => {
        if (e.relatedTarget?.classList.contains('menu-btn')) {
          return;
        }

        setIsOpen(false);
      }}
    >
      <button
        type='button'
        className='toolbar-btn'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <SortIcon />
      </button>

      <div className='sort-menu absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny hidden'>
        <button
          type='button'
          className='menu-btn'
          onClick={() => {
            // TODO: set sorting mode
            setIsOpen(false);
          }}
        >
          Sort by newest
        </button>

        <button
          type='button'
          className='menu-btn'
          onClick={() => {
            // TODO: set sorting mode
            setIsOpen(false);
          }}
        >
          Sort by oldest
        </button>

        <button
          type='button'
          className='menu-btn'
          onClick={() => {
            // TODO: set sorting mode
            setIsOpen(false);
          }}
        >
          Sort alphabetically
        </button>
      </div>
    </div>
  );
}
