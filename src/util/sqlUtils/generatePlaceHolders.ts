export function generatePlaceHolders(numberOfPlaceHolders: number): string {
  return Array(numberOfPlaceHolders).fill('?').join(', ');
}
