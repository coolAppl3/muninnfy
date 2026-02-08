export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err: unknown) {
    console.log(err);
    return false;
  }
}

export function getFullDateString(timestamp: number): string {
  const dateObject: Date = new Date(timestamp);

  const date: number = dateObject.getDate();
  const monthName: string = getMonthName(dateObject);
  const ordinalSuffix: string = getDateOrdinalSuffix(date);
  const year: number = dateObject.getFullYear();

  return `${monthName} ${date}${ordinalSuffix}, ${year}`;
}

export function getShortenedDateString(timestamp: number): string {
  const dateObject: Date = new Date(timestamp);

  const date: number = dateObject.getDate();
  const monthName: string = getShortMonthName(dateObject);
  const ordinalSuffix: string = getDateOrdinalSuffix(date);
  const year: number = dateObject.getFullYear();

  return `${monthName} ${date}${ordinalSuffix}, ${year}`;
}

export function getDateAndTimeString(timestamp: number, includeYear: boolean = false): string {
  const dateObject: Date = new Date(timestamp);

  const date: number = dateObject.getDate();
  const monthName: string = getMonthName(dateObject);
  const ordinalSuffix: string = getDateOrdinalSuffix(date);
  const year: number = dateObject.getFullYear();

  const time = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short' }).format(dateObject);

  return `${monthName} ${date}${ordinalSuffix}${includeYear ? `, ${year} -` : ','} ${time}`;
}

function getMonthName(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
}

function getShortMonthName(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date);
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
