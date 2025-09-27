import { JSX, useState } from 'react';
import SingleColumnGridIcon from '../../../../assets/svg/SingleColumnGridIcon.svg?react';
import DoubleColumnGridIcon from '../../../../assets/svg/DoubleColumnGridIcon.svg?react';

export default function WishlistItemsToolbarView(): JSX.Element {
  const [isSingleColumnGrid, setIsSingleColumnGrid] = useState<boolean>(false);
  // TODO: implement logic to update the to-be-added context

  return (
    <button
      type='button'
      className={`view toolbar-btn ${isSingleColumnGrid && 'single-column-grid'}`}
      onClick={() => setIsSingleColumnGrid((prev) => !prev)}
    >
      <DoubleColumnGridIcon />
      <SingleColumnGridIcon />
    </button>
  );
}
