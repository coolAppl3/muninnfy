import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import CalendarProvider from './CalendarProvider';
import { Locator, userEvent } from 'vitest/browser';
import { JSX, ReactNode, useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import useCalendar from '../hooks/useCalendar';
import PopupMessageProvider from './PopupMessageProvider';

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <MemoryRouter>
      <PopupMessageProvider>{children}</PopupMessageProvider>
    </MemoryRouter>
  );
}

describe('CalendarProvider', () => {
  it('should render the Calendar component when displayCalendar is called', async () => {
    function TestComponent(): JSX.Element {
      const { displayCalendar } = useCalendar();

      useEffect(() => {
        displayCalendar('start', 'someCalendarKey');
      }, [displayCalendar]);

      return <></>;
    }

    const { getByRole } = await render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
      { wrapper: TestWrapper }
    );

    const calendarCancelBtn: Locator = getByRole('button', { name: 'Cancel' });
    await expect.element(calendarCancelBtn).toBeVisible();
  });

  it('should remove the Calendar component when removeCalendar is called', async () => {
    function TestComponent(): JSX.Element {
      const { displayCalendar } = useCalendar();

      useEffect(() => {
        displayCalendar('start', 'someCalendarKey');
      }, [displayCalendar]);

      return <></>;
    }

    const { getByRole } = await render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
      { wrapper: TestWrapper }
    );

    const calendarCancelBtn: Locator = getByRole('button', { name: 'Cancel' });
    await expect.element(calendarCancelBtn).toBeVisible();

    await userEvent.click(calendarCancelBtn);
    await expect.element(calendarCancelBtn).not.toBeInTheDocument();
  });

  it('should update the startTimestampsMap when setStartTimestampsMap is used', async () => {
    function TestComponent(): JSX.Element {
      const { startTimestampsMap, setStartTimestampsMap, displayCalendar } = useCalendar();

      useEffect(() => {
        displayCalendar('start', 'someCalendarKey');
      }, [displayCalendar]);

      return (
        <>
          <span>map size: {startTimestampsMap.size}</span>

          <button
            type='button'
            className='relative z-11'
            onClick={() =>
              setStartTimestampsMap((prev) => {
                const newMap = new Map<string, number>(prev);
                newMap.set('someCalendarKey', Date.now());

                return newMap;
              })
            }
          >
            Add current timestamp
          </button>
        </>
      );
    }

    const { getByRole, getByText } = await render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
      { wrapper: TestWrapper }
    );

    const mapSizeSpan: Locator = getByText('map size:');
    const addTimestampBtn: Locator = getByRole('button', { name: 'Add current timestamp' });

    await expect.element(mapSizeSpan).toHaveTextContent('map size: 0');
    await userEvent.click(addTimestampBtn);
    await expect.element(mapSizeSpan).toHaveTextContent('map size: 1');
  });

  it('should update the endTimestampsMap when setEndTimestampsMap is used', async () => {
    function TestComponent(): JSX.Element {
      const { endTimestampsMap, setEndTimestampsMap, displayCalendar } = useCalendar();

      useEffect(() => {
        displayCalendar('start', 'someCalendarKey');
      }, [displayCalendar]);

      return (
        <>
          <span>map size: {endTimestampsMap.size}</span>

          <button
            type='button'
            className='relative z-11'
            onClick={() =>
              setEndTimestampsMap((prev) => {
                const newMap = new Map<string, number>(prev);
                newMap.set('someCalendarKey', Date.now());

                return newMap;
              })
            }
          >
            Add current timestamp
          </button>
        </>
      );
    }

    const { getByRole, getByText } = await render(
      <CalendarProvider>
        <TestComponent />
      </CalendarProvider>,
      { wrapper: TestWrapper }
    );

    const mapSizeSpan: Locator = getByText('map size:');
    const addTimestampBtn: Locator = getByRole('button', { name: 'Add current timestamp' });

    await expect.element(mapSizeSpan).toHaveTextContent('map size: 0');
    await userEvent.click(addTimestampBtn);
    await expect.element(mapSizeSpan).toHaveTextContent('map size: 1');
  });
});
