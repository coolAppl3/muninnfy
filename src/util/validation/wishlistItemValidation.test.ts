import { describe, expect, it } from 'vitest';
import {
  isValidWishlistItemDescription,
  isValidWishlistItemLink,
  isValidWishlistItemPrice,
  isValidWishlistItemTitle,
} from './wishlistItemValidation';
import { WISHLIST_ITEM_MAX_PRICE } from '../constants/wishlistItemConstants';

describe('isValidWishlistItemTitle', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidWishlistItemTitle(23);
    const result2 = isValidWishlistItemTitle({});
    const result3 = isValidWishlistItemTitle([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the title contains invalid white space', () => {
    const result1 = isValidWishlistItemTitle(' some title');
    const result2 = isValidWishlistItemTitle(' some title ');
    const result3 = isValidWishlistItemTitle('some title ');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the title contains any non-ASCII characters', () => {
    const result = isValidWishlistItemTitle('улица');
    expect(result).toBe(false);
  });

  it('should return false if the title contains more than 50 characters', () => {
    const result = isValidWishlistItemTitle('a'.repeat(51));
    expect(result).toBe(false);
  });

  it('should return false if the title is an empty string', () => {
    const result = isValidWishlistItemTitle('');
    expect(result).toBe(false);
  });

  it('should return true if a valid title is provided', () => {
    const result1 = isValidWishlistItemTitle('some title');
    const result2 = isValidWishlistItemTitle('some title 123!');
    const result3 = isValidWishlistItemTitle('some title !@#$%^');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});

describe('isValidWishlistItemDescription', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidWishlistItemDescription(23);
    const result2 = isValidWishlistItemDescription({});
    const result3 = isValidWishlistItemDescription([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the description contains leading or trailing whitespace', () => {
    const result1 = isValidWishlistItemDescription(' some description');
    const result2 = isValidWishlistItemDescription('some description ');
    const result3 = isValidWishlistItemDescription('\nsome description\n');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the description is an empty string', () => {
    const result = isValidWishlistItemDescription('');
    expect(result).toBe(false);
  });

  it('should return false if the description is longer than 500 characters', () => {
    const result = isValidWishlistItemDescription('a'.repeat(501));
    expect(result).toBe(false);
  });

  it('should return false if the description contains any non-ASCII characters', () => {
    const result = isValidWishlistItemDescription('улица');
    expect(result).toBe(false);
  });

  it('should return true if a valid description is provided', () => {
    const result1 = isValidWishlistItemDescription('a');
    const result2 = isValidWishlistItemDescription('Some valid description');
    const result3 = isValidWishlistItemDescription('double  whitespace !@#$%^&*');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});

describe('isValidWishlistItemLink', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidWishlistItemLink(23);
    const result2 = isValidWishlistItemLink({});
    const result3 = isValidWishlistItemLink([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the link does not start with https://', () => {
    const result = isValidWishlistItemLink('invalidLink.com');
    expect(result).toBe(false);
  });

  it('should return false if the link does not contain anything past https://', () => {
    const result = isValidWishlistItemLink('https://');
    expect(result).toBe(false);
  });

  it('should return false if the link is loner than 1992 characters long past https://', () => {
    const result = isValidWishlistItemLink('https://' + 'a'.repeat(1993));
    expect(result).toBe(false);
  });

  it('should return true if none of the above conditions are met (allows invalid link, but meant to not be too verbose on purpose)', () => {
    const result = isValidWishlistItemLink('https://' + 'a'.repeat(1992));
    expect(result).toBe(true);
  });
});

describe('isValidWishlistItemPrice', () => {
  it('should return false if the value provided is not a number', () => {
    const result1 = isValidWishlistItemPrice('23');
    const result2 = isValidWishlistItemPrice({});
    const result3 = isValidWishlistItemPrice(NaN);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the price is less than 0', () => {
    const result = isValidWishlistItemPrice(-15);
    expect(result).toBe(false);
  });

  it('should return false if the price is greater than the maximum allowed price', () => {
    const result = isValidWishlistItemPrice(WISHLIST_ITEM_MAX_PRICE + 1);
    expect(result).toBe(false);
  });

  it('should return false if more than two decimal points are used', () => {
    const result = isValidWishlistItemPrice(23.555);
    expect(result).toBe(false);
  });

  it('should return true if a valid price is provided', () => {
    const result1 = isValidWishlistItemPrice(23);
    const result2 = isValidWishlistItemPrice(23.52);
    const result3 = isValidWishlistItemPrice(WISHLIST_ITEM_MAX_PRICE);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});
