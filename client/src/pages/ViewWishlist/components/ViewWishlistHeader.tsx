import { JSX } from 'react';
import useWishlistItems from '../../Wishlist/hooks/useWishlistItems';
import Container from '../../../components/Container/Container';
import { getFullDateString } from '../../../utils/globalUtils';
import { getFormattedPrice } from '../../../utils/wishlistUtils';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import {
  ViewWishlistDetailsType,
  ViewWishlistOwnerDetails,
} from '../../../types/wishlistTypes';
import { Link } from 'react-router-dom';

type ViewWishlistHeaderProps = {
  ownerDetails: ViewWishlistOwnerDetails;
  viewWishlistDetails: ViewWishlistDetailsType;
};

export default function ViewWishlistHeader({
  ownerDetails,
  viewWishlistDetails,
}: ViewWishlistHeaderProps): JSX.Element {
  const { wishlistItems } = useWishlistItems();
  const { owner_public_account_id, owner_username, owner_display_name } = ownerDetails;

  return (
    <header>
      <Container>
        <p className='text-description text-xs font-medium mb-[4px]'>
          Owned by <span className='text-title'>{owner_display_name}</span>{' '}
          <Link
            to={`/view/account/${owner_public_account_id}`}
            className='link break-all'
          >
            @{owner_username}
          </Link>
        </p>
        <div className='bg-secondary p-2 rounded-sm shadow-simple-tiny'>
          <h3 className='text-title font-medium mb-1 leading-none wrap-anywhere'>
            {viewWishlistDetails.title}
          </h3>

          <div className='h-line mb-1 mt-[4px]'></div>

          <div className='text-sm text-description grid grid-cols-3 mb-2 relative z-0'>
            <StatisticItem
              title='Items'
              value={`${wishlistItems.length}`}
            />

            <StatisticItem
              title='Worth'
              value={getFormattedPrice(
                wishlistItems.reduce(
                  (acc: number, curr: WishlistItemType) => acc + (curr.price || 0),
                  0
                )
              )}
            />

            <StatisticItem
              title='To complete'
              value={getFormattedPrice(
                wishlistItems.reduce(
                  (acc: number, curr: WishlistItemType) =>
                    curr.purchased_on_timestamp ? acc : acc + (curr.price || 0),
                  0
                )
              )}
            />
          </div>

          <p className='text-description text-sm font-medium'>
            {getFullDateString(viewWishlistDetails.created_on_timestamp)}
          </p>
        </div>
      </Container>
    </header>
  );
}
