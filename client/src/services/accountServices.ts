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

type ResendVerificationEmailPayload = {
  publicAccountId: string;
};

export function resendAccountVerificationEmailService(body: ResendVerificationEmailPayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/verification/resendEmail`, body);
}

type VerifyAccountPayload = {
  publicAccountId: string;
  verificationToken: string;
};

export function verifyAccountService(body: VerifyAccountPayload, abortSignal: AbortSignal): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/verification/verify`, body, { signal: abortSignal });
}

type SignInPayload = {
  email: string;
  password: string;
  keepSignedIn: boolean;
};

export function signInService(body: SignInPayload): Promise<AxiosResponse> {
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
