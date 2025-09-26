import { FocusEvent, JSX, useState } from 'react';
import SortIcon from '../../../../assets/svg/SortIcon.svg?react';

export default function WishlistItemsToolbarSort(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className={`sort ${isOpen && 'open'}`}
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

      <div className='sort-menu'>
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
