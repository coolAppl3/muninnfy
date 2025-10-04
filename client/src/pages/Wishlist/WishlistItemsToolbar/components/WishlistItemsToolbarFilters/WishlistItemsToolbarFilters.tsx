import { Dispatch, JSX, SetStateAction, useState } from 'react';
import WishlistItemsToolbarFilterItem from './components/WishlistItemsToolbarFilterItem';
import Button from '../../../../../components/Button/Button';

type WishlistItemsToolbarFiltersProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function WishlistItemsToolbarFilters({ isOpen, setIsOpen }: WishlistItemsToolbarFiltersProps): JSX.Element {
  const [filterByPurchaseStatus, setFilterByPurchaseStatus] = useState<boolean | null>(null);
  const [filterByLink, setFilterByLink] = useState<boolean | null>(null);

  return (
    <div className={`bg-secondary p-2 rounded-sm shadow-simple-tiny mb-2 ${isOpen ? 'block' : 'hidden'}`}>
      <h4 className='text-title mb-2'>Filters</h4>

      <WishlistItemsToolbarFilterItem
        filterBy={filterByPurchaseStatus}
        setFilterBy={setFilterByPurchaseStatus}
        title='Purchase status'
        positiveFilterTitle='Purchased'
        negativeFilterTitle='Unpurchased'
      />

      <WishlistItemsToolbarFilterItem
        filterBy={filterByLink}
        setFilterBy={setFilterByLink}
        title='Link'
        positiveFilterTitle='Contains a link'
        negativeFilterTitle={`Doesn't contain a link`}
      />

      <div className='btn-container flex flex-col sm:flex-row justify-start items-start gap-1 mt-2'>
        <Button className='bg-cta border-cta w-full sm:w-fit order-1 sm:order-3'>Apply filters</Button>
        <Button className='bg-secondary border-title text-title w-full sm:w-fit order-2'>Cancel</Button>
        <Button className='bg-description border-description w-full sm:w-fit order-3 sm:order-1 mt-1 sm:mt-0'>Reset</Button>
      </div>
    </div>
  );
}
