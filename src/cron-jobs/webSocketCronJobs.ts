import { minuteMilliseconds } from '../util/constants/globalConstants';
import { wsMap } from '../webSocket/webSocketServer';

export function pingWebSocketsCron(currentTimestamp: number): void {
  for (const { ws, pongTimestamp } of wsMap.values()) {
    if (currentTimestamp - pongTimestamp >= minuteMilliseconds * 2) {
      ws.close(1000, 'Connection closed due to inactivity.');
      continue;
    }

    ws.ping();
  }
}
