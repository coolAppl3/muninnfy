"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRouter = void 0;
const express_1 = __importDefault(require("express"));
const requestValidation_1 = require("../util/validation/requestValidation");
const userValidation_1 = require("../util/validation/userValidation");
const cookieUtils_1 = require("../util/cookieUtils");
const db_1 = require("../db/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generatePlaceHolders_1 = require("../util/sqlUtils/generatePlaceHolders");
const tokenGenerator_1 = require("../util/tokenGenerator");
const constants_1 = require("../util/constants");
const emailServices_1 = require("../util/email/emailServices");
const isSqlError_1 = require("../util/sqlUtils/isSqlError");
const errorLogger_1 = require("../logs/errorLogger");
exports.accountsRouter = express_1.default.Router();
exports.accountsRouter.post('/signUp', async (req, res) => {
    const requestData = req.body;
    const expectedKeys = ['email', 'username', 'password', 'displayName'];
    if ((0, requestValidation_1.undefinedValuesDetected)(requestData, expectedKeys)) {
        res.status(400).json({ message: 'Invalid request data.' });
        return;
    }
    if (!(0, userValidation_1.isValidEmail)(requestData.email)) {
        res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
        return;
    }
    if (!(0, userValidation_1.isValidUsername)(requestData.username)) {
        res.status(400).json({ message: 'Invalid username.', reason: 'invalidUsername' });
        return;
    }
    if (!(0, userValidation_1.isValidNewPassword)(requestData.password)) {
        res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
        return;
    }
    if (!(0, userValidation_1.isValidDisplayName)(requestData.displayName)) {
        res.status(400).json({ message: 'Invalid display name', reason: 'invalidDisplayName' });
        return;
    }
    if (requestData.username === requestData.password) {
        res.status(409).json({ message: 'Username and password must not be identical.', reason: 'passwordMatchesUsername' });
        return;
    }
    const isSignedIn = (0, cookieUtils_1.getRequestCookie)(req, 'authSessionId') !== null;
    if (isSignedIn) {
        res.status(403).json({ message: 'You must sign out before being able to create a new account.', reason: 'signedIn' });
        return;
    }
    let connection;
    try {
        connection = await db_1.dbPool.getConnection();
        await connection.execute(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
        await connection.beginTransaction();
        const [takenStatusRows] = await connection.execute(`SELECT
        EXISTS (SELECT 1 FROM accounts WHERE email = ?) AS email_taken,
        EXISTS (SELECT 1 FROM accounts WHERE username = ?) AS username_taken;`, [requestData.email, requestData.email]);
        const takenStatus = takenStatusRows[0];
        if (!takenStatus) {
            res.status(500).json({ message: 'Internal server error.' });
            return;
        }
        if (takenStatus.email_taken) {
            res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });
            return;
        }
        if (takenStatus.username_taken) {
            res.status(409).json({ message: 'Username is taken.', reason: 'usernameTaken' });
            return;
        }
        const currentTimestamp = Date.now();
        const hashedPassword = await bcrypt_1.default.hash(requestData.password, 10);
        const [resultSetHeader] = await connection.execute(`INSERT INTO accounts (
        email,
        hashed_password,
        username,
        display_name,
        created_on_timestamp,
        is_verified,
        failed_sign_in_attempts
      ) VALUES (${(0, generatePlaceHolders_1.generatePlaceHolders)(7)});`, [requestData.email, hashedPassword, requestData.username, requestData.displayName, currentTimestamp, false, 0]);
        const accountId = resultSetHeader.insertId;
        const verificationToken = (0, tokenGenerator_1.generateCryptoUuid)();
        const verificationExpiryTimestamp = currentTimestamp + constants_1.ACCOUNT_VERIFICATION_WINDOW;
        await connection.execute(`INSERT INTO account_verification (
        account_id,
        verification_token,
        verification_emails_sent,
        failed_verification_attempts,
        expiry_timestamp
      ) VALUES (${(0, generatePlaceHolders_1.generatePlaceHolders)(5)});`, [accountId, verificationToken, 1, 0, verificationExpiryTimestamp]);
        await connection.commit();
        res.json({});
        await (0, emailServices_1.sendAccountVerificationEmail)({
            receiver: requestData.email,
            displayName: requestData.displayName,
            accountId,
            verificationToken,
            expiryTimestamp: verificationExpiryTimestamp,
        });
    }
    catch (err) {
        console.log(err);
        await connection?.rollback();
        if (res.headersSent) {
            return;
        }
        if (!(0, isSqlError_1.isSqlError)(err)) {
            res.status(500).json({ message: 'Internal server error.' });
            await (0, errorLogger_1.logUnexpectedError)(req, err);
            return;
        }
        const sqlError = err;
        if (sqlError.errno === 1062 && sqlError.sqlMessage?.endsWith(`for key 'email'`)) {
            res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });
            return;
        }
        if (sqlError.errno === 1062 && sqlError.sqlMessage?.endsWith(`for key 'username'`)) {
            res.status(409).json({ message: 'Username is taken.', reason: 'usernameTaken' });
            return;
        }
        res.status(500).json({ message: 'Internal server error.' });
        await (0, errorLogger_1.logUnexpectedError)(req, err);
    }
    finally {
        connection?.release();
    }
});
