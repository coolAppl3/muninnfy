import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountProfileContext, { AccountProfileContextType, AccountProfileSection } from './AccountProfileContext';

type AccountProfileProviderProps = {
  children: ReactNode;
};

export default function AccountProfileProvider({ children }: AccountProfileProviderProps): JSX.Element {
  const [section, setSection] = useState<AccountProfileSection | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contextValue: AccountProfileContextType = useMemo(
    () => ({
      section,
      setSection,

      menuIsOpen,
      setMenuIsOpen,

      isSubmitting,
      setIsSubmitting,
    }),
    [section, menuIsOpen, isSubmitting]
  );

  return <AccountProfileContext value={contextValue}>{children}</AccountProfileContext>;
}
