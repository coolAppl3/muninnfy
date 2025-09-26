import { JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import DefaultFormGroup from '../../../components/FormGroups/DefaultFormGroup';
import SingleColumnGridIcon from '../../../assets/svg/SingleColumnGridIcon.svg?react';
import DoubleColumnGridIcon from '../../../assets/svg/DoubleColumnGridIcon.svg?react';
import SlidersIcon from '../../../assets/svg/SlidersIcon.svg?react';
import WishlistItemsToolbarOptions from './components/WishlistItemsToolbarOptions';
import WishlistItemsToolbarSort from './components/WishlistItemsToolbarSort';

export default function WishlistItemsToolbar(): JSX.Element {
  const [value, setValue] = useState<string>('');

  return (
    <div className='wishlist-items-toolbar pt-2'>
      <Container>
        <div className='text-title'>
          <div className='flex justify-start items-center gap-1 mb-1'>
            <div className='view-container flex justify-center items-center mr-auto'>
              <button
                type='button'
                className='selected toolbar-btn'
              >
                <DoubleColumnGridIcon />
              </button>
              <button
                type='button'
                className='toolbar-btn'
              >
                <SingleColumnGridIcon />
              </button>
            </div>

            <button
              type='button'
              className='toolbar-btn'
            >
              <SlidersIcon />
            </button>

            <WishlistItemsToolbarSort />
            <WishlistItemsToolbarOptions />
          </div>
        </div>

        <DefaultFormGroup
          id='search-wishlist-items'
          label='Search wishlist items'
          autoComplete='off'
          value={value}
          errorMessage={null}
          onChange={(e) => setValue(e.target.value)}
        />
      </Container>
    </div>
  );
}
