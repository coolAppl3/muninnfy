import http, { IncomingMessage } from 'http';
import { Socket } from 'net';
import { isValidUuid } from '../util/tokenGenerator';
import { dbPool } from '../db/db';
import { RowDataPacket } from 'mysql2/promise';
import { WebSocketDetails, wsMap, wss } from './webSocketServer';
import { WebSocket } from 'ws';

export async function handleWebSocketUpgrade(req: IncomingMessage, socket: Socket, head: Buffer): Promise<void> {
  socket.on('error', (err) => {
    if ('errno' in err && err.errno === -4077) {
      socket.end();
      return;
    }

    console.log(err, err.stack);

    socket.write(`HTTP/1.1 ${http.STATUS_CODES[500]}\r\n\r\n`);
    socket.write('Internal server error\r\n');

    socket.end();
  });

  const memoryUsageMegabytes: number = process.memoryUsage().rss / Math.pow(1024, 2);
  const memoryThreshold: number = +(process.env.WS_ALLOW_MEMORY_THRESHOLD_MB || 500);

  if (memoryUsageMegabytes >= memoryThreshold) {
    socket.write(`HTTP/1.1 ${http.STATUS_CODES[509]}\r\n\r\n`);
    socket.write('Temporarily unavailable\r\n');

    socket.end();
    return;
  }

  const authSessionId: string | null = getAuthSessionId(req);

  if (!authSessionId || !(await isValidAuthSessionId(authSessionId))) {
    socket.end();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
    const existingWsDetails: WebSocketDetails | undefined = wsMap.get(authSessionId);

    if (existingWsDetails) {
      existingWsDetails.ws.close(1000, 'Replaced by new WebSocket.');
    }

    wsMap.set(authSessionId, { ws, pongTimestamp: Date.now() });
    wss.emit('connection', ws, req, authSessionId);
  });
}

function getAuthSessionId(req: IncomingMessage): string | null {
  const cookie: string | undefined = req.headers.cookie;

  if (!cookie) {
    return null;
  }

  const cookiesArr: string[] = cookie.split(';');

  for (const cookie of cookiesArr) {
    const [name, value] = cookie.split('=');

    if (name !== 'authSessionId') {
      continue;
    }

    if (!value || !isValidUuid(value)) {
      return null;
    }

    return value;
  }

  return null;
}

async function isValidAuthSessionId(authSessionId: string): Promise<number | null> {
  const currentTimestamp: number = Date.now();

  try {
    type AuthSessionDetails = {
      account_id: number;
      expiry_timestamp: number;
    };

    const [authSessionRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        account_id,
        expiry_timestamp
      FROM
        auth_sessions
      WHERE
        session_id = ?;`,
      [authSessionId]
    );

    const authSessionDetails = authSessionRows[0] as AuthSessionDetails | undefined;

    if (!authSessionDetails) {
      return null;
    }

    if (currentTimestamp >= authSessionDetails.expiry_timestamp) {
      return null;
    }

    return authSessionDetails.account_id;
  } catch (err: unknown) {
    console.log(err);
    return null;
  }
}
