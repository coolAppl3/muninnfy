import { Dispatch, FormEvent, JSX, SetStateAction, useEffect, useReducer } from 'react';
import Button from '../../../../../components/Button/Button';
import TimeWindowContainer from '../../../../../components/TimeWindowContainer/TimeWindowContainer';
import WishlistItemTagsFormGroup from '../../../../../components/WishlistItemTagsFormGroup/WishlistItemTagsFormGroup';
import useCalendar from '../../../../../hooks/useCalendar';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useWishlistItems from '../../../hooks/useWishlistItems';
import useWishlistItemsSelectionStore from '../../../stores/wishlistItemsSelectionStore';
import CheckboxFormGroup from '../../../../../components/CheckboxFormGroup/CheckboxFormGroup';
import PriceRangeFormGroup from '../../../../../components/PriceRangeFormGroup/PriceRangeFormGroup';
import { WISHLIST_ITEM_MAX_PRICE } from '../../../../../utils/constants/wishlistItemConstants';
import WishlistItemsFilterToggler from './components/WishlistItemsFilterToggler';
import wishlistItemsToolbarFiltersReducer, { initialWishlistItemsToolbarFiltersState } from './wishlistItemsToolbarFiltersReducer';

type WishlistItemsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistItemsToolbarFilters({ isOpen, setIsOpen }: WishlistItemsToolbarFiltersProps): JSX.Element {
  const { itemsFilterConfig, setItemsFilterConfig } = useWishlistItems();
  const { calendarKey, startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap } = useCalendar();
  const unselectAllWishlistItems: () => void = useWishlistItemsSelectionStore((store) => store.unselectAllWishlistItems);

  const [state, dispatch] = useReducer(wishlistItemsToolbarFiltersReducer, initialWishlistItemsToolbarFiltersState);
  const { tagsSet, priceRangeValid, ...filters } = state;

  const addedTimestampsKey: string = 'addedTimestamps';
  const purchasedTimestampsKey: string = 'purchasedTimestamps';

  const { displayPopupMessage } = usePopupMessage();

  useEffect(() => {
    if (calendarKey === addedTimestampsKey) {
      dispatch({
        type: 'SET_ADDED_TIMESTAMP',
        payload: {
          fromValue: startTimestampsMap.get(addedTimestampsKey) || null,
          toValue: endTimestampsMap.get(addedTimestampsKey) || null,
        },
      });

      return;
    }

    dispatch({
      type: 'SET_PURCHASED_TIMESTAMP',
      payload: {
        fromValue: startTimestampsMap.get(purchasedTimestampsKey) || null,
        toValue: endTimestampsMap.get(purchasedTimestampsKey) || null,
      },
    });
  }, [calendarKey, startTimestampsMap, endTimestampsMap]);

  function changesDetected(): boolean {
    if (!priceRangeValid) {
      return false;
    }

    for (const key of Object.keys(filters) as (keyof typeof filters)[]) {
      if (filters[key] !== itemsFilterConfig[key]) {
        return true;
      }
    }

    if (tagsSet.size !== itemsFilterConfig.tagsSet.size) {
      return true;
    }

    for (const tag of itemsFilterConfig.tagsSet) {
      if (!tagsSet.has(tag)) {
        return true;
      }
    }

    return false;
  }

  function applyFilters(): void {
    if (!priceRangeValid) {
      displayPopupMessage('Invalid price range.', 'error');
      return;
    }

    unselectAllWishlistItems();
    setItemsFilterConfig((prev) => ({
      ...prev,
      ...filters,
      tagsSet,
    }));

    displayPopupMessage('Filters applied.', 'success');
  }

  function resetFilter(): void {
    dispatch({ type: 'RESET_FILTERS' });
    unselectAllWishlistItems();

    setStartTimestampsMap(new Map<string, number>());
    setEndTimestampsMap(new Map<string, number>());

    setItemsFilterConfig((prev) => ({
      ...prev,

      addedAfterTimestamp: null,
      addedBeforeTimestamp: null,
      purchasedAfterTimestamp: null,
      purchasedBeforeTimestamp: null,
      priceFrom: null,
      priceTo: null,

      filterByIsPurchased: null,
      filterByLink: null,
      filterByPrice: null,

      tagsSet: new Set<string>(),
      requireAllFilterTags: false,
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
        calendarKey={addedTimestampsKey}
        startLabel='Added after'
        endLabel='Added before'
      />

      <div>
        <WishlistItemTagsFormGroup
          tagsSet={tagsSet}
          setTagsSet={(newSet: Set<string>) => dispatch({ type: 'SET_TAGS_SET', payload: { newSet } })}
          label='Tags'
        />

        <CheckboxFormGroup
          id='require-all-tags'
          label='Require all tags'
          isChecked={state.requireAllFilterTags}
          onClick={() => dispatch({ type: 'SET_REQUIRE_ALL_FILTER_TAGS', payload: { newValue: !state.requireAllFilterTags } })}
          className='mt-1'
        />
      </div>

      <div className='grid gap-1'>
        <WishlistItemsFilterToggler
          filterBy={state.filterByIsPurchased}
          setFilterBy={(newValue: boolean | null) => dispatch({ type: 'SET_FILTER_BY_IS_PURCHASED', payload: { newValue } })}
          title='Purchase status'
          positiveFilterTitle='Purchased'
          negativeFilterTitle='Unpurchased'
        />

        {state.filterByIsPurchased && (
          <TimeWindowContainer
            calendarKey={purchasedTimestampsKey}
            startLabel='Purchased after'
            endLabel='Purchased before'
            className='mb-1'
          />
        )}

        <WishlistItemsFilterToggler
          filterBy={state.filterByPrice}
          setFilterBy={(newValue: boolean | null) => dispatch({ type: 'SET_FILTER_BY_PRICE', payload: { newValue } })}
          title='Price'
          positiveFilterTitle='Has a price'
          negativeFilterTitle={`Doesn't have a price`}
        />

        {state.filterByPrice && (
          <PriceRangeFormGroup
            setRangeValue={(mewRange: { fromValue: number | null; toValue: number | null }) =>
              dispatch({ type: 'SET_ITEM_PRICE', payload: { ...mewRange } })
            }
            setRangeIsValid={(newValue: boolean) => dispatch({ type: 'SET_ITEM_PRICE_RANGE_VALID', payload: { newValue } })}
            maxPrice={WISHLIST_ITEM_MAX_PRICE}
            className='mb-1'
          />
        )}

        <WishlistItemsFilterToggler
          filterBy={state.filterByLink}
          setFilterBy={(newValue: boolean | null) => dispatch({ type: 'SET_FILTER_BY_LINK', payload: { newValue } })}
          title='Link'
          positiveFilterTitle='Contains a link'
          negativeFilterTitle={`Doesn't contain a link`}
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
          onClick={resetFilter}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
