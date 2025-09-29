import { JSX, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import CalendarContext, { CalendarContextType, CalendarMode } from '../contexts/CalendarContext';
import Calendar from '../components/Calendar/Calendar';
import { Location, useLocation } from 'react-router-dom';

export default function CalendarProvider({ children }: { children: ReactNode }): JSX.Element {
  const [calendarMode, setCalendarMode] = useState<CalendarMode | null>(null);

  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);

  const routerLocation: Location = useLocation();

  const displayCalendar: (mode: CalendarMode) => void = useCallback((mode: CalendarMode) => setCalendarMode(mode), []);
  const removeCalendar: () => void = useCallback(() => setCalendarMode(null), []);

  const clearCalendar: () => void = useCallback(() => {
    setCalendarMode(null);

    setStartTimestamp(null);
    setEndTimestamp(null);
  }, []);

  useEffect(() => {
    return removeCalendar;
  }, [routerLocation, removeCalendar]);

  const contextValue: CalendarContextType = useMemo(
    () => ({
      startTimestamp,
      setStartTimestamp,

      endTimestamp,
      setEndTimestamp,

      displayCalendar,
      removeCalendar,
      clearCalendar,
    }),
    [startTimestamp, endTimestamp, displayCalendar, removeCalendar, clearCalendar]
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
      {calendarMode ? <Calendar calendarMode={calendarMode} /> : null}
    </CalendarContext.Provider>
  );
}
