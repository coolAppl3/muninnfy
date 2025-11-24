import { JSX } from 'react';
import Container from '../../../components/Container/Container';
import { getFullDateString } from '../../../utils/globalUtils';
import { getFormattedPrice } from '../../../utils/wishlistUtils';
import useWishlistHeader from './context/useWishlistHeader';
import WishlistHeaderEditingContainer from './components/WishlistHeaderEditingContainer';
import WishlistHeaderContent from './WishlistHeaderContent/WishlistHeaderContent';
import useWishlist from '../hooks/useWishlist';
import useWishlistItems from '../hooks/useWishlistItems';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import WishlistPrivacyLevelIcon from '../../../components/WishlistPrivacyLevelIcon/WishlistPrivacyLevelIcon';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import HeartIcon from '../../../assets/svg/HeartIcon.svg?react';

export default function WishlistHeader(): JSX.Element {
  const { wishlistDetails } = useWishlist();
  const { wishlistItems } = useWishlistItems();
  const { editMode } = useWishlistHeader();

  return (
    <header>
      <Container>
        <div
          className={`bg-secondary p-2 pb-0 rounded-sm shadow-simple-tiny grid transition-[grid] gap-2 ${
            editMode ? 'grid-rows-[auto_1fr] !pb-2' : 'grid-rows-[auto_0fr]'
          }`}
        >
          <div>
            <WishlistHeaderContent />

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

            <div className='text-description flex justify-between items-center'>
              <p className='text-sm font-medium'>{getFullDateString(wishlistDetails.created_on_timestamp)}</p>
              {wishlistDetails.is_favorite && (
                <span
                  title='Favorited'
                  aria-label='Favorited'
                  className='ml-auto mr-[4px] z-0'
                >
                  <HeartIcon className='w-[1.6rem] h-[1.6rem] text-cta' />
                </span>
              )}
              <WishlistPrivacyLevelIcon privacyLevel={wishlistDetails.privacy_level} />
            </div>
          </div>

          <div className='overflow-hidden relative z-0'>
            <div className='h-line mb-[1.4rem]'></div>
            <WishlistHeaderEditingContainer />
          </div>
        </div>
      </Container>
    </header>
  );
}
