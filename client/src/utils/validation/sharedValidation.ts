export function validatePrice(value: string, maxValue: number): string | null {
  if (value === '') {
    return null;
  }

  const valueAsNumber: number = +value;

  if (Number.isNaN(+value)) {
    return 'Price must be a valid number.';
  }

  if (valueAsNumber < 0) {
    return `Price can't be negative.`;
  }

  if (valueAsNumber > maxValue) {
    const maxPrice: string = maxValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `Price can't exceed ${maxPrice}.`;
  }

  const decimalPortion: string | undefined = value.toString().split('.')[1];

  if (decimalPortion === undefined) {
    return null;
  }

  if (decimalPortion.length === 0) {
    return 'Price must be a valid number.';
  }

  if (decimalPortion.length > 2) {
    return `Price can't exceed 2 decimal places.`;
  }

  return null;
}

export function validateHexCode(hexCode: string): string | null {
  if (hexCode.length !== 8) {
    return 'Code must be 8 characters long.';
  }

  if (hexCode.trim() !== hexCode) {
    return 'Code must not contain leading or trailing whitespace.';
  }

  if (hexCode.includes(' ')) {
    return 'Code must not contain any whitespace';
  }

  const regex: RegExp = /^[A-F0-9]{8}$/;
  if (!regex.test(hexCode)) {
    return 'Invalid code.';
  }

  return null;
}
