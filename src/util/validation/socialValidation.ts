import { isValidUuid } from '../tokenGenerator';

export function isValidSocialQuery(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^(?=.{1,25}$)(?=.*[A-Za-z0-9._])[A-Za-z0-9._\s]*$/;
  return regex.test(value);
}

export function isValidSocialFindQuery(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.includes('-')) {
    return isValidUuid(value);
  }

  const regex: RegExp = /^[A-Za-z0-9._]{3,25}$/;
  return regex.test(value);
}
