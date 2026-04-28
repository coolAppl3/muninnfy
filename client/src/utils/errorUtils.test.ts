import { describe, expect, it } from 'vitest';
import { AsyncErrorData, getAsyncErrorData } from './errorUtils';
import { AxiosError } from 'axios';

describe('getAsyncErrorData', () => {
  it('should return null if the err provided is not an axios error', async () => {
    expect(getAsyncErrorData({ someKey: 23 })).toBeNull();
  });

  it('should return null if the err provided does not have a status', async () => {
    const axiosErrorMock = {
      isAxiosError: true,
      status: undefined,
      response: {
        data: {
          message: 'someErrorMessage',
        },
      },
    } as unknown as AxiosError;

    const result: AsyncErrorData | null = getAsyncErrorData(axiosErrorMock);
    expect(result).toBeNull();
  });

  it('should return null if the err provided does not have a response object', async () => {
    const axiosErrorMock = {
      isAxiosError: true,
      status: 400,
    } as unknown as AxiosError;

    const result: AsyncErrorData | null = getAsyncErrorData(axiosErrorMock);
    expect(result).toBeNull();
  });

  it('should return an object containing the status, errMessage, errReason, and errResData within the err provided', async () => {
    const axiosErrorMock = {
      isAxiosError: true,
      status: 400,
      response: {
        data: {
          message: 'someErrorMessage',
          reason: 'someReason',
          resData: {
            someKey: 23,
          },
        },
      },
    } as unknown as AxiosError;

    const result: AsyncErrorData | null = getAsyncErrorData(axiosErrorMock);
    expect(result).not.toBeNull();
    expect(result).toStrictEqual({
      status: 400,
      errMessage: 'someErrorMessage',
      errReason: 'someReason',
      errResData: { someKey: 23 },
    });
  });
});
