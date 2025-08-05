export function isValidAuthSessionId(authSessionId: string): boolean {
  if (authSessionId.length !== 32) {
    return false;
  }

  const regex: RegExp = /^[A-Za-z0-9]{32}$/;
  return regex.test(authSessionId);
}

interface AuthSessionDetails {
  user_id: number;
  expiry_timestamp: number;
}

export function isValidAuthSessionDetails(authSessionDetails: AuthSessionDetails): boolean {
  if (authSessionDetails.expiry_timestamp <= Date.now()) {
    return false;
  }

  return true;
}
