import { Request } from 'express';
import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';

export async function deleteFollowRequest(requestId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ?;`,
      [requestId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to delete follow request.');

    return false;
  }
}
