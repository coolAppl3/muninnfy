"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationCode = exports.generateCryptoUuid = void 0;
function generateCryptoUuid() {
    return crypto.randomUUID();
}
exports.generateCryptoUuid = generateCryptoUuid;
function generateVerificationCode() {
    const allowedCodeCharacters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
    let verificationCode = '';
    while (verificationCode.length < 6) {
        verificationCode += allowedCodeCharacters[Math.floor(Math.random() * allowedCodeCharacters.length)];
    }
    return verificationCode;
}
exports.generateVerificationCode = generateVerificationCode;
