import { createContext, Dispatch, SetStateAction } from 'react';

export type WishlistHeaderEditMode = 'TITLE' | 'PRIVACY_LEVEL' | 'DELETE_WISHLIST';

export type WishlistHeaderContextType = {
  editMode: WishlistHeaderEditMode | null;
  setEditMode: Dispatch<SetStateAction<WishlistHeaderEditMode | null>>;

  menuIsOpen: boolean;
  setMenuIsOpen: Dispatch<SetStateAction<boolean>>;

  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

const WishlistHeaderContext = createContext<WishlistHeaderContextType | null>(null);
export default WishlistHeaderContext;
