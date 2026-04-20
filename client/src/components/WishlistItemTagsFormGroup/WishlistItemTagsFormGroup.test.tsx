import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import WishlistItemTagsFormGroup from './WishlistItemTagsFormGroup';
import PopupMessageProvider from '../../providers/PopupMessageProvider';
import { JSX, useState } from 'react';

function WrappedComponent(): JSX.Element {
  const [tagsSet, setTagsSet] = useState<Set<string>>(new Set<string>());

  return (
    <WishlistItemTagsFormGroup
      tagsSet={tagsSet}
      setTagsSet={setTagsSet}
      label='someLabel'
    />
  );
}

describe('WishlistItemTagsFormGroup', () => {
  it('should render a label with the label prop text and a for attribute of item-tags', async () => {
    const { getByText } = await render(
      <WishlistItemTagsFormGroup
        tagsSet={new Set<string>()}
        setTagsSet={vi.fn()}
        label='someLabel'
      />,
      { wrapper: PopupMessageProvider }
    );

    const span: Locator = getByText('someLabel');
    await expect.element(span).toBeVisible();
    await expect.element(span).toHaveAttribute('for', 'item-tags');
  });

  it('should render an input with the correct attributes', async () => {
    const { getByRole } = await render(
      <WishlistItemTagsFormGroup
        tagsSet={new Set<string>()}
        setTagsSet={vi.fn()}
        label='someLabel'
      />,
      { wrapper: PopupMessageProvider }
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('name', 'item-tags');
    await expect.element(input).toHaveAttribute('id', 'item-tags');
    await expect.element(input).toHaveAttribute('autocomplete', 'off');
  });

  it('should render a span for every tag in the tagsSet', async () => {
    const { getByText } = await render(
      <WishlistItemTagsFormGroup
        tagsSet={new Set<string>(['tag1', 'tag2', 'tag3'])}
        setTagsSet={vi.fn()}
        label='someLabel'
      />,
      { wrapper: PopupMessageProvider }
    );

    const tag1: Locator = getByText('tag1');
    const tag2: Locator = getByText('tag2');
    const tag3: Locator = getByText('tag3');

    await expect.element(tag1).toBeVisible();
    await expect.element(tag2).toBeVisible();
    await expect.element(tag3).toBeVisible();
  });

  it('should render a tag spans with title and aria-label attributes of Remove tag', async () => {
    const { getByText } = await render(
      <WishlistItemTagsFormGroup
        tagsSet={new Set<string>(['tag'])}
        setTagsSet={vi.fn()}
        label='someLabel'
      />,
      { wrapper: PopupMessageProvider }
    );

    const tag: Locator = getByText('tag');
    await expect.element(tag).toHaveAttribute('title', 'Remove tag');
    await expect.element(tag).toHaveAttribute('aria-label', 'Remove tag');
  });

  it('should clear the input if the space or enter buttons are used, adding content to the tagsSet and rendering tag spans in the process', async () => {
    const { getByRole, getByText } = await render(<WrappedComponent />, {
      wrapper: PopupMessageProvider,
    });

    const input: Locator = getByRole('textbox', { name: 'someLabel' });

    await userEvent.type(input, 'tag1 ');
    await expect.element(input).toHaveValue('');

    await userEvent.type(input, 'tag2 \n');
    await expect.element(input).toHaveValue('');

    const tag1: Locator = getByText('tag1');
    const tag2: Locator = getByText('tag2');

    await expect.element(tag1).toBeVisible();
    await expect.element(tag2).toBeVisible();
  });

  it('should render an error span if an invalid tag value is typed into the input', async () => {
    const { getByRole, getByText } = await render(<WrappedComponent />, {
      wrapper: PopupMessageProvider,
    });

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await userEvent.type(input, '!nval!dT@g');

    const firstErrorSpan: Locator = getByText('Only english letters');
    await expect.element(firstErrorSpan).toBeVisible();
    await expect
      .element(firstErrorSpan)
      .toHaveTextContent('Only English letters, numbers, and underscores are allowed.');
  });

  it('should render an error span if an invalid tag value is typed into the input', async () => {
    const { getByRole, getByText } = await render(<WrappedComponent />, {
      wrapper: PopupMessageProvider,
    });

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await userEvent.type(input, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

    const errorSpan: Locator = getByText('50 characters');
    await expect.element(errorSpan).toBeVisible();
    await expect.element(errorSpan).toHaveTextContent('Tag must not exceed 50 characters.');
  });

  it('should remove a tag span from the DOM f clicked', async () => {
    const { getByRole, getByText } = await render(<WrappedComponent />, {
      wrapper: PopupMessageProvider,
    });

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await userEvent.type(input, 'someTag ');

    const tag: Locator = getByText('someTag');
    await expect.element(tag).toBeVisible();

    await userEvent.click(tag);
    await expect.element(tag).not.toBeInTheDocument();
  });
});
