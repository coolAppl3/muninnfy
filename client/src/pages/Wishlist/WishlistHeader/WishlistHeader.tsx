import { Dispatch, JSX, SetStateAction } from 'react';
import Container from '../../../components/Container/Container';
import '../Wishlist.css';
import { getFullDateString } from '../../../utils/globalUtils';
import { WishlistDetails } from '../../../services/wishlistServices';
import { getWishlistPrivacyLevelName } from '../../../utils/wishlistUtils';
import useWishlistHeader from './useWishlistHeader';
import WishlistHeaderEditingContainer from './components/WishlistHeaderEditingContainer';
import WishlistHeaderContent from './components/WishlistHeaderContent';

export default function WishlistHeader({
  wishlistId,
  wishlistDetails,
  setWishlistDetails,
}: {
  wishlistId: string;
  wishlistDetails: WishlistDetails;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetails | null>>;
}): JSX.Element {
  const { editMode } = useWishlistHeader();

  return (
    <header className='wishlist-header'>
      <Container>
        <div className={`wishlist-header-container ${editMode ? 'expanded' : ''}`}>
          <div className='content'>
            <WishlistHeaderContent
              wishlistId={wishlistId}
              wishlistDetails={wishlistDetails}
            />

            <p>
              Created on: <span>{getFullDateString(wishlistDetails.created_on_timestamp)}</span>
            </p>
            <p>
              Privacy level: <span>{getWishlistPrivacyLevelName(wishlistDetails.privacy_level)}</span>
            </p>
          </div>

          <div className='editing-container'>
            <div className='h-line'></div>

            <WishlistHeaderEditingContainer
              wishlistId={wishlistId}
              wishlistDetails={wishlistDetails}
              setWishlistDetails={setWishlistDetails}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}
