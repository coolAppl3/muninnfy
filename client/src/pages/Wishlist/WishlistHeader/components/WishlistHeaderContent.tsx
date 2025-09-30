import { FocusEvent, JSX } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useWishlistHeader from '../context/useWishlistHeader';
import { copyToClipboard } from '../../../../utils/globalUtils';
import useWishlist from '../../context/useWishlist';

export default function WishlistHeaderContent(): JSX.Element {
  const { wishlistId, wishlistDetails } = useWishlist();
  const { setEditMode, menuIsOpen, setMenuIsOpen } = useWishlistHeader();

  const { displayPopupMessage } = usePopupMessage();

  return (
    <div
      className={`content-header flex justify-between items-start gap-1 mb-1 relative ${menuIsOpen ? 'open' : ''}`}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget?.classList.contains('content-menu-btn')) {
          return;
        }

        setMenuIsOpen(false);
      }}
    >
      <h3 className='text-title font-medium mb-1 break-words leading-[1]'>{wishlistDetails.title}</h3>

      <button
        type='button'
        title='Wishlist menu'
        aria-label='Wishlist menu'
        className='mt-[-1rem] mr-[-1.2rem] p-1 bg-dark rounded-[50%] transition-[filter] hover:brightness-75 cursor-pointer flex justify-center items-center'
        onClick={() => setMenuIsOpen((prev) => !prev)}
      >
        <TripleDotMenuIcon />
      </button>

      <div className='content-menu absolute top-[-1rem] right-4 rounded-sm overflow-hidden shadow-centered-tiny hidden'>
        <button
          type='button'
          className='content-menu-btn'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('TITLE');
          }}
        >
          Change title
        </button>

        <button
          type='button'
          className='content-menu-btn'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('PRIVACY_LEVEL');
          }}
        >
          Change privacy level
        </button>

        <button
          type='button'
          className='content-menu-btn'
          id='share-wishlist-btn'
          onClick={async () => {
            const successfullyCopied: boolean = await copyToClipboard(`${window.location.origin}/wishlist/view/${wishlistId}`);
            successfullyCopied
              ? displayPopupMessage('Share link copied to clipboard.', 'success')
              : displayPopupMessage('Failed to copy to clipboard.', 'error');
          }}
        >
          Share wishlist
        </button>

        <button
          type='button'
          className='content-menu-btn !text-danger'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('DELETE_WISHLIST');
          }}
        >
          Delete wishlist
        </button>
      </div>
    </div>
  );
}
