import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import ConfirmModal from './ConfirmModal';
import { Locator, userEvent } from 'vitest/browser';

describe('ConfirmModal', () => {
  it('should render a heading with the value of the title prop if provided', async () => {
    const { getByText } = await render(
      <ConfirmModal
        title='someTitle'
        description='someDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const heading: Locator = getByText('someTitle');
    await expect.element(heading).toBeVisible();
  });

  it('should render a paragraph with the value of the description prop if provided', async () => {
    const { getByText } = await render(
      <ConfirmModal
        title='someTitle'
        description='someDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const paragraph: Locator = getByText('someDescription');
    await expect.element(paragraph).toBeVisible();
  });

  it('should render a confirm button with the confirmBtnTitle prop', async () => {
    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Confirm' });
    await expect.element(btn).toBeVisible();
  });

  it('should call onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();

    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={false}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Confirm' });
    await userEvent.click(btn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should render a cancel button with the cancelBtnTitle prop', async () => {
    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Cancel' });
    await expect.element(btn).toBeVisible();
  });

  it('should call onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();

    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Cancel' });
    await userEvent.click(btn);
    expect(onCancel).toHaveBeenCalled();
  });

  it('should render a extra button with the extraBtnTitle prop', async () => {
    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        extraBtnTitle='Extra'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={() => {}}
        onExtraAction={() => {}}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Extra' });
    await expect.element(btn).toBeVisible();
  });

  it('should call onExtraAction when the cancel button is clicked', async () => {
    const onExtraAction = vi.fn();

    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        extraBtnTitle='Extra'
        isDangerous={false}
        onConfirm={() => {}}
        onCancel={() => {}}
        onExtraAction={onExtraAction}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Extra' });
    await userEvent.click(btn);
    expect(onExtraAction).toHaveBeenCalled();
  });

  it('should render a confirm button with the bg-danger border-danger class names if isDangerous is true', async () => {
    const { getByRole } = await render(
      <ConfirmModal
        title='someTitle'
        description='soeDescription'
        confirmBtnTitle='Confirm'
        cancelBtnTitle='Cancel'
        isDangerous={true}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Confirm' });
    await expect.element(btn).toHaveClass('bg-danger border-danger');
  });
});
