import { OngoingAccountRequest } from '../../../../types/accountTypes';

export function isValidOngoingRequestData(errResData: unknown): errResData is OngoingAccountRequest {
  if (typeof errResData !== 'object' || errResData === null) {
    return false;
  }

  if (
    !('expiry_timestamp' in errResData) ||
    typeof errResData.expiry_timestamp !== 'number' ||
    !Number.isInteger(errResData.expiry_timestamp)
  ) {
    return false;
  }

  if (!('is_suspended' in errResData) || typeof errResData.is_suspended !== 'boolean') {
    return false;
  }

  return true;
}

export function resDataContainsExpiryTimestamp(errResData: unknown): errResData is { expiryTimestamp: number } {
  if (typeof errResData !== 'object' || errResData === null) {
    return false;
  }

  if (
    !('expiryTimestamp' in errResData) ||
    typeof errResData.expiryTimestamp !== 'number' ||
    !Number.isInteger(errResData.expiryTimestamp)
  ) {
    return false;
  }

  return true;
}
