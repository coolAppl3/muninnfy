import { JSX } from 'react';
import useCalendar from '../../hooks/useCalendar';
import { getFullDateString } from '../../utils/globalUtils';
import CrossIcon from '../../assets/svg/CrossIcon.svg?react';

type TimeWindowContainerProps = {
  startLabel: string;
  endLabel: string;

  className?: string;
};

export default function TimeWindowContainer({ startLabel, endLabel, className }: TimeWindowContainerProps): JSX.Element {
  const { displayCalendar, setStartTimestamp, setEndTimestamp, startTimestamp, endTimestamp } = useCalendar();

  return (
    <div className={`grid gap-1 sm:gap-2 sm:grid-cols-2 ${className || ''}`}>
      {Array.from({ length: 2 }, (_, index: number) => (
        <div
          key={index}
          className='relative flex flex-col justify-center items-start gap-[6px]'
        >
          <label
            htmlFor='time-window-start'
            className='text-sm font-medium text-title'
          >
            {index === 0 ? startLabel : endLabel}
          </label>

          <button
            type='button'
            id='time-window-start'
            onClick={() => (index === 0 ? displayCalendar('start') : displayCalendar('end'))}
            className='w-full h-4 p-1 rounded border-1 focus:!border-cta outline-0 text-description text-start font-medium md:text-sm transition-colors cursor-pointer'
          >
            {index === 0 ? startTimestamp && getFullDateString(startTimestamp) : endTimestamp && getFullDateString(endTimestamp)}
          </button>

          {((index === 0 && startTimestamp) || (index === 1 && endTimestamp)) && (
            <button
              type='button'
              className='absolute bottom-0 right-0 h-4 w-4 grid place-items-center cursor-pointer text-title transition-colors hover:text-cta'
              title='Remove date'
              aria-label='Remove date'
              onClick={() => (index === 0 ? setStartTimestamp(null) : setEndTimestamp(null))}
            >
              <CrossIcon className='w-[1.4rem] h-[1.4rem] rotate-45' />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
