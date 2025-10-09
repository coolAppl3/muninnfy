import { JSX } from 'react';
import SingleColumnGridIcon from '../../../../assets/svg/SingleColumnGridIcon.svg?react';
import DoubleColumnGridIcon from '../../../../assets/svg/DoubleColumnGridIcon.svg?react';
import useWishlist from '../../context/useWishlist';

export default function WishlistItemsToolbarView(): JSX.Element {
  const { isSingleColumnGrid, setIsSingleColumnGrid } = useWishlist();

  return (
    <button
      type='button'
      title={`Switch to ${isSingleColumnGrid ? 'double' : 'single'} column grid`}
      aria-label={`Switch to ${isSingleColumnGrid ? 'double' : 'single'} column grid`}
      onClick={() => setIsSingleColumnGrid((prev) => !prev)}
      className={`hidden sm:flex justify-between gap-2 px-2 bg-dark shadow-simple-tiny overflow-hidden rounded-pill relative after:absolute after:top-0 after:left-0 after:h-full after:w-1/2 after:bg-secondary after:transition-transform p-1 cursor-pointer transition-all hover:brightness-75 ${
        isSingleColumnGrid ? 'after:translate-x-full' : ''
      }`}
    >
      <DoubleColumnGridIcon className='w-2 h-2' />
      <SingleColumnGridIcon className='w-2 h-2' />
    </button>
  );
}
