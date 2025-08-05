import cron from 'node-cron';

import { removeLightRateAbusers, replenishRateRequests } from './rateLimiterCronJobs';
import { minuteMilliseconds } from '../util/constants';
import { clearErrorLogs } from '../logs/errorLoggerCronJobs';

export function initCronJobs(): void {
  // every 30 seconds
  setInterval(async () => {
    await replenishRateRequests();
  }, minuteMilliseconds / 2);

  // every day
  cron.schedule('0 0 * * *', async () => {
    await removeLightRateAbusers();
    await clearErrorLogs();
  });

  console.log('CRON jobs started.');
}
