import { FocusEvent, JSX, useState } from 'react';
import SortIcon from '../../../../assets/svg/SortIcon.svg?react';

export default function WishlistItemsToolbarSort(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
      >
        <SortIcon className={`w-2 h-2 transition-colors ${isOpen ? 'text-cta' : ''}`} />
      </button>

      <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${isOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            // TODO: set sorting mode
            setIsOpen(false);
          }}
        >
          Sort by newest
        </button>

        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            // TODO: set sorting mode
            setIsOpen(false);
          }}
        >
          Sort by oldest
        </button>

        <button
          type='button'
          className='context-menu-btn'
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
