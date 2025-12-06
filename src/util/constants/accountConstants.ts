import { dayMilliseconds, hourMilliseconds, minuteMilliseconds } from '../constants/globalConstants';

export const ACCOUNT_FAILED_SIGN_IN_LIMIT: number = 5;
export const ACCOUNT_FAILED_UPDATE_LIMIT: number = 3;
export const ACCOUNT_EMAILS_SENT_LIMIT: number = 3;

export const ACCOUNT_VERIFICATION_WINDOW: number = minuteMilliseconds * 20;
export const ACCOUNT_RECOVERY_WINDOW: number = hourMilliseconds;
export const ACCOUNT_DELETION_WINDOW: number = hourMilliseconds;
export const ACCOUNT_EMAIL_UPDATE_WINDOW: number = hourMilliseconds;

export const ACCOUNT_UPDATE_SUSPENSION_DURATION: number = dayMilliseconds;
