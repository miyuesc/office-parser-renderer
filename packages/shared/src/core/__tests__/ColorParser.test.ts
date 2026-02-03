import { describe, it, expect } from 'vitest';
import { ColorParser } from '../ColorParser';

describe('ColorParser', () => {
  it('should parse 6-digit hex', () => {
    expect(ColorParser.toCSS('FF0000')).toBe('#FF0000');
    expect(ColorParser.toCSS('00FF00')).toBe('#00FF00');
  });

  it('should parse 8-digit hex (ARGB)', () => {
    // 80 = 128/255 approx 0.5
    expect(ColorParser.toCSS('80FF0000')).toBe('rgba(255, 0, 0, 0.50)');
  });

  it('should return transparent for empty string', () => {
    expect(ColorParser.toCSS('')).toBe('transparent');
  });
});
