import { JSX, useState } from 'react';
import SingleColumnGridIcon from '../../../../assets/svg/SingleColumnGridIcon.svg?react';
import DoubleColumnGridIcon from '../../../../assets/svg/DoubleColumnGridIcon.svg?react';

export default function WishlistItemsToolbarView(): JSX.Element {
  const [isSingleColumnGrid, setIsSingleColumnGrid] = useState<boolean>(false);
  // TODO: implement logic to update the to-be-added context

  return (
    <button
      type='button'
      className={`flex justify-between gap-2 mr-auto px-2 bg-dark shadow-simple-tiny overflow-hidden rounded-pill relative after:absolute after:top-0 after:left-0 after:h-full after:w-1/2 after:bg-secondary after:transition-transform p-1 cursor-pointer transition-all hover:brightness-75 ${
        isSingleColumnGrid ? 'after:translate-x-full' : ''
      }`}
      onClick={() => setIsSingleColumnGrid((prev) => !prev)}
    >
      <DoubleColumnGridIcon className='w-2 h-2' />
      <SingleColumnGridIcon className='w-2 h-2' />
    </button>
  );
}
