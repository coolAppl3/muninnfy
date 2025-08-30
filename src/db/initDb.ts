import { dbPool } from './db';

export async function initDb(): Promise<void> {
  await createAccountsTable();
  await createAccountPreferencesTable();
  await createAccountVerificationTable();
  await createAccountRecoveryTable();
  await createAccountDeletionTable();
  await createEmailUpdateTable();
  await createAuthSessionsTable();

  await createWishlistsTable();
  await createWishlistItemsTable();
  await createWishlistItemTagsTable();

  await createRateTrackerTable();
  await createAbusiveUsersTable();
  await createUnexpectedErrorsTable();

  console.log('Database initialized.');
}

async function createAccountsTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS accounts (
        account_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        public_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
        email VARCHAR(254) NOT NULL UNIQUE,
        hashed_password VARCHAR(128) NOT NULL,
        username VARCHAR(40) NOT NULL UNIQUE,
        display_name VARCHAR(40) NOT NULL,
        created_on_timestamp BIGINT UNSIGNED NOT NULL,
        is_verified BOOLEAN NOT NULL,
        failed_sign_in_attempts TINYINT UNSIGNED NOT NULL CHECK(failed_sign_in_attempts <= 5)
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createAccountPreferencesTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS account_preferences (
        account_id INT UNSIGNED PRIMARY KEY,
        is_private BOOLEAN NOT NULL,
        approve_follow_requests BOOLEAN NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createAccountVerificationTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS account_verification (
        verification_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        account_id INT UNSIGNED NOT NULL UNIQUE,
        verification_token CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        verification_emails_sent TINYINT UNSIGNED NOT NULL CHECK(verification_emails_sent <= 3),
        failed_verification_attempts TINYINT UNSIGNED NOT NULL CHECK(failed_verification_attempts <= 3),
        expiry_timestamp BIGINT UNSIGNED NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createAccountRecoveryTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS account_recovery (
        recovery_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        account_id INT UNSIGNED NOT NULL UNIQUE,
        recovery_token CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        expiry_timestamp BIGINT UNSIGNED NOT NULL,
        recovery_emails_sent TINYINT UNSIGNED NOT NULL CHECK(recovery_emails_sent <= 3),
        failed_recovery_attempts TINYINT UNSIGNED NOT NULL CHECK(failed_recovery_attempts <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createAccountDeletionTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS account_deletion (
        deletion_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        account_id INT UNSIGNED NOT NULL UNIQUE,
        confirmation_code VARCHAR(10) NOT NULL COLLATE utf8mb4_bin,
        expiry_timestamp BIGINT UNSIGNED NOT NULL,
        deletion_emails_sent TINYINT UNSIGNED NOT NULL CHECK(deletion_emails_sent <= 3),
        failed_deletion_attempts TINYINT UNSIGNED NOT NULL CHECK(failed_deletion_attempts <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createEmailUpdateTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS email_update (
        update_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        account_id INT UNSIGNED NOT NULL UNIQUE,
        new_email VARCHAR(254) NOT NULL UNIQUE,
        confirmation_code VARCHAR(10) NOT NULL COLLATE utf8mb4_bin,
        expiry_timestamp BIGINT UNSIGNED NOT NULL,
        update_emails_sent TINYINT UNSIGNED NOT NULL CHECK(update_emails_sent <= 3),
        failed_update_attempts TINYINT UNSIGNED NOT NULL CHECK(failed_update_attempts <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createAuthSessionsTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS auth_sessions (
        session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
        account_id INT UNSIGNED NOT NULL,
        created_on_timestamp BIGINT UNSIGNED NOT NULL,
        expiry_timestamp BIGINT UNSIGNED NOT NULL,
        keep_signed_in BOOLEAN NOT NULL,
        extensions_count TINYINT UNSIGNED NOT NULL CHECK(extensions_count <= 3),
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createWishlistsTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS wishlists (
        wishlist_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
        account_id INT UNSIGNED,
        privacy_level TINYINT UNSIGNED NOT NULL CHECK (privacy_level IN (0, 1, 2)),
        title VARCHAR(100) NOT NULL,
        description VARCHAR(600),
        created_on_timestamp BIGINT UNSIGNED NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createWishlistItemsTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS wishlist_items (
        item_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        wishlist_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        added_on_timestamp BIGINT UNSIGNED NOT NULL,
        title VARCHAR(254) NOT NULL,
        description VARCHAR(500),
        link VARCHAR(2048),
        FOREIGN KEY (wishlist_id) REFERENCES wishlists(wishlist_id) ON DELETE CASCADE
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createWishlistItemTagsTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS wishlist_item_tags (
        tag_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        item_id INT UNSIGNED NOT NULL,
        tag_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (item_id) REFERENCES wishlist_items(item_id) ON DELETE CASCADE,
        UNIQUE (item_id, tag_name)
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createRateTrackerTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS rate_tracker (
        rate_limit_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        requests_count INT UNSIGNED NOT NULL,
        window_timestamp BIGINT UNSIGNED NOT NULL
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createAbusiveUsersTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS abusive_users (
        ip_address VARCHAR(45) PRIMARY KEY,
        first_abuse_timestamp BIGINT UNSIGNED NOT NULL,
        latest_abuse_timestamp BIGINT UNSIGNED NOT NULL,
        rate_limit_reached_count INT UNSIGNED NOT NULL
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function createUnexpectedErrorsTable(): Promise<void> {
  try {
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS unexpected_errors (
        error_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        request_method VARCHAR(10),
        request_path VARCHAR(400),
        error_timestamp BIGINT UNSIGNED NOT NULL,
        error_message TEXT,
        stack_trace TEXT,
        description VARCHAR(254)
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
