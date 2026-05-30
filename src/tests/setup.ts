import { beforeEach, vi } from 'vitest';

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
