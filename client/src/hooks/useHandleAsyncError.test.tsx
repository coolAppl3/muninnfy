import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import useHandleAsyncError from './useHandleAsyncError';
import AuthProvider from '../providers/AuthProvider';
import { JSX, ReactNode } from 'react';
import PopupMessageProvider from '../providers/PopupMessageProvider';
import InfoModalProvider from '../providers/InfoModalProvider';
import { MemoryRouter } from 'react-router-dom';
import * as errorUtils from '../utils/errorUtils';
import * as axios from 'axios';

const displayPopupMessageMock = vi.fn();
const setAuthStatusMock = vi.fn();
const displayInfoModalMock = vi.fn();

vi.mock('../utils/errorUtils', { spy: true });
vi.mock('./usePopupMessage', () => ({
  default: () => displayPopupMessageMock,
}));
vi.mock('./useAuth', () => ({
  default: () => ({
    authStatus: 'authenticated',
    setAuthStatus: setAuthStatusMock,
  }),
}));
vi.mock('./useInfoModal', () => ({
  default: () => ({
    displayInfoModal: displayInfoModalMock,
    removeInfoModal: vi.fn(),
  }),
}));

type HandleAsyncErrorData = errorUtils.AsyncErrorData & { isHandled: boolean };

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <MemoryRouter>
        <PopupMessageProvider>
          <InfoModalProvider>{children}</InfoModalProvider>
        </PopupMessageProvider>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('useHandleAsyncError', () => {
  it('should return a function', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current).toBeTypeOf('function');
  });

  it('should always call getAsyncErrorData with the err parameter provided', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current('invalidResponse');
    result.current({ someValue: 23 });
    result.current(new Error('someError'));

    expect(errorUtils.getAsyncErrorData).toHaveBeenCalledTimes(3);
    expect(errorUtils.getAsyncErrorData).toHaveBeenCalledWith('invalidResponse');
    expect(errorUtils.getAsyncErrorData).toHaveBeenCalledWith({ someValue: 23 });
    expect(errorUtils.getAsyncErrorData).toHaveBeenCalledWith(new Error('someError'));
  });

  it('should always call displayPopupMessage', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current('invalidResponse');
    result.current({ someValue: 23 });
    result.current(new Error('someError'));

    expect(displayPopupMessageMock).toHaveBeenCalledTimes(3);
  });

  it('should return a default HandleAsyncErrorData object if a non-axios error, or an axios error without the status and response properties, is provided', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const axiosErrorMock1 = {
      isAxiosError: true,
      status: undefined,
      response: {
        message: 'someErrorMessage',
      },
    } as unknown as axios.AxiosError;

    const axiosErrorMock2 = {
      isAxiosError: true,
      status: 400,
      response: undefined,
    } as unknown as axios.AxiosError;

    const response1: HandleAsyncErrorData = result.current('invalidResponse');
    const response2: HandleAsyncErrorData = result.current({ someValue: 23 });
    const response3: HandleAsyncErrorData = result.current(new Error('someError'));

    const response4: HandleAsyncErrorData = result.current(axiosErrorMock2);
    const response5: HandleAsyncErrorData = result.current(axiosErrorMock1);

    const defaultObject: HandleAsyncErrorData = {
      isHandled: true,
      status: 0,
      errMessage: 'Something went wrong.',
    };

    expect(response1).toStrictEqual(defaultObject);
    expect(response2).toStrictEqual(defaultObject);
    expect(response3).toStrictEqual(defaultObject);
    expect(response4).toStrictEqual(defaultObject);
    expect(response5).toStrictEqual(defaultObject);
  });

  it(`should call displayPopupMessage with 'Something went wrong.', and 'error' if a non-axios error is provided`, async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current('invalidResponse');
    result.current({ someValue: 23 });
    result.current(new Error('someError'));

    expect(displayPopupMessageMock).toHaveBeenCalledTimes(3);
    expect(displayPopupMessageMock).toHaveBeenCalledWith('Something went wrong.', 'error');
  });

  it('should return the return value of getAsyncErrorData if an axios error with the status and response properties is provided', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const axiosErrorMock1 = {
      isAxiosError: true,
      status: 400,
      response: {
        data: {
          message: 'someErrorMessage',
        },
      },
    } as unknown as axios.AxiosError;

    const axiosErrorMock2 = {
      isAxiosError: true,
      status: 404,
      response: {
        data: {
          message: 'someErrorMessage',
          reason: 'someReason',
        },
      },
    } as unknown as axios.AxiosError;

    const axiosErrorMock3 = {
      isAxiosError: true,
      status: 500,
      response: {
        data: {
          message: 'someErrorMessage',
          reason: 'someReason',
          resData: {
            someKey: 'someValue',
          },
        },
      },
    } as unknown as axios.AxiosError;

    const response1: HandleAsyncErrorData = result.current(axiosErrorMock1);
    const response2: HandleAsyncErrorData = result.current(axiosErrorMock2);
    const response3: HandleAsyncErrorData = result.current(axiosErrorMock3);

    expect(response1).toHaveProperty('isHandled', false);
    expect(response1).toHaveProperty('status', 400);
    expect(response1).toHaveProperty('errMessage', 'someErrorMessage');
    expect(response1).toHaveProperty('errReason', undefined);
    expect(response1).toHaveProperty('errResData', undefined);

    expect(response2).toHaveProperty('isHandled', false);
    expect(response2).toHaveProperty('status', 404);
    expect(response2).toHaveProperty('errMessage', 'someErrorMessage');
    expect(response2).toHaveProperty('errReason', 'someReason');
    expect(response2).toHaveProperty('errResData', undefined);

    expect(response3).toHaveProperty('isHandled', true);
    expect(response3).toHaveProperty('status', 500);
    expect(response3).toHaveProperty('errMessage', 'someErrorMessage');
    expect(response3).toHaveProperty('errReason', 'someReason');
    expect(response3).toHaveProperty('errResData', { someKey: 'someValue' });
  });

  it('should, assuming a valid axios error is provided, set isHandled to true in HandleAsyncErrorData if the error has a status of 500', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const axiosErrorMock = {
      isAxiosError: true,
      status: 500,
      response: {
        data: {
          message: 'someErrorMessage',
        },
      },
    } as unknown as axios.AxiosError;

    const response: HandleAsyncErrorData = result.current(axiosErrorMock);
    expect(response).toHaveProperty('isHandled', true);
  });

  it('should, assuming a valid axios error is provided, set isHandled to true in HandleAsyncErrorData if the error has a status of 401 and an errorREason of authSessionExpired, calling setAuthStatus in the process', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const axiosErrorMock = {
      isAxiosError: true,
      status: 401,
      response: {
        data: {
          message: 'someErrorMessage',
          reason: 'authSessionExpired',
        },
      },
    } as unknown as axios.AxiosError;

    const response: HandleAsyncErrorData = result.current(axiosErrorMock);
    expect(response).toHaveProperty('isHandled', true);
    expect(setAuthStatusMock).toHaveBeenCalledWith('unauthenticated');
  });

  it('should, assuming a valid axios error is provided, set isHandled to true in HandleAsyncErrorData if the error has a status of 429, calling displayInfoModal in the process', async () => {
    const { result } = await renderHook(() => useHandleAsyncError(), { wrapper: TestWrapper });

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const axiosErrorMock = {
      isAxiosError: true,
      status: 429,
      response: {
        data: {
          message: 'someErrorMessage',
        },
      },
    } as unknown as axios.AxiosError;

    const response: HandleAsyncErrorData = result.current(axiosErrorMock);
    expect(response).toHaveProperty('isHandled', true);
    expect(displayInfoModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Please slow down.',
        description: `You're making too many requests and have been suspended.\nYou'll be allowed to make requests again within 30-60 seconds.`,
        btnTitle: 'Okay',
      })
    );
  });
});
