import crypto from 'node:crypto';

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

export function generateHexCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function isValidHexCode(hexCode: any): boolean {
  if (typeof hexCode !== 'string') {
    return false;
  }

  const regex: RegExp = /^[A-F0-9]{8}$/;
  return regex.test(hexCode);
}
