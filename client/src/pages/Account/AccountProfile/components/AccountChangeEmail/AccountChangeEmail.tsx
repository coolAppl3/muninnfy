import { JSX } from 'react';
import useAccountOngoingRequests from '../../../hooks/useAccountOngoingRequests';
import AccountChangeEmailStart from './components/AccountChangeEmailStart';
import AccountChangeEmailSuspended from './components/AccountChangeEmailSuspended';
import AccountChangeEmailConfirm from './components/AccountChangeEmailConfirm';

export default function AccountChangeEmail(): JSX.Element {
  const { ongoingEmailUpdateRequest } = useAccountOngoingRequests();

  if (!ongoingEmailUpdateRequest) {
    return <AccountChangeEmailStart />;
  }

  if (ongoingEmailUpdateRequest.is_suspended) {
    return <AccountChangeEmailSuspended />;
  }

  return <AccountChangeEmailConfirm />;
}
