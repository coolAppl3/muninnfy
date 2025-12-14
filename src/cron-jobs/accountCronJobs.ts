import { dbPool } from '../db/db';
import { minuteMilliseconds } from '../util/constants/globalConstants';

export async function deleteUnverifiedAccountsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        accounts
      WHERE
        is_verified = ? AND
        ? - created_on_timestamp >= ?;`,
      [false, currentTimestamp, 20 * minuteMilliseconds]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function deleteStaleAccountVerificationRequestsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        account_verification
      WHERE
        expiry_timestamp <= ?;`,
      [currentTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function deleteStaleEmailUpdateRequestsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        email_update
      WHERE
        expiry_timestamp <= ?;`,
      [currentTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function deleteStaleAccountRecoveryRequestsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        account_recovery
      WHERE
        expiry_timestamp <= ?;`,
      [currentTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function deleteStaleAccountDeletionRequestsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        account_deletion
      WHERE
        expiry_timestamp <= ?;`,
      [currentTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
