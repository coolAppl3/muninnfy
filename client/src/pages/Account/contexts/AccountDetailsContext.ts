import { createContext, Dispatch, SetStateAction } from 'react';
import { AccountDetailsType, OngoingAccountRequest } from '../../../types/accountTypes';

export type AccountDetailsContextType = {
  accountDetails: AccountDetailsType;
  setAccountDetails: Dispatch<SetStateAction<AccountDetailsType>>;

  ongoingEmailUpdateRequest: (OngoingAccountRequest & { new_email: string }) | null;
  setOngoingEmailUpdateRequest: Dispatch<SetStateAction<(OngoingAccountRequest & { new_email: string }) | null>>;

  ongoingAccountDeletionRequest: OngoingAccountRequest | null;
  setOngoingAccountDeletionRequest: Dispatch<SetStateAction<OngoingAccountRequest | null>>;
};

const AccountDetailsContext = createContext<AccountDetailsContextType | null>(null);
export default AccountDetailsContext;
