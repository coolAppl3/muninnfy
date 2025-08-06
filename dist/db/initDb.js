"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = void 0;
const db_1 = require("./db");
async function initDb() {
    await createAuthSessionsTable();
    await createAccountsTable();
    await createAccountVerificationTable();
    await createAccountRecoveryTable();
    await createAccountDeletionTable();
    await createEmailUpdateTable();
    await createFriendRequestsTable();
    await createFriendshipsTable();
    await createRateTrackerTable();
    await createAbusiveUsersTable();
    await createUnexpectedErrorsTable();
    console.log('Database initialized.');
}
exports.initDb = initDb;
async function createAuthSessionsTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS auth_sessions (
        session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        user_id INT NOT NULL,
        created_on_timestamp BIGINT NOT NULL,
        expiry_timestamp BIGINT NOT NULL
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createAccountsTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS accounts (
        account_id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(254) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        username VARCHAR(40) NOT NULL UNIQUE,
        display_name VARCHAR(40) NOT NULL,
        created_on_timestamp BIGINT NOT NULL,
        is_verified BOOLEAN NOT NULL,
        failed_sign_in_attempts INT NOT NULL CHECK(failed_sign_in_attempts <= 5)
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createAccountVerificationTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS account_verification (
        verification_id INT PRIMARY KEY AUTO_INCREMENT,
        account_id INT NOT NULL UNIQUE,
        verification_token CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        verification_emails_sent INT NOT NULL CHECK(verification_emails_sent <= 3),
        failed_verification_attempts INT NOT NULL CHECK(failed_verification_attempts <= 3),
        expiry_timestamp BIGINT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createAccountRecoveryTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS account_recovery (
        recovery_id INT PRIMARY KEY AUTO_INCREMENT,
        account_id INT NOT NULL UNIQUE,
        recovery_token CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        expiry_timestamp BIGINT NOT NULL,
        recovery_emails_sent INT NOT NULL CHECK(recovery_emails_sent <= 3),
        failed_recovery_attempts INT NOT NULL CHECK(failed_recovery_attempts <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createAccountDeletionTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS account_deletion (
        deletion_id INT PRIMARY KEY AUTO_INCREMENT,
        account_id INT NOT NULL UNIQUE,
        confirmation_code VARCHAR(10) NOT NULL COLLATE utf8mb4_bin,
        expiry_timestamp BIGINT NOT NULL,
        deletion_emails_sent INT NOT NULL CHECK(deletion_emails_sent <= 3),
        failed_deletion_attempts INT NOT NULL CHECK(failed_deletion_attempts <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createEmailUpdateTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS email_update (
        update_id INT PRIMARY KEY AUTO_INCREMENT,
        account_id INT NOT NULL UNIQUE,
        new_email VARCHAR(254) NOT NULL UNIQUE,
        confirmation_code VARCHAR(10) NOT NULL COLLATE utf8mb4_bin,
        expiry_timestamp BIGINT NOT NULL,
        update_emails_sent INT NOT NULL CHECK(update_emails_sent <= 3),
        failed_update_attempts INT NOT NULL CHECK(failed_update_attempts <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createFriendRequestsTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS friend_requests (
        request_id INT PRIMARY KEY AUTO_INCREMENT,
        requester_id INT NOT NULL,
        requestee_id INT NOT NULL,
        request_timestamp BIGINT NOT NULL,
        UNIQUE(requester_id, requestee_id),
        FOREIGN KEY (requester_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
        FOREIGN KEY (requestee_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createFriendshipsTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS friendships (
        friendship_id INT PRIMARY KEY AUTO_INCREMENT,
        account_id INT NOT NULL,
        friend_id INT NOT NULL,
        friendship_timestamp BIGINT NOT NULL,
        UNIQUE(account_id, friend_id),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createRateTrackerTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS rate_tracker (
        rate_limit_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        requests_count INT UNSIGNED NOT NULL,
        window_timestamp BIGINT NOT NULL
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createAbusiveUsersTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS abusive_users (
        ip_address VARCHAR(45) PRIMARY KEY,
        first_abuse_timestamp BIGINT NOT NULL,
        latest_abuse_timestamp BIGINT NOT NULL,
        rate_limit_reached_count INT UNSIGNED NOT NULL
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
async function createUnexpectedErrorsTable() {
    try {
        await db_1.dbPool.execute(`CREATE TABLE IF NOT EXISTS unexpected_errors (
        error_id INT PRIMARY KEY AUTO_INCREMENT,
        request_method VARCHAR(10),
        request_path VARCHAR(255),
        error_timestamp BIGINT NOT NULL,
        error_message TEXT,
        stack_trace TEXT
      );`);
    }
    catch (err) {
        console.log(err);
    }
}
