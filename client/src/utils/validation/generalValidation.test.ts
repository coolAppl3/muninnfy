import { describe, expect, it } from 'vitest';
import { isValidUuid } from './generalValidation';

describe('isValidUuid', () => {
  it('should return false if a string not 36-characters long is provided', () => {
    expect(isValidUuid('f81d4fae-7dec-11d0-a765')).toBe(false);
    expect(isValidUuid('f81d4fae-7dec-11d0-00a0c91e6bf6')).toBe(false);
    expect(isValidUuid('f81d4fae-7dec-a765-00a0c91e6bf6')).toBe(false);
    expect(isValidUuid('f81d4fae-11d0-a765-00a0c91e6bf6')).toBe(false);
    expect(isValidUuid('7dec-11d0-a765-00a0c91e6bf6')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });

  it('should return false if a non-UUIDv4 is provided', () => {
    expect(isValidUuid('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')).toBe(false);
    expect(isValidUuid('9c858901-8a57-21e1-8b1a-0800200c9a66')).toBe(false);
    expect(isValidUuid('5df41881-3aed-3515-88a7-2f4a814cf09e')).toBe(false);
    expect(isValidUuid('21f7f8de-8051-5b89-8680-0195ef798b6a')).toBe(false);
  });

  it('should return true if a valid UUIDv$ is provided', () => {
    expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    expect(isValidUuid('9b1deb4d-3b7d-4b6a-a3c1-5f2e9d8c7a10')).toBe(true);
    expect(isValidUuid('2f6a9c8e-1d4b-4f72-b9e3-6c0a1e5d7f23')).toBe(true);
  });
});
