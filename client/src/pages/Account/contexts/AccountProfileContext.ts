import { createContext, Dispatch, SetStateAction } from 'react';

export type AccountProfileSection = 'privacySettings' | 'changeDisplayName' | 'changeEmail' | 'changePassword' | 'deleteAccount';

export type AccountProfileContextType = {
  profileSection: AccountProfileSection | null;
  setProfileSection: Dispatch<SetStateAction<AccountProfileSection | null>>;

  menuIsOpen: boolean;
  setMenuIsOpen: Dispatch<SetStateAction<boolean>>;

  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

const AccountProfileContext = createContext<AccountProfileContextType | null>(null);
export default AccountProfileContext;
