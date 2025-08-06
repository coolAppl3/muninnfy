"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const accountsRouter_1 = require("./routers/accountsRouter");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.use((0, compression_1.default)({ threshold: 1024 }));
exports.app.use((0, cookie_parser_1.default)());
if (process.env.NODE_ENV?.toLowerCase() === 'development') {
    const whitelist = ['http://localhost:3000', 'http://localhost:5000'];
    exports.app.use((0, cors_1.default)({ origin: whitelist, credentials: true }));
}
exports.app.use((req, res, next) => {
    res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; connect-src 'self';`);
    next();
});
exports.app.use(express_1.default.static(path_1.default.join(__dirname, '../client/dist')));
exports.app.use('/api/', rateLimiter_1.rateLimiter);
exports.app.use('/api/accounts', accountsRouter_1.accountsRouter);
exports.app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/dist/index.html'));
});
