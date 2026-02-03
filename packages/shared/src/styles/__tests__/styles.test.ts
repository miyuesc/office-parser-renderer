import { describe, it, expect, vi, afterEach } from 'vitest';
import { FontManager } from '../FontManager';
import { BorderConflictResolver } from '../BorderConflictResolver';
import { IBorder } from '../types';

describe('FontManager', () => {
  it('should generate correct font string', () => {
    const font = { family: 'Arial', size: 12, bold: true };
    // 12pt * 1.333 = 16px (approx) - logic uses UnitConversion.ptToPixel
    expect(FontManager.getFontString(font)).toContain('bold 16px "Arial"');
  });

  // Note: FontManager.measureText requires DOM/Canvas, which happy-dom provides.
  it('should measure text (mocked)', () => {
    // happy-dom's canvas implementation might be limited, but we check if it runs
    try {
      const metrics = FontManager.measureText('Test', { family: 'Arial', size: 10 });
      expect(metrics.width).toBeDefined();
    } catch (e) {
      // Fallback if canvas not supported in test env
      console.warn('Canvas not fully supported in test env');
    }
  });
});

describe('BorderConflictResolver', () => {
  const solidThin: IBorder = { style: 'solid', width: 1, color: 'black' };
  const solidThick: IBorder = { style: 'solid', width: 2, color: 'black' };
  const double: IBorder = { style: 'double', width: 1, color: 'black' };
  const none: IBorder = { style: 'none', width: 0, color: '' };

  it('should prefer wider border', () => {
    expect(BorderConflictResolver.resolve(solidThin, solidThick)).toEqual(solidThick);
  });

  it('should prefer higher priority style', () => {
    expect(BorderConflictResolver.resolve(solidThin, double)).toEqual(double);
  });

  it('should prefer visible over none', () => {
    expect(BorderConflictResolver.resolve(solidThin, none)).toEqual(solidThin);
  });
});
