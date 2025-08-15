import cron from 'node-cron';

import { removeLightRateAbusers, replenishRateRequests } from './rateLimiterCronJobs';
import { minuteMilliseconds } from '../util/constants';
import { clearErrorLogs } from '../logs/errorLoggerCronJobs';

export function initCronJobs(): void {
  // every 30 seconds
  setInterval(async () => {
    const currentTimestamp: number = Date.now();

    await replenishRateRequests(currentTimestamp);
  }, minuteMilliseconds / 2);

  // every day
  cron.schedule('0 0 * * *', async () => {
    const currentTimestamp: number = Date.now();

    await removeLightRateAbusers(currentTimestamp);
    await clearErrorLogs(currentTimestamp);
  });

  console.log('CRON jobs started.');
}
