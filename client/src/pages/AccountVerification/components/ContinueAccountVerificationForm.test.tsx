import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, LocatorByRoleOptions, userEvent } from 'vitest/browser';
import AuthProvider from '../../../providers/AuthProvider';
import Providers from '../../../Providers';
import { AriaRole, JSX, ReactNode } from 'react';
import * as accountServices from '../../../services/accountServices';
import ContinueAccountVerificationForm from './ContinueAccountVerificationForm';
import { AxiosResponse } from 'axios';
import { getAsyncErrorData } from '../../../utils/errorUtils';
import useAuth from '../../../hooks/useAuth';

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

describe('ContinueAccountVerificationForm', () => {
  it('should call continueAccountVerificationService, displayLoadingOverlay and removeLoadingOverlay when a valid submission is attempted', async () => {
    const { getByRole } = await render(<ContinueAccountVerificationForm />, {
      wrapper: TestWrapper,
    });

    vi.mocked(accountServices.continueAccountVerificationService).mockResolvedValueOnce({
      data: {
        publicAccountId: 'somePublicAccountId',
      },
    } as unknown as AxiosResponse);

    await submitForm(getByRole);

    expect(accountServices.continueAccountVerificationService).toHaveBeenCalledExactlyOnceWith({
      email: 'validEmail@example.com',
    });
    expect(displayLoadingOverlayMock).toHaveBeenCalledOnce();
    expect(removeLoadingOverlayMock).toHaveBeenCalledOnce();
  });

  it('should, assuming a successful response is received from the server, navigate the user to the verification page and call displayPopupMessage', async () => {
    const { getByRole } = await render(<ContinueAccountVerificationForm />, {
      wrapper: TestWrapper,
    });

    vi.mocked(accountServices.continueAccountVerificationService).mockResolvedValueOnce({
      data: {
        publicAccountId: 'somePublicAccountId',
      },
    } as unknown as AxiosResponse);

    await submitForm(getByRole);

    expect(
      location.href.endsWith('/sign-up/verification?publicAccountId=somePublicAccountId')
    ).toBe(true);
    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'Verification request found.',
      'success'
    );
  });

  it('should, if a 403 response is received from the server, set the authStatus to authenticated', async () => {
    const { getByRole } = await render(<ContinueAccountVerificationForm />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      isAxiosError: true,
      status: 403,
      response: {
        data: {
          message: 'You must sign out before proceeding.',
          reason: 'signedIn',
        },
      },
    } as unknown as AxiosResponse;

    const setAuthStatusMock = vi.fn();

    vi.mocked(accountServices.continueAccountVerificationService).mockRejectedValueOnce(
      responseData
    );
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: setAuthStatusMock,
    }));

    await submitForm(getByRole);

    expect(setAuthStatusMock).toHaveBeenCalledExactlyOnceWith('authenticated');
  });
});

async function submitForm(
  getByRole: (role: AriaRole | ({} & string), options?: LocatorByRoleOptions) => Locator
): Promise<void> {
  const emailInput: Locator = getByRole('textbox', { name: 'Email address' });
  const submitBtn: Locator = getByRole('button', { name: 'Continue' });

  await userEvent.type(emailInput, 'validEmail@example.com');
  await userEvent.click(submitBtn);
}
