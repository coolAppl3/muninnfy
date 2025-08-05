export function generateCryptoUuid(): string {
  return crypto.randomUUID();
}

export function generateVerificationCode(): string {
  const allowedCodeCharacters: string = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789'; // uppercase and lowercase O not included
  let verificationCode: string = '';

  while (verificationCode.length < 6) {
    verificationCode += allowedCodeCharacters[Math.floor(Math.random() * allowedCodeCharacters.length)];
  }

  return verificationCode;
}
