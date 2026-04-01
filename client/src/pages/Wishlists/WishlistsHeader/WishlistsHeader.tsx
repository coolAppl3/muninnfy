import { JSX } from 'react';
import { getFormattedPrice } from '../../../utils/wishlistUtils';
import Container from '../../../components/Container/Container';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import { CombinedWishlistsStatistics } from '../../../services/wishlistServices';
import Button from '../../../components/Button/Button';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import useWishlists from '../hooks/useWishlists';
import useViewMode from '../../../hooks/useViewMode';
import { ViewWishlistOwnerDetails } from '../../../types/wishlistTypes';

type WishlistsHeaderProps = {
  combinedWishlistsStatistics: CombinedWishlistsStatistics;
  ownerDetails?: Omit<ViewWishlistOwnerDetails, 'owner_public_account_id'>;
};

export default function WishlistsHeader({
  combinedWishlistsStatistics,
  ownerDetails,
}: WishlistsHeaderProps): JSX.Element {
  const { inViewMode, publicAccountId } = useViewMode();
  const { wishlists } = useWishlists();
  const navigate: NavigateFunction = useNavigate();

  const {
    totalItemsCount,
    totalPurchasedItemsCount,
    totalWishlistsWorth,
    totalWishlistsSpent,
    totalWishlistsToComplete,
  } = combinedWishlistsStatistics;

  return (
    <header>
      <Container className='w-full'>
        {inViewMode && ownerDetails && (
          <p className='text-description text-xs font-medium mb-[4px]'>
            Owned by <span className='text-title'>{ownerDetails.owner_display_name}</span>{' '}
            <Link
              to={`/view/account/${publicAccountId}`}
              className='link break-all'
            >
              @{ownerDetails.owner_username}
            </Link>
          </p>
        )}

        <div className='p-2 bg-secondary rounded-sm shadow-simple-tiny border-transparent'>
          <h3 className='text-title font-medium wrap-anywhere'>Combined statistics</h3>

          <div className='h-line my-1'></div>

          <div className='text-sm text-description grid grid-cols-3 gap-y-1 mb-2'>
            <StatisticItem
              title='Wishlists'
              value={`${wishlists.length}`}
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
              title='To complete'
              value={getFormattedPrice(Math.round(totalWishlistsToComplete))}
            />
          </div>

          {inViewMode || (
            <Button
              className='bg-cta border-cta text-dark w-full sm:w-fit'
              onClick={() => navigate('/wishlist/new')}
            >
              New wishlist
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
