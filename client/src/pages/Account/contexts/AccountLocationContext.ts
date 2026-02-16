import { createContext, Dispatch, SetStateAction } from 'react';

export type AccountLocation = 'profile' | 'social' | 'notifications';

export type AccountLocationContextType = {
  accountLocation: AccountLocation;
  setAccountLocation: Dispatch<SetStateAction<AccountLocation>>;
};

const AccountLocationContext = createContext<AccountLocationContextType | null>(null);
export default AccountLocationContext;
