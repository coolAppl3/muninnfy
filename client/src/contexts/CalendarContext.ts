import { createContext, Dispatch, SetStateAction } from 'react';

export type CalendarMode = 'start' | 'end';
export type CalendarContextType = {
  calendarKey: string;

  startTimestampsMap: Map<string, number>;
  setStartTimestampsMap: Dispatch<SetStateAction<Map<string, number>>>;

  endTimestampsMap: Map<string, number>;
  setEndTimestampsMap: Dispatch<SetStateAction<Map<string, number>>>;

  displayCalendar: (calendarMode: CalendarMode, calendarKey: string) => void;
  removeCalendar: () => void;
  clearCalendar: () => void;
};

const CalendarContext = createContext<CalendarContextType | null>(null);
export default CalendarContext;
