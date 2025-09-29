import { createContext, Dispatch, SetStateAction } from 'react';

export type CalendarMode = 'start' | 'end';
export type CalendarContextType = {
  startTimestamp: number | null;
  setStartTimestamp: Dispatch<SetStateAction<number | null>>;

  endTimestamp: number | null;
  setEndTimestamp: Dispatch<SetStateAction<number | null>>;

  displayCalendar: (calendarMode: CalendarMode) => void;
  removeCalendar: () => void;
  clearCalendar: () => void;
};

const CalendarContext = createContext<CalendarContextType | null>(null);
export default CalendarContext;
