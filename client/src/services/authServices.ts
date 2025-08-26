import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const authApiUrl: string = location.hostname === 'localhost' ? `http://localhost:5000/api/auth` : `https://muninnfy/api/auth`;

export function getAuthSessionService(): Promise<AxiosResponse> {
  return axios.get(`${authApiUrl}/session`);
}

export function signOutService(): Promise<AxiosResponse> {
  return axios.delete(`${authApiUrl}/session`);
}
