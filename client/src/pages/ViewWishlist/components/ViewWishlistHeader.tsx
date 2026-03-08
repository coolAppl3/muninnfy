import { JSX } from 'react';
import useWishlistItems from '../../Wishlist/hooks/useWishlistItems';
import Container from '../../../components/Container/Container';
import { getFullDateString } from '../../../utils/globalUtils';
import { getFormattedPrice } from '../../../utils/wishlistUtils';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import { ViewWishlistDetailsType } from '../../../types/wishlistTypes';

type ViewWishlistHeaderProps = {
  viewWishlistDetails: ViewWishlistDetailsType;
};

export default function ViewWishlistHeader({ viewWishlistDetails }: ViewWishlistHeaderProps): JSX.Element {
  const { wishlistItems } = useWishlistItems();

  return (
    <header>
      <Container>
        <div className='bg-secondary p-2 rounded-sm shadow-simple-tiny'>
          <h3 className='text-title font-medium mb-1 leading-none wrap-anywhere'>{viewWishlistDetails.title}</h3>

          <div className='h-line mb-1 mt-[4px]'></div>

          <div className='text-sm text-description grid grid-cols-3 mb-2 relative z-0'>
            <StatisticItem
              title='Items'
              value={`${wishlistItems.length}`}
            />

            <StatisticItem
              title='Worth'
              value={getFormattedPrice(wishlistItems.reduce((acc: number, curr: WishlistItemType) => acc + (curr.price || 0), 0))}
            />

            <StatisticItem
              title='To complete'
              value={getFormattedPrice(
                wishlistItems.reduce(
                  (acc: number, curr: WishlistItemType) => (curr.purchased_on_timestamp ? acc : acc + (curr.price || 0)),
                  0
                )
              )}
            />
          </div>

          <p className='text-description text-sm font-medium'>{getFullDateString(viewWishlistDetails.created_on_timestamp)}</p>
        </div>
      </Container>
    </header>
  );
}
