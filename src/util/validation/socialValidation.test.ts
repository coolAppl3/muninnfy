import { describe, expect, it, vi } from 'vitest';
import { isValidSocialFindQuery, isValidSocialQuery } from './socialValidation';
import * as tokenGenerator from '../tokenGenerator';

vi.mock('../tokenGenerator', { spy: true });

describe('isValidSocialQuery', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidSocialQuery(23);
    const result2 = isValidSocialQuery({});
    const result3 = isValidSocialQuery([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the value is an empty string', () => {
    const result = isValidSocialQuery('');
    expect(result).toBe(false);
  });

  it('should return false if the value contains more than 25 characters', () => {
    const result = isValidSocialQuery('a'.repeat(26));
    expect(result).toBe(false);
  });

  it('should return false if the value is a single whitespace', () => {
    const result1 = isValidSocialQuery(' ');
    const result2 = isValidSocialQuery('\n');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });

  it('should return false if any symbols, apart from periods and underscores, are used', () => {
    const result1 = isValidSocialQuery('!');
    const result2 = isValidSocialQuery('@');
    const result3 = isValidSocialQuery('#');
    const result4 = isValidSocialQuery('$');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
    expect(result4).toBe(false);
  });

  it('should return true if a valid social query is provided', () => {
    const result1 = isValidSocialQuery('some query');
    const result2 = isValidSocialQuery(' some  query');
    const result3 = isValidSocialQuery('some_query');
    const result4 = isValidSocialQuery('some.query');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
    expect(result4).toBe(true);
  });
});

describe('isValidSocialFindQuery', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidSocialFindQuery(23);
    const result2 = isValidSocialFindQuery({});
    const result3 = isValidSocialFindQuery([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should call isValidUuid and return its result if the value includes a hyphen', () => {
    const result1 = isValidSocialFindQuery('invalid-uuid');
    const result2 = isValidSocialFindQuery('818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(result1).toBe(false);
    expect(result2).toBe(true);

    expect(tokenGenerator.isValidUuid).toHaveBeenCalledTimes(2);
    expect(tokenGenerator.isValidUuid).toHaveBeenCalledWith('invalid-uuid');
    expect(tokenGenerator.isValidUuid).toHaveBeenCalledWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb6'
    );
  });

  it('should call isValidUuid and return its result if the value includes a hyphen', () => {
    const result1 = isValidSocialFindQuery('invalid-uuid');
    const result2 = isValidSocialFindQuery('818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(result1).toBe(false);
    expect(result2).toBe(true);

    expect(tokenGenerator.isValidUuid).toHaveBeenCalledTimes(2);
    expect(tokenGenerator.isValidUuid).toHaveBeenCalledWith('invalid-uuid');
    expect(tokenGenerator.isValidUuid).toHaveBeenCalledWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb6'
    );
  });

  it('should return false if the value is shorter than 3 characters long', () => {
    const result1 = isValidSocialFindQuery('a');
    const result2 = isValidSocialFindQuery('aa');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });

  it('should return false if the value is longer than 25 characters long', () => {
    const result = isValidSocialFindQuery('a'.repeat(26));
    expect(result).toBe(false);
  });

  it('should return false if the value includes anything apart from alphanumerical values, periods, or underscores', () => {
    const result1 = isValidSocialFindQuery('invalid!@#$%^');
    const result2 = isValidSocialFindQuery('invalid value');
    const result3 = isValidSocialFindQuery('invalid\nvalue');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return true if a valid value is provided', () => {
    const result1 = isValidSocialFindQuery('aaa');
    const result2 = isValidSocialFindQuery('a'.repeat(25));
    const result3 = isValidSocialFindQuery('some_query.');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});
