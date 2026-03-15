import { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';

type CheckForAuthSessionServiceData = {
  isValidAuthSession: boolean;
};

export function checkForAuthSessionService(abortSignal: AbortSignal): Promise<AxiosResponse<CheckForAuthSessionServiceData>> {
  return axiosInstance.get('/auth/session', { signal: abortSignal });
}

export function signOutService(): Promise<AxiosResponse> {
  return axiosInstance.delete('/auth/session');
}
