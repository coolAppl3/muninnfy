export const minuteMilliseconds: number = 1000 * 60;
export const hourMilliseconds: number = minuteMilliseconds * 60;
export const dayMilliseconds: number = hourMilliseconds * 24;

export const ACCOUNT_FAILED_SIGN_IN_LIMIT: number = 5;
export const ACCOUNT_FAILED_UPDATE_LIMIT: number = 3;
export const ACCOUNT_EMAILS_SENT_LIMIT: number = 3;
export const ACCOUNT_VERIFICATION_WINDOW: number = minuteMilliseconds * 20;
export const ACCOUNT_RECOVERY_WINDOW: number = hourMilliseconds;
export const ACCOUNT_DELETION_WINDOW: number = hourMilliseconds;
export const ACCOUNT_EMAIL_UPDATE_WINDOW: number = dayMilliseconds;
export const ACCOUNT_DELETION_SUSPENSION_DURATION: number = dayMilliseconds;

export const REQUESTS_RATE_LIMIT: number = 60;
export const LIGHT_DAILY_RATE_ABUSE_COUNT: number = 10;

export const AUTH_SESSIONS_LIMIT: number = 3;
