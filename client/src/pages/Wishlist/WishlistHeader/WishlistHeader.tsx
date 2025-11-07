import { JSX } from 'react';
import Container from '../../../components/Container/Container';
import { getFullDateString } from '../../../utils/globalUtils';
import { getFormattedPrice } from '../../../utils/wishlistUtils';
import useWishlistHeader from './context/useWishlistHeader';
import WishlistHeaderEditingContainer from './components/WishlistHeaderEditingContainer';
import WishlistHeaderContent from './components/WishlistHeaderContent';
import useWishlist from '../hooks/useWishlist';
import useWishlistItems from '../hooks/useWishlistItems';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import WishlistPrivacyLevelIcon from '../../../components/WishlistPrivacyLevelIcon/WishlistPrivacyLevelIcon';

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

            <div className='h-line mt-1'></div>

            <div className='text-sm text-description grid grid-cols-3 mt-1 relative z-0'>
              <div className='grid'>
                <span className='font-medium text-title'>{wishlistItems.length}</span>
                <span className='text-xs font-medium'>Items</span>
              </div>

              <div className='grid'>
                <span className='font-medium text-title'>
                  {getFormattedPrice(wishlistItems.reduce((acc: number, curr: WishlistItemType) => acc + (curr.price || 0), 0))}
                </span>
                <span className='text-xs font-medium'>Worth</span>
              </div>

              <div className='grid'>
                <span className='font-medium text-title'>
                  {getFormattedPrice(
                    wishlistItems.reduce(
                      (acc: number, curr: WishlistItemType) => (curr.purchased_on_timestamp ? acc : acc + (curr.price || 0)),
                      0
                    )
                  )}
                </span>
                <span className='text-xs font-medium'>To complete</span>
              </div>
            </div>

            <div className='text-description flex justify-between items-center mt-2'>
              <p className='text-sm font-medium'>{getFullDateString(wishlistDetails.created_on_timestamp)}</p>
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
