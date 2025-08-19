import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const accountsApiUrl: string = location.hostname === 'localhost' ? `http://localhost:5000/api/accounts` : `https://muninnfy/api/accounts`;

interface SignUpServicePayload {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

interface SignUpServiceData {
  publicAccountId: string;
}

export function signUpService(body: SignUpServicePayload): Promise<AxiosResponse<SignUpServiceData>> {
  return axios.post(`${accountsApiUrl}/signUp`, body);
}

interface ResendVerificationEmailPayload {
  publicAccountId: string;
}

export function resendAccountVerificationEmailService(body: ResendVerificationEmailPayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/verification/resendEmail`, body);
}

interface VerifyAccountPayload {
  publicAccountId: string;
  verificationToken: string;
}

export function verifyAccountService(body: VerifyAccountPayload): Promise<AxiosResponse> {
  return axios.patch(`${accountsApiUrl}/verification/verify`, body);
}

interface SignInPayload {
  email: string;
  password: string;
  keepSignedIn: boolean;
}

export function signInService(body: SignInPayload): Promise<AxiosResponse> {
  return axios.post(`${accountsApiUrl}/signIn`, body);
}
