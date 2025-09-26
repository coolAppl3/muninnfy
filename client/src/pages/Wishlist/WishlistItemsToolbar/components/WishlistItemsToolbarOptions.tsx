import { FocusEvent, JSX, useState } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';

export default function WishlistItemsToolbarOptions(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className={`options ${isOpen && 'open'}`}
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
        <TripleDotMenuIcon />
      </button>

      <div className='options-menu'>
        <button
          type='button'
          className='menu-btn'
          onClick={() => {
            // TODO: toggle select mode
            setIsOpen(false);
          }}
        >
          Select items
        </button>

        <button
          type='button'
          className='menu-btn'
          onClick={() => {
            // TODO: toggle items' default look
            setIsOpen(false);
          }}
        >
          Expand items by default
          {/* TODO: conditionally change between Expand/Collapse */}
        </button>
      </div>
    </div>
  );
}
