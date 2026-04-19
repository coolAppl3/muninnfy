import { page } from 'vitest/browser';
import '../src/index.css';
import { beforeEach, vi } from 'vitest';
import { cleanup } from 'vitest-browser-react';

await page.viewport(1280, 720);

beforeEach(async () => {
  await page.viewport(1280, 720);

  vi.clearAllMocks();
  cleanup();
});
