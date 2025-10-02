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
    <div className='pt-2'>
      <Container>
        <div>
          <header className='flex justify-start items-center gap-1 mb-1 text-title relative z-3'>
            <WishlistItemsToolbarView />

            <button
              type='button'
              className='bg-dark p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
              onClick={() => setFiltersMenuOpen((prev) => !prev)}
            >
              <SlidersIcon className={`w-2 h-2 transition-colors ${filtersMenuOpen ? 'text-cta' : ''}`} />
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
