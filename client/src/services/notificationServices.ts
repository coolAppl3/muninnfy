import axios, { AxiosResponse } from 'axios';
import { NotificationDetails } from '../types/notificationTypes';

axios.defaults.withCredentials = true;
const notificationsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/notifications` : `https://muninnfy/api/notifications`;

export async function getNotificationsBatchService(
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<NotificationDetails[]>> {
  return axios.get(`${notificationsApiUrl}/${offset}`, { signal: abortSignal });
}
