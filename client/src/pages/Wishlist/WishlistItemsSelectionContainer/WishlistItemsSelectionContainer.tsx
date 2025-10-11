import { JSX } from 'react';
import useWishlist from '../context/useWishlist';
import Container from '../../../components/Container/Container';

export default function WishlistItemsSelectionContainer(): JSX.Element {
  const { selectionModeActive } = useWishlist();

  if (!selectionModeActive) {
    return <></>;
  }

  return (
    <div>
      <Container>
        <div></div>
      </Container>
    </div>
  );
}
