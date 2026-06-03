import { beforeEach, vi } from 'vitest';
import { NextFunction, Request, Response } from 'express';

vi.mock('../middleware/rateLimiter', () => ({
  rateLimiter: (req: Request, res: Response, next: NextFunction) => next(),
}));

vi.mock('../db/db', () => ({
  dbPool: {
    getConnection: vi.fn().mockResolvedValue(mockConnection),
    execute: vi.fn(),
    query: vi.fn(),
  },
}));

export const mockConnection = {
  beginTransaction: vi.fn(),
  execute: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});
