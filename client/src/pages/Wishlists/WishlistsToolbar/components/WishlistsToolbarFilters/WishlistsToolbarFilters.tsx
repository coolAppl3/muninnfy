import { Dispatch, FormEvent, JSX, SetStateAction, useEffect, useReducer } from 'react';
import TimeWindowContainer from '../../../../../components/TimeWindowContainer/TimeWindowContainer';
import Button from '../../../../../components/Button/Button';
import useWishlists from '../../../hooks/useWishlists';
import useCalendar from '../../../../../hooks/useCalendar';
import PriceRangeFormGroup from '../../../../../components/PriceRangeFormGroup/PriceRangeFormGroup';
import { WISHLIST_MAX_TOTAL_ITEMS_PRICE } from '../../../../../utils/constants/wishlistConstants';
import ToggleSwitch from '../../../../../components/ToggleSwitch/ToggleSwitch';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import WishlistsItemsCountRange from './components/WishlistsItemsCountRange';
import wishlistsToolbarFiltersReducer, { initialWishlistsToolbarFiltersState } from './wishlistsToolbarFiltersReducer';

type WishlistsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistsToolbarFilters({ isOpen, setIsOpen }: WishlistsToolbarFiltersProps): JSX.Element {
  const { wishlistsFilterConfig, setWishlistsFilterConfig } = useWishlists();
  const { startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap } = useCalendar();

  const [state, dispatch] = useReducer(wishlistsToolbarFiltersReducer, initialWishlistsToolbarFiltersState);

  const {
    filterByItemsCount,
    filterByPriceToComplete,
    filterByTotalItemsPrice,
    itemsCountRangeValid,
    totalItemsPriceRangeValid,
    priceToCompleteRangeValid,
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
    if (!allRangesValid) {
      return false;
    }

    for (const key of Object.keys(filters) as (keyof typeof filters)[]) {
      if (filters[key] !== wishlistsFilterConfig[key]) {
        return true;
      }
    }

    return false;
  }

  function applyFilters(): void {
    if (!allRangesValid) {
      displayPopupMessage('Invalid filter configuration.', 'error');
      return;
    }

    setWishlistsFilterConfig((prev) => ({
      ...prev,
      ...filters,
    }));

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
    }));

    displayPopupMessage('Filters reset.', 'success');
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
        <div className='grid gap-1'>
          <header className='flex justify-start items-center gap-1'>
            <ToggleSwitch
              isToggled={filterByItemsCount}
              onClick={() => dispatch({ type: 'SET_FILTER_BY_ITEMS_COUNT', payload: { newValue: !filterByItemsCount } })}
            />
            <p className='text-title text-sm leading-[1]'>Items</p>
          </header>

          {filterByItemsCount && (
            <WishlistsItemsCountRange
              dispatch={dispatch}
              className='mb-1'
            />
          )}
        </div>

        <div className='grid gap-1'>
          <header className='flex justify-start items-center gap-1'>
            <ToggleSwitch
              isToggled={filterByTotalItemsPrice}
              onClick={() => dispatch({ type: 'SET_FILTER_BY_TOTAL_ITEMS_PRICE', payload: { newValue: !filterByTotalItemsPrice } })}
            />
            <p className='text-title text-sm leading-[1]'>Worth</p>
          </header>

          {filterByTotalItemsPrice && (
            <PriceRangeFormGroup
              setRangeValue={(newRange: { fromValue: number | null; toValue: number | null }) =>
                dispatch({ type: 'SET_TOTAL_ITEMS_PRICE', payload: { ...newRange } })
              }
              setRangeIsValid={(newValue: boolean) => dispatch({ type: 'SET_TOTAL_ITEMS_PRICE_RANGE_VALID', payload: { newValue } })}
              maxPrice={WISHLIST_MAX_TOTAL_ITEMS_PRICE}
              className='mb-1'
            />
          )}
        </div>

        <div className='grid gap-1'>
          <header className='flex justify-start items-center gap-1'>
            <ToggleSwitch
              isToggled={filterByPriceToComplete}
              onClick={() => dispatch({ type: 'SET_FILTER_BY_PRICE_TO_COMPLETE', payload: { newValue: !filterByPriceToComplete } })}
            />
            <p className='text-title text-sm leading-[1]'>To complete</p>
          </header>

          {filterByPriceToComplete && (
            <PriceRangeFormGroup
              setRangeValue={(newRange: { fromValue: number | null; toValue: number | null }) =>
                dispatch({ type: 'SET_PRICE_TO_COMPLETE', payload: { ...newRange } })
              }
              setRangeIsValid={(newValue: boolean) => dispatch({ type: 'SET_PRICE_TO_COMPLETE_RANGE_VALID', payload: { newValue } })}
              maxPrice={WISHLIST_MAX_TOTAL_ITEMS_PRICE}
            />
          )}
        </div>
      </div>

      <div className='btn-container flex flex-col sm:flex-row justify-start items-start gap-1'>
        <Button
          className='bg-cta border-cta w-full sm:w-fit order-1 sm:order-3'
          disabled={!changesDetected()}
          isSubmitBtn={true}
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
