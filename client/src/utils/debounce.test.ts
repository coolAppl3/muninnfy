import { describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  it('should return a debounced function that calls the function passed in only if the delay amount has passed', async () => {
    const mockFunction = vi.fn();
    const debounceDelayMilliseconds: number = 200;
    const debouncedMockFunction = debounce(mockFunction, debounceDelayMilliseconds);

    vi.useFakeTimers();

    debouncedMockFunction();
    expect(mockFunction).not.toHaveBeenCalled();

    debouncedMockFunction();
    expect(mockFunction).not.toHaveBeenCalled();

    debouncedMockFunction();
    vi.advanceTimersByTime(200);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
