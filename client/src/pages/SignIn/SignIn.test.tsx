import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, LocatorByRoleOptions, LocatorOptions, userEvent } from 'vitest/browser';
import SignIn from './SignIn';
import { AriaRole, JSX, ReactNode } from 'react';
import AuthProvider from '../../providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import Providers from '../../Providers';
import * as accountServices from '../../services/accountServices';
import { AxiosResponse } from 'axios';
import useAuth from '../../hooks/useAuth';
import { getAsyncErrorData } from '../../utils/errorUtils';
import useConfirmModal from '../../hooks/useConfirmModal';

const displayPopupMessageMock = vi.fn();
const handleAsyncErrorMock = vi.fn();
const displayLoadingOverlayMock = vi.fn();
const removeLoadingOverlayMock = vi.fn();

vi.mock('../../hooks/usePopupMessage', () => ({
  default: () => displayPopupMessageMock,
}));
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useLoadingOverlay', () => ({
  default: () => ({
    displayLoadingOverlay: displayLoadingOverlayMock,
    removeLoadingOverlay: removeLoadingOverlayMock,
  }),
}));
vi.mock('../../hooks/useConfirmModal');
vi.mock('../../services/accountServices', { spy: true });
vi.mock('../../hooks/useHandleAsyncError', () => ({
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

describe('SignIn', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should render a heading, email input, password input, checkbox button, submit button, recovery link, and a sign up link', async () => {
    const { getByRole, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const heading: Locator = getByRole('heading', { name: 'Sign in to Muninnfy' });
    await expect.element(heading).toBeVisible();

    const emailInput: Locator = getByRole('textbox', { name: 'Email address' });
    await expect.element(emailInput).toBeVisible();
    await expect.element(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect.element(emailInput).toHaveAttribute('id', 'email');

    const passwordInput: Locator = getByRole('textbox', { name: 'Password' });
    await expect.element(passwordInput).toBeVisible();
    await expect.element(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    await expect.element(passwordInput).toHaveAttribute('id', 'password');

    const keepSignedInBtn: Locator = getByTitle('Check');
    await expect.element(keepSignedInBtn).toBeVisible();
    await expect.element(keepSignedInBtn).toHaveAttribute('id', 'keep-signed-in');

    const submitBtn: Locator = getByRole('button', { name: 'Submit' });
    await expect.element(submitBtn).toBeVisible();

    const recoveryLink: Locator = getByRole('link', { name: 'Start account recovery' });
    await expect.element(recoveryLink).toBeVisible();
    await expect.element(recoveryLink).toHaveAttribute('href', '/account/recovery');

    const signUpLink: Locator = getByRole('link', { name: 'Sign up' });
    await expect.element(signUpLink).toBeVisible();
    await expect.element(signUpLink).toHaveAttribute('href', '/sign-up');
  });

  it('should render an error span if an invalid email is provided', async () => {
    const { getByRole, getByText } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const emailInput: Locator = getByRole('textbox', { name: 'Email address' });
    await userEvent.type(emailInput, 'invalidEmail');

    const errorSpan: Locator = getByText('Invalid email format.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render an error span if an invalid password is provided', async () => {
    const { getByRole, getByText } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const passwordInput: Locator = getByRole('textbox', { name: 'Password' });
    await userEvent.type(passwordInput, 'invalid password');

    const errorSpan: Locator = getByText('Password must not contain any whitespace.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render error spans and a popup message if an invalid submission if attempted', async () => {
    const { getByRole, getByText } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const submitBtn: Locator = getByRole('button', { name: 'Submit' });
    await userEvent.click(submitBtn);

    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'A valid email is required.',
      'error'
    );

    const emailErrorSpan: Locator = getByText('A valid email is required.');
    await expect.element(emailErrorSpan).toBeVisible();

    const passwordErrorSpan: Locator = getByText('Password required.');
    await expect.element(passwordErrorSpan).toBeVisible();
  });

  it('should call signUpService, displayLoadingOverlay and removeLoadingOverlay when a valid submission is attempted', async () => {
    const { getByRole, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    vi.mocked(accountServices.signInService).mockResolvedValueOnce(
      {} as unknown as AxiosResponse
    );

    await submitForm(getByRole, getByTitle, true);

    expect(accountServices.signInService).toHaveBeenCalledExactlyOnceWith({
      email: 'validEmail@example.com',
      password: 'validPassword',
      keepSignedIn: true,
    });

    expect(displayLoadingOverlayMock).toHaveBeenCalledOnce();
    expect(removeLoadingOverlayMock).toHaveBeenCalledOnce();
  });

  it('should, if valid credentials are provided and confirmed by the server response, set the authStatus to authenticated and call displayPopupMessage', async () => {
    const { getByRole, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const setAuthStatusMock = vi.fn();

    vi.mocked(accountServices.signInService).mockResolvedValueOnce(
      {} as unknown as AxiosResponse
    );

    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: setAuthStatusMock,
    }));

    await submitForm(getByRole, getByTitle);

    expect(setAuthStatusMock).toHaveBeenCalledExactlyOnceWith('authenticated');
    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith('Signed in.', 'success');
  });

  it('should, if an error is returned from the server, log it and call handleAsyncError', async () => {
    const { getByRole, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      status: 500,
      response: {
        data: {
          message: 'Internal server error.',
        },
      },
    } as unknown as AxiosResponse;

    vi.mocked(accountServices.signInService).mockRejectedValueOnce(responseData);
    vi.spyOn(console, 'log');
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: true,
      status: 500,
      errMessage: 'Internal server error.',
    });

    await submitForm(getByRole, getByTitle);

    expect(console.log).toHaveBeenCalledExactlyOnceWith(responseData);
    expect(handleAsyncErrorMock).toHaveBeenCalledExactlyOnceWith(responseData);
  });

  it('should, if a 400 response is received from the server, render an error span with the error message provided', async () => {
    const { getByRole, getByText, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      isAxiosError: true,
      status: 400,
      response: {
        data: {
          message: 'Invalid email address.',
          reason: 'invalidEmail',
        },
      },
    } as unknown as AxiosResponse;

    vi.mocked(accountServices.signInService).mockRejectedValueOnce(responseData);
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    await submitForm(getByRole, getByTitle);

    const errorSpan: Locator = getByText('Invalid email address.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should, if a 401 response is received from the server, render an error span with the error message provided', async () => {
    const { getByRole, getByText, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      isAxiosError: true,
      status: 401,
      response: {
        data: {
          message: 'Incorrect password.',
          reason: 'incorrectPassword',
        },
      },
    } as unknown as AxiosResponse;

    vi.mocked(accountServices.signInService).mockRejectedValueOnce(responseData);
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    await submitForm(getByRole, getByTitle);

    const errorSpan: Locator = getByText('Incorrect password.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should, if a 404 response is received from the server, render an error span with the error message provided', async () => {
    const { getByRole, getByText, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      isAxiosError: true,
      status: 401,
      response: {
        data: {
          message: 'Account not found.',
          reason: 'accountNotFound',
        },
      },
    } as unknown as AxiosResponse;

    vi.mocked(accountServices.signInService).mockRejectedValueOnce(responseData);
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    await submitForm(getByRole, getByTitle);

    const errorSpan: Locator = getByText('Account not found.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should, if a 403 response with an alreadySignedIn errReason are received from the server, call displayPopupMessage as a successful operation and set the authStatus to authenticated', async () => {
    const { getByRole, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      isAxiosError: true,
      status: 403,
      response: {
        data: {
          message: 'Already signed in.',
          reason: 'alreadySignedIn',
        },
      },
    } as unknown as AxiosResponse;

    const setAuthStatusMock = vi.fn();

    vi.mocked(accountServices.signInService).mockRejectedValueOnce(responseData);
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: setAuthStatusMock,
    }));

    await submitForm(getByRole, getByTitle);

    expect(setAuthStatusMock).toHaveBeenCalledExactlyOnceWith('authenticated');
    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'Already signed in.',
      'success'
    );
  });

  it('should, if a 403 response with an accountLocked errReason are received from the server, call displayConfirmModal', async () => {
    const { getByRole, getByTitle } = await render(<SignIn />, {
      wrapper: TestWrapper,
    });

    const responseData = {
      isAxiosError: true,
      status: 403,
      response: {
        data: {
          message: 'Account is locked.',
          reason: 'accountLocked',
        },
      },
    } as unknown as AxiosResponse;

    const displayConfirmModalMock = vi.fn();

    vi.mocked(accountServices.signInService).mockRejectedValueOnce(responseData);
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: false,
      ...getAsyncErrorData(responseData),
    });

    vi.mocked(useConfirmModal).mockImplementation(() => ({
      displayConfirmModal: displayConfirmModalMock,
      removeConfirmModal: vi.fn(),
    }));

    await submitForm(getByRole, getByTitle);

    expect(displayConfirmModalMock).toHaveBeenCalledExactlyOnceWith({
      title: 'Account is locked.',
      description: 'You can regain access by following the account recovery process.',
      confirmBtnTitle: 'Recover account',
      cancelBtnTitle: 'Go to homepage',
      isDangerous: false,
      onConfirm: expect.any(Function),
      onCancel: expect.any(Function),
    });
  });
});

async function submitForm(
  getByRole: (role: AriaRole | ({} & string), options?: LocatorByRoleOptions) => Locator,
  getByTitle: (text: string | RegExp, options?: LocatorOptions | undefined) => Locator,
  keepSignedIn: boolean = false
): Promise<void> {
  const emailInput: Locator = getByRole('textbox', { name: 'Email address' });
  await userEvent.type(emailInput, 'validEmail@example.com');

  const passwordInput: Locator = getByRole('textbox', { name: 'Password' });
  await userEvent.type(passwordInput, 'validPassword');

  const keepSignedInBtn: Locator = getByTitle('Check');
  keepSignedIn && (await userEvent.click(keepSignedInBtn));

  const submitBtn: Locator = getByRole('button', { name: 'Submit' });
  await userEvent.click(submitBtn);
}
