import { page } from 'vitest/browser';
import '../src/index.css';
import { afterEach } from 'vitest';

await page.viewport(1280, 720);

afterEach(async () => {
  await page.viewport(1280, 720);
});
