import { Dispatch, FormEvent, JSX, SetStateAction, useEffect, useState } from 'react';
import WishlistItemsToolbarFilterItem from './components/WishlistItemsToolbarFilterItem';
import Button from '../../../../../components/Button/Button';
import TimeWindowContainer from '../../../../../components/TimeWindowContainer/TimeWindowContainer';
import WishlistItemTagsFormGroup from '../../../../../components/WishlistItemTagsFormGroup/WishlistItemTagsFormGroup';
import useCalendar from '../../../../../hooks/useCalendar';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useWishlistItems from '../../../hooks/useWishlistItems';
import useWishlistItemsSelectionStore from '../../../stores/wishlistItemsSelectionStore';

type WishlistItemsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistItemsToolbarFilters({ isOpen, setIsOpen }: WishlistItemsToolbarFiltersProps): JSX.Element {
  const { itemsFilterConfig, setItemsFilterConfig } = useWishlistItems();
  const { calendarKey, startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap } = useCalendar();
  const unselectAllWishlistItems: () => void = useWishlistItemsSelectionStore((store) => store.unselectAllWishlistItems);

  const addedTimestampsKey: string = 'addTimestamps';
  const purchasedTimestampsKey: string = 'purchasedTimestamps';

  const [addedAfterTimestamp, setAddedAfterTimestamp] = useState<number | null>(startTimestampsMap.get(addedTimestampsKey) || null);
  const [addedBeforeTimestamp, setAddedBeforeTimestamp] = useState<number | null>(endTimestampsMap.get(addedTimestampsKey) || null);

  const [purchasedAfterTimestamp, setPurchasedAfterTimestamp] = useState<number | null>(
    startTimestampsMap.get(purchasedTimestampsKey) || null
  );
  const [purchasedBeforeTimestamp, setPurchasedBeforeTimestamp] = useState<number | null>(
    endTimestampsMap.get(purchasedTimestampsKey) || null
  );

  const [isPurchased, setIsPurchased] = useState<boolean | null>(itemsFilterConfig.isPurchased);
  const [hasLink, setHasLink] = useState<boolean | null>(itemsFilterConfig.hasLink);
  const [tagsSet, setTagsSet] = useState<Set<string>>(new Set(itemsFilterConfig.tagsSet));

  const { displayPopupMessage } = usePopupMessage();

  useEffect(() => {
    if (calendarKey === addedTimestampsKey) {
      setAddedAfterTimestamp(startTimestampsMap.get(addedTimestampsKey) || null);
      setAddedBeforeTimestamp(endTimestampsMap.get(addedTimestampsKey) || null);

      return;
    }

    setPurchasedAfterTimestamp(startTimestampsMap.get(purchasedTimestampsKey) || null);
    setPurchasedBeforeTimestamp(endTimestampsMap.get(purchasedTimestampsKey) || null);
  }, [calendarKey, startTimestampsMap, endTimestampsMap]);

  function changesDetected(): boolean {
    if (addedAfterTimestamp !== itemsFilterConfig.addedAfterTimestamp) {
      return true;
    }

    if (addedBeforeTimestamp !== itemsFilterConfig.addedBeforeTimestamp) {
      return true;
    }

    if (purchasedAfterTimestamp !== itemsFilterConfig.purchasedAfterTimestamp) {
      return true;
    }

    if (purchasedBeforeTimestamp !== itemsFilterConfig.purchasedBeforeTimestamp) {
      return true;
    }

    if (isPurchased !== itemsFilterConfig.isPurchased) {
      return true;
    }

    if (hasLink !== itemsFilterConfig.hasLink) {
      return true;
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
    unselectAllWishlistItems();
    setItemsFilterConfig((prev) => ({
      ...prev,

      addedAfterTimestamp,
      addedBeforeTimestamp,
      purchasedAfterTimestamp,
      purchasedBeforeTimestamp,

      isPurchased,
      hasLink,
      tagsSet,
    }));

    displayPopupMessage('Filters applied.', 'success');
  }

  function resetFilter(): void {
    unselectAllWishlistItems();

    setAddedAfterTimestamp(null);
    setAddedBeforeTimestamp(null);
    setPurchasedAfterTimestamp(null);
    setPurchasedBeforeTimestamp(null);

    setIsPurchased(null);
    setHasLink(null);
    setTagsSet(new Set());

    setStartTimestampsMap(new Map<string, number>());
    setEndTimestampsMap(new Map<string, number>());

    setItemsFilterConfig((prev) => ({
      ...prev,

      addedAfterTimestamp: null,
      addedBeforeTimestamp: null,
      purchasedAfterTimestamp: null,
      purchasedBeforeTimestamp: null,

      isPurchased: null,
      hasLink: null,
      tagsSet: new Set(),
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

      <div className='grid gap-1'>
        <WishlistItemsToolbarFilterItem
          filterBy={isPurchased}
          setFilterBy={setIsPurchased}
          title='Purchase status'
          positiveFilterTitle='Purchased'
          negativeFilterTitle='Unpurchased'
        />

        <WishlistItemsToolbarFilterItem
          filterBy={hasLink}
          setFilterBy={setHasLink}
          title='Link'
          positiveFilterTitle='Contains a link'
          negativeFilterTitle={`Doesn't contain a link`}
        />
      </div>

      <TimeWindowContainer
        calendarKey={addedTimestampsKey}
        startLabel='Added after'
        endLabel='Added before'
      />

      {isPurchased && (
        <TimeWindowContainer
          calendarKey={purchasedTimestampsKey}
          startLabel='Purchased after'
          endLabel='Purchased before'
        />
      )}

      <WishlistItemTagsFormGroup
        itemTags={tagsSet}
        setItemTags={setTagsSet}
        label='Tags - space to add'
      />

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
