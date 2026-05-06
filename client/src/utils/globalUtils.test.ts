import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  containsInvalidWhitespace,
  copyToClipboard,
  getDateAndTimeString,
  getDateString,
} from './globalUtils';

const clipboardWriteText = vi.fn();

describe('copyToClipboard', () => {
  beforeAll(() =>
    Object.assign(navigator.clipboard, {
      writeText: clipboardWriteText,
    })
  );

  afterAll(() => vi.resetAllMocks());

  it('should call navigator.clipboard.writeText with the provided text', async () => {
    await copyToClipboard('some text');
    expect(clipboardWriteText).toHaveBeenCalledTimes(1);
    expect(clipboardWriteText).toHaveBeenCalledWith('some text');
  });

  it('should return true if the text is successfully copied', async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error());
    const copiedSuccessfully: boolean = await copyToClipboard('some text');
    expect(copiedSuccessfully).toBe(false);
  });

  it('should return false if the text is not successfully copied', async () => {
    clipboardWriteText.mockResolvedValueOnce(undefined);
    const copiedSuccessfully: boolean = await copyToClipboard('some text');
    expect(copiedSuccessfully).toBe(true);
  });
});

describe('getDateString', () => {
  it('should, using the provided timestamp, provide a full date string with the Month DDnth, YYYY format', async () => {
    const result1: string = getDateString(new Date(2026, 1, 1).getTime());
    const result2: string = getDateString(new Date(2013, 7, 26).getTime());

    expect(result1).toBe('February 1st, 2026');
    expect(result2).toBe('August 26th, 2013');
  });

  it('should shorten the month to 3 characters if shortenedMonthName is true', async () => {
    const result1: string = getDateString(new Date(2026, 1, 1).getTime(), true);
    const result2: string = getDateString(new Date(2013, 7, 26).getTime(), true);

    expect(result1).toBe('Feb 1st, 2026');
    expect(result2).toBe('Aug 26th, 2013');
  });
});

describe('getDateAndTimeString', () => {
  it('should, using the provided timestamp, provide a date and time string with the Month DDnth, HH:MM format', async () => {
    const result1: string = getDateAndTimeString(new Date(2026, 1, 1).getTime());
    const result2: string = getDateAndTimeString(new Date(2013, 7, 26).getTime());

    expect(result1).toBe('February 1st, 00:00');
    expect(result2).toBe('August 26th, 00:00');
  });

  it('should, using the provided timestamp, provide a date and time string with the Month DDnth, YYYY — HH:MM format if the includeYear parameter is true', async () => {
    const result1: string = getDateAndTimeString(new Date(2026, 1, 1).getTime(), true);
    const result2: string = getDateAndTimeString(new Date(2013, 7, 26).getTime(), true);

    expect(result1).toBe('February 1st, 2026 — 00:00');
    expect(result2).toBe('August 26th, 2013 — 00:00');
  });
});

describe('containsInvalidWhitespace', () => {
  it('should return true if the string starts with any whitespace', async () => {
    expect(containsInvalidWhitespace(' someText')).toBe(true);
    expect(containsInvalidWhitespace('  someText')).toBe(true);
    expect(containsInvalidWhitespace('\nsomeText')).toBe(true);
    expect(containsInvalidWhitespace('\n\nsomeText')).toBe(true);
    expect(containsInvalidWhitespace('\n someText')).toBe(true);
  });

  it('should return true if the string ends with any whitespace', async () => {
    expect(containsInvalidWhitespace('someText ')).toBe(true);
    expect(containsInvalidWhitespace('someText  ')).toBe(true);
    expect(containsInvalidWhitespace('someText\n')).toBe(true);
    expect(containsInvalidWhitespace('someText\n\n')).toBe(true);
    expect(containsInvalidWhitespace('someText \n')).toBe(true);
  });

  it('should return true if the string contains two or more consecutive instances of whitespace', async () => {
    expect(containsInvalidWhitespace('someText  someText')).toBe(true);
    expect(containsInvalidWhitespace('someText   someText')).toBe(true);
    expect(containsInvalidWhitespace('someText\n\nsomeText')).toBe(true);
    expect(containsInvalidWhitespace('someText\n\n\nsomeText')).toBe(true);
    expect(containsInvalidWhitespace('someText\n someText')).toBe(true);
    expect(containsInvalidWhitespace('someText \n someText')).toBe(true);
    expect(containsInvalidWhitespace('someText\n \nsomeText')).toBe(true);
  });

  it('should return false if no invalid whitespace is found', async () => {
    expect(containsInvalidWhitespace('someText someText')).toBe(false);
    expect(containsInvalidWhitespace('someText\nsomeText')).toBe(false);
    expect(containsInvalidWhitespace('someTextSomeText')).toBe(false);
  });
});
