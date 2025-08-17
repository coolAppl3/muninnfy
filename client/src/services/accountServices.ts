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
