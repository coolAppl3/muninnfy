import { FocusEvent, JSX } from 'react';
import TripleDotMenuIcon from '../../../../assets/svg/TripleDotMenuIcon.svg?react';
import usePopupMessage from '../../../../hooks/usePopupMessage';
import useWishlistHeader from '../context/useWishlistHeader';
import { copyToClipboard } from '../../../../utils/globalUtils';
import useWishlist from '../../hooks/useWishlist';

export default function WishlistHeaderContent(): JSX.Element {
  const { wishlistId, wishlistDetails } = useWishlist();
  const { setEditMode, menuIsOpen, setMenuIsOpen } = useWishlistHeader();

  const { displayPopupMessage } = usePopupMessage();

  return (
    <div
      className='flex justify-between items-start gap-1 relative'
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn')) {
          return;
        }

        setMenuIsOpen(false);
      }}
    >
      <h3 className='text-title font-medium mb-1 leading-[1] wrap-anywhere'>{wishlistDetails.title}</h3>

      <button
        type='button'
        title={`${menuIsOpen ? 'Hide' : 'View'} wishlist menu`}
        aria-label={`${menuIsOpen ? 'Hide' : 'View'} wishlist menu`}
        className='mt-[-1rem] mr-[-9px] p-1 bg-dark rounded-[50%] transition-[filter] hover:brightness-75 cursor-pointer flex justify-center items-center'
        onClick={() => setMenuIsOpen((prev) => !prev)}
      >
        <TripleDotMenuIcon className={`w-[1.4rem] h-[1.4rem] transition-colors ${menuIsOpen ? 'text-cta' : 'text-title'}`} />
      </button>

      <div className={`absolute top-[-1rem] right-4 rounded-sm overflow-hidden shadow-centered-tiny ${menuIsOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('TITLE');
          }}
        >
          Change title
        </button>

        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            setMenuIsOpen(false);
            setEditMode('PRIVACY_LEVEL');
          }}
        >
          Change privacy level
        </button>

        <button
          type='button'
          className='context-menu-btn'
          onClick={async () => {
            setMenuIsOpen(false);

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
          className='context-menu-btn danger'
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
