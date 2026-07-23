import { describe, expect, it } from 'vitest';
import { undefinedValuesDetected } from './requestValidation';

describe('undefinedValuesDetected', () => {
  it('should return true if the number of keys in the requestData object does not match the length of the expectedKeys array', () => {
    const result = undefinedValuesDetected({ someKey: 'someValue' }, [
      'someKey',
      'someOtherKey',
    ]);

    expect(result).toBe(true);
  });

  it('should return true if any of the keys in expected keys does not exist in the requestData object', () => {
    const result = undefinedValuesDetected(
      { someKey: 'someValue', someRandomKey: 'someRandomValue' },
      ['someKey', 'someOtherKey']
    );

    expect(result).toBe(true);
  });

  it('should return false if the keys in expectedKeys all exist in the requestData object', () => {
    const result = undefinedValuesDetected(
      { someKey: 'someValue', someOtherKey: 'someOtherValue' },
      ['someKey', 'someOtherKey']
    );

    expect(result).toBe(false);
  });
});
