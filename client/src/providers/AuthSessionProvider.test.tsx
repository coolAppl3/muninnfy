import { JSX, ReactNode, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import AuthSessionProvider from './AuthSessionProvider';
import AuthProvider from './AuthProvider';
import PopupMessageProvider from './PopupMessageProvider';
import LoadingOverlayProvider from './LoadingOverlayProvider';
import { MemoryRouter } from 'react-router-dom';
import * as authServices from '../services/authServices';
import useAuthSession from '../hooks/useAuthSession';
import useAuth from '../hooks/useAuth';

const setAuthStatusMock = vi.fn();
const displayLoadingOverlayMock = vi.fn();
const removeLoadingOverlayMock = vi.fn();
const displayPopupMessageMock = vi.fn();

vi.mock('../services/authServices', () => ({
  signOutService: vi.fn(),
  checkForAuthSessionService: vi.fn(),
}));
vi.mock('../hooks/useAuth', () => ({
  default: vi.fn(() => ({
    authStatus: 'authenticated',
    setAuthStatus: setAuthStatusMock,
  })),
}));
vi.mock('../hooks/useLoadingOverlay', () => ({
  default: () => ({
    displayLoadingOverlay: displayLoadingOverlayMock,
    removeLoadingOverlay: removeLoadingOverlayMock,
  }),
}));
vi.mock('../hooks/usePopupMessage', () => ({
  default: () => displayPopupMessageMock,
}));

function TestComponent(): JSX.Element {
  const { signOut } = useAuthSession();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return <></>;
}

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <MemoryRouter>
        <LoadingOverlayProvider>
          <PopupMessageProvider>{children}</PopupMessageProvider>
        </LoadingOverlayProvider>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('AuthSessionProvider', () => {
  it('should provide access to the signOut function', async () => {
    await render(
      <AuthSessionProvider>
        <TestComponent />
      </AuthSessionProvider>,
      { wrapper: TestWrapper }
    );

    await vi.waitFor(() => {
      expect(authServices.signOutService).toHaveBeenCalledTimes(1);
    });
  });

  it('should, assuming signOutService resolves, call displayLoadingOverlay, removeLoadingOverlay, setAuthStatus, and displayPopupMessage', async () => {
    vi.mocked(authServices.signOutService).mockResolvedValueOnce({ data: {} } as any);

    await render(
      <AuthSessionProvider>
        <TestComponent />
      </AuthSessionProvider>,
      { wrapper: TestWrapper }
    );

    await vi.waitFor(() => {
      expect(authServices.signOutService).toHaveBeenCalledTimes(1);
      expect(displayLoadingOverlayMock).toHaveBeenCalledTimes(1);
      expect(removeLoadingOverlayMock).toHaveBeenCalledTimes(1);
      expect(setAuthStatusMock).toHaveBeenCalledWith('unauthenticated');

      expect(displayPopupMessageMock).toHaveBeenCalledTimes(1);
      expect(displayPopupMessageMock).toHaveBeenCalledWith('Signed out.', 'success');
    });
  });

  it('should, assuming signOutService rejects, call displayLoadingOverlay, removeLoadingOverlay, and displayPopupMessage', async () => {
    vi.mocked(authServices.signOutService).mockRejectedValue({ data: {} } as any);

    await render(
      <AuthSessionProvider>
        <TestComponent />
      </AuthSessionProvider>,
      { wrapper: TestWrapper }
    );

    await vi.waitFor(() => {
      expect(authServices.signOutService).toHaveBeenCalledTimes(1);
      expect(displayLoadingOverlayMock).toHaveBeenCalledTimes(1);
      expect(removeLoadingOverlayMock).toHaveBeenCalledTimes(1);
      expect(displayPopupMessageMock).toHaveBeenCalledTimes(1);
      expect(displayPopupMessageMock).toHaveBeenCalledWith('Failed to sign out.', 'error');
    });
  });

  it('should, if the authStatus is already unauthenticated, call displayPopupMessage', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: vi.fn(),
    }));

    await render(
      <AuthSessionProvider>
        <TestComponent />
      </AuthSessionProvider>,
      { wrapper: TestWrapper }
    );

    await vi.waitFor(() => {
      expect(displayPopupMessageMock).toHaveBeenCalledTimes(1);
      expect(displayPopupMessageMock).toHaveBeenCalledWith('Already signed out.', 'success');

      expect(displayLoadingOverlayMock).not.toHaveBeenCalled();
      expect(removeLoadingOverlayMock).not.toHaveBeenCalled();
    });
  });
});
