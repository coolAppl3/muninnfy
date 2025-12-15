import { createContext, Dispatch, SetStateAction } from 'react';

export type AccountProfileSection = 'PRIVACY_SETTINGS' | 'CHANGE_DISPLAY_NAME' | 'CHANGE_EMAIL' | 'CHANGE_PASSWORD' | 'DELETE_ACCOUNT';

export type AccountProfileContextType = {
  section: AccountProfileSection | null;
  setSection: Dispatch<SetStateAction<AccountProfileSection | null>>;

  menuIsOpen: boolean;
  setMenuIsOpen: Dispatch<SetStateAction<boolean>>;

  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

const AccountProfileContext = createContext<AccountProfileContextType | null>(null);
export default AccountProfileContext;
