import { JSX, useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import InfoModalProvider from './InfoModalProvider';
import { MemoryRouter } from 'react-router-dom';
import useInfoModal from '../hooks/useInfoModal';

function TestComponent(): JSX.Element {
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  useEffect(() => {
    displayInfoModal({
      title: 'someTitle',
      btnTitle: 'Okay',
      onClick: removeInfoModal,
    });
  }, [displayInfoModal, removeInfoModal]);

  return <></>;
}

describe('InfoModalProvider', () => {
  it('should render a the InfoModal component when displayInfoModal is called', async () => {
    const { getByRole } = await render(
      <InfoModalProvider>
        <TestComponent />
      </InfoModalProvider>,
      { wrapper: MemoryRouter }
    );

    const confirmBtn: Locator = getByRole('button', { name: 'Okay' });
    await expect.element(confirmBtn).toBeVisible();
  });

  it('should remove the InfoModal component when removeInfoModal is called', async () => {
    const { getByRole } = await render(
      <InfoModalProvider>
        <TestComponent />
      </InfoModalProvider>,
      { wrapper: MemoryRouter }
    );

    const confirmBtn: Locator = getByRole('button', { name: 'Okay' });
    await expect.element(confirmBtn).toBeVisible();

    await userEvent.click(confirmBtn);
    await expect.element(confirmBtn).not.toBeInTheDocument();
  });
});
