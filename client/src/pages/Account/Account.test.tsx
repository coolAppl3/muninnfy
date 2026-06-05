import { JSX, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import AuthProvider from '../../providers/AuthProvider';
import Account from './Account';
import * as accountServices from '../../services/accountServices';
import useAuth from '../../hooks/useAuth';
import { AxiosResponse } from 'axios';
import { getAsyncErrorData } from '../../utils/errorUtils';

const handleAsyncErrorMock = vi.fn();

vi.mock('../../services/accountServices', { spy: true });
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useHandleAsyncError', () => ({
  default: () => handleAsyncErrorMock,
}));

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

describe('Account', () => {
  it('should call getAccountDetailsService on mount', async () => {
    await render(<Account />, { wrapper: TestWrapper });

    expect(accountServices.getAccountDetailsService).toHaveBeenCalledExactlyOnceWith(
      new AbortController().signal
    );
  });

  it('should, if a 404 error is received from the server, set the authSTatus to unauthenticated', async () => {
    const responseData = {
      isAxiosError: true,
      status: 404,
      response: {
        data: {
          message: 'Account not found.',
          reason: 'accountNotFound',
        },
      },
    } as unknown as AxiosResponse;

    const setAuthStatusMock = vi.fn();

    vi.mocked(accountServices.getAccountDetailsService).mockRejectedValueOnce({
      responseData,
    });
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'authenticated',
      setAuthStatus: setAuthStatusMock,
    }));

    await render(<Account />, { wrapper: TestWrapper });

    expect(setAuthStatusMock).toHaveBeenCalledWith('unauthenticated');
  });
});
