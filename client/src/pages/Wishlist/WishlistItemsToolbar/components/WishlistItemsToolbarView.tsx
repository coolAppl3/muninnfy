import { JSX } from 'react';
import SingleColumnGridIcon from '../../../../assets/svg/SingleColumnGridIcon.svg?react';
import DoubleColumnGridIcon from '../../../../assets/svg/DoubleColumnGridIcon.svg?react';
import useWishlist from '../../context/useWishlist';
import usePopupMessage from '../../../../hooks/usePopupMessage';

export default function WishlistItemsToolbarView(): JSX.Element {
  const { isSingleColumnView, setIsSingleColumnView } = useWishlist();
  const { displayPopupMessage } = usePopupMessage();

  return (
    <button
      type='button'
      title={`Switch to ${isSingleColumnView ? 'double' : 'single'} column view`}
      aria-label={`Switch to ${isSingleColumnView ? 'double' : 'single'} column view`}
      className={`hidden sm:flex justify-between gap-2 px-2 bg-dark shadow-simple-tiny overflow-hidden rounded-pill relative after:absolute after:top-0 after:left-0 after:h-full after:w-1/2 after:bg-secondary after:transition-transform p-1 cursor-pointer transition-all hover:brightness-75 ${
        isSingleColumnView ? 'after:translate-x-full' : ''
      }`}
      onClick={() => {
        displayPopupMessage(`${isSingleColumnView ? 'Double' : 'Single'} column view.`, 'success');
        setIsSingleColumnView((prev) => !prev);
      }}
    >
      <DoubleColumnGridIcon className='w-2 h-2' />
      <SingleColumnGridIcon className='w-2 h-2' />
    </button>
  );
}
