import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistHeaderContext, { WishlistHeaderContextType, WishlistHeaderEditMode } from './WishlistHeaderContext';

type WishlistHeaderProviderProps = {
  children: ReactNode;
};

export default function WishlistHeaderProvider({ children }: WishlistHeaderProviderProps): JSX.Element {
  const [editMode, setEditMode] = useState<WishlistHeaderEditMode | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contextValue: WishlistHeaderContextType = useMemo(
    () => ({
      editMode,
      setEditMode,

      menuIsOpen,
      setMenuIsOpen,

      isSubmitting,
      setIsSubmitting,
    }),
    [editMode, menuIsOpen, isSubmitting]
  );

  return <WishlistHeaderContext value={contextValue}>{children}</WishlistHeaderContext>;
}
