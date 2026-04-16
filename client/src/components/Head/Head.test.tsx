import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import Head from './Head';

describe('Head', () => {
  it('should set the document title to the title prop', async () => {
    await render(<Head title='someTitle' />);
    vi.waitFor(() => expect(document.title).toBe('someTitle'));
  });
});
