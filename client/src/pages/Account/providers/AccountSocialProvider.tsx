import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountSocialContext, { AccountSocialContextType, AccountSocialSection } from '../contexts/AccountSocialContext';

type AccountSocialProviderProps = {
  children: ReactNode;
};

export default function AccountSocialProvider({ children }: AccountSocialProviderProps): JSX.Element {
  const [socialSection, setSocialSection] = useState<AccountSocialSection | null>(null);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const contextValue: AccountSocialContextType = useMemo(
    () => ({
      socialSection,
      setSocialSection,

      menuIsOpen,
      setMenuIsOpen,

      isSubmitting,
      setIsSubmitting,
    }),
    [socialSection, menuIsOpen, isSubmitting]
  );

  return <AccountSocialContext value={contextValue}>{children}</AccountSocialContext>;
}
