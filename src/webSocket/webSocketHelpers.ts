import { WebSocketDetails, wsMap } from './webSocketServer';

type WebSocketMessage = {
  type: string;
  reason: string;
  data: { [key: string]: unknown };
};

export function sendWebSocketMessage(authSessionId: string, data: WebSocketMessage): void {
  try {
    const wsDetails: WebSocketDetails | undefined = wsMap.get(authSessionId);

    if (!wsDetails) {
      return;
    }

    wsDetails.ws.send(JSON.stringify(data), (err: Error | undefined) => err && console.log(err));
  } catch (err: unknown) {
    console.log(err);
  }
}
