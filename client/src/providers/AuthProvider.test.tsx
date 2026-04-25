import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import * as authServices from '../services/authServices';
import * as accountNotificationsWebsSocket from '../services/websockets/accountNotificationsWebsSocket';
import AuthProvider from './AuthProvider';

vi.mock('../services/authServices', { spy: true });
vi.mock('../services/websockets/accountNotificationsWebsSocket', { spy: true });

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should call checkForAuthSessionService with an abort signal on mount', async () => {
    await render(
      <AuthProvider>
        <></>
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(authServices.checkForAuthSessionService).toHaveBeenCalledTimes(1);
      expect(authServices.checkForAuthSessionService).toHaveBeenCalledWith(
        new AbortController().signal
      );
    });
  });

  it('should call connectAccountNotificationsWebSocket on mount if the user is authenticated', async () => {
    vi.mocked(authServices.checkForAuthSessionService).mockResolvedValueOnce({
      data: { isValidAuthSession: true },
    } as any);

    await render(
      <AuthProvider>
        <></>
      </AuthProvider>
    );

    await vi.waitFor(() =>
      expect(
        accountNotificationsWebsSocket.connectAccountNotificationsWebSocket
      ).toHaveBeenCalledTimes(1)
    );
  });

  it('should call disconnectAccountNotificationsWebSocket on mount if the user is unauthenticated', async () => {
    vi.mocked(authServices.checkForAuthSessionService).mockResolvedValueOnce({
      data: { isValidAuthSession: false },
    } as any);

    await render(
      <AuthProvider>
        <></>
      </AuthProvider>
    );

    await vi.waitFor(() =>
      expect(
        accountNotificationsWebsSocket.disconnectAccountNotificationsWebSocket
      ).toHaveBeenCalledTimes(1)
    );
  });
});
