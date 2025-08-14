import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';

export async function deleteAccountById(accountId: number, executor: Pool | PoolConnection): Promise<boolean> {
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
    return false;
  }
}
