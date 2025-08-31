import { containsInvalidWhitespace } from '../globalUtils';

export function isValidEmail(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp =
    /^(?=.{6,254}$)[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]{0,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}?(?:\.[a-zA-Z]{2,})*$/;
  return regex.test(value);
}

export function isValidNewPassword(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^[A-Za-z0-9_.!#$&]{8,40}$/;
  return regex.test(value);
}

export function isValidPassword(value: any): boolean {
  // meant for sign in attempts - doesn't over-validate

  if (typeof value !== 'string') {
    return false;
  }

  if (value.trim() === '' || value.includes(' ')) {
    return false;
  }

  if (value.length > 40) {
    return false;
  }

  return true;
}

export function isValidUsername(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^[A-Za-z0-9_.]{5,25}$/;
  return regex.test(value);
}

export function isValidDisplayName(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (containsInvalidWhitespace(value)) {
    return false;
  }

  const regex: RegExp = /^(?=.{1,25}$)(?!.*  )[A-Za-z]+(?: [A-Za-z]+)*$/;
  return regex.test(value);
}
