import { JSX, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import useConfirmModal from '../hooks/useConfirmModal';
import ConfirmModalProvider from './ConfirmModalProvider';
import { MemoryRouter } from 'react-router-dom';

function TestComponent(): JSX.Element {
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  useEffect(() => {
    displayConfirmModal({
      title: 'someTitle',
      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      isDangerous: false,
      onConfirm: vi.fn(),
      onCancel: removeConfirmModal,
    });
  }, [displayConfirmModal, removeConfirmModal]);

  return <></>;
}

describe('ConfirmModalProvider', () => {
  it('should render a the ConfirmModal component when displayConfirmModal is called', async () => {
    const { getByRole } = await render(
      <ConfirmModalProvider>
        <TestComponent />
      </ConfirmModalProvider>,
      { wrapper: MemoryRouter }
    );

    const confirmBtn: Locator = getByRole('button', { name: 'Confirm' });
    await expect.element(confirmBtn).toBeVisible();
  });

  it('should remove the ConfirmModal component when removeConfirmModal is called', async () => {
    const { getByRole } = await render(
      <ConfirmModalProvider>
        <TestComponent />
      </ConfirmModalProvider>,
      { wrapper: MemoryRouter }
    );

    const cancelBtn: Locator = getByRole('button', { name: 'Cancel' });
    await expect.element(cancelBtn).toBeVisible();

    await userEvent.click(cancelBtn);
    await expect.element(cancelBtn).not.toBeInTheDocument();
  });
});
