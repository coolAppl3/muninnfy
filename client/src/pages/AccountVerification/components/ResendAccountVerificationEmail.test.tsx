import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import AuthProvider from '../../../providers/AuthProvider';
import Providers from '../../../Providers';
import { JSX, ReactNode } from 'react';
import * as accountServices from '../../../services/accountServices';
import ResendAccountVerificationEmail from './ResendAccountVerificationEmail';
import { AxiosResponse } from 'axios';
import { getAsyncErrorData } from '../../../utils/errorUtils';

const displayPopupMessageMock = vi.fn();
const handleAsyncErrorMock = vi.fn();
const displayLoadingOverlayMock = vi.fn();
const removeLoadingOverlayMock = vi.fn();

vi.mock('../../../hooks/usePopupMessage', () => ({
  default: () => displayPopupMessageMock,
}));
vi.mock('../../../hooks/useLoadingOverlay', () => ({
  default: () => ({
    displayLoadingOverlay: displayLoadingOverlayMock,
    removeLoadingOverlay: removeLoadingOverlayMock,
  }),
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

describe('ResendAccountVerificationEmail', () => {
  it('it should call resendAccountVerificationEmailService, displayPopupMessage, displayLoadingOverlay, and removeLoadingOverlay if the emailResendBtn is clicked', async () => {
    const { getByRole } = await render(
      <ResendAccountVerificationEmail
        publicAccountId='somePublicAccountId'
        setIsValidVerificationLink={vi.fn()}
      />,
      { wrapper: TestWrapper }
    );

    vi.mocked(accountServices.resendAccountVerificationEmailService).mockResolvedValueOnce(
      {} as any
    );

    const resendBtn: Locator = getByRole('button', { name: 'Resend email' });
    await userEvent.click(resendBtn);

    expect(
      accountServices.resendAccountVerificationEmailService
    ).toHaveBeenCalledExactlyOnceWith({ publicAccountId: 'somePublicAccountId' });

    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith('Email resent.', 'success');
    expect(displayLoadingOverlayMock).toHaveBeenCalledOnce();
    expect(removeLoadingOverlayMock).toHaveBeenCalledOnce();
  });

  it('it should, if a 404 error is received from the server, call displayPopupMessage to override the displayed error message', async () => {
    const { getByRole } = await render(
      <ResendAccountVerificationEmail
        publicAccountId='somePublicAccountId'
        setIsValidVerificationLink={vi.fn()}
      />,
      { wrapper: TestWrapper }
    );

    const responseData = {
      isAxiosError: true,
      status: 400,
      response: {
        data: {
          message: 'Invalid public account ID.',
          reason: 'invalidPublicAccountId',
        },
      },
    } as unknown as AxiosResponse;

    vi.mocked(accountServices.resendAccountVerificationEmailService).mockRejectedValueOnce(
      responseData
    );
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    const resendBtn: Locator = getByRole('button', { name: 'Resend email' });
    await userEvent.click(resendBtn);

    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'Invalid recovery link.',
      'error'
    );
  });
});
