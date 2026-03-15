import { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';
import { NotificationDetails } from '../types/notificationTypes';

export async function getNotificationsBatchService(
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<NotificationDetails[]>> {
  return axiosInstance.get(`/notifications/${offset}`, { signal: abortSignal });
}
