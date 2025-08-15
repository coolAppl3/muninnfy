import cron from 'node-cron';

import { removeLightRateAbusersCron, replenishRateRequestsCron } from './rateLimiterCronJobs';
import { minuteMilliseconds } from '../util/constants';
import { clearErrorLogsCron } from '../logs/errorLoggerCronJobs';

export function initCronJobs(): void {
  // every 30 seconds
  setInterval(async () => {
    const currentTimestamp: number = Date.now();

    await replenishRateRequestsCron(currentTimestamp);
  }, minuteMilliseconds / 2);

  // every day
  cron.schedule('0 0 * * *', async () => {
    const currentTimestamp: number = Date.now();

    await removeLightRateAbusersCron(currentTimestamp);
    await clearErrorLogsCron(currentTimestamp);
  });

  console.log('CRON jobs started.');
}
