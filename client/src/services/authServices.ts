import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const authApiUrl: string = location.hostname === 'localhost' ? `http://localhost:5000/api/auth` : `https://muninnfy/api/auth`;

interface GetAuthSessionServiceData {
  isValidAuthSession: boolean;
}

export function checkForAuthSessionService(abortSignal: AbortSignal): Promise<AxiosResponse<GetAuthSessionServiceData>> {
  return axios.get(`${authApiUrl}/session`, { signal: abortSignal });
}

export function signOutService(): Promise<AxiosResponse> {
  return axios.delete(`${authApiUrl}/session`);
}
