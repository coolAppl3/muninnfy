import { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';
import {
  AccountDetailsType,
  OngoingAccountRequest,
  ViewAccountDetailsType,
} from '../types/accountTypes';

type SignUpServicePayload = {
  dateOfBirthTimestamp: number;
  email: string;
  username: string;
  password: string;
  displayName: string;
};

type SignUpServiceData = {
  publicAccountId: string;
};

export function signUpService(
  body: SignUpServicePayload
): Promise<AxiosResponse<SignUpServiceData>> {
  return axiosInstance.post(`/accounts/signUp`, body);
}

type ContinueAccountVerificationServicePayload = {
  email: string;
};

type ContinueAccountVerificationServiceData = {
  publicAccountId: string;
};

export function continueAccountVerificationService(
  body: ContinueAccountVerificationServicePayload
): Promise<AxiosResponse<ContinueAccountVerificationServiceData>> {
  return axiosInstance.post('/accounts/verification/continue', body);
}

type ResendAccountVerificationEmailServicePayload = {
  publicAccountId: string;
};

export function resendAccountVerificationEmailService(
  body: ResendAccountVerificationEmailServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/verification/resendEmail', body);
}

type VerifyAccountServicePayload = {
  publicAccountId: string;
  verificationToken: string;
};

type VerifyAccountServiceData = {
  authSessionCreated: boolean;
};

export function confirmAccountVerificationService(
  body: VerifyAccountServicePayload,
  abortSignal: AbortSignal
): Promise<AxiosResponse<VerifyAccountServiceData>> {
  return axiosInstance.patch('/accounts/verification/confirm', body, { signal: abortSignal });
}

type SignInServicePayload = {
  email: string;
  password: string;
  keepSignedIn: boolean;
};

export function signInService(body: SignInServicePayload): Promise<AxiosResponse> {
  return axiosInstance.post('/accounts/signIn', body);
}

type GetAccountDetailsServiceData = {
  accountDetails: AccountDetailsType;
  ongoingEmailUpdateRequest: (OngoingAccountRequest & { new_email: string }) | null;
  ongoingAccountDeletionRequest: OngoingAccountRequest | null;
};

export function getAccountDetailsService(
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetAccountDetailsServiceData>> {
  return axiosInstance.get('/accounts', { signal: abortSignal });
}

type GetViewAccountDetailsServiceData = {
  viewAccountDetails: ViewAccountDetailsType;
};

export function getViewAccountDetailsService(
  publicAccountId: string,
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetViewAccountDetailsServiceData>> {
  return axiosInstance.get(`/accounts/${publicAccountId}`, { signal: abortSignal });
}

type UpdateAccountPrivacyServicePayload = {
  isPrivate: boolean;
  approveFollowRequests: boolean;
};

export function updateAccountPrivacyService(
  body: UpdateAccountPrivacyServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/details/privacy', body);
}

type UpdateDisplayNameServicePayload = {
  newDisplayName: string;
};

export function updateDisplayNameService(
  body: UpdateDisplayNameServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/details/displayName', body);
}

type UpdatePasswordServicePayload = {
  password: string;
  newPassword: string;
};

export function updatePasswordService(
  body: UpdatePasswordServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/details/password', body);
}

type StartEmailUpdateServicePayload = {
  newEmail: string;
  password: string;
};

type StartEmailUpdateServiceData = {
  expiryTimestamp: number;
};

export function startEmailUpdateService(
  body: StartEmailUpdateServicePayload
): Promise<AxiosResponse<StartEmailUpdateServiceData>> {
  return axiosInstance.post('/accounts/details/email/start', body);
}

export function resendEmailUpdateEmailService(): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/details/email/resendEmail');
}

type ConfirmEmailUpdateServicePayload = {
  confirmationCode: string;
};

export function confirmEmailUpdateService(
  body: ConfirmEmailUpdateServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/details/email/confirm', body);
}

type StartAccountRecoveryServicePayload = {
  email: string;
};

type StartAccountRecoveryServiceData = {
  publicAccountId: string;
};

export function startAccountRecoveryService(
  body: StartAccountRecoveryServicePayload
): Promise<AxiosResponse<StartAccountRecoveryServiceData>> {
  return axiosInstance.post('/accounts/recovery/start', body);
}

type ResendAccountRecoveryEmailServicePayload = {
  publicAccountId: string;
};

export function resendAccountRecoveryEmailService(
  body: ResendAccountRecoveryEmailServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/recovery/resendEmail', body);
}

type ConfirmAccountRecoveryServicePayload = {
  publicAccountId: string;
  recoveryToken: string;
  newPassword: string;
};

type confirmAccountRecoveryServiceData = {
  authSessionCreated: boolean;
};

export function confirmAccountRecoveryService(
  body: ConfirmAccountRecoveryServicePayload
): Promise<AxiosResponse<confirmAccountRecoveryServiceData>> {
  return axiosInstance.patch('/accounts/recovery/confirm', body);
}

type StartAccountDeletionServicePayload = {
  password: string;
};

type StartAccountDeletionServiceData = {
  expiryTimestamp: number;
};

export function startAccountDeletionService(
  body: StartAccountDeletionServicePayload
): Promise<AxiosResponse<StartAccountDeletionServiceData>> {
  return axiosInstance.post('/accounts/deletion/start', body);
}

export function resendAccountDeletionEmailService(): Promise<AxiosResponse> {
  return axiosInstance.patch('/accounts/deletion/resendEmail');
}

export function confirmAccountDeletionService(
  confirmationCode: string
): Promise<AxiosResponse> {
  return axiosInstance.delete(`/accounts/deletion/confirm/${confirmationCode}`);
}
