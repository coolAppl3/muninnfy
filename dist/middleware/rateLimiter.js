"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const cookieUtils_1 = require("../util/cookieUtils");
const db_1 = require("../db/db");
const generatePlaceHolders_1 = require("../util/sqlUtils/generatePlaceHolders");
const constants_1 = require("../util/constants");
const tokenGenerator_1 = require("../util/tokenGenerator");
async function rateLimiter(req, res, next) {
    const rateLimitId = (0, cookieUtils_1.getRequestCookie)(req, 'rateLimitId');
    if (!rateLimitId) {
        await addToRateTracker(res);
        next();
        return;
    }
    if (!isValidRateLimitId(rateLimitId)) {
        await addToRateTracker(res);
        next();
        return;
    }
    if (await rateLimitReached(rateLimitId, res)) {
        res.status(429).json({ message: 'Too many requests.' });
        await incrementRequestsCount(rateLimitId);
        await addToAbusiveUsers(req);
        return;
    }
    await incrementRequestsCount(rateLimitId);
    next();
}
exports.rateLimiter = rateLimiter;
async function addToRateTracker(res) {
    const newRateId = (0, tokenGenerator_1.generateCryptoUuid)();
    const currentTimestamp = Date.now();
    try {
        await db_1.dbPool.execute(`INSERT INTO rate_tracker (
        rate_limit_id,
        requests_count,
        window_timestamp
      ) VALUES (${(0, generatePlaceHolders_1.generatePlaceHolders)(3)});`, [newRateId, 1, currentTimestamp]);
        (0, cookieUtils_1.setResponseCookie)(res, 'rateLimitId', newRateId, constants_1.hourMilliseconds, true);
    }
    catch (err) {
        console.log('RATE LIMITING ERROR:', err);
    }
}
async function rateLimitReached(rateLimitId, res) {
    try {
        const [rateTrackerRows] = await db_1.dbPool.execute(`SELECT
        requests_count
      FROM
        rate_tracker
      WHERE
        rate_limit_id = ?;`, [rateLimitId]);
        const rateTrackerDetails = rateTrackerRows[0];
        if (!rateTrackerDetails) {
            await addToRateTracker(res);
            return false;
        }
        if (rateTrackerDetails.requests_count > constants_1.REQUESTS_RATE_LIMIT) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
async function incrementRequestsCount(rateLimitId) {
    try {
        await db_1.dbPool.execute(`UPDATE
        rate_tracker
      SET
        requests_count = requests_count + 1
      WHERE
        rate_limit_id = ?;`, [rateLimitId]);
    }
    catch (err) {
        console.log(err);
    }
}
function isValidRateLimitId(rateLimitId) {
    if (!rateLimitId.startsWith('r')) {
        return false;
    }
    if (rateLimitId.length !== 32) {
        return false;
    }
    const regex = /^[A-Za-z0-9]{32}$/;
    return regex.test(rateLimitId);
}
async function addToAbusiveUsers(req) {
    const currentTimestamp = Date.now();
    try {
        const [userRows] = await db_1.dbPool.execute(`SELECT
        rate_limit_reached_count
      FROM
        abusive_users
      WHERE
        ip_address = ?;`, [req.ip]);
        const userDetails = userRows[0];
        if (!userDetails) {
            await db_1.dbPool.execute(`INSERT INTO abusive_users (
          ip_address,
          first_abuse_timestamp,
          latest_abuse_timestamp,
          rate_limit_reached_count
        ) VALUES (${(0, generatePlaceHolders_1.generatePlaceHolders)(4)});`, [req.ip, currentTimestamp, currentTimestamp, 1]);
            return;
        }
        await db_1.dbPool.execute(`UPDATE
        abusive_users
      SET
        rate_limit_reached_count = ?,
        latest_abuse_timestamp = ?
      WHERE
        ip_address = ?;`, [userDetails.rate_limit_reached_count + 1, currentTimestamp, req.ip]);
    }
    catch (err) {
        console.log(err);
    }
}
