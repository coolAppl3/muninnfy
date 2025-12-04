export function generateCryptoUuid(): string {
  return crypto.randomUUID();
}

export function isValidUuid(uuid: string): boolean {
  if (uuid.length !== 36) {
    return false;
  }

  const regex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export function generateConfirmationCode(): string {
  // number 0, as well as uppercase and lowercase O, not included
  const allowedCodeCharacters: string = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let verificationCode: string = '';

  while (verificationCode.length < 6) {
    verificationCode += allowedCodeCharacters[Math.floor(Math.random() * allowedCodeCharacters.length)];
  }

  return verificationCode;
}

export function isValidConfirmationCode(verificationCode: any): boolean {
  if (typeof verificationCode !== 'string') {
    return false;
  }

  const regex: RegExp = /^[A-NP-Z1-9]{6}$/;
  return regex.test(verificationCode);
}
