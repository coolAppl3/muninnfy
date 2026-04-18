import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import StatisticItem from './StatisticItem';
import { Locator } from 'vitest/browser';

describe('StatisticItem', () => {
  it('should render a span with the title prop', async () => {
    const { getByText } = await render(
      <StatisticItem
        title='someTitle'
        value='someValue'
      />
    );

    const span: Locator = getByText('someTitle');
    await expect.element(span).toBeVisible();
  });

  it('should render a span with the value prop', async () => {
    const { getByText } = await render(
      <StatisticItem
        title='someTitle'
        value='someValue'
      />
    );

    const span: Locator = getByText('someValue');
    await expect.element(span).toBeVisible();
  });
});
