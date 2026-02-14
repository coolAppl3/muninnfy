import cron from 'node-cron';
import { removeLightRateAbusersCron, removeStaleRateTrackerRowsCron, replenishRateRequestsCron } from './rateLimiterCronJobs';
import { clearErrorLogsCron } from '../logs/errorLoggerCronJobs';
import {
  deleteStaleAccountDeletionRequestsCron,
  deleteStaleAccountRecoveryRequestsCron,
  deleteStaleAccountVerificationRequestsCron,
  deleteStaleEmailUpdateRequestsCron,
  deleteUnverifiedAccountsCron,
} from './accountCronJobs';
import { minuteMilliseconds } from '../util/constants/globalConstants';
import { deleteExpiredAuthSessionsCron } from '../auth/authSessions';
import { decayWishlistsInteractivityIndexCron } from './wishlistCronJobs';
import { deleteStaleFollowRequestsCron } from './socialCronJobs';
import { destroyStaleWebSocketsCron } from './webSocketCronJobs';
import { deleteStaleNotificationsCron } from './notificationCronJobs';

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
    await deleteStaleEmailUpdateRequestsCron(currentTimestamp);
    await deleteStaleAccountRecoveryRequestsCron(currentTimestamp);
    await deleteStaleAccountDeletionRequestsCron(currentTimestamp);

    destroyStaleWebSocketsCron(currentTimestamp);
  });

  // every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    const currentTimestamp: number = Date.now();

    await decayWishlistsInteractivityIndexCron(currentTimestamp);
    await deleteStaleFollowRequestsCron(currentTimestamp);
  });

  // every day
  cron.schedule('0 0 * * *', async () => {
    const currentTimestamp: number = Date.now();

    await removeLightRateAbusersCron(currentTimestamp);
    await clearErrorLogsCron(currentTimestamp);
    await deleteStaleNotificationsCron;
  });

  console.log('CRON jobs started.');
}
