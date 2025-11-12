import { Dispatch, FormEvent, JSX, SetStateAction, useEffect, useState } from 'react';
import TimeWindowContainer from '../../../../../components/TimeWindowContainer/TimeWindowContainer';
import Button from '../../../../../components/Button/Button';
import useWishlists from '../../../hooks/useWishlists';
import useCalendar from '../../../../../hooks/useCalendar';
import PriceRangeFormGroup from '../../../../../components/PriceRangeFormGroup/PriceRangeFormGroup';
import { WISHLIST_MAX_PRICE_TO_COMPLETE } from '../../../../../utils/constants/wishlistConstants';
import FilterToggler from '../../../../../components/FilterToggler/FilterToggler';

type WishlistsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistsToolbarFilters({ isOpen, setIsOpen }: WishlistsToolbarFiltersProps): JSX.Element {
  const { wishlistsFilterConfig, setWishlistsFilterConfig } = useWishlists();
  const { startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap } = useCalendar();

  const [createdAfterTimestamp, setCreatedAfterTimestamp] = useState<number | null>(null);
  const [createdBeforeTimestamp, setCreatedBeforeTimestamp] = useState<number | null>(null);

  const [filterByItemsCount, setFilterByItemsCount] = useState<boolean | null>(null);
  const [itemsCountFrom, setItemsCountFrom] = useState<number | null>(null);
  const [itemsCountTo, setItemsCountTo] = useState<number | null>(null);
  const [itemsCountRangeValid, setItemsCountRangeValid] = useState<boolean>(true);

  const [filterByTotalItemsPrice, setFilterByTotalItemsPrice] = useState<boolean | null>(null);
  const [totalItemsPriceFrom, setTotalIItemsFrom] = useState<number | null>(null);
  const [totalItemsPriceTo, setTotalIItemsTo] = useState<number | null>(null);
  const [totalItemsPriceRangeValid, setTotalItemsPriceRangeValid] = useState<boolean>(true);

  const [filterByPriceToComplete, setFilterByPriceToComplete] = useState<boolean | null>(null);
  const [priceToCompleteFrom, setPriceToCompleteFrom] = useState<number | null>(null);
  const [priceToCompleteTo, setPriceToCompleteTo] = useState<number | null>(null);
  const [priceToCompleteRangeValid, setPriceToCompleteRangeValid] = useState<boolean>(true);

  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  const createdTimestampsKey: string = 'createdTimestamps';

  useEffect(() => {
    setCreatedAfterTimestamp(startTimestampsMap.get(createdTimestampsKey) || null);
    setCreatedBeforeTimestamp(endTimestampsMap.get(createdTimestampsKey) || null);
  }, [startTimestampsMap, endTimestampsMap]);

  function changesDetected(): boolean {
    return false;
  }

  function applyFilters(): void {
    //
  }

  function resetFilter(): void {
    //
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
        <FilterToggler
          filterBy={filterByItemsCount}
          setFilterBy={setFilterByItemsCount}
          title='Items'
          positiveFilterTitle={null}
          negativeFilterTitle={null}
        />

        {filterByItemsCount && <>{/* TODO: implement items count range */}</>}

        <FilterToggler
          filterBy={filterByTotalItemsPrice}
          setFilterBy={setFilterByTotalItemsPrice}
          title='Worth'
          positiveFilterTitle={null}
          negativeFilterTitle={null}
        />

        {filterByTotalItemsPrice && (
          <PriceRangeFormGroup
            setPriceFrom={setTotalIItemsFrom}
            setPriceTo={setTotalIItemsTo}
            setPriceRangeValid={setTotalItemsPriceRangeValid}
            maxPrice={WISHLIST_MAX_PRICE_TO_COMPLETE}
            className='mb-1'
          />
        )}

        <FilterToggler
          filterBy={filterByPriceToComplete}
          setFilterBy={setFilterByPriceToComplete}
          title='To complete'
          positiveFilterTitle={null}
          negativeFilterTitle={null}
        />

        {filterByPriceToComplete && (
          <PriceRangeFormGroup
            setPriceFrom={setPriceToCompleteFrom}
            setPriceTo={setPriceToCompleteTo}
            setPriceRangeValid={setPriceToCompleteRangeValid}
            maxPrice={WISHLIST_MAX_PRICE_TO_COMPLETE}
          />
        )}
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
          onClick={resetFilter}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
