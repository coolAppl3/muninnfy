import { JSX, memo } from 'react';
import { getFormattedPrice } from '../../utils/wishlistUtils';
import { getFullDateString } from '../../utils/globalUtils';
import { Link } from 'react-router-dom';
import WishlistPrivacyLevelIcon from '../WishlistPrivacyLevelIcon/WishlistPrivacyLevelIcon';
import { ExtendedWishlistDetailsType } from '../../types/wishlistTypes';
import StatisticItem from '../StatisticItem/StatisticItem';
import ArrowIcon from '../../assets/svg/ArrowIcon.svg?react';
import HeartIcon from '../../assets/svg/HeartIcon.svg?react';

type WishlistCardProps = {
  wishlist: ExtendedWishlistDetailsType;
};

export default memo(WishlistCard);
function WishlistCard({ wishlist }: WishlistCardProps): JSX.Element {
  const { wishlist_id, title, privacy_level, created_on_timestamp, items_count, total_items_price, price_to_complete } = wishlist;

  return (
    <div className='relative p-2 bg-secondary rounded-sm shadow-simple-tiny'>
      <h3 className='text-title font-medium leading-[1] wrap-anywhere'>{title}</h3>

      <div className='h-line my-1'></div>

      <div className='text-sm text-description grid grid-cols-3 mb-2 relative z-0'>
        <StatisticItem
          title='Items'
          value={`${items_count}`}
        />

        <StatisticItem
          title='Worth'
          value={getFormattedPrice(total_items_price)}
        />

        <StatisticItem
          title='To Complete'
          value={getFormattedPrice(price_to_complete)}
        />
      </div>

      <div className='text-description flex justify-between items-center'>
        <p className='text-sm font-medium mr-auto'>{getFullDateString(created_on_timestamp)}</p>

        {wishlist.is_favorited && (
          <span
            title='Favorited'
            aria-label='Favorited'
            className='ml-auto mr-[4px]'
          >
            <HeartIcon className='w-[1.6rem] h-[1.6rem] text-cta' />
          </span>
        )}

        <WishlistPrivacyLevelIcon privacyLevel={privacy_level} />

        <Link
          to={`/wishlist/${wishlist_id}`}
          className='ml-1 bg-dark text-title px-[2.4rem] h-[2.8rem] rounded-pill hidden xs:flex justify-center items-center transition-colors hover:text-cta'
          title='View'
          aria-label='View wishlist'
        >
          <ArrowIcon className='w-2 h-2' />
        </Link>
      </div>

      <Link
        to={`/wishlist/${wishlist_id}`}
        className='bg-dark text-title ml-auto mt-1 py-[1rem] rounded xs:hidden flex justify-center items-center text-sm font-medium'
      >
        View
      </Link>
    </div>
  );
}
