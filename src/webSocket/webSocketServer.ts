import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({
  noServer: true,
  clientTracking: false,
  maxPayload: 2000,
  perMessageDeflate: false,
});

export type WebSocketDetails = {
  ws: WebSocket;
  pongTimestamp: number;
};

export const wsMap: Map<string, WebSocketDetails> = new Map();

wss.on('connection', (ws: WebSocket, req: IncomingMessage, authSessionId: string) => {
  ws.on('pong', () => {
    wsMap.set(authSessionId, { ws, pongTimestamp: Date.now() });
  });

  ws.on('message', () => {
    // client messages aren't expected and will be ignored
  });

  ws.on('error', (err: Error) => {
    console.log(err);
    ws.close(1011, `Unexpected websocket error: ${err}`);
  });

  ws.on('close', () => {
    wsMap.delete(authSessionId);
  });
});

console.log('Websocket server started.');
