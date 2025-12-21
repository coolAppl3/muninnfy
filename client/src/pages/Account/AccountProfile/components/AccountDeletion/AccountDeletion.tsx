import { JSX } from 'react';
import useAccountOngoingRequests from '../../../hooks/useAccountOngoingRequests';
import AccountDeletionStart from './components/AccountDeletionStart';
import AccountDeletionSuspended from './components/AccountDeletionSuspended';
import AccountDeletionConfirm from './components/AccountDeletionConfirm';

export default function AccountDeletion(): JSX.Element {
  const { ongoingAccountDeletionRequest } = useAccountOngoingRequests();

  if (!ongoingAccountDeletionRequest) {
    return <AccountDeletionStart />;
  }

  if (ongoingAccountDeletionRequest.is_suspended) {
    return <AccountDeletionSuspended />;
  }

  return <AccountDeletionConfirm />;
}
