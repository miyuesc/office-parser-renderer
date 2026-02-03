import { describe, it, expect } from 'vitest';
import { NumberFormatter } from '../NumberFormatter';

describe('NumberFormatter', () => {
  it('should format numbers with decimals', () => {
    expect(NumberFormatter.format(123.456, '0.00')).toBe('123.46');
    expect(NumberFormatter.format(123, '0.00')).toBe('123.00');
  });

  it('should format percentage', () => {
    expect(NumberFormatter.format(0.123, '0.00%')).toBe('12.30%');
  });

  it('should format currency (simple)', () => {
    expect(NumberFormatter.format(123.45, '$0.00')).toBe('$123.45');
  });

  it('should format dates (ISO)', () => {
    const date = new Date(2023, 0, 1); // Jan 1, 2023
    expect(NumberFormatter.format(date, 'yyyy-mm-dd')).toBe('2023-01-01');
  });
});
