import { Dispatch, JSX, SetStateAction, useState } from 'react';
import WishlistItemsToolbarFilterItem from './components/WishlistItemsToolbarFilterItem';
import Button from '../../../../../components/Button/Button';

export default function WishlistItemsToolbarFilters({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const [filterByPurchaseStatus, setFilterByPurchaseStatus] = useState<boolean | null>(null);
  const [filterByLink, setFilterByLink] = useState<boolean | null>(null);

  return (
    <div className={`filters ${isOpen ? 'open' : ''}`}>
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

      <div className='btn-container'>
        <Button className='bg-cta border-cta'>Apply filters</Button>
        <Button className='bg-secondary border-title text-title'>Cancel</Button>
        <Button className='bg-description border-description'>Reset</Button>
      </div>
    </div>
  );
}
