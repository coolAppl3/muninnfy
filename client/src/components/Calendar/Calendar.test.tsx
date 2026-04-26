import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import Calendar from './Calendar';
import CalendarProvider from '../../providers/CalendarProvider';
import { JSX, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import PopupMessageProvider from '../../providers/PopupMessageProvider';
import { Locator, userEvent } from 'vitest/browser';
import useCalendar from '../../hooks/useCalendar';

vi.mock('../../hooks/useCalendar');

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <MemoryRouter>
      <PopupMessageProvider>
        <CalendarProvider>{children}</CalendarProvider>
      </PopupMessageProvider>
    </MemoryRouter>
  );
}

describe('Calendar', () => {
  it('should render a title button which, if the render mode is set to years, contains the the year range and is disabled', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const decadeStart: number = currentYear - (currentYear % 10);
    const lastVisibleYearData: number = decadeStart + 11;

    const btn: Locator = getByRole('button', {
      name: `${decadeStart} - ${lastVisibleYearData}`,
    });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toBeDisabled();
  });

  it('should render 12 year buttons starting from the start of the current decade', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const decadeStart: number = currentYear - (currentYear % 10);

    for (let i = 0; i < 12; i++) {
      const btn: Locator = getByRole('button', { name: new RegExp(`^${decadeStart + i}$`) });
      await expect.element(btn).toBeVisible();
    }
  });

  it('should switch the render mode to months and display all 12 months (first 3 letters) when a year button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    for (let i = 0; i < 12; i++) {
      const btn: Locator = getByRole('button', { name: monthsArr[i]?.slice(0, 3) });
      await expect.element(btn).toBeVisible();
    }
  });

  it('should switch the render mode to months when a year button is clicked, display the selected year in the title button, and enable it', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const titleBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await expect.element(titleBtn).toHaveTextContent(currentYear);
    await expect.element(titleBtn).not.toBeDisabled();
  });

  it('should switch the render mode to dates when a month button is clicked, display the selected year and month in the title button, and enable it', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const aprilBtn: Locator = getByRole('button', { name: 'Apr' });
    await userEvent.click(aprilBtn);

    const titleBtn: Locator = getByRole('button', { name: `April ${currentYear}` });
    await expect.element(titleBtn).toHaveTextContent(currentYear);
    await expect.element(titleBtn).not.toBeDisabled();
  });

  it('should switch the render mode to dates when a month button is clicked and display all the dates in said month', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const aprilBtn: Locator = getByRole('button', { name: 'Apr' });
    await userEvent.click(aprilBtn);

    for (let i = 0; i < 30; i++) {
      const btn: Locator = getByRole('button', { name: new RegExp(`^${i + 1}$`) });
      await expect.element(btn).toBeVisible();
    }
  });

  it('should switch the render mode back to months if the title button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const aprilBtn: Locator = getByRole('button', { name: 'Apr' });
    await userEvent.click(aprilBtn);

    const titleBtn: Locator = getByRole('button', { name: `April ${currentYear}` });
    await userEvent.click(titleBtn);

    const nextTitleBtn: Locator = getByRole('button', {
      name: `${currentYear}`,
    });
    await expect.element(nextTitleBtn).toBeVisible();
  });

  it('should switch the render mode back to years if the title button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const titleBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(titleBtn);

    const decadeStart: number = currentYear - (currentYear % 10);
    const lastVisibleYearData: number = decadeStart + 11;

    const nextTitleBtn: Locator = getByRole('button', {
      name: `${decadeStart} - ${lastVisibleYearData}`,
    });
    await expect.element(nextTitleBtn).toBeVisible();
    await expect.element(nextTitleBtn).toBeDisabled();
  });

  it('should render a button backwards navigation button with the correct attributes', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const btn: Locator = getByRole('button', { name: 'Navigate backwards' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toHaveAttribute('type', 'button');
    await expect.element(btn).toHaveAttribute('title', 'Navigate backwards');
    await expect.element(btn).toHaveAttribute('aria-label', 'Navigate backwards');
  });

  it('should render a button forwards navigation button with the correct attributes', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const btn: Locator = getByRole('button', { name: 'Navigate forwards' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toHaveAttribute('type', 'button');
    await expect.element(btn).toHaveAttribute('title', 'Navigate forwards');
    await expect.element(btn).toHaveAttribute('aria-label', 'Navigate forwards');
  });

  it('should regress the years by a decade when the backwards navigation button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const decadeStart: number = currentYear - (currentYear % 10);

    const backwardsNavigationBtn: Locator = getByRole('button', { name: 'Navigate backwards' });
    await userEvent.click(backwardsNavigationBtn);

    for (let i = 0; i < 12; i++) {
      const btn: Locator = getByRole('button', {
        name: new RegExp(`^${decadeStart + i - 10}$`),
      });
      await expect.element(btn).toBeVisible();
    }
  });

  it('should progress the years by a decade when the forwards navigation button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const decadeStart: number = currentYear - (currentYear % 10);

    const forwardsNavigationBtn: Locator = getByRole('button', { name: 'Navigate forwards' });
    await userEvent.click(forwardsNavigationBtn);

    for (let i = 0; i < 12; i++) {
      const btn: Locator = getByRole('button', {
        name: new RegExp(`^${decadeStart + i + 10}$`),
      });
      await expect.element(btn).toBeVisible();
    }
  });

  it('should regress the year by 1 when the backwards navigation button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const backwardsNavigationBtn: Locator = getByRole('button', { name: 'Navigate backwards' });
    await userEvent.click(backwardsNavigationBtn);

    const titleBtn: Locator = getByRole('button', { name: `${currentYear - 1}` });
    await expect.element(titleBtn).toBeVisible();
  });

  it('should progress the year by 1 when the forwards navigation button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const forwardsNavigationBtn: Locator = getByRole('button', { name: 'Navigate forwards' });
    await userEvent.click(forwardsNavigationBtn);

    const titleBtn: Locator = getByRole('button', { name: `${currentYear + 1}` });
    await expect.element(titleBtn).toBeVisible();
  });

  it('should regress the month by 1 when the backwards navigation button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const januaryBtn: Locator = getByRole('button', { name: 'Jan' });
    await userEvent.click(januaryBtn);

    const backwardsNavigationBtn: Locator = getByRole('button', { name: 'Navigate backwards' });
    await userEvent.click(backwardsNavigationBtn);

    const titleBtn: Locator = getByRole('button', { name: `December ${currentYear - 1}` });
    await expect.element(titleBtn).toBeVisible();
  });

  it('should progress the month by 1 when the forwards navigation button is clicked', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const currentYear: number = new Date().getFullYear();
    const currentYearBtn: Locator = getByRole('button', { name: `${currentYear}` });
    await userEvent.click(currentYearBtn);

    const decemberBtn: Locator = getByRole('button', { name: 'Dec' });
    await userEvent.click(decemberBtn);

    const forwardsNavigationBtn: Locator = getByRole('button', { name: 'Navigate forwards' });
    await userEvent.click(forwardsNavigationBtn);

    const titleBtn: Locator = getByRole('button', { name: `January ${currentYear + 1}` });
    await expect.element(titleBtn).toBeVisible();
  });

  it('should render a cancel button', async () => {
    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const btn: Locator = getByRole('button', { name: 'Cancel' });
    await expect.element(btn).toBeVisible();
  });

  it('should hide the component if the cancel button is clicked', async () => {
    const removeCalendarMock = vi.fn();

    vi.mocked(useCalendar).mockImplementation(() => ({
      calendarKey: 'someKey',
      startTimestampsMap: new Map<string, number>(),
      endTimestampsMap: new Map<string, number>(),
      setStartTimestampsMap: vi.fn(),
      setEndTimestampsMap: vi.fn(),
      displayCalendar: vi.fn(),
      removeCalendar: removeCalendarMock,
    }));

    const { getByRole } = await render(<Calendar calendarMode='start' />, {
      wrapper: TestWrapper,
    });

    const btn: Locator = getByRole('button', { name: 'Cancel' });

    await userEvent.click(btn);
    expect(removeCalendarMock).toHaveBeenCalled();
  });
});

const monthsArr: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
