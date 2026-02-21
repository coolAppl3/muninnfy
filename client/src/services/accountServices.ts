import axios, { AxiosResponse } from 'axios';
import { AccountDetailsType, OngoingAccountRequest } from '../types/accountTypes';

axios.defaults.withCredentials = true;
const accountsApiUrl: string = location.hostname === 'localhost' ? `http://localhost:5000/api/accounts` : `https://muninnfy/api/accounts`;

type SignUpServicePayload = {
  email: string;
  username: string;
  password: string;
  displayName: string;
};

type SignUpServiceData = {
  publicAccountId: string;
};

export function signUpService(body: SignUpServicePayload): Promise<AxiosResponse<SignUpServiceData>> {
  return axios.post(`${accountsApiUrl}/signUp`, body);
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
  return axios.post(`${accountsApiUrl}/verification/continue`, body);
}

type ResendAccountVerificationEmailServicePayload = {
  publicAccountId: string;
};

export function resendAccountVerificationEmailService(body: ResendAccountVerificationEmailServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/verification/resendEmail`, body);
}

type VerifyAccountServicePayload = {
  publicAccountId: string;
  verificationToken: string;
};

export function verifyAccountService(body: VerifyAccountServicePayload, abortSignal: AbortSignal): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/verification/verify`, body, { signal: abortSignal });
}

type SignInServicePayload = {
  email: string;
  password: string;
  keepSignedIn: boolean;
};

export function signInService(body: SignInServicePayload): Promise<AxiosResponse> {
  return axios.post(`${accountsApiUrl}/signIn`, body);
}

type GetAccountDetailsServiceData = {
  accountDetails: AccountDetailsType;
  ongoingEmailUpdateRequest: (OngoingAccountRequest & { new_email: string }) | null;
  ongoingAccountDeletionRequest: OngoingAccountRequest | null;
};

export function getAccountDetailsService(abortSignal: AbortSignal): Promise<AxiosResponse<GetAccountDetailsServiceData>> {
  return axios.get(accountsApiUrl, { signal: abortSignal });
}

type UpdateAccountPrivacyServicePayload = {
  isPrivate: boolean;
  approveFollowRequests: boolean;
};

export function updateAccountPrivacyService(body: UpdateAccountPrivacyServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/details/privacy`, body);
}

type UpdateDisplayNameServicePayload = {
  newDisplayName: string;
};

export function updateDisplayNameService(body: UpdateDisplayNameServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/details/displayName`, body);
}

type UpdatePasswordServicePayload = {
  password: string;
  newPassword: string;
};

export function updatePasswordService(body: UpdatePasswordServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/details/password`, body);
}

type StartEmailUpdateServicePayload = {
  newEmail: string;
  password: string;
};

type StartEmailUpdateServiceData = {
  expiryTimestamp: number;
};

export function startEmailUpdateService(body: StartEmailUpdateServicePayload): Promise<AxiosResponse<StartEmailUpdateServiceData>> {
  return axios.post(`${accountsApiUrl}/details/email/start`, body);
}

export function resendEmailUpdateEmailService(): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/details/email/resendEmail`);
}

type ConfirmEmailUpdateServicePayload = {
  confirmationCode: string;
};

export function confirmEmailUpdateService(body: ConfirmEmailUpdateServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/details/email/confirm`, body);
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
  return axios.post(`${accountsApiUrl}/recovery/start`, body);
}

type ResendAccountRecoveryEmailServicePayload = {
  publicAccountId: string;
};

export function resendAccountRecoveryEmailService(body: ResendAccountRecoveryEmailServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/recovery/resendEmail`, body);
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
  return axios.patch(`${accountsApiUrl}/recovery/confirm`, body);
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
  return axios.post(`${accountsApiUrl}/deletion/start`, body);
}

export function resendAccountDeletionEmailService(): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/deletion/resendEmail`);
}

export function confirmAccountDeletionService(confirmationCode: string): Promise<AxiosResponse> {
  return axios.delete(`${accountsApiUrl}/deletion/confirm/${confirmationCode}`);
}
