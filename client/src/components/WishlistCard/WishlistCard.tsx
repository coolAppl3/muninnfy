import { JSX } from 'react';
import { getFormattedPrice } from '../../utils/wishlistUtils';
import { getFullDateString } from '../../utils/globalUtils';
import { Link } from 'react-router-dom';
import WishlistPrivacyLevelIcon from '../WishlistPrivacyLevelIcon/WishlistPrivacyLevelIcon';
import RedirectIcon from '../../assets/svg/RedirectIcon.svg?react';
import { ExtendedWishlistDetailsType } from '../../types/wishlistTypes';

type WishlistCardProps = {
  wishlist: ExtendedWishlistDetailsType;
};

export default function WishlistCard({ wishlist }: WishlistCardProps): JSX.Element {
  const { wishlist_id, title, privacy_level, created_on_timestamp, items_count, total_items_price, price_to_complete } = wishlist;

  return (
    <div className='relative p-2 bg-secondary rounded-sm shadow-simple-tiny border-transparent transition-all duration-200 hover:scale-102 hover:brightness-110 hover:cursor-pointer will-change-transform group'>
      <h3 className='text-title font-medium mb-1 leading-[1] wrap-anywhere'>{title}</h3>

      <div className='h-line mt-1'></div>

      <div className='text-sm text-description grid grid-cols-3 mt-1 relative z-0'>
        <div className='grid'>
          <span className='font-medium text-title'>{items_count}</span>
          <span className='text-xs font-medium'>Items</span>
        </div>

        <div className='grid'>
          <span className='font-medium text-title'>{getFormattedPrice(total_items_price)}</span>
          <span className='text-xs font-medium'>Worth</span>
        </div>

        <div className='grid'>
          <span className='font-medium text-title'>{getFormattedPrice(price_to_complete)}</span>
          <span className='text-xs font-medium'>To complete</span>
        </div>
      </div>

      <div className='text-description flex justify-between items-center mt-2'>
        <p className='text-sm font-medium'>{getFullDateString(created_on_timestamp)}</p>
        <WishlistPrivacyLevelIcon privacyLevel={privacy_level} />
      </div>

      <Link
        to={`/wishlist/${wishlist_id}`}
        className='absolute top-0 left-0 h-full w-full'
      />

      <RedirectIcon className='w-[1.6rem] h-[1.6rem] text-description absolute top-1 right-1 transition-colors group-hover:text-cta z-0' />
    </div>
  );
}
