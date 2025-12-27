import { createContext, Dispatch, SetStateAction } from 'react';

export type AccountSocialSection = 'FOLLOWERS' | 'FOLLOWING' | 'FOLLOW_REQUESTS' | 'FIND_ACCOUNT';

export type AccountSocialContextType = {
  socialSection: AccountSocialSection | null;
  setSocialSection: Dispatch<SetStateAction<AccountSocialSection | null>>;

  menuIsOpen: boolean;
  setMenuIsOpen: Dispatch<SetStateAction<boolean>>;

  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

const AccountSocialContext = createContext<AccountSocialContextType | null>(null);
export default AccountSocialContext;
