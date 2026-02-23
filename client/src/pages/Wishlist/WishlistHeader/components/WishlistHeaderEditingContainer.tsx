import { JSX } from 'react';
import useWishlistHeader from '../context/useWishlistHeader';
import EditWishlistTitleForm from './EditWishlistTitleForm';
import EditPrivacyLevelContainer from './EditPrivacyLevelContainer';
import DeleteWishlistForm from './DeleteWishlistForm';

export default function WishlistHeaderEditingContainer(): JSX.Element {
  const { editMode } = useWishlistHeader();

  if (editMode === 'title') {
    return <EditWishlistTitleForm />;
  }

  if (editMode === 'privacyLevel') {
    return <EditPrivacyLevelContainer />;
  }

  if (editMode === 'deleteWishlist') {
    return <DeleteWishlistForm />;
  }

  editMode;

  return <div className='h-[15rem] w-full'></div>;
}
