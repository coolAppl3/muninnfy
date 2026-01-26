import { JSX, useMemo, useState } from 'react';
import Container from '../../../components/Container/Container';
import SlidersIcon from '../../../assets/svg/SlidersIcon.svg?react';
import DefaultFormGroup from '../../../components/DefaultFormGroup/DefaultFormGroup';
import { debounce } from '../../../utils/debounce';
import useWishlists from '../hooks/useWishlists';
import WishlistsToolbarView from './components/WishlistsToolbarView';
import WishlistsToolbarSort from './components/WishlistsToolbarSort';
import WishlistsToolbarOptions from './components/WishlistsToolbarOptions';
import CalendarProvider from '../../../providers/CalendarProvider';
import WishlistsToolbarFilters from './components/WishlistsToolbarFilters/WishlistsToolbarFilters';

export function WishlistsToolbar(): JSX.Element {
  const { setWishlistsFilterConfig } = useWishlists();

  const [titleQueryValue, setTitleQueryValue] = useState<string>('');
  const [filtersMenuOpen, setFiltersMenuOpen] = useState<boolean>(false);

  const debouncedSetTitleQuery: (titleQuery: string) => void = useMemo(
    () =>
      debounce((titleQuery: string) => {
        setWishlistsFilterConfig((prev) => ({
          ...prev,
          titleQuery,
        }));
      }, 200),
    [setWishlistsFilterConfig]
  );

  return (
    <div className='pt-2 relative z-2'>
      <Container>
        <div>
          <header className='flex justify-start items-center gap-1 mb-1 text-title relative z-3'>
            <WishlistsToolbarView />

            <button
              type='button'
              className='bg-dark ml-auto p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
              onClick={() => setFiltersMenuOpen((prev) => !prev)}
              title={`${filtersMenuOpen ? 'Hide' : 'View'} filters`}
              aria-label={`${filtersMenuOpen ? 'Hide' : 'View'} filters`}
            >
              <SlidersIcon className={`w-2 h-2 transition-colors ${filtersMenuOpen ? 'text-cta' : ''}`} />
            </button>

            <WishlistsToolbarSort />
            <WishlistsToolbarOptions />
          </header>

          <CalendarProvider>
            <WishlistsToolbarFilters
              isOpen={filtersMenuOpen}
              setIsOpen={setFiltersMenuOpen}
            />
          </CalendarProvider>
        </div>

        <DefaultFormGroup
          id='search-wishlists'
          label='Search wishlists'
          autoComplete='off'
          value={titleQueryValue}
          errorMessage={null}
          onChange={(e) => {
            const newValue: string = e.target.value;
            setTitleQueryValue(newValue);

            debouncedSetTitleQuery(newValue.toLowerCase());
          }}
        />
      </Container>
    </div>
  );
}
