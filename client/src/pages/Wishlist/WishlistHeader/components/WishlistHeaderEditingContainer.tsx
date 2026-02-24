import { ComponentType, JSX } from 'react';
import useWishlistHeader from '../context/useWishlistHeader';
import EditWishlistTitleForm from './EditWishlistTitleForm';
import EditPrivacyLevelContainer from './EditPrivacyLevelContainer';
import DeleteWishlistForm from './DeleteWishlistForm';
import { WishlistHeaderEditMode } from '../context/WishlistHeaderContext';

export default function WishlistHeaderEditingContainer(): JSX.Element {
  const { editMode } = useWishlistHeader();

  if (!editMode) {
    return <div className='h-[15rem] w-full'></div>;
  }

  const MappedComponent: ComponentType = componentRecord[editMode];
  return <MappedComponent />;
}

const componentRecord: Record<WishlistHeaderEditMode, ComponentType> = {
  title: EditWishlistTitleForm,
  privacyLevel: EditPrivacyLevelContainer,
  deleteWishlist: DeleteWishlistForm,
};
