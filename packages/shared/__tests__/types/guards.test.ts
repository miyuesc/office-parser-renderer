import { describe, it, expect } from 'vitest';
import { isLength, isLengthUnit } from '../../types';

describe('Type Guards: Length', () => {
  describe('isLengthUnit', () => {
    it('should return true for valid length units', () => {
      expect(isLengthUnit('pt')).toBe(true);
      expect(isLengthUnit('px')).toBe(true);
      expect(isLengthUnit('%')).toBe(true);
      expect(isLengthUnit('rem')).toBe(true);
    });

    it('should return false for invalid length units', () => {
      expect(isLengthUnit('invalid')).toBe(false);
      expect(isLengthUnit('')).toBe(false);
      expect(isLengthUnit('pixel')).toBe(false);
    });
  });

  describe('isLength', () => {
    it('should return true for numbers', () => {
      expect(isLength(100)).toBe(true);
      expect(isLength(0)).toBe(true);
      expect(isLength(-50)).toBe(true);
    });

    it('should return true for strings', () => {
      expect(isLength('100px')).toBe(true);
      expect(isLength('50%')).toBe(true);
      expect(isLength('auto')).toBe(true); // Technically currently just checks for string
    });

    it('should return false for other types', () => {
      expect(isLength(null)).toBe(false);
      expect(isLength(undefined)).toBe(false);
      expect(isLength({})).toBe(false);
      expect(isLength([])).toBe(false);
    });
  });
});
