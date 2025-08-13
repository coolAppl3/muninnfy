export function generateCryptoUuid(): string {
  return crypto.randomUUID();
}

export function generateVerificationCode(): string {
  // number 0, as well as uppercase and lowercase O, not included
  const allowedCodeCharacters: string = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let verificationCode: string = '';

  while (verificationCode.length < 6) {
    verificationCode += allowedCodeCharacters[Math.floor(Math.random() * allowedCodeCharacters.length)];
  }

  return verificationCode;
}
