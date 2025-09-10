import { JSX } from 'react';
import useWishlistHeader from '../useWishlistHeader';
import { EditWishlistTitleForm } from './EditWishlistTitleForm';
import EditPrivacyLevelContainer from './EditPrivacyLevelContainer';
import { DeleteWishlistForm } from './DeleteWishlistForm';

export default function WishlistHeaderEditingContainer(): JSX.Element {
  const { editMode } = useWishlistHeader();

  if (editMode === 'TITLE') {
    return <EditWishlistTitleForm />;
  }

  if (editMode === 'PRIVACY_LEVEL') {
    return <EditPrivacyLevelContainer />;
  }

  if (editMode === 'DELETE_WISHLIST') {
    return <DeleteWishlistForm />;
  }

  return <div className='h-[15rem] w-full'></div>;
}
