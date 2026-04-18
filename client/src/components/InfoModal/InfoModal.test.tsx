import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import InfoModal from './InfoModal';
import { Locator, userEvent } from 'vitest/browser';

describe('InfoModal', () => {
  it('should render a heading with the value of the title prop if provided', async () => {
    const { getByText } = await render(
      <InfoModal
        title='someTitle'
        description='someDescription'
        btnTitle='Okay'
        onClick={() => {}}
      />
    );

    const heading: Locator = getByText('someTitle');
    await expect.element(heading).toBeVisible();
  });

  it('should render a paragraph with the value of the description prop if provided', async () => {
    const { getByText } = await render(
      <InfoModal
        title='someTitle'
        description='someDescription'
        btnTitle='Okay'
        onClick={() => {}}
      />
    );

    const paragraph: Locator = getByText('someDescription');
    await expect.element(paragraph).toBeVisible();
  });

  it('should render a button', async () => {
    const { getByRole } = await render(
      <InfoModal
        title='someTitle'
        description='someDescription'
        btnTitle='Okay'
        onClick={() => {}}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Okay' });
    await expect.element(btn).toBeVisible();
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();

    const { getByRole } = await render(
      <InfoModal
        title='someTitle'
        description='someDescription'
        btnTitle='Okay'
        onClick={onClick}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Okay' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
