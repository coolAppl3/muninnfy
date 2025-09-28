export function getDateAndTimeString(timestamp: number): string {
  const dateObject: Date = new Date(timestamp);

  const date: number = dateObject.getDate();
  const ordinalSuffix: string = getDateOrdinalSuffix(date);

  return `${getMonthName(dateObject)} ${date}${ordinalSuffix}, ${getTime(dateObject)}`;
}

function getMonthName(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
}

function getTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function getDateOrdinalSuffix(date: number): string {
  if (date % 100 >= 11 && date % 100 <= 13) {
    return 'th';
  }

  if (date % 10 === 1) return 'st';
  if (date % 10 === 2) return 'nd';
  if (date % 10 === 3) return 'rd';

  return 'th';
}

export function containsInvalidWhitespace(str: string): boolean {
  return /^\s|\s$|\s{2,}/.test(str);
}
