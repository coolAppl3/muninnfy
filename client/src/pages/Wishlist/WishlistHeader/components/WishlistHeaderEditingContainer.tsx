import { Dispatch, JSX, SetStateAction } from 'react';
import { WishlistDetails } from '../../../../services/wishlistServices';
import useWishlistHeader from '../useWishlistHeader';
import { EditWishlistTitleForm } from './EditWishlistTitleForm';
import EditPrivacyLevelContainer from './EditPrivacyLevelContainer';
import { DeleteWishlistForm } from './DeleteWishlistForm';

export default function WishlistHeaderEditingContainer({
  wishlistId,
  wishlistDetails,
  setWishlistDetails,
}: {
  wishlistId: string;
  wishlistDetails: WishlistDetails;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetails | null>>;
}): JSX.Element {
  const { editMode } = useWishlistHeader();

  if (!editMode) {
    // meant to smooth out the header's collapse animation
    return <div className='h-[15rem] w-full'></div>;
  }

  if (editMode === 'TITLE') {
    return (
      <EditWishlistTitleForm
        wishlistId={wishlistId}
        setWishlistDetails={setWishlistDetails}
      />
    );
  }

  if (editMode === 'PRIVACY_LEVEL') {
    return (
      <EditPrivacyLevelContainer
        wishlistId={wishlistId}
        wishlistDetails={wishlistDetails}
        setWishlistDetails={setWishlistDetails}
      />
    );
  }

  return (
    <DeleteWishlistForm
      wishlistId={wishlistId}
      wishlistDetails={wishlistDetails}
    />
  );
}
