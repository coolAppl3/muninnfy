import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountProfileContext, { AccountProfileContextType, AccountProfileSection } from '../contexts/AccountProfileContext';

type AccountProfileProviderProps = {
  children: ReactNode;
};

export default function AccountProfileProvider({ children }: AccountProfileProviderProps): JSX.Element {
  const [profileSection, setProfileSection] = useState<AccountProfileSection | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contextValue: AccountProfileContextType = useMemo(
    () => ({
      profileSection,
      setProfileSection,

      menuIsOpen,
      setMenuIsOpen,

      isSubmitting,
      setIsSubmitting,
    }),
    [profileSection, menuIsOpen, isSubmitting]
  );

  return <AccountProfileContext value={contextValue}>{children}</AccountProfileContext>;
}
