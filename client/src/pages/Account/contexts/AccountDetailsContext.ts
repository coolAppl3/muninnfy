import { createContext, Dispatch, SetStateAction } from 'react';
import { AccountDetailsType } from '../../../types/accountTypes';

export type AccountDetailsContextType = {
  accountDetails: AccountDetailsType | null;
  setAccountDetails: Dispatch<SetStateAction<AccountDetailsType | null>>;
};

const AccountDetailsContext = createContext<AccountDetailsContextType | null>(null);
export default AccountDetailsContext;
