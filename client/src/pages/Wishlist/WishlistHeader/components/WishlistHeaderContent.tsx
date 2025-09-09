import { FocusEvent, JSX } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useWishlistHeader from '../useWishlistHeader';
import { WishlistDetails } from '../../../../services/wishlistServices';
import { copyToClipboard } from '../../../../utils/globalUtils';

export default function WishlistHeaderContent({
  wishlistId,
  wishlistDetails,
}: {
  wishlistId: string;
  wishlistDetails: WishlistDetails;
}): JSX.Element {
  const { setEditMode, menuIsOpen, setMenuIsOpen } = useWishlistHeader();
  const { displayPopupMessage } = usePopupMessage();

  return (
    <div
      className={`content-header ${menuIsOpen ? 'open' : ''}`}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget) {
          return;
        }

        setMenuIsOpen(false);
      }}
    >
      <h3>{wishlistDetails.title}</h3>

      <button
        type='button'
        onClick={() => setMenuIsOpen((prev) => !prev)}
      >
        <TripleDotMenuIcon />
      </button>

      <div className='content-menu'>
        <button
          type='button'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('TITLE');
          }}
        >
          Change title
        </button>
        <button
          type='button'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('PRIVACY_LEVEL');
          }}
        >
          Change privacy level
        </button>
        <button
          type='button'
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
          className='!text-danger'
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
