import { dbPool } from './db';

export async function initDb(): Promise<void> {
  await createRateTrackerTable();
  await createAbusiveUsersTable();
  await createUnexpectedErrorsTable();

  console.log('Database initialized.');
}

async function createRateTrackerTable(): Promise<void> {
  try {
    // TODO: remove chat request limiters
    await dbPool.execute(
      `CREATE TABLE IF NOT EXISTS rate_tracker (
        rate_limit_id VARCHAR(65) PRIMARY KEY COLLATE utf8mb4_bin,
        requests_count INT UNSIGNED NOT NULL,
        window_timestamp BIGINT NOT NULL
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
        first_abuse_timestamp BIGINT NOT NULL,
        latest_abuse_timestamp BIGINT NOT NULL,
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
        error_id INT PRIMARY KEY AUTO_INCREMENT,
        request_method VARCHAR(10),
        request_path VARCHAR(255),
        error_timestamp BIGINT NOT NULL,
        error_message TEXT,
        stack_trace TEXT
      );`
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
