import { JSX } from 'react';
import Container from '../../../components/Container/Container';
import { getFullDateString } from '../../../utils/globalUtils';
import { getWishlistPrivacyLevelName } from '../../../utils/wishlistUtils';
import useWishlistHeader from './context/useWishlistHeader';
import WishlistHeaderEditingContainer from './components/WishlistHeaderEditingContainer';
import WishlistHeaderContent from './components/WishlistHeaderContent';
import useWishlist from '../hooks/useWishlist';
import useWishlistItems from '../hooks/useWishlistItems';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

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

            <div className='text-sm text-description'>
              <p>
                Created on: <span className='font-medium text-title'>{getFullDateString(wishlistDetails.created_on_timestamp)}</span>
              </p>

              <p className='mb-[6px]'>
                Privacy level: <span className='font-medium text-title'>{getWishlistPrivacyLevelName(wishlistDetails.privacy_level)}</span>
              </p>

              <p>
                Total items: <span className='font-medium text-title'>{wishlistItems.length}</span>
              </p>

              <p>
                Cost to complete:{' '}
                <span className='font-medium text-title'>
                  {wishlistItems
                    .reduce((acc: number, curr: WishlistItemType) => (curr.purchased_on_timestamp ? acc : acc + (curr.price || 0)), 0)
                    .toFixed(2)}
                </span>
              </p>
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
