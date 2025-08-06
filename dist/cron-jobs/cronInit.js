"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const rateLimiterCronJobs_1 = require("./rateLimiterCronJobs");
const constants_1 = require("../util/constants");
const errorLoggerCronJobs_1 = require("../logs/errorLoggerCronJobs");
function initCronJobs() {
    setInterval(async () => {
        await (0, rateLimiterCronJobs_1.replenishRateRequests)();
    }, constants_1.minuteMilliseconds / 2);
    node_cron_1.default.schedule('0 0 * * *', async () => {
        await (0, rateLimiterCronJobs_1.removeLightRateAbusers)();
        await (0, errorLoggerCronJobs_1.clearErrorLogs)();
    });
    console.log('CRON jobs started.');
}
exports.initCronJobs = initCronJobs;
