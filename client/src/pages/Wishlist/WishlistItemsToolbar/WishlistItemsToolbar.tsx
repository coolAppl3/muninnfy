import { JSX, useMemo, useState } from 'react';
import Container from '../../../components/Container/Container';
import DefaultFormGroup from '../../../components/DefaultFormGroup/DefaultFormGroup';
import SlidersIcon from '../../../assets/svg/SlidersIcon.svg?react';
import WishlistItemsToolbarOptions from './components/WishlistItemsToolbarOptions';
import WishlistItemsToolbarSort from './components/WishlistItemsToolbarSort';
import WishlistItemsToolbarView from './components/WishlistItemsToolbarView';
import WishlistItemsToolbarFilters from './components/WishlistItemsToolbarFilters/WishlistItemsToolbarFilters';
import { debounce } from '../../../utils/debounce';
import useWishlistItems from '../hooks/useWishlistItems';

export default function WishlistItemsToolbar(): JSX.Element {
  const [titleQuery, setTitleQuery] = useState<string>('');
  const [filtersMenuOpen, setFiltersMenuOpen] = useState<boolean>(false);

  const { setItemsFilterConfig } = useWishlistItems();

  const debounceSetTitleQuery: (titleQuery: string) => void = useMemo(
    () =>
      debounce((titleQuery: string) => {
        setItemsFilterConfig((prev) => ({
          ...prev,
          titleQuery,
        }));
      }, 200),
    [setItemsFilterConfig]
  );

  return (
    <div className='pt-2 relative z-2'>
      <Container>
        <div>
          <header className='flex justify-start items-center gap-1 mb-1 text-title relative z-3'>
            <WishlistItemsToolbarView />

            <button
              type='button'
              className='bg-dark ml-auto p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
              onClick={() => setFiltersMenuOpen((prev) => !prev)}
              title={`${filtersMenuOpen ? 'Hide' : 'View'} filters`}
              aria-label={`${filtersMenuOpen ? 'Hide' : 'View'} filters`}
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
          value={titleQuery}
          errorMessage={null}
          onChange={(e) => {
            const newValue: string = e.target.value;
            setTitleQuery(newValue);

            debounceSetTitleQuery(newValue.toLowerCase());
          }}
        />
      </Container>
    </div>
  );
}
