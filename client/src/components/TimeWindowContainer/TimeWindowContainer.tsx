import { Dispatch, JSX, MouseEventHandler, SetStateAction } from 'react';
import useCalendar from '../../hooks/useCalendar';
import { getFullDateString } from '../../utils/globalUtils';
import CrossIcon from '../../assets/svg/CrossIcon.svg?react';

type TimeWindowContainerProps = {
  calendarKey: string;
  startLabel: string;
  endLabel: string;
  className?: string;
};

export default function TimeWindowContainer({
  calendarKey,
  startLabel,
  endLabel,
  className,
}: TimeWindowContainerProps): JSX.Element {
  const {
    startTimestampsMap,
    endTimestampsMap,
    setStartTimestampsMap,
    setEndTimestampsMap,
    displayCalendar,
  } = useCalendar();

  const startTimestamp: number | undefined = startTimestampsMap.get(calendarKey);
  const endTimestamp: number | undefined = endTimestampsMap.get(calendarKey);

  function handleRemoveTimestamp(
    stateSetter: Dispatch<SetStateAction<Map<string, number>>>
  ): void {
    stateSetter((prev) => {
      const nextMap = new Map<string, number>(prev);
      nextMap.delete(calendarKey);

      return nextMap;
    });
  }

  return (
    <div className={`grid gap-1 sm:gap-2 sm:grid-cols-2 ${className || ''}`}>
      <div className='relative flex flex-col justify-center items-start gap-[6px]'>
        <label
          htmlFor='time-window-start'
          className='text-sm font-medium text-title'
        >
          {startLabel}
        </label>

        <button
          type='button'
          id='time-window-start'
          onClick={() => displayCalendar('start', calendarKey)}
          className='w-full h-4 p-1 rounded border-1 border-description/75 hover:border-cta outline-0 text-description text-start text-sm transition-colors cursor-pointer'
        >
          {startTimestamp && getFullDateString(startTimestamp)}
        </button>

        {startTimestamp && (
          <RemoveTimestampBtn onClick={() => handleRemoveTimestamp(setStartTimestampsMap)} />
        )}
      </div>

      <div className='relative flex flex-col justify-center items-start gap-[6px]'>
        <label
          htmlFor='time-window-end'
          className='text-sm font-medium text-title'
        >
          {endLabel}
        </label>

        <button
          type='button'
          id='time-window-end'
          onClick={() => displayCalendar('end', calendarKey)}
          className='w-full h-4 p-1 rounded border-1 border-description/75 hover:border-cta outline-0 text-description text-start text-sm transition-colors cursor-pointer'
        >
          {endTimestamp && getFullDateString(endTimestamp)}
        </button>

        {endTimestamp && (
          <RemoveTimestampBtn onClick={() => handleRemoveTimestamp(setEndTimestampsMap)} />
        )}
      </div>
    </div>
  );
}

type RemoveTimestampBtnProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
};

function RemoveTimestampBtn({ onClick }: RemoveTimestampBtnProps): JSX.Element {
  return (
    <button
      type='button'
      className='absolute bottom-0 right-0 h-4 w-4 grid place-items-center cursor-pointer text-title transition-colors hover:text-cta'
      title='Remove date'
      aria-label='Remove date'
      onClick={onClick}
    >
      <CrossIcon className='w-[1.4rem] h-[1.4rem] rotate-45' />
    </button>
  );
}
