import { WEB_SOCKET_INACTIVITY_THRESHOLD } from '../util/constants/webSocketConstants';
import { wsMap } from '../webSocket/webSocketServer';

export function destroyStaleWebSocketsCron(currentTimestamp: number): void {
  for (const { ws, pongTimestamp } of wsMap.values()) {
    if (currentTimestamp - pongTimestamp >= WEB_SOCKET_INACTIVITY_THRESHOLD) {
      ws.close(1000, 'Connection closed due to inactivity.');
    }
  }
}
