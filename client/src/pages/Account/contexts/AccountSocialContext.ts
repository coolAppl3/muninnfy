import { createContext, Dispatch, SetStateAction } from 'react';

export type AccountSocialSection = 'followers' | 'following' | 'followRequests' | 'findAccount';

export type AccountSocialContextType = {
  socialSection: AccountSocialSection;
  setSocialSection: Dispatch<SetStateAction<AccountSocialSection>>;

  menuIsOpen: boolean;
  setMenuIsOpen: Dispatch<SetStateAction<boolean>>;

  isSubmitting: boolean;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

const AccountSocialContext = createContext<AccountSocialContextType | null>(null);
export default AccountSocialContext;
