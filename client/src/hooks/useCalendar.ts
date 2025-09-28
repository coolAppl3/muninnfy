import { useContext } from 'react';
import CalendarContext, { CalendarContextType } from '../contexts/CalendarContext';

export default function useCalendar(): CalendarContextType {
  const context = useContext<CalendarContextType | null>(CalendarContext);

  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider.');
  }

  return context;
}
