export function isValidSocialQuery(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^(?=.{1,25}$)(?=.*[A-Za-z0-9._])[A-Za-z0-9._\s]*$/;
  return regex.test(value);
}
