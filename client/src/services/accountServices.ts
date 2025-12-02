import axios, { AxiosResponse } from 'axios';
import { AccountDetailsType } from '../types/accountTypes';

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
};

export function getAccountDetailsService(abortSignal: AbortSignal): Promise<AxiosResponse<GetAccountDetailsServiceData>> {
  return axios.get(accountsApiUrl, { signal: abortSignal });
}

type UpdateAccountPrivacyServiceData = {
  isPrivate: boolean;
  approveFollowRequests: boolean;
};

export function updateAccountPrivacyService(body: UpdateAccountPrivacyServiceData): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/details/privacy`, body);
}
