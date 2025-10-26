import { JSX, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import CalendarContext, { CalendarContextType, CalendarMode } from '../contexts/CalendarContext';
import Calendar from '../components/Calendar/Calendar';
import { Location, useLocation } from 'react-router-dom';

type CalendarProviderProps = {
  children: ReactNode;
};

export default function CalendarProvider({ children }: CalendarProviderProps): JSX.Element {
  const [calendarMode, setCalendarMode] = useState<CalendarMode | null>(null);
  const [calendarKey, setCalendarKey] = useState<string>('');

  const [startTimestampsMap, setStartTimestampsMap] = useState<Map<string, number>>(new Map<string, number>());
  const [endTimestampsMap, setEndTimestampsMap] = useState<Map<string, number>>(new Map<string, number>());

  const routerLocation: Location = useLocation();

  const displayCalendar = useCallback((mode: CalendarMode, calendarKey: string) => {
    setCalendarMode(mode);
    setCalendarKey(calendarKey);
  }, []);

  const removeCalendar = useCallback(() => setCalendarMode(null), []);

  const clearCalendar = useCallback(() => {
    setCalendarMode(null);

    setStartTimestampsMap(new Map<string, number>());
    setEndTimestampsMap(new Map<string, number>());
  }, []);

  useEffect(() => {
    return removeCalendar;
  }, [routerLocation, removeCalendar]);

  const contextValue: CalendarContextType = useMemo(
    () => ({
      calendarKey,

      startTimestampsMap,
      setStartTimestampsMap,

      endTimestampsMap,
      setEndTimestampsMap,

      displayCalendar,
      removeCalendar,
      clearCalendar,
    }),
    [calendarKey, startTimestampsMap, endTimestampsMap, displayCalendar, removeCalendar, clearCalendar]
  );

  return (
    <CalendarContext value={contextValue}>
      {children}
      {calendarMode ? <Calendar calendarMode={calendarMode} /> : null}
    </CalendarContext>
  );
}
