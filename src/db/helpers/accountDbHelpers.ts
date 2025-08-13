import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { dbPool } from '../db';

export async function deleteAccountById(accountId: number, executor: Pool | PoolConnection): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `DELETE FROM
        accounts
      WHERE
        account_id = ?;`,
      [accountId]
    );

    if (resultSetHeader.affectedRows === 0) {
      return false;
    }

    return true;
  } catch (err: unknown) {
    console.log(err);
    return false;
  }
}
