import { JSX, MouseEvent, useState } from 'react';
import './Calendar.css';
import ChevronIcon from '../../assets/svg/ChevronIcon.svg?react';
import usePopupMessage from '../../hooks/usePopupMessage';
import useCalendar from '../../hooks/useCalendar';
import { CalendarMode } from '../../contexts/CalendarContext';
import Button from '../Button/Button';

export default function Calendar({ calendarMode }: { calendarMode: CalendarMode }): JSX.Element {
  const { setStartTimestamp, setEndTimestamp, removeCalendar } = useCalendar();
  const [renderMode, setRenderMode] = useState<'years' | 'months' | 'dates'>('years');

  const dateObject: Date = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(dateObject.getFullYear());
  const [selectedMonth, setSelecteDMonth] = useState<number>(dateObject.getMonth());

  const { displayPopupMessage } = usePopupMessage();

  const yearsArr: number[] = Array.from({ length: 12 }, (_, index: number) => selectedYear - (selectedYear % 10) + index);
  const daysArr: number[] = Array.from({ length: getMonthNumberOfDays(selectedMonth, selectedYear) }, (_, index: number) => index + 1);

  function navigateCalendar(direction: 1 | -1): void {
    if (renderMode === 'years') {
      setSelectedYear((prev) => prev + direction * 10);
      return;
    }

    if (renderMode === 'months') {
      setSelectedYear((prev) => prev + direction);
      return;
    }

    if (selectedMonth === 11 && direction === 1) {
      setSelecteDMonth(0);
      setSelectedYear((prev) => prev + 1);

      return;
    }

    if (selectedMonth === 0 && direction === -1) {
      setSelecteDMonth(11);
      setSelectedYear((prev) => prev - 1);

      return;
    }

    setSelecteDMonth((prev) => prev + direction);
  }

  function handleHeaderBtnClick(): void {
    if (renderMode === 'years') {
      return;
    }

    if (renderMode === 'months') {
      setRenderMode('years');
      return;
    }

    setRenderMode('months');
  }

  function getHeaderTitle(): string {
    if (renderMode === 'years') {
      return `${yearsArr[0]} - ${yearsArr[yearsArr.length - 1]}`;
    }

    if (renderMode === 'months') {
      return `${selectedYear}`;
    }

    return `${monthsArr[selectedMonth]} ${selectedYear}`;
  }

  function getEmptyDaysCount(): number {
    const firstDay: number = new Date(selectedYear, selectedMonth, 1).getDay();

    if (firstDay === 0) {
      return 6;
    }

    return firstDay - 1;
  }

  function isValidDate(date: number): boolean {
    if (!Number.isInteger(date)) {
      return false;
    }

    if (date < 0) {
      return false;
    }

    const monthNumberOfDays: number = getMonthNumberOfDays(selectedMonth, selectedYear);
    return date <= monthNumberOfDays;
  }

  function isCurrentMonth(index: number): boolean {
    return selectedYear === dateObject.getFullYear() && index === dateObject.getMonth();
  }

  return (
    <div className='calendar-modal fixed top-0 left-0 w-full h-[100vh] bg-overlay z-10 flex justify-center items-center outline-none'>
      <div className='calendar-modal-container w-[32rem] max-w-[32rem] py-3 px-2 mx-2 rounded-sm bg-primary border-1 border-cta/15 shadow-simple-tiny break-words;'>
        <header className='flex justify-between items-center mb-2'>
          <button
            type='button'
            className='w-full py-1 mr-1 bg-cta/10 rounded transition-[filter] hover:brightness-75 text-title text-start text-sm leading-[1] px-1 cursor-pointer disabled:hover:brightness-100 disabled:cursor-default disabled:bg-transparent'
            disabled={renderMode === 'years'}
            onClick={handleHeaderBtnClick}
          >
            {getHeaderTitle()}
          </button>

          <button
            type='button'
            className='nav-btn ml-auto mr-1'
            onClick={() => navigateCalendar(-1)}
          >
            <ChevronIcon className='rotate-90' />
          </button>

          <button
            type='button'
            className='nav-btn'
            onClick={() => navigateCalendar(1)}
          >
            <ChevronIcon className='-rotate-90' />
          </button>
        </header>

        {renderMode === 'years' && (
          <div
            className='years-container grid grid-cols-3 gap-1'
            onClick={(e: MouseEvent) => {
              if (!(e.target instanceof HTMLButtonElement)) {
                return;
              }

              const newSelectedYear: string = e.target.textContent;

              if (!Number.isInteger(+newSelectedYear)) {
                return;
              }

              setSelectedYear(+newSelectedYear);
              setRenderMode('months');
            }}
          >
            {yearsArr.map((year: number) => (
              <button
                type='button'
                key={year}
                className={year === dateObject.getFullYear() ? 'current' : ''}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {renderMode === 'months' && (
          <div
            className='months-container grid grid-cols-3 gap-1'
            onClick={(e: MouseEvent) => {
              if (!(e.target instanceof HTMLButtonElement)) {
                return;
              }

              const newSelectedMonth: string = e.target.textContent;
              const monthIndex: number = monthsArr.findIndex((month) => month.slice(0, 3) === newSelectedMonth);

              if (monthIndex < 0 || monthIndex > 11) {
                return;
              }

              setSelecteDMonth(monthIndex);
              setRenderMode('dates');
            }}
          >
            {Array.from({ length: 12 }, (_, index: number) => (
              <button
                type='button'
                className={isCurrentMonth(index) ? 'current' : ''}
                key={index}
              >
                {monthsArr[index]?.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {renderMode === 'dates' && (
          <div
            className='dates-container grid grid-cols-7'
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              if (!(e.target instanceof HTMLButtonElement)) {
                return;
              }

              const newSelectedDate: number = +e.target.textContent;

              if (!isValidDate(newSelectedDate)) {
                displayPopupMessage('Invalid date selected.', 'error');
                return;
              }

              const timestamp: number = new Date(selectedYear, selectedMonth, newSelectedDate).getTime();
              calendarMode === 'start' ? setStartTimestamp(timestamp) : setEndTimestamp(timestamp);

              removeCalendar();
            }}
          >
            {Array.from({ length: daysArr.length + getEmptyDaysCount() }, (_, index) => {
              if (index < getEmptyDaysCount()) {
                return <span key={index}></span>;
              }

              const date: number = index + 1 - getEmptyDaysCount();

              return (
                <button
                  type='button'
                  className={isCurrentMonth(selectedMonth) && date === dateObject.getDate() ? 'current' : ''}
                  key={index}
                >
                  {date}
                </button>
              );
            })}
          </div>
        )}

        <Button
          className='bg-primary border-title text-title mt-2 w-full'
          onClick={removeCalendar}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function getMonthNumberOfDays(month: number, year: number): number {
  if (month === 1) {
    return isLeapYear(year) ? 29 : 28;
  }

  if ([3, 5, 8, 10].includes(month)) {
    return 30;
  }

  return 31;
}

function isLeapYear(year: number): boolean {
  if (year % 400 === 0) {
    return true;
  }

  if (year % 100 === 0) {
    return false;
  }

  return year % 4 === 0;
}

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
