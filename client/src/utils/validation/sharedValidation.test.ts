import { describe, expect, it } from 'vitest';
import { validateHexCode, validatePrice } from './sharedValidation';

describe('validatePrice', () => {
  it('should return null if the value provided is an empty string', () => {
    expect(validatePrice('', 2000)).toBeNull();
  });

  it('should return an error message if the value provided can not be converted to a number', () => {
    expect(validatePrice('invalid', 2000)).toBe('Price must be a valid number.');
    expect(validatePrice('23-', 2000)).toBe('Price must be a valid number.');
    expect(validatePrice('23invalid', 2000)).toBe('Price must be a valid number.');
    expect(validatePrice('23 invalid', 2000)).toBe('Price must be a valid number.');
  });

  it('should return an error message if the value provided is below 0', () => {
    expect(validatePrice('-23', 2000)).toBe(`Price can't be negative.`);
    expect(validatePrice('-230', 2000)).toBe(`Price can't be negative.`);
    expect(validatePrice('-2309999', 2000)).toBe(`Price can't be negative.`);
    expect(validatePrice('-1', 2000)).toBe(`Price can't be negative.`);
    expect(validatePrice('-0.01', 2000)).toBe(`Price can't be negative.`);
  });

  it('should return an error message if the value provided is larger than the maxValue provided', () => {
    expect(validatePrice('4000', 3000.23)).toBe(`Price can't exceed 3,000.23.`);
    expect(validatePrice('4000', 2100)).toBe(`Price can't exceed 2,100.00.`);
    expect(validatePrice('4000', 22)).toBe(`Price can't exceed 22.00.`);
  });

  it('should return an error message if the value provided has a decimal points without any decimal places', () => {
    expect(validatePrice('23.', 2000)).toBe('Price must be a valid number.');
  });

  it('should return an error message if the value provided has a decimal points with more than two decimals', () => {
    expect(validatePrice('23.333', 2000)).toBe(`Price can't exceed 2 decimal places.`);
  });

  it('should return null if a valid value is provided', () => {
    expect(validatePrice('100.23', 2000)).toBeNull();
    expect(validatePrice('240', 2000)).toBeNull();
    expect(validatePrice('1500.00', 2000)).toBeNull();
  });
});

describe('validateHexCode', () => {
  it('should return an error message if the code length is not equal to 8', () => {
    expect(validateHexCode('AA')).toBe('Code must be 8 characters long.');
    expect(validateHexCode('AAAAAAA')).toBe('Code must be 8 characters long.');
    expect(validateHexCode('AAAAAAAAA')).toBe('Code must be 8 characters long.');
  });

  it('should return an error message if the code includes any whitespace', () => {
    expect(validateHexCode('AAAA AAA')).toBe('Code must not contain any whitespace.');
  });

  it('should return an error message if a non-hexadecimal code is provided', () => {
    expect(validateHexCode('LLLLLLLL')).toBe('Only hexadecimal values are allowed.');
    expect(validateHexCode('AAA*$AAA')).toBe('Only hexadecimal values are allowed.');
    expect(validateHexCode('UUUUUUUU')).toBe('Only hexadecimal values are allowed.');
  });

  it('should return null if a valid hexadecimal code is provided', () => {
    expect(validateHexCode('ABCDEF12')).toBeNull();
    expect(validateHexCode('FF23DCAF')).toBeNull();
  });
});
