import { JSX } from 'react';
import Container from '../../../components/Container/Container';
import { getFullDateString } from '../../../utils/globalUtils';
import { getWishlistPrivacyLevelName } from '../../../utils/wishlistUtils';
import useWishlistHeader from './context/useWishlistHeader';
import WishlistHeaderEditingContainer from './components/WishlistHeaderEditingContainer';
import WishlistHeaderContent from './components/WishlistHeaderContent';
import useWishlist from '../context/useWishlist';

export default function WishlistHeader(): JSX.Element {
  const { wishlistDetails } = useWishlist();
  const { editMode } = useWishlistHeader();

  return (
    <header className='wishlist-header'>
      <Container>
        <div
          className={`wishlist-header-container bg-secondary p-2 pb-0 rounded-sm shadow-simple-tiny grid transition-[grid] gap-2 ${
            editMode ? 'grid-rows-[auto_1fr] !pb-2' : 'grid-rows-[auto_0fr]'
          }`}
        >
          <div className='content'>
            <WishlistHeaderContent />

            <p>
              Created on: <span>{getFullDateString(wishlistDetails.created_on_timestamp)}</span>
            </p>
            <p>
              Privacy level: <span>{getWishlistPrivacyLevelName(wishlistDetails.privacy_level)}</span>
            </p>
          </div>

          <div className='editing-container overflow-hidden relative z-0'>
            <div className='h-line mb-[1.4rem]'></div>
            <WishlistHeaderEditingContainer />
          </div>
        </div>
      </Container>
    </header>
  );
}
