export function isValidAuthSessionId(authSessionId: string): boolean {
  if (authSessionId.length !== 36) {
    return false;
  }

  const regex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(authSessionId);
}

interface AuthSessionDetails {
  account_id: number;
  expiry_timestamp: number;
}

export function isValidAuthSessionDetails(authSessionDetails: AuthSessionDetails): boolean {
  if (authSessionDetails.expiry_timestamp <= Date.now()) {
    return false;
  }

  return true;
}
