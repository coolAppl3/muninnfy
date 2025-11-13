import { Dispatch, FormEvent, JSX, SetStateAction, useEffect, useState } from 'react';
import TimeWindowContainer from '../../../../../components/TimeWindowContainer/TimeWindowContainer';
import Button from '../../../../../components/Button/Button';
import useWishlists from '../../../hooks/useWishlists';
import useCalendar from '../../../../../hooks/useCalendar';
import PriceRangeFormGroup from '../../../../../components/PriceRangeFormGroup/PriceRangeFormGroup';
import { WISHLIST_MAX_PRICE_TO_COMPLETE } from '../../../../../utils/constants/wishlistConstants';
import ToggleSwitch from '../../../../../components/ToggleSwitch/ToggleSwitch';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import WishlistsItemsCountRange from './components/WishlistsItemsCountRange';

type WishlistsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistsToolbarFilters({ isOpen, setIsOpen }: WishlistsToolbarFiltersProps): JSX.Element {
  const { wishlistsFilterConfig, setWishlistsFilterConfig } = useWishlists();
  const { startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap } = useCalendar();

  const [createdAfterTimestamp, setCreatedAfterTimestamp] = useState<number | null>(null);
  const [createdBeforeTimestamp, setCreatedBeforeTimestamp] = useState<number | null>(null);

  const [filterByItemsCount, setFilterByItemsCount] = useState<boolean>(false);
  const [itemsCountFrom, setItemsCountFrom] = useState<number | null>(null);
  const [itemsCountTo, setItemsCountTo] = useState<number | null>(null);
  const [itemsCountRangeValid, setItemsCountRangeValid] = useState<boolean>(true);

  const [filterByTotalItemsPrice, setFilterByTotalItemsPrice] = useState<boolean>(false);
  const [totalItemsPriceFrom, setTotalIItemsFrom] = useState<number | null>(null);
  const [totalItemsPriceTo, setTotalIItemsTo] = useState<number | null>(null);
  const [totalItemsPriceRangeValid, setTotalItemsPriceRangeValid] = useState<boolean>(true);

  const [filterByPriceToComplete, setFilterByPriceToComplete] = useState<boolean>(false);
  const [priceToCompleteFrom, setPriceToCompleteFrom] = useState<number | null>(null);
  const [priceToCompleteTo, setPriceToCompleteTo] = useState<number | null>(null);
  const [priceToCompleteRangeValid, setPriceToCompleteRangeValid] = useState<boolean>(true);

  const allRangesValid: boolean = itemsCountRangeValid && totalItemsPriceRangeValid && priceToCompleteRangeValid;
  const createdTimestampsKey: string = 'createdTimestamps';

  const { displayPopupMessage } = usePopupMessage();

  useEffect(() => {
    setCreatedAfterTimestamp(startTimestampsMap.get(createdTimestampsKey) || null);
    setCreatedBeforeTimestamp(endTimestampsMap.get(createdTimestampsKey) || null);
  }, [startTimestampsMap, endTimestampsMap]);

  function changesDetected(): boolean {
    if (!allRangesValid) {
      return false;
    }

    const stateRecord = {
      createdAfterTimestamp,
      createdBeforeTimestamp,
      itemsCountFrom,
      itemsCountTo,
      totalItemsPriceFrom,
      totalItemsPriceTo,
      priceToCompleteFrom,
      priceToCompleteTo,
    };

    for (const key of Object.keys(stateRecord) as (keyof typeof stateRecord)[]) {
      if (stateRecord[key] !== wishlistsFilterConfig[key]) {
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

      createdAfterTimestamp,
      createdBeforeTimestamp,
      itemsCountFrom,
      itemsCountTo,
      totalItemsPriceFrom,
      totalItemsPriceTo,
      priceToCompleteFrom,
      priceToCompleteTo,
    }));

    displayPopupMessage('Filters applied.', 'success');
  }

  function resetFilter(): void {
    setFilterByItemsCount(false);
    setFilterByTotalItemsPrice(false);
    setFilterByPriceToComplete(false);

    setCreatedAfterTimestamp(null);
    setCreatedBeforeTimestamp(null);
    setItemsCountFrom(null);
    setItemsCountTo(null);
    setTotalIItemsFrom(null);
    setTotalIItemsTo(null);
    setPriceToCompleteFrom(null);
    setPriceToCompleteTo(null);

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
              setIsToggled={() => {
                const newValue: boolean = !filterByItemsCount;
                setFilterByItemsCount(newValue);

                if (newValue) {
                  return;
                }

                setItemsCountFrom(null);
                setItemsCountTo(null);
                setItemsCountRangeValid(true);
              }}
            />
            <p className='text-title text-sm leading-[1]'>Items</p>
          </header>

          {filterByItemsCount && (
            <WishlistsItemsCountRange
              setCountFrom={setItemsCountFrom}
              setCountTo={setItemsCountTo}
              setCountRangeValid={setItemsCountRangeValid}
              className='mb-1'
            />
          )}
        </div>

        <div className='grid gap-1'>
          <header className='flex justify-start items-center gap-1'>
            <ToggleSwitch
              isToggled={filterByTotalItemsPrice}
              setIsToggled={() => {
                const newValue: boolean = !filterByTotalItemsPrice;
                setFilterByTotalItemsPrice(newValue);

                if (newValue) {
                  return;
                }

                setTotalIItemsFrom(null);
                setTotalIItemsTo(null);
                setTotalItemsPriceRangeValid(true);
              }}
            />
            <p className='text-title text-sm leading-[1]'>Worth</p>
          </header>

          {filterByTotalItemsPrice && (
            <PriceRangeFormGroup
              setPriceFrom={setTotalIItemsFrom}
              setPriceTo={setTotalIItemsTo}
              setPriceRangeValid={setTotalItemsPriceRangeValid}
              maxPrice={WISHLIST_MAX_PRICE_TO_COMPLETE}
              className='mb-1'
            />
          )}
        </div>

        <div className='grid gap-1'>
          <header className='flex justify-start items-center gap-1'>
            <ToggleSwitch
              isToggled={filterByPriceToComplete}
              setIsToggled={() => {
                const newValue: boolean = !filterByPriceToComplete;
                setFilterByPriceToComplete(newValue);

                if (newValue) {
                  return;
                }

                setPriceToCompleteFrom(null);
                setPriceToCompleteTo(null);
                setPriceToCompleteRangeValid(true);
              }}
            />
            <p className='text-title text-sm leading-[1]'>To complete</p>
          </header>

          {filterByPriceToComplete && (
            <PriceRangeFormGroup
              setPriceFrom={setPriceToCompleteFrom}
              setPriceTo={setPriceToCompleteTo}
              setPriceRangeValid={setPriceToCompleteRangeValid}
              maxPrice={WISHLIST_MAX_PRICE_TO_COMPLETE}
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
          onClick={resetFilter}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
