import { Dispatch, JSX, SetStateAction } from 'react';
import useCalendar from '../../hooks/useCalendar';
import { getFullDateString } from '../../utils/globalUtils';
import CrossIcon from '../../assets/svg/CrossIcon.svg?react';
import { CalendarMode } from '../../contexts/CalendarContext';

type TimeWindowContainerProps = {
  calendarKey: string;
  startLabel: string;
  endLabel: string;
  className?: string;
};

export default function TimeWindowContainer({ calendarKey, startLabel, endLabel, className }: TimeWindowContainerProps): JSX.Element {
  const { startTimestampsMap, endTimestampsMap, setStartTimestampsMap, setEndTimestampsMap, displayCalendar } = useCalendar();

  const startTimestamp: number | undefined = startTimestampsMap.get(calendarKey);
  const endTimestamp: number | undefined = endTimestampsMap.get(calendarKey);

  function removeTimestamp(calendarMode: CalendarMode): void {
    const stateSetter: Dispatch<SetStateAction<Map<string, number>>> =
      calendarMode === 'start' ? setStartTimestampsMap : setEndTimestampsMap;

    stateSetter((prev) => {
      const nextMap = new Map<string, number>(prev);
      nextMap.delete(calendarKey);

      return nextMap;
    });
  }

  return (
    <div className={`grid gap-1 sm:gap-2 sm:grid-cols-2 ${className || ''}`}>
      {Array.from({ length: 2 }, (_, index: number) => (
        <div
          key={index}
          className='relative flex flex-col justify-center items-start gap-[6px]'
        >
          <label
            htmlFor={`time-window-${index === 0 ? 'start' : 'end'}`}
            className='text-sm font-medium text-title'
          >
            {index === 0 ? startLabel : endLabel}
          </label>

          <button
            type='button'
            id={`time-window-${index === 0 ? 'start' : 'end'}`}
            onClick={() => (index === 0 ? displayCalendar('start', calendarKey) : displayCalendar('end', calendarKey))}
            className='w-full h-4 p-1 rounded border-1 border-description/75 hover:border-cta outline-0 text-description text-start text-sm transition-colors cursor-pointer'
          >
            {index === 0 ? startTimestamp && getFullDateString(startTimestamp) : endTimestamp && getFullDateString(endTimestamp)}
          </button>

          {((index === 0 && startTimestamp) || (index === 1 && endTimestamp)) && (
            <button
              type='button'
              className='absolute bottom-0 right-0 h-4 w-4 grid place-items-center cursor-pointer text-title transition-colors hover:text-cta'
              title='Remove date'
              aria-label='Remove date'
              onClick={() => removeTimestamp(index === 0 ? 'start' : 'end')}
            >
              <CrossIcon className='w-[1.4rem] h-[1.4rem] rotate-45' />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
