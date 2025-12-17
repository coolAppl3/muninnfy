import { Dispatch, FormEvent, JSX, SetStateAction, useEffect, useReducer, useState } from 'react';
import TimeWindowContainer from '../../../../../components/TimeWindowContainer/TimeWindowContainer';
import Button from '../../../../../components/Button/Button';
import useWishlists from '../../../hooks/useWishlists';
import useCalendar from '../../../../../hooks/useCalendar';
import PriceRangeFormGroup from '../../../../../components/PriceRangeFormGroup/PriceRangeFormGroup';
import { WISHLIST_MAX_TOTAL_ITEMS_PRICE } from '../../../../../utils/constants/wishlistConstants';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import WishlistsItemsCountRange from './components/WishlistsItemsCountRange';
import wishlistsToolbarFiltersReducer, { initialWishlistsToolbarFiltersState } from './wishlistsToolbarFiltersReducer';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { crossWishlistSearchService } from '../../../../../services/wishlistServices';
import useLoadingOverlay from '../../../../../hooks/useLoadingOverlay';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import WishlistsFilterToggler from './components/WishlistsFilterToggler';
import FilterTogglerCheckboxBtn from '../../../../../components/FilterTogglerCheckboxBtn/FilterTogglerCheckboxBtn';

type WishlistsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistsToolbarFilters({ isOpen, setIsOpen }: WishlistsToolbarFiltersProps): JSX.Element {
  const [state, dispatch] = useReducer(wishlistsToolbarFiltersReducer, initialWishlistsToolbarFiltersState);
  const [isFetchingSearchQuery, setIsFetchingSearchingQuery] = useState<boolean>(false);

  const { wishlistsFilterConfig, setWishlistsFilterConfig } = useWishlists();
  const { startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap } = useCalendar();

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  const {
    itemTitleQuery,
    itemTitleQueryErrorMessage,

    filterByItemsCount,
    filterByPriceToComplete,
    filterByTotalItemsPrice,
    filterByItemTitle,

    itemsCountRangeValid,
    totalItemsPriceRangeValid,
    priceToCompleteRangeValid,
    itemTitleQueryValid,
    ...filters
  } = state;

  const allRangesValid: boolean = itemsCountRangeValid && totalItemsPriceRangeValid && priceToCompleteRangeValid;
  const createdTimestampsKey: string = 'createdTimestamps';

  const { displayPopupMessage } = usePopupMessage();

  useEffect(() => {
    dispatch({
      type: 'SET_CREATED_TIMESTAMP',
      payload: {
        fromValue: startTimestampsMap.get(createdTimestampsKey) || null,
        toValue: endTimestampsMap.get(createdTimestampsKey) || null,
      },
    });
  }, [startTimestampsMap, endTimestampsMap]);

  function changesDetected(): boolean {
    if (!allRangesValid || itemTitleQueryErrorMessage) {
      return false;
    }

    if (itemTitleQuery !== wishlistsFilterConfig.itemTitleQuery) {
      return true;
    }

    for (const key of Object.keys(filters) as (keyof typeof filters)[]) {
      if (filters[key] !== wishlistsFilterConfig[key]) {
        return true;
      }
    }

    return false;
  }

  async function applyFilters(): Promise<void> {
    if (!allRangesValid || itemTitleQueryErrorMessage) {
      displayPopupMessage('Invalid filter configuration.', 'error');
      return;
    }

    setWishlistsFilterConfig((prev) => ({
      ...prev,
      ...filters,
      itemTitleQuery,
    }));

    if (itemTitleQuery !== wishlistsFilterConfig.itemTitleQuery) {
      setIsFetchingSearchingQuery(true);
      await applyCrossWishlistSearch();
    }

    displayPopupMessage('Filters applied.', 'success');
  }

  function resetFilters(): void {
    dispatch({ type: 'RESET_FILTERS' });

    setStartTimestampsMap(new Map<string, number>());
    setEndTimestampsMap(new Map<string, number>());

    setWishlistsFilterConfig((prev) => ({
      ...prev,

      createdAfterTimestamp: null,
      createdBeforeTimestamp: null,
      itemsCountFrom: null,
      itemsCountTo: null,
      totalItemsPriceFrom: null,
      totalItemsPriceTo: null,
      priceToCompleteFrom: null,
      priceToCompleteTo: null,

      itemTitleQuery: '',
      crossWishlistQueryIdSet: null,
    }));

    displayPopupMessage('Filters reset.', 'success');
  }

  async function applyCrossWishlistSearch(): Promise<void> {
    if (isFetchingSearchQuery) {
      return;
    }

    displayLoadingOverlay();

    if (itemTitleQuery === '') {
      setWishlistsFilterConfig((prev) => ({ ...prev, crossWishlistQueryIdSet: null }));
      removeLoadingOverlay();

      return;
    }

    try {
      const wishlistIdsArr: string[] = (await crossWishlistSearchService(itemTitleQuery)).data;
      setWishlistsFilterConfig((prev) => ({ ...prev, crossWishlistQueryIdSet: new Set<string>(wishlistIdsArr) }));
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        dispatch({ type: 'SET_ITEM_TITLE_QUERY_ERROR_MESSAGE', payload: { newValue: errMessage } });
      }
    } finally {
      setIsFetchingSearchingQuery(false);
      removeLoadingOverlay();
    }
  }

  return (
    <form
      className={`grid gap-2 bg-secondary p-2 rounded-sm shadow-simple-tiny mb-2 ${isOpen ? 'block' : 'hidden'}`}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        changesDetected() && applyFilters();
      }}
    >
      <h4 className='text-title'>Filters</h4>

      <TimeWindowContainer
        calendarKey={createdTimestampsKey}
        startLabel='Created after'
        endLabel='Created before'
      />

      <div className='grid gap-1'>
        <WishlistsFilterToggler
          title='Favorited'
          isToggled={filters.isFavorited !== null}
          onClick={() => dispatch({ type: 'SET_IS_FAVORITED', payload: { newValue: filters.isFavorited ? null : true } })}
          children={
            <div className={`gap-[1.4rem] pl-1 mb-1 ${filters.isFavorited === null ? 'hidden' : 'grid'}`}>
              <FilterTogglerCheckboxBtn
                onClick={() => dispatch({ type: 'SET_IS_FAVORITED', payload: { newValue: true } })}
                title='Favorited'
                isChecked={filters.isFavorited === true}
              />

              <FilterTogglerCheckboxBtn
                onClick={() => dispatch({ type: 'SET_IS_FAVORITED', payload: { newValue: false } })}
                title='Not favorited'
                isChecked={filters.isFavorited === false}
              />
            </div>
          }
        />

        <WishlistsFilterToggler
          title='Items'
          isToggled={filterByItemsCount}
          onClick={() => dispatch({ type: 'SET_FILTER_BY_ITEMS_COUNT', payload: { newValue: !filterByItemsCount } })}
          children={
            <WishlistsItemsCountRange
              dispatch={dispatch}
              className='mb-1'
            />
          }
        />

        <WishlistsFilterToggler
          title='Worth'
          isToggled={filterByTotalItemsPrice}
          onClick={() => dispatch({ type: 'SET_FILTER_BY_TOTAL_ITEMS_PRICE', payload: { newValue: !filterByTotalItemsPrice } })}
          children={
            <PriceRangeFormGroup
              setRangeValue={(newRange: { fromValue: number | null; toValue: number | null }) =>
                dispatch({ type: 'SET_TOTAL_ITEMS_PRICE', payload: { ...newRange } })
              }
              setRangeIsValid={(newValue: boolean) => dispatch({ type: 'SET_TOTAL_ITEMS_PRICE_RANGE_VALID', payload: { newValue } })}
              maxPrice={WISHLIST_MAX_TOTAL_ITEMS_PRICE}
              className='mb-1'
            />
          }
        />

        <WishlistsFilterToggler
          title='To complete'
          isToggled={filterByPriceToComplete}
          onClick={() => dispatch({ type: 'SET_FILTER_BY_PRICE_TO_COMPLETE', payload: { newValue: !filterByPriceToComplete } })}
          children={
            <PriceRangeFormGroup
              setRangeValue={(newRange: { fromValue: number | null; toValue: number | null }) =>
                dispatch({ type: 'SET_PRICE_TO_COMPLETE', payload: { ...newRange } })
              }
              setRangeIsValid={(newValue: boolean) => dispatch({ type: 'SET_PRICE_TO_COMPLETE_RANGE_VALID', payload: { newValue } })}
              maxPrice={WISHLIST_MAX_TOTAL_ITEMS_PRICE}
            />
          }
        />

        <WishlistsFilterToggler
          title='Specific item'
          isToggled={filterByItemTitle}
          onClick={() => dispatch({ type: 'SET_FILTER_BY_ITEM_TITLE', payload: { newValue: !filterByItemTitle } })}
          children={
            <DefaultFormGroup
              id='cross-wishlists-search'
              label='Wishlist item title'
              autoComplete='off'
              value={itemTitleQuery}
              errorMessage={itemTitleQueryErrorMessage}
              onChange={(e) => dispatch({ type: 'SET_ITEM_TITLE_QUERY', payload: { newValue: e.target.value } })}
            />
          }
        />
      </div>

      <div className='btn-container flex flex-col sm:flex-row justify-start items-start gap-1'>
        <Button
          className='bg-cta border-cta w-full sm:w-fit order-1 sm:order-3'
          disabled={!changesDetected()}
          isSubmitBtn
        >
          Apply filters
        </Button>

        <Button
          className='bg-secondary border-title text-title w-full sm:w-fit order-2'
          onClick={() => setIsOpen(false)}
        >
          Close
        </Button>

        <Button
          className='bg-description border-description w-full sm:w-fit order-3 sm:order-1 mt-1 sm:mt-0'
          onClick={resetFilters}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
