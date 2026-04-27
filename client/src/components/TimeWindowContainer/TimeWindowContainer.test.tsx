import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import TimeWindowContainer from './TimeWindowContainer';
import CalendarProvider from '../../providers/CalendarProvider';
import { MemoryRouter } from 'react-router-dom';
import { JSX, ReactNode } from 'react';
import useCalendar from '../../hooks/useCalendar';
import * as globalUtils from '../../utils/globalUtils';

vi.mock('../../hooks/useCalendar');
vi.mock('../../utils/globalUtils', { spy: true });

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <MemoryRouter>
      <CalendarProvider>{children}</CalendarProvider>
    </MemoryRouter>
  );
}

describe('TimeWindowContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it('should render a time start label with the value of the startLabel prop', async () => {
    const { getByText } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const span: Locator = getByText('someStartLabel');
    await expect.element(span).toBeVisible();
    await expect.element(span).toHaveAttribute('for', 'time-window-start');
  });

  it('should render a time end label with the value of the endLabel prop', async () => {
    const { getByText } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const span: Locator = getByText('someEndLabel');
    await expect.element(span).toBeVisible();
    await expect.element(span).toHaveAttribute('for', 'time-window-end');
  });

  it('should render a time start button with the id of time-window-start', async () => {
    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'someStartLabel' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toHaveAttribute('type', 'button');
    await expect.element(btn).toHaveAttribute('id', 'time-window-start');
  });

  it('should render a time end button with the id of time-window-end', async () => {
    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'someEndLabel' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toHaveAttribute('type', 'button');
    await expect.element(btn).toHaveAttribute('id', 'time-window-end');
  });

  it('should call getFullDateString and render out the date in time start button if the startTimestampsMap contains a timestamp related to the calendarKey prop', async () => {
    const startTimestamp: number = new Date(2026, 0, 1).getTime();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',

      startTimestampsMap: new Map<string, number>([['someKey', startTimestamp]]),
      setStartTimestampsMap: vi.fn(),

      endTimestampsMap: new Map<string, number>(),
      setEndTimestampsMap: vi.fn(),

      displayCalendar: vi.fn(),
      removeCalendar: vi.fn(),
    }));

    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'someStartLabel' });
    await expect.element(btn).toHaveTextContent('January 1st, 2026');

    expect(globalUtils.getFullDateString).toHaveBeenCalledWith(startTimestamp);
  });

  it('should call getFullDateString and render out the date in time end button if the endTimestampsMap contains a timestamp related to the calendarKey prop', async () => {
    const endTimestamp: number = new Date(2026, 0, 1).getTime();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',

      startTimestampsMap: new Map<string, number>(),
      setStartTimestampsMap: vi.fn(),

      endTimestampsMap: new Map<string, number>([['someKey', endTimestamp]]),
      setEndTimestampsMap: vi.fn(),

      displayCalendar: vi.fn(),
      removeCalendar: vi.fn(),
    }));

    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'someEndLabel' });
    await expect.element(btn).toHaveTextContent('January 1st, 2026');

    expect(globalUtils.getFullDateString).toHaveBeenCalledWith(endTimestamp);
  });

  it('should call displayCalendar with start and the calendarKey prop if the time start button is clicked', async () => {
    const displayCalendarMock = vi.fn();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',

      startTimestampsMap: new Map<string, number>(),
      setStartTimestampsMap: vi.fn(),

      endTimestampsMap: new Map<string, number>(),
      setEndTimestampsMap: vi.fn(),

      displayCalendar: displayCalendarMock,
      removeCalendar: vi.fn(),
    }));

    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'someStartLabel' });
    await userEvent.click(btn);
    expect(displayCalendarMock).toHaveBeenCalledWith('start', 'someKey');
  });

  it('should call displayCalendar with end and the calendarKey prop if the time end button is clicked', async () => {
    const displayCalendarMock = vi.fn();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',

      startTimestampsMap: new Map<string, number>(),
      setStartTimestampsMap: vi.fn(),

      endTimestampsMap: new Map<string, number>(),
      setEndTimestampsMap: vi.fn(),

      displayCalendar: displayCalendarMock,
      removeCalendar: vi.fn(),
    }));

    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'someEndLabel' });
    await userEvent.click(btn);
    expect(displayCalendarMock).toHaveBeenCalledWith('end', 'someKey');
  });

  it('should render a remove date button if the startTimestampsMap contains a timestamp related to the calendarKey prop, which if clicked, calls setStartTimestampsMap', async () => {
    const startTimestamp: number = new Date(2026, 0, 1).getTime();
    const setStartTimestampsMapMock = vi.fn();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',

      startTimestampsMap: new Map<string, number>([['someKey', startTimestamp]]),
      setStartTimestampsMap: setStartTimestampsMapMock,

      endTimestampsMap: new Map<string, number>(),
      setEndTimestampsMap: vi.fn(),

      displayCalendar: vi.fn(),
      removeCalendar: vi.fn(),
    }));

    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'Remove date' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toHaveAttribute('type', 'button');
    await expect.element(btn).toHaveAttribute('title', 'Remove date');
    await expect.element(btn).toHaveAttribute('aria-label', 'Remove date');

    await userEvent.click(btn);
    expect(setStartTimestampsMapMock).toHaveBeenCalled();
  });

  it('should render a remove date button if the startTimestampsMap contains a timestamp related to the calendarKey prop, which if clicked, calls setStartTimestampsMap', async () => {
    const endTimestamp: number = new Date(2026, 0, 1).getTime();
    const setEndTimestampsMapMock = vi.fn();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',

      startTimestampsMap: new Map<string, number>(),
      setStartTimestampsMap: vi.fn(),

      endTimestampsMap: new Map<string, number>([['someKey', endTimestamp]]),
      setEndTimestampsMap: setEndTimestampsMapMock,

      displayCalendar: vi.fn(),
      removeCalendar: vi.fn(),
    }));

    const { getByRole } = await render(
      <TimeWindowContainer
        calendarKey='someKey'
        startLabel='someStartLabel'
        endLabel='someEndLabel'
      />,
      { wrapper: TestWrapper }
    );

    const btn: Locator = getByRole('button', { name: 'Remove date' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toHaveAttribute('type', 'button');
    await expect.element(btn).toHaveAttribute('title', 'Remove date');
    await expect.element(btn).toHaveAttribute('aria-label', 'Remove date');

    await userEvent.click(btn);
    expect(setEndTimestampsMapMock).toHaveBeenCalled();
  });
});
