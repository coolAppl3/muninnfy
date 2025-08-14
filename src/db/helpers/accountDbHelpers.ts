import { Request } from 'express';
import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';

export async function deleteAccountById(accountId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `DELETE FROM
        accounts
      WHERE
        account_id = ?;`,
      [accountId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'failed to delete account');

    return false;
  }
}

export async function incrementVerificationEmailsSent(verificationId: Readonly<number>, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        account_verification
      SET
        verification_emails_sent = verification_emails_sent + 1
      WHERE
        verification_id = ?;`,
      [verificationId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'failed to increment verification_emails_sent');

    return false;
  }
}

export async function incrementFailedVerificationAttempts(verificationId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        account_verification
      SET
        failed_verification_attempts = failed_verification_attempts + 1
      WHERE
        verification_id = ?`,
      [verificationId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'failed to increment failed_verification_attempts');

    return false;
  }
}
