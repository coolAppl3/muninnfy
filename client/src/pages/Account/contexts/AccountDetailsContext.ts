import { createContext, Dispatch, SetStateAction } from 'react';
import { AccountDetailsType } from '../../../types/accountTypes';

export type AccountDetailsContextType = {
  accountDetails: AccountDetailsType;
  setAccountDetails: Dispatch<SetStateAction<AccountDetailsType>>;
};

const AccountDetailsContext = createContext<AccountDetailsContextType | null>(null);
export default AccountDetailsContext;
