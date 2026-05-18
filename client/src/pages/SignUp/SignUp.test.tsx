import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, LocatorByRoleOptions, LocatorOptions, userEvent } from 'vitest/browser';
import SignUp from './SignUp';
import { AriaRole, JSX, ReactNode } from 'react';
import AuthProvider from '../../providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import Providers from '../../Providers';
import * as accountServices from '../../services/accountServices';
import { AxiosResponse } from 'axios';
import useAuth from '../../hooks/useAuth';
import { getAsyncErrorData } from '../../utils/errorUtils';
import CalendarProvider from '../../providers/CalendarProvider';
import useCalendar from '../../hooks/useCalendar';

const displayPopupMessageMock = vi.fn();
const handleAsyncErrorMock = vi.fn();
const displayLoadingOverlayMock = vi.fn();
const removeLoadingOverlayMock = vi.fn();

vi.mock('../../hooks/usePopupMessage', () => ({
  default: () => displayPopupMessageMock,
}));
vi.mock('../../hooks/useLoadingOverlay', () => ({
  default: () => ({
    displayLoadingOverlay: displayLoadingOverlayMock,
    removeLoadingOverlay: removeLoadingOverlayMock,
  }),
}));
vi.mock('../../hooks/useAuth');
vi.mock('../../services/accountServices', { spy: true });
vi.mock('../../hooks/useHandleAsyncError', () => ({
  default: () => handleAsyncErrorMock,
}));
vi.mock('../../hooks/useCalendar');

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Providers>
          <CalendarProvider>{children}</CalendarProvider>
        </Providers>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('SignUp', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render a heading, date of birth form element, display name, username, email, password, and confirmPassword inputs, a submit button, a checkbox for accepting the Terms of Service, and links to the Terms of Service, sign in page, and account verification page', async () => {
    const { getByRole, getByTitle } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const heading: Locator = getByRole('heading', { name: 'Sign up to Muninnfy' });
    await expect.element(heading).toBeVisible();

    const dateOfBirthBtn: Locator = getByRole('button', { name: 'Date of birth' });
    await expect.element(dateOfBirthBtn).toBeVisible();

    const displayNameInput: Locator = getByRole('textbox', { name: 'Display name' });
    await expect.element(displayNameInput).toBeVisible();

    const usernameInput: Locator = getByRole('textbox', { name: 'Username' });
    await expect.element(usernameInput).toBeVisible();

    const emailInput: Locator = getByRole('textbox', { name: 'Email' });
    await expect.element(emailInput).toBeVisible();

    const passwordInput: Locator = getByRole('textbox', { name: /Password/ });
    await expect.element(passwordInput).toBeVisible();

    const confirmPasswordInput: Locator = getByRole('textbox', { name: 'Confirm password' });
    await expect.element(confirmPasswordInput).toBeVisible();

    const acceptTermsBtn: Locator = getByTitle('Check');
    await expect.element(acceptTermsBtn).toBeVisible();
    await expect.element(acceptTermsBtn).toHaveAttribute('id', 'accepted-terms');

    const submitBtn: Locator = getByRole('button', { name: 'Submit' });
    await expect.element(submitBtn).toBeVisible();

    const signInLink: Locator = getByRole('link', { name: 'Sign in' });
    await expect.element(signInLink).toHaveAttribute('href', '/sign-in');

    const verificationLink: Locator = getByRole('link', {
      name: 'Continue your account verification',
    });
    await expect.element(verificationLink).toHaveAttribute('href', '/sign-up/verification');
  });

  it('should render an error span if an invalid date of birth is provided', async () => {
    // mocking an invalid date of birth

    const mockStartTimestampsMap = new Map<string, number>();
    mockStartTimestampsMap.set('dateOfBirth', Date.now());

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'dateOfBirth',

      startTimestampsMap: mockStartTimestampsMap,
      setStartTimestampsMap: vi.fn(),

      endTimestampsMap: new Map<string, number>(),
      setEndTimestampsMap: vi.fn(),

      displayCalendar: vi.fn(),
      removeCalendar: vi.fn(),
    }));

    const { getByText } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const errorSpan: Locator = getByText('You must be 13 years or older to sign up.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render an error span if an invalid display name is provided', async () => {
    const { getByRole, getByText } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const displayNameINput: Locator = getByRole('textbox', { name: 'Display name' });
    await userEvent.type(displayNameINput, '!nval!d D1splay Name 23');

    const errorSpan: Locator = getByText(
      'Only English letters and non-consecutive whitespaces are allowed.'
    );
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render an error span if an invalid username is provided', async () => {
    const { getByRole, getByText } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const usernameInput: Locator = getByRole('textbox', { name: 'Username' });
    await userEvent.type(usernameInput, 'invalid username');

    const errorSpan: Locator = getByText('Username must not contain any whitespace.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render an error span if an invalid email is provided', async () => {
    const { getByRole, getByText } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const emailInput: Locator = getByRole('textbox', { name: 'Email address' });
    await userEvent.type(emailInput, 'invalidEmail');

    const errorSpan: Locator = getByText('Invalid email format.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render an error span if an invalid password is provided', async () => {
    const { getByRole, getByText } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const passwordInput: Locator = getByRole('textbox', { name: /Password/ });
    await userEvent.type(passwordInput, 'invalid');

    const errorSpan: Locator = getByText('Password must at least contain 8 characters.');
    await expect.element(errorSpan).toBeVisible();
  });

  it('should render an error span if the password confirmation input does not match the password provided', async () => {
    const { getByRole, getByText } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    const passwordInput: Locator = getByRole('textbox', { name: /Password/ });
    await userEvent.type(passwordInput, 'somePassword');

    const confirmPasswordInput: Locator = getByRole('textbox', { name: 'Confirm password' });
    await userEvent.type(confirmPasswordInput, 'someOtherPassword');

    const errorSpan: Locator = getByText(`Passwords don't match`);
    await expect.element(errorSpan).toBeVisible();
  });

  it('should call displayPopupMessage if a submission is attempted without the Terms of Service being checked as accepted', async () => {
    const { getByRole, getByTitle } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    await submitForm(getByRole, getByTitle, false);

    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'You must accept our Terms of Service.',
      'error'
    );
  });

  it('should, assuming valid signup data is provided and a successful response is provided from the server, navigate the user to the verification page, and call displayLoadingOverlay, removeLoadingOverlay, and displayPopupMessage', async () => {
    const { getByRole, getByTitle } = await render(<SignUp />, {
      wrapper: TestWrapper,
    });

    vi.mocked(accountServices.signUpService).mockResolvedValueOnce({
      data: {
        publicAccountId: 'somePublicAccountId',
      },
    } as any);

    await submitForm(getByRole, getByTitle);

    expect(
      location.href.endsWith('/sign-up/verification?publicAccountId=somePublicAccountId')
    ).toBe(true);

    expect(displayLoadingOverlayMock).toHaveBeenCalledOnce();
    expect(removeLoadingOverlayMock).toHaveBeenCalledOnce();

    expect(displayPopupMessageMock).toHaveBeenCalledExactlyOnceWith(
      'Account created.',
      'success'
    );
  });

  it('should, if an error is returned from the server, log it and call handleAsyncError', async () => {
    const { getByRole, getByTitle } = await render(<SignUp />, {
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

    vi.mocked(accountServices.signUpService).mockRejectedValueOnce(responseData);
    vi.spyOn(console, 'log');
    handleAsyncErrorMock.mockReturnValueOnce({
      isHandled: true,
      ...getAsyncErrorData(responseData),
    });

    await submitForm(getByRole, getByTitle);

    expect(console.log).toHaveBeenCalledExactlyOnceWith(responseData);
    expect(handleAsyncErrorMock).toHaveBeenCalledExactlyOnceWith(responseData);
  });

  it('should, if a 403 response is received from the server, set the authStatus to authenticated', async () => {
    const { getByRole, getByTitle } = await render(<SignUp />, {
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

    vi.mocked(accountServices.signUpService).mockRejectedValueOnce(responseData);
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
  });
});

async function submitForm(
  getByRole: (role: AriaRole | ({} & string), options?: LocatorByRoleOptions) => Locator,
  getByTitle: (text: string | RegExp, options?: LocatorOptions | undefined) => Locator,
  acceptTerms: boolean = true
): Promise<void> {
  const mockStartTimestampsMap = new Map<string, number>();
  mockStartTimestampsMap.set('dateOfBirth', new Date(2000, 1, 1).getTime());

  vi.mocked(useCalendar).mockImplementation(() => ({
    calendarKey: 'dateOfBirth',

    startTimestampsMap: mockStartTimestampsMap,
    setStartTimestampsMap: vi.fn(),

    endTimestampsMap: new Map<string, number>(),
    setEndTimestampsMap: vi.fn(),

    displayCalendar: vi.fn(),
    removeCalendar: vi.fn(),
  }));

  const displayNameInput: Locator = getByRole('textbox', { name: 'Display name' });
  const usernameInput: Locator = getByRole('textbox', { name: 'Username' });
  const emailInput: Locator = getByRole('textbox', { name: 'Email' });
  const passwordInput: Locator = getByRole('textbox', { name: /Password/ });
  const confirmPasswordInput: Locator = getByRole('textbox', { name: 'Confirm password' });
  const acceptTermsBtn: Locator = getByTitle('Check');
  const submitBtn: Locator = getByRole('button', { name: 'Submit' });

  await userEvent.type(displayNameInput, 'John Doe');
  await userEvent.type(usernameInput, 'johnDoe');
  await userEvent.type(emailInput, 'johnDoe@example.com');
  await userEvent.type(passwordInput, 'somePassword');
  await userEvent.type(confirmPasswordInput, 'somePassword');

  acceptTerms && (await userEvent.click(acceptTermsBtn));
  await userEvent.click(submitBtn);
}
