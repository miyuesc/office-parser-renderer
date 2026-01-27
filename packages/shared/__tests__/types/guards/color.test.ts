import { describe, it, expect } from 'vitest';
import { isRgbColor, isSchemeColor, isSystemColor, isPresetColor, isColor } from '../../../types/guards/color';

describe('Color Type Guards', () => {
  it('should validate RgbColor', () => {
    expect(isRgbColor({ type: 'rgb', r: 255, g: 0, b: 0 })).toBe(true);
    expect(isRgbColor({ type: 'rgb', r: 0, g: 0, b: 0, a: 0.5 })).toBe(true);
    expect(isRgbColor({ type: 'cmyk', c: 0, m: 0, y: 0, k: 0 })).toBe(false);
    expect(isRgbColor(null)).toBe(false);
    expect(isRgbColor('red')).toBe(false);
  });

  it('should validate SchemeColor', () => {
    expect(isSchemeColor({ type: 'scheme', value: 'accent1' })).toBe(true);
    expect(isSchemeColor({ type: 'rgb', r: 0, g: 0, b: 0 })).toBe(false);
  });

  it('should validate SystemColor', () => {
    expect(isSystemColor({ type: 'system', value: 'windowText' })).toBe(true);
  });

  it('should validate PresetColor', () => {
    expect(isPresetColor({ type: 'preset', value: 'red' })).toBe(true);
  });

  it('should validate Color union', () => {
    expect(isColor('red')).toBe(true);
    expect(isColor('#FF0000')).toBe(true);
    expect(isColor({ type: 'rgb', r: 255, g: 255, b: 255 })).toBe(true);
    expect(isColor(123)).toBe(false);
  });
});
