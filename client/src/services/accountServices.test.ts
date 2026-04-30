import { describe, expect, it, vi } from 'vitest';
import {
  confirmAccountDeletionService,
  confirmAccountRecoveryService,
  confirmAccountVerificationService,
  confirmEmailUpdateService,
  continueAccountVerificationService,
  getAccountDetailsService,
  getViewAccountDetailsService,
  resendAccountDeletionEmailService,
  resendAccountRecoveryEmailService,
  resendAccountVerificationEmailService,
  resendEmailUpdateEmailService,
  signInService,
  signUpService,
  startAccountDeletionService,
  startAccountRecoveryService,
  startEmailUpdateService,
  updateAccountPrivacyService,
  updateDisplayNameService,
  updatePasswordService,
} from './accountServices';
import axiosInstance from './axiosInstance';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBody = { someValue: 23 };

describe('signUpService', () => {
  it('should call post on the axios instance with the correct endpoint and request body', async () => {
    await signUpService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/signUp', mockBody);
  });
});

describe('continueAccountVerificationService', () => {
  it('should call post on the axios instance with the correct endpoint and request body', async () => {
    await continueAccountVerificationService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/accounts/verification/continue',
      mockBody
    );
  });
});

describe('resendAccountVerificationEmailService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await resendAccountVerificationEmailService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/accounts/verification/resendEmail',
      mockBody
    );
  });
});

describe('confirmAccountVerificationService', () => {
  it('should call patch on the axios instance with the correct endpoint, request body, and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await confirmAccountVerificationService(mockBody as any, abortSignal);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/accounts/verification/confirm',
      mockBody,
      { signal: abortSignal }
    );
  });
});

describe('signInService', () => {
  it('should call post on the axios instance with the correct endpoint and request body', async () => {
    await signInService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/signIn', mockBody);
  });
});

describe('getAccountDetailsService', () => {
  it('should call get on the axios instance with the correct endpoint and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getAccountDetailsService(abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/accounts', { signal: abortSignal });
  });
});

describe('getViewAccountDetailsService', () => {
  it('should call get on the axios instance with the correct endpoint and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getViewAccountDetailsService('somePublicAccountId', abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/accounts/somePublicAccountId', {
      signal: abortSignal,
    });
  });
});

describe('updateAccountPrivacyService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await updateAccountPrivacyService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/accounts/details/privacy', mockBody);
  });
});

describe('updateDisplayNameService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await updateDisplayNameService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/accounts/details/displayName', mockBody);
  });
});

describe('updatePasswordService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await updatePasswordService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/accounts/details/password', mockBody);
  });
});

describe('startEmailUpdateService', () => {
  it('should call post on the axios instance with the correct endpoint and request body', async () => {
    await startEmailUpdateService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/details/email/start', mockBody);
  });
});

describe('resendEmailUpdateEmailService', () => {
  it('should call patch on the axios instance with the correct endpoint', async () => {
    await resendEmailUpdateEmailService();
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/accounts/details/email/resendEmail');
  });
});

describe('confirmEmailUpdateService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await confirmEmailUpdateService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/accounts/details/email/confirm',
      mockBody
    );
  });
});

describe('startAccountRecoveryService', () => {
  it('should call post on the axios instance with the correct endpoint and request body', async () => {
    await startAccountRecoveryService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/recovery/start', mockBody);
  });
});

describe('resendAccountRecoveryEmailService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await resendAccountRecoveryEmailService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/accounts/recovery/resendEmail',
      mockBody
    );
  });
});

describe('confirmAccountRecoveryService', () => {
  it('should call patch on the axios instance with the correct endpoint and request body', async () => {
    await confirmAccountRecoveryService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/accounts/recovery/confirm', mockBody);
  });
});

describe('startAccountDeletionService', () => {
  it('should call post on the axios instance with the correct endpoint and request body', async () => {
    await startAccountDeletionService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/accounts/deletion/start', mockBody);
  });
});

describe('resendAccountDeletionEmailService', () => {
  it('should call patch on the axios instance with the correct endpoint', async () => {
    await resendAccountDeletionEmailService();
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/accounts/deletion/resendEmail');
  });
});

describe('confirmAccountDeletionService', () => {
  it('should call delete on the axios instance with the confirmation code', async () => {
    await confirmAccountDeletionService('AAAAAA');
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/accounts/deletion/confirm/AAAAAA');
  });
});
