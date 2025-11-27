import { createContext, Dispatch, SetStateAction } from 'react';

export type AccountLocation = 'overview' | 'details' | 'social';

export type AccountLocationContextType = {
  accountLocation: AccountLocation;
  setAccountLocation: Dispatch<SetStateAction<AccountLocation>>;
};

const AccountLocationContext = createContext<AccountLocationContextType | null>(null);
export default AccountLocationContext;
