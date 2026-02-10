import express, { Router, Request, Response } from 'express';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { dbPool } from '../db/db';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { isValidUuid } from '../util/tokenGenerator';
import { SOCIAL_FETCH_BATCH_SIZE, SOCIAL_MAX_FOLLOWING_LIMIT, SOCIAL_MAX_FOLLOWERS_LIMIT } from '../util/constants/socialConstants';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import { deleteFollowRequest } from '../db/helpers/socialDbHelpers';
import { getAuthSessionId } from '../auth/authUtils';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { isValidSocialFindQuery, isValidSocialQuery } from '../util/validation/socialValidation';
import { addNotification } from '../db/helpers/notificationsDbHelpers';

export const socialRouter: Router = express.Router();

type SocialCounts = {
  followers_count: number;
  following_count: number;
  follow_requests_count: number;
};

export type SocialData = {
  public_account_id: string;
  username: string;
  display_name: string;
};

export type FollowDetails = SocialData & {
  follow_id: number;
  follow_timestamp: number;
};

export type FollowRequest = SocialData & {
  request_id: number;
  request_timestamp: number;
};

socialRouter.get('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [socialRows] = await dbPool.query<RowDataPacket[][]>(
      `SELECT
        (SELECT COUNT(*) FROM followers WHERE account_id = :accountId) AS followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_account_id = :accountId) AS following_count,
        (SELECT COUNT(*) FROM follow_requests WHERE requestee_account_id = :accountId) AS follow_requests_count;
      
      SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.follower_account_id = accounts.account_id
      WHERE
        followers.account_id = :accountId
      ORDER BY
        followers.follow_timestamp DESC,
        followers.follow_id ASC
      LIMIT :socialFetchBatchSize;

      SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.account_id = accounts.account_id
      WHERE
        followers.follower_account_id = :accountId
      ORDER BY
        followers.follow_timestamp DESC,
        followers.follow_id ASC
      LIMIT :socialFetchBatchSize;
      
      SELECT
        follow_requests.request_id,
        follow_requests.request_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        follow_requests
      INNER JOIN
        accounts ON follow_requests.requester_account_id = accounts.account_id
      WHERE
        follow_requests.requestee_account_id = :accountId
      ORDER BY
        follow_requests.request_timestamp DESC,
        follow_requests.request_id ASC
      LIMIT :socialFetchBatchSize;`,
      { accountId, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    const socialCounts = (socialRows[0] ? socialRows[0][0] : undefined) as SocialCounts | undefined;
    const followers = socialRows[1] as FollowDetails[] | undefined;
    const following = socialRows[2] as FollowDetails[] | undefined;
    const followRequests = socialRows[3] as FollowRequest[] | undefined;

    if (!socialCounts || !followers || !following || !followRequests) {
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(
        req,
        null,
        `Failed to fetch social data. Social count dat fetched: ${Boolean(socialCounts)}. Followers fetched: ${Boolean(
          followers
        )}. Following fetched: ${Boolean(following)}. Follow requests fetched: ${Boolean(followRequests)}.`
      );

      return;
    }

    res.json({ socialCounts, followers, following, followRequests });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/followers/search', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const searchQuery: string = req.query.searchQuery?.toString().trim() || '';
  const offset: number = +(req.query.offset || 0);

  if (!isValidSocialQuery(searchQuery)) {
    res.status(400).json({ message: 'Invalid search query.', reason: 'invalidSearchQuery' });
    return;
  }

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [followers] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.follower_account_id = accounts.account_id
      WHERE
        followers.account_id = :accountId AND (
          accounts.username LIKE CONCAT('%', :searchQuery, '%') OR accounts.display_name LIKE CONCAT('%', :searchQuery, '%')
        )
      ORDER BY
        followers.follow_timestamp DESC,
        followers.follow_id ASC
      LIMIT
        :socialFetchBatchSize
      OFFSET
        :offset;`,
      { accountId, searchQuery, offset, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    res.json(followers as FollowDetails[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/followers/:offset', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const offset: number = +(req.params.offset || 0);

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [followers] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.follower_account_id = accounts.account_id
      WHERE
        followers.account_id = :accountId
      ORDER BY
        followers.follow_timestamp DESC,
        followers.follow_id ASC
      LIMIT
        :socialFetchBatchSize
      OFFSET
        :offset;`,
      { accountId, offset, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    res.json(followers as FollowDetails[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/following/search', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const searchQuery: string = req.query.searchQuery?.toString().trim() || '';
  const offset: number = +(req.query.offset || 0);

  if (!isValidSocialQuery(searchQuery)) {
    res.status(400).json({ message: 'Invalid search query.', reason: 'invalidSearchQuery' });
    return;
  }

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [following] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.account_id = accounts.account_id
      WHERE
        followers.follower_account_id = :accountId AND (
          accounts.username LIKE CONCAT('%', :searchQuery, '%') OR accounts.display_name LIKE CONCAT('%', :searchQuery, '%')
        )
      ORDER BY
        followers.follow_timestamp DESC,
        followers.follow_id ASC
      LIMIT
        :socialFetchBatchSize
      OFFSET
        :offset;`,
      { accountId, searchQuery, offset, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    res.json(following as FollowDetails[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/following/:offset', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const offset: number = +(req.params.offset || 0);

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [following] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.account_id = accounts.account_id
      WHERE
        followers.follower_account_id = :accountId
      ORDER BY
        followers.follow_timestamp DESC,
        followers.follow_id ASC
      LIMIT
        :socialFetchBatchSize
      OFFSET
        :offset;`,
      { accountId, offset, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    res.json(following as FollowDetails[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/followRequests/search', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const searchQuery: string = req.query.searchQuery?.toString().trim() || '';
  const offset: number = +(req.query.offset || 0);

  if (!isValidSocialQuery(searchQuery)) {
    res.status(400).json({ message: 'Invalid search query.', reason: 'invalidSearchQuery' });
    return;
  }

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [followRequests] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        follow_requests.request_id,
        follow_requests.request_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        follow_requests
      INNER JOIN
        accounts ON follow_requests.requester_account_id = accounts.account_id
      WHERE
        follow_requests.requestee_account_id = :accountId AND (
          accounts.username LIKE CONCAT('%', :searchQuery, '%') OR accounts.display_name LIKE CONCAT('%', :searchQuery, '%')
        )
      ORDER BY
        follow_requests.request_timestamp DESC,
        follow_requests.request_id ASC
      LIMIT
        :socialFetchBatchSize
      OFFSET
        :offset;`,
      { accountId, searchQuery, offset, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    res.json(followRequests as FollowRequest[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/followRequests/:offset', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const offset: number = +(req.params.offset || 0);

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [followRequests] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        follow_requests.request_id,
        follow_requests.request_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        follow_requests
      INNER JOIN
        accounts ON follow_requests.requester_account_id = accounts.account_id
      WHERE
        follow_requests.requestee_account_id = :accountId
      ORDER BY
        follow_requests.request_timestamp DESC,
        follow_requests.request_id ASC
      LIMIT
        :socialFetchBatchSize
      OFFSET
        :offset;`,
      { accountId, offset, socialFetchBatchSize: SOCIAL_FETCH_BATCH_SIZE }
    );

    res.json(followRequests as FollowRequest[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.post('/followRequests/send', async (req: Request, res: Response) => {
  const authSessionOd: string | null = getAuthSessionId(req, res);

  if (!authSessionOd) {
    return;
  }

  type RequestData = {
    requesteePublicAccountId: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['requesteePublicAccountId'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { requesteePublicAccountId } = requestData;

  if (!isValidUuid(requesteePublicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidPublicAccountId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionOd, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type FollowDetails = {
      requestee_account_id: number;
      requestee_is_verified: boolean;
      already_following: boolean;
      already_requested: boolean;

      requester_following_count: number;
      requester_follow_requests_count: number;
      requestee_followers_count: number;
      follow_requires_approval: boolean;
    };

    const [followRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        account_id AS requestee_account_id,
        is_verified AS requestee_is_verified,

        EXISTS (
          SELECT 1 FROM followers WHERE follower_account_id = :accountId AND account_id = accounts.account_id
        ) AS already_following,

        EXISTS (
          SELECT 1 FROM follow_requests WHERE requester_account_id = :accountId AND requestee_account_id = accounts.account_id
        ) AS already_requested,

        
        (SELECT COUNT(*) FROM followers WHERE follower_account_id = :accountId FOR UPDATE) AS requester_following_count,
        (SELECT COUNT(*) FROM follow_requests WHERE requester_account_id = :accountId FOR UPDATE) AS requester_follow_requests_count,
        (SELECT COUNT(*) FROM followers WHERE account_id = accounts.account_id FOR UPDATE) AS requestee_followers_count,
        (SELECT approve_follow_requests FROM account_preferences WHERE account_id = accounts.account_id) AS follow_requires_approval
      FROM
        accounts
      WHERE
        public_account_id = :requesteePublicAccountId;`,
      { accountId, requesteePublicAccountId }
    );

    const followDetails = followRows[0] as FollowDetails | undefined;

    if (!followDetails || !followDetails.requestee_is_verified) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    if (followDetails.requestee_account_id === accountId) {
      await connection.rollback();
      res.status(409).json({ message: `Can't follow yourself.`, reason: 'selfFollow' });

      return;
    }

    if (followDetails.already_following) {
      await connection.rollback();
      res.status(409).json({ message: 'Already following this user.', reason: 'alreadyFollowing' });

      return;
    }

    if (followDetails.already_requested) {
      await connection.rollback();
      res.status(409).json({ message: 'Follow request already sent.', reason: 'alreadySent' });

      return;
    }

    if (followDetails.requester_following_count + followDetails.requester_follow_requests_count >= SOCIAL_MAX_FOLLOWING_LIMIT) {
      await connection.rollback();
      res.status(409).json({ message: 'Following limit reached.', reason: 'followingLimitReached' });

      return;
    }

    if (followDetails.requestee_followers_count >= SOCIAL_MAX_FOLLOWERS_LIMIT) {
      await connection.rollback();
      res.status(409).json({ message: `User can't accept followers at this time.`, reason: 'requesteeFollowersLimitReached' });

      return;
    }

    const currentTimestamp: number = Date.now();

    if (!followDetails.follow_requires_approval) {
      const [resultSetHeader] = await connection.execute<ResultSetHeader>(
        `INSERT INTO followers (
          account_id,
          follower_account_id,
          follow_timestamp
        ) VALUES (${generatePlaceHolders(3)});`,
        [followDetails.requestee_account_id, accountId, currentTimestamp]
      );

      await connection.commit();
      res.json({ followId: resultSetHeader.insertId, followTimestamp: currentTimestamp });

      await addNotification(followDetails.requestee_account_id, accountId, currentTimestamp, 'NEW_FOLLOWER', resultSetHeader.insertId);
      return;
    }

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `INSERT INTO follow_requests (
        requester_account_id,
        requestee_account_id,
        request_timestamp
      ) VALUES (${generatePlaceHolders(3)})`,
      [accountId, followDetails.requestee_account_id, currentTimestamp]
    );

    await connection.commit();
    res.json({ requestId: resultSetHeader.insertId, requestTimestamp: currentTimestamp });

    await addNotification(followDetails.requestee_account_id, accountId, currentTimestamp, 'NEW_FOLLOW_REQUEST', resultSetHeader.insertId);
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    if (!isSqlError(err)) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, err);

      return;
    }

    if (err.errno === 1452) {
      res.status(409).json({ message: 'Follow request already sent.', reason: 'alreadySent' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

socialRouter.delete('/followRequests/cancel/:requestId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const requestId: number | undefined = req.params.requestId ? +req.params.requestId : undefined;

  if (!requestId || !Number.isInteger(requestId)) {
    res.status(400).json({ messagE: 'Invalid request ID.', reason: 'invalidRequestId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ? AND
        requester_account_id = ?;`,
      [requestId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.post('/followRequests/accept', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    requestId: number;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['requestId'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { requestId } = requestData;

  if (!Number.isInteger(requestId)) {
    res.status(400).json({ message: 'Invalid request ID.', reason: 'invalidRequestId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type FollowDetails = {
      requester_account_id: number;
      followers_count: number;
      requester_already_following: boolean;
    };

    const [followRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        requester_account_id,
        (SELECT COUNT(*) FROM followers WHERE account_id = :accountId FOR UPDATE) AS followers_count,

        EXISTS (
          SELECT 1 FROM followers WHERE account_id = :accountId AND follower_account_id = follow_requests.requester_account_id
        ) AS requester_already_following
      FROM
        follow_requests
      WHERE
        request_id = :requestId AND
        requestee_account_id = :accountId;`,
      { requestId, accountId }
    );

    const followDetails = followRows[0] as FollowDetails | undefined;

    if (!followDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Follow request not found.', reason: 'requestNotFound' });

      return;
    }

    if (followDetails.requester_already_following) {
      await connection.rollback();

      const followRequestDeleted: boolean = await deleteFollowRequest(requestId, dbPool, req);
      if (!followRequestDeleted) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(409).json({ message: 'Request already accepted.', reason: 'alreadyAccepted' });
      return;
    }

    if (followDetails.followers_count >= SOCIAL_MAX_FOLLOWERS_LIMIT) {
      await connection.rollback();
      res.status(409).json({ message: 'Followers limit reached.', reason: 'followersLimitReached' });

      return;
    }

    const currentTimestamp: number = Date.now();

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `INSERT INTO followers (
        account_id,
        follower_account_Id,
        follow_timestamp
      ) VALUES (${generatePlaceHolders(3)});`,
      [accountId, followDetails.requester_account_id, currentTimestamp]
    );

    const followRequestDeleted: boolean = await deleteFollowRequest(requestId, connection, req);
    if (!followRequestDeleted) {
      await connection.rollback();
      res.status(500).json({ message: 'Internal server error.' });

      return;
    }

    await connection.commit();
    res.json({ follow_id: resultSetHeader.insertId, follow_timestamp: currentTimestamp });

    await addNotification(
      followDetails.requester_account_id,
      accountId,
      currentTimestamp,
      'FOLLOW_REQUEST_ACCEPTED',
      resultSetHeader.insertId
    );
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

socialRouter.delete('/followRequests/decline/:requestId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const requestId: number | undefined = req.params.requestId ? +req.params.requestId : undefined;

  if (!requestId || !Number.isInteger(requestId)) {
    res.status(400).json({ messagE: 'Invalid request ID.', reason: 'invalidRequestId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ? AND
        requestee_account_id = ?;`,
      [requestId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.delete('/followers/unfollow/:followId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const followId: number | undefined = req.params.followId ? +req.params.followId : undefined;

  if (!followId || !Number.isInteger(followId)) {
    res.status(400).json({ messagE: 'Invalid follow ID.', reason: 'invalidFollowId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        followers
      WHERE
        follow_id = ? AND
        follower_account_id = ?;`,
      [followId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.delete('/followers/remove/:followId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const followId: number | undefined = req.params.followId ? +req.params.followId : undefined;

  if (!followId || !Number.isInteger(followId)) {
    res.status(400).json({ messagE: 'Invalid follow ID.', reason: 'invalidFollowId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        followers
      WHERE
        follow_id = ? AND
        account_id = ?;`,
      [followId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

socialRouter.get('/find/:searchQuery', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const searchQuery: string | undefined = req.params.searchQuery;

  if (!searchQuery || !isValidSocialFindQuery(searchQuery)) {
    res.status(400).json({ message: 'Invalid search query.', reason: 'invalidSearchQuery' });
    return;
  }

  const isPublicAccountIdQuery: boolean = searchQuery.includes('-');
  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type AccountDetails = {
      public_account_id: string;
      username: string;
      display_name: string;
    };

    const [results] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        public_account_id,
        username,
        display_name
      FROM
        accounts
      WHERE
        account_id != :accountId AND
        ${isPublicAccountIdQuery ? `public_account_id = :searchQuery` : `username LIKE CONCAT('%', :searchQuery, '%')`}
      LIMIT 20;`,
      { accountId, searchQuery }
    );

    res.json(results as AccountDetails[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    await logUnexpectedError(req, err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
