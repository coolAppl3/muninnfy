import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { logUnexpectedError } from '../logs/errorLogger';

export const dbPool: Pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  connectionLimit: 50,
  maxIdle: 20,
  idleTimeout: 80 * 1000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 20 * 1000,
  waitForConnections: true,
  queueLimit: 10,
  multipleStatements: true,
  namedPlaceholders: true,
  decimalNumbers: true,

  typeCast: (field: mysql.TypeCastField, next) => {
    if (field.type === 'TINY' && field.length === 1) {
      const value: unknown = next();
      return value === 1;
    }

    return next();
  },
});

dbPool.on('release', async (connection: PoolConnection) => {
  try {
    await connection.execute(`SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;`);
  } catch (err: unknown) {
    console.log(err);
    logUnexpectedError(null, err, 'Failed to reset transaction isolation level.');
  }
});
