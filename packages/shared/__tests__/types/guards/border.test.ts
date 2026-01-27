import { describe, it, expect } from 'vitest';
import { isBorderStyle } from '../../../types/guards/border';

describe('Border Type Guards', () => {
  it('should validate BorderStyle', () => {
    expect(isBorderStyle('single')).toBe(true); // 'solid' is not in ST_Border, usually 'single'
    expect(isBorderStyle('dashed')).toBe(true);
    expect(isBorderStyle('none')).toBe(true);
    expect(isBorderStyle('invalid')).toBe(false);
    expect(isBorderStyle(123)).toBe(false);
  });
});
