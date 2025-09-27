import { JSX, useState } from 'react';
import Container from '../../../components/Container/Container';
import DefaultFormGroup from '../../../components/FormGroups/DefaultFormGroup';
import SlidersIcon from '../../../assets/svg/SlidersIcon.svg?react';
import WishlistItemsToolbarOptions from './components/WishlistItemsToolbarOptions';
import WishlistItemsToolbarSort from './components/WishlistItemsToolbarSort';
import WishlistItemsToolbarView from './components/WishlistItemsToolbarView';
import WishlistItemsToolbarFilters from './components/WishlistItemsToolbarFilters/WishlistItemsToolbarFilters';

export default function WishlistItemsToolbar(): JSX.Element {
  const [value, setValue] = useState<string>('');
  const [filtersMenuOpen, setFiltersMenuOpen] = useState<boolean>(false);

  return (
    <div className='wishlist-items-toolbar pt-2'>
      <Container>
        <div className='inner-container'>
          <header>
            <WishlistItemsToolbarView />

            <button
              type='button'
              className='toolbar-btn'
              onClick={() => setFiltersMenuOpen((prev) => !prev)}
            >
              <SlidersIcon />
              {/* TODO: add color indicator when filters are applied */}
            </button>

            <WishlistItemsToolbarSort />
            <WishlistItemsToolbarOptions />
          </header>

          <WishlistItemsToolbarFilters
            isOpen={filtersMenuOpen}
            setIsOpen={setFiltersMenuOpen}
          />
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
