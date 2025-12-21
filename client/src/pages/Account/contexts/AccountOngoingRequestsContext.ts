import { createContext, Dispatch, SetStateAction } from 'react';
import { OngoingAccountRequest } from '../../../types/accountTypes';

export type AccountOngoingRequestsContextType = {
  ongoingEmailUpdateRequest: (OngoingAccountRequest & { new_email: string }) | null;
  setOngoingEmailUpdateRequest: Dispatch<SetStateAction<(OngoingAccountRequest & { new_email: string }) | null>>;

  ongoingAccountDeletionRequest: OngoingAccountRequest | null;
  setOngoingAccountDeletionRequest: Dispatch<SetStateAction<OngoingAccountRequest | null>>;
};

const AccountOngoingRequestsContext = createContext<AccountOngoingRequestsContextType | null>(null);
export default AccountOngoingRequestsContext;
