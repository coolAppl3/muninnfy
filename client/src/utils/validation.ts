export function validateEmail(value: string): string | null {
  if (value === '') {
    return 'A valid email is required.';
  }

  if (/\s/.test(value)) {
    return 'Email must not contain any whitespace.';
  }

  const regex: RegExp =
    /^(?=.{6,254}$)[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]{0,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}?(?:\.[a-zA-Z]{2,})*$/;
  if (!regex.test(value)) {
    return 'Invalid email format.';
  }

  return null;
}

export function validateNewPassword(value: string): string | null {
  if (value === '') {
    return 'A valid password is required.';
  }

  if (/\s/.test(value)) {
    return 'Password must not contain any whitespace.';
  }

  if (value.length < 8) {
    return 'Password must at least contain 8 characters.';
  }

  if (value.length > 40) {
    return 'Password must not exceed 40 characters.';
  }

  const regex: RegExp = /^[A-Za-z0-9_.!#$&]{8,40}$/;
  if (!regex.test(value)) {
    return 'Only English letters, numbers, and the following symbols are allowed: `_`, `.`, `!`, `#`, `$`, `&`.';
  }

  return null;
}

export function validatePassword(value: string): string | null {
  // meant for sign in attempts - doesn't over-validate

  if (value === '') {
    return 'A valid password is required.';
  }

  if (/\s/.test(value)) {
    return 'Password must not contain any whitespace.';
  }

  if (value.length > 40) {
    return 'Password must not exceed 40 characters.';
  }

  return null;
}

export function validateUsername(value: string): string | null {
  if (value === '') {
    return 'A valid username is required.';
  }

  if (/\s/.test(value)) {
    return 'Username must not contain any whitespace.';
  }

  if (value.length < 5) {
    return 'Username must at least contain 5 characters.';
  }

  if (value.length > 25) {
    return 'Username must not exceed 25 characters.';
  }

  const regex: RegExp = /^[A-Za-z0-9_.]{5,25}$/;
  if (!regex.test(value)) {
    return 'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.';
  }

  return null;
}

export function validateDisplayName(value: string): string | null {
  if (value === '') {
    return 'A valid display name is required.';
  }

  if (value !== value.trim()) {
    return 'Display name must not contain leading or trailing whitespace.';
  }

  if (/\s{2,}/.test(value)) {
    return 'Display name must not contain consecutive whitespaces';
  }

  if (value.length > 25) {
    return 'Display name must not exceed 25 characters.';
  }

  const regex: RegExp = /^(?=.{1,25}$)(?!.*  )[A-Za-z]+(?: [A-Za-z]+)*$/;
  if (!regex.test(value)) {
    return 'Only English letters and non-consecutive whitespaces are allowed.';
  }

  return null;
}

// --- --- ---

export function isValidUuid(uuid: string): boolean {
  if (uuid.length !== 36) {
    return false;
  }

  const regex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
