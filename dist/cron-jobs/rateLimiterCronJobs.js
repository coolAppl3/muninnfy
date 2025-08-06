"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLightRateAbusers = exports.removeStaleRateTrackerRows = exports.replenishRateRequests = void 0;
const db_1 = require("../db/db");
const constants_1 = require("../util/constants");
async function replenishRateRequests() {
    const currentTimestamp = Date.now();
    const requestsToReplenish = constants_1.REQUESTS_RATE_LIMIT / 2;
    try {
        await db_1.dbPool.execute(`UPDATE
        rate_tracker
      SET
        requests_count = GREATEST(requests_count - ?, 0)
      WHERE
        ? - window_timestamp >= ?;`, [requestsToReplenish, currentTimestamp, constants_1.minuteMilliseconds / 2]);
    }
    catch (err) {
        console.log(err);
    }
}
exports.replenishRateRequests = replenishRateRequests;
async function removeStaleRateTrackerRows() {
    const currentTimestamp = Date.now();
    try {
        await db_1.dbPool.execute(`DELETE FROM
        rate_tracker
      WHERE
        ? - window_timestamp >= ? AND
        requests_count = ?;`, [currentTimestamp, constants_1.minuteMilliseconds, 0]);
    }
    catch (err) {
        console.log(err);
    }
}
exports.removeStaleRateTrackerRows = removeStaleRateTrackerRows;
async function removeLightRateAbusers() {
    const currentTimestamp = Date.now();
    try {
        await db_1.dbPool.execute(`DELETE FROM
        abusive_users
      WHERE
        rate_limit_reached_count <= ? AND
        ? - latest_abuse_timestamp >= ?;`, [constants_1.LIGHT_DAILY_RATE_ABUSE_COUNT, currentTimestamp, constants_1.hourMilliseconds]);
    }
    catch (err) {
        console.log(err);
    }
}
exports.removeLightRateAbusers = removeLightRateAbusers;
