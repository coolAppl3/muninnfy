import cron from 'node-cron';

import { removeLightRateAbusersCron, removeStaleRateTrackerRowsCron, replenishRateRequestsCron } from './rateLimiterCronJobs';
import { clearErrorLogsCron } from '../logs/errorLoggerCronJobs';
import { deleteStaleAccountVerificationRequestsCron, deleteUnverifiedAccountsCron } from './accountCronJobs';
import { minuteMilliseconds } from '../util/constants/globalConstants';
import { deleteExpiredAuthSessionsCron } from '../auth/authSessions';

export function initCronJobs(): void {
  // every 30 seconds
  setInterval(async () => {
    const currentTimestamp: number = Date.now();

    await replenishRateRequestsCron(currentTimestamp);
  }, minuteMilliseconds / 2);

  // every minute
  cron.schedule('* * * * *', async () => {
    const currentTimestamp: number = Date.now();

    await deleteExpiredAuthSessionsCron(currentTimestamp);
    await removeStaleRateTrackerRowsCron(currentTimestamp);
    await deleteUnverifiedAccountsCron(currentTimestamp);
    await deleteStaleAccountVerificationRequestsCron(currentTimestamp);
  });

  // every day
  cron.schedule('0 0 * * *', async () => {
    const currentTimestamp: number = Date.now();

    await removeLightRateAbusersCron(currentTimestamp);
    await clearErrorLogsCron(currentTimestamp);
  });

  console.log('CRON jobs started.');
}
