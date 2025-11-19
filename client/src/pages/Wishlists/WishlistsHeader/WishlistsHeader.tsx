import { JSX } from 'react';
import { getFormattedPrice } from '../../../utils/wishlistUtils';
import Container from '../../../components/Container/Container';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import { CombinedWishlistsStatistics } from '../../../services/wishlistServices';
import Button from '../../../components/Button/Button';

type WishlistsHeaderProps = {
  combinedWishlistsStatistics: CombinedWishlistsStatistics;
};

export default function WishlistsHeader({ combinedWishlistsStatistics }: WishlistsHeaderProps): JSX.Element {
  const {
    totalWishlistsCount,
    totalItemsCount,
    totalPurchasedItemsCount,
    totalWishlistsWorth,
    totalWishlistsSpent,
    totalWishlistsToComplete,
  } = combinedWishlistsStatistics;

  return (
    <header>
      <Container className='w-full'>
        <div className='p-2 bg-secondary rounded-sm shadow-simple-tiny border-transparent'>
          <h3 className='text-title font-medium wrap-anywhere'>Combined statistics</h3>

          <div className='h-line my-1'></div>

          <div className='text-sm text-description grid grid-cols-3 gap-y-1 mb-2'>
            <StatisticItem
              title='Wishlists'
              value={`${totalWishlistsCount}`}
            />

            <StatisticItem
              title='Items'
              value={`${totalItemsCount}`}
            />

            <StatisticItem
              title='Purchased'
              value={`${totalPurchasedItemsCount}`}
            />

            <StatisticItem
              title='Worth'
              value={getFormattedPrice(Math.round(totalWishlistsWorth))}
            />

            <StatisticItem
              title='Spent'
              value={getFormattedPrice(Math.round(totalWishlistsSpent))}
            />

            <StatisticItem
              title='Spent'
              value={getFormattedPrice(Math.round(totalWishlistsToComplete))}
            />
          </div>

          <Button className='bg-cta border-cta text-dark w-full sm:w-fit'>New wishlist</Button>
        </div>
      </Container>
    </header>
  );
}
