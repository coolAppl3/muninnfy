import { describe, expect, it } from 'vitest';
import { validateSocialFindQuery, validateSocialSearchQuery } from './socialValidation';

describe('validateSocialSearchQuery', () => {
  it('should return null if the value provided is an empty string', async () => {
    expect(validateSocialSearchQuery('')).toBeNull();
  });

  it('should return an error message if the value provided, when trimmed, is an empty string', () => {
    expect(validateSocialSearchQuery(' ')).toBe(
      'Search query must include at least one valid character.'
    );

    expect(validateSocialSearchQuery('\n')).toBe(
      'Search query must include at least one valid character.'
    );

    expect(validateSocialSearchQuery(' \n')).toBe(
      'Search query must include at least one valid character.'
    );
  });

  it('should return an error message if the value provided is longer than 25 characters', () => {
    expect(validateSocialSearchQuery('a'.repeat(26))).toBe(
      'Search query must not exceed 25 characters.'
    );
  });

  it('should return an error message if the value provided contains anything but English letters, numbers, whitespace, underscores, and periods', () => {
    expect(validateSocialSearchQuery('!nval!d se@rch query')).toBe(
      'Only English letters, numbers, whitespace, and the following symbols are allowed: `_`, `.`.'
    );

    expect(validateSocialSearchQuery('!@#$%^&*}{/][')).toBe(
      'Only English letters, numbers, whitespace, and the following symbols are allowed: `_`, `.`.'
    );
  });

  it('should return null if the value provided is a valid search query', () => {
    expect(validateSocialSearchQuery('someValidQuery')).toBeNull();
    expect(validateSocialSearchQuery('some other valid query')).toBeNull();
    expect(validateSocialSearchQuery('third query ._ 123')).toBeNull();
  });
});

describe('validateSocialFindQuery', () => {
  it('should return an error message if the value provided is an empty string', () => {
    expect(validateSocialFindQuery('')).toBe('A valid search query is required.');
  });

  it('should return an error message if the value provided contains whitespace', () => {
    expect(validateSocialFindQuery('some query')).toBe(
      'Search query must not contain any whitespace.'
    );
    expect(validateSocialFindQuery('some  query')).toBe(
      'Search query must not contain any whitespace.'
    );
    expect(validateSocialFindQuery('some\nquery')).toBe(
      'Search query must not contain any whitespace.'
    );
    expect(validateSocialFindQuery('some\n\nquery')).toBe(
      'Search query must not contain any whitespace.'
    );
    expect(validateSocialFindQuery(' someQuery ')).toBe(
      'Search query must not contain any whitespace.'
    );
  });

  it('should return null if the value provided is a valid UUID', () => {
    expect(validateSocialFindQuery('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBeNull();
    expect(validateSocialFindQuery('9b1deb4d-3b7d-4b6a-a3c1-5f2e9d8c7a10')).toBeNull();
    expect(validateSocialFindQuery('2f6a9c8e-1d4b-4f72-b9e3-6c0a1e5d7f23')).toBeNull();
  });

  it('should return an error message if the search query contains a hyphen but is not a valid UUIDv4', () => {
    expect(validateSocialFindQuery('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')).toBe(
      'Invalid account ID.'
    );
    expect(validateSocialFindQuery('9c858901-8a57-21e1-8b1a-0800200c9a66')).toBe(
      'Invalid account ID.'
    );
    expect(validateSocialFindQuery('5df41881-3aed-3515-88a7-2f4a814cf09e')).toBe(
      'Invalid account ID.'
    );
    expect(validateSocialFindQuery('21f7f8de-8051-5b89-8680-0195ef798b6a')).toBe(
      'Invalid account ID.'
    );
    expect(validateSocialFindQuery('21f7f8de-8680-0195ef798b6a')).toBe('Invalid account ID.');
    expect(validateSocialFindQuery('some-query')).toBe('Invalid account ID.');
  });

  it('should return an error message if the value provided, assuming it is not a UUID, is shorter than 3 characters', () => {
    expect(validateSocialFindQuery('a')).toBe(
      'Search query must at least contain 3 characters.'
    );
    expect(validateSocialFindQuery('aa')).toBe(
      'Search query must at least contain 3 characters.'
    );
  });

  it('should return an error message if the value provided , assuming it is not a UUID, is longer than 25 characters', () => {
    expect(validateSocialFindQuery('a'.repeat(26))).toBe(
      'Username-based search query must not exceed 25 characters.'
    );
  });

  it('should return an error message if the value provided contains anything but English letters, numbers, underscores, and periods', () => {
    expect(validateSocialFindQuery('!nval!dSe@rchQuery')).toBe(
      'Only English letters, numbers, whitespace, and the following symbols are allowed: `_`, `.`.'
    );

    expect(validateSocialFindQuery('!@#$%^&*}{/][')).toBe(
      'Only English letters, numbers, whitespace, and the following symbols are allowed: `_`, `.`.'
    );
  });

  it('should return null if the value provided is a valid search query', () => {
    expect(validateSocialFindQuery('someValidQuery')).toBeNull();
    expect(validateSocialFindQuery('someOtherQuery123_.')).toBeNull();
  });
});
