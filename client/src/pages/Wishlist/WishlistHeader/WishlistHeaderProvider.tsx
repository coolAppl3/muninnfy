import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistHeaderContext, { WishlistHeaderContextInterface, WishlistHeaderEditMode } from './WishlistHeaderContext';

export default function WishlistHeaderProvider({ children }: { children: ReactNode }): JSX.Element {
  const [editMode, setEditMode] = useState<WishlistHeaderEditMode | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contextValue: WishlistHeaderContextInterface = useMemo(
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

  return <WishlistHeaderContext.Provider value={contextValue}>{children}</WishlistHeaderContext.Provider>;
}
