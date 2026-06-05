import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import AuthProvider from '../../../providers/AuthProvider';
import Providers from '../../../Providers';
import { JSX, ReactNode } from 'react';
import * as accountServices from '../../../services/accountServices';
import { AxiosResponse } from 'axios';
import useAuth from '../../../hooks/useAuth';
import ConfirmAccountVerification from './ConfirmAccountVerification';

const displayPopupMessageMock = vi.fn();
const handleAsyncErrorMock = vi.fn();

vi.mock('../../../hooks/usePopupMessage', () => ({
  default: () => displayPopupMessageMock,
}));

vi.mock('../../../hooks/useAuth');
vi.mock('../../../services/accountServices', { spy: true });
vi.mock('../../../hooks/useHandleAsyncError', () => ({
  default: () => handleAsyncErrorMock,
}));

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Providers>{children}</Providers>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('ConfirmAccountVerification', () => {
  it('should call confirmAccountVerificationService on mount', async () => {
    const { getByRole } = await render(
      <ConfirmAccountVerification
        publicAccountId='somePublicAccountId'
        setIsValidVerificationLink={vi.fn()}
        verificationToken='someVerificationToken'
      />,
      {
        wrapper: TestWrapper,
      }
    );

    expect(accountServices.confirmAccountVerificationService).toHaveBeenCalledExactlyOnceWith(
      { publicAccountId: 'somePublicAccountId', verificationToken: 'someVerificationToken' },
      new AbortController().signal
    );
  });

  it('should call displayPopupMessage if the verification attempt is successful', async () => {
    vi.mocked(accountServices.confirmAccountVerificationService).mockResolvedValueOnce({
      data: {
        authSessionCreated: true,
      },
    } as unknown as AxiosResponse);

    await render(
      <ConfirmAccountVerification
        publicAccountId='somePublicAccountId'
        setIsValidVerificationLink={vi.fn()}
        verificationToken='someVerificationToken'
      />,
      {
        wrapper: TestWrapper,
      }
    );

    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'Account verified.',
      'success'
    );
  });

  it('should, if an auth session is not created, navigate the user to the sign in page', async () => {
    vi.mocked(accountServices.confirmAccountVerificationService).mockResolvedValueOnce({
      data: {
        authSessionCreated: false,
      },
    } as unknown as AxiosResponse);

    await render(
      <ConfirmAccountVerification
        publicAccountId='somePublicAccountId'
        setIsValidVerificationLink={vi.fn()}
        verificationToken='someVerificationToken'
      />,
      {
        wrapper: TestWrapper,
      }
    );

    expect(location.href.endsWith('/sign-in')).toBe(true);
  });

  it('should, if an auth session is created, set the authStatus to authenticated and navigate the user to the account page', async () => {
    const setAuthStatusMock = vi.fn();

    vi.mocked(accountServices.confirmAccountVerificationService).mockResolvedValueOnce({
      data: {
        authSessionCreated: true,
      },
    } as unknown as AxiosResponse);

    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: setAuthStatusMock,
    }));

    await render(
      <ConfirmAccountVerification
        publicAccountId='somePublicAccountId'
        setIsValidVerificationLink={vi.fn()}
        verificationToken='someVerificationToken'
      />,
      {
        wrapper: TestWrapper,
      }
    );

    expect(setAuthStatusMock).toHaveBeenCalledExactlyOnceWith('authenticated');
    expect(location.href.endsWith('/account')).toBe(true);
  });
});
