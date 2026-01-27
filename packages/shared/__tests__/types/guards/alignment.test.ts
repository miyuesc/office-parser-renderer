import { describe, it, expect } from 'vitest';
import { isHorizontalAlignment, isVerticalAlignment } from '../../../types/guards/alignment';

describe('Alignment Type Guards', () => {
  it('should validate HorizontalAlignment', () => {
    expect(isHorizontalAlignment('left')).toBe(true);
    expect(isHorizontalAlignment('center')).toBe(true);
    expect(isHorizontalAlignment('inside')).toBe(true); // 'justify' is not in ST_XAlign
    expect(isHorizontalAlignment('invalid')).toBe(false);
    expect(isHorizontalAlignment(123)).toBe(false);
  });

  it('should validate VerticalAlignment', () => {
    expect(isVerticalAlignment('top')).toBe(true);
    expect(isVerticalAlignment('center')).toBe(true); // 'middle' is not in ST_YAlign, it's 'center'
    expect(isVerticalAlignment('bottom')).toBe(true);
    expect(isVerticalAlignment('auto')).toBe(true); // Added 'auto' manually
    expect(isVerticalAlignment('invalid')).toBe(false);
  });
});
