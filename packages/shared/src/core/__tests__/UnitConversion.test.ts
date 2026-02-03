import { describe, it, expect } from 'vitest';
import { UnitConversion } from '../UnitConversion';

describe('UnitConversion', () => {
  it('should convert EMU to Pixel correctly', () => {
    // 1 inch = 914400 EMU = 96 px
    expect(UnitConversion.emuToPixel(914400)).toBeCloseTo(96);
    expect(UnitConversion.emuToPixel(0)).toBe(0);
  });

  it('should convert Pixel to EMU correctly', () => {
    expect(UnitConversion.pixelToEmu(96)).toBe(914400);
  });

  it('should convert Pt to Pixel correctly', () => {
    // 1 inch = 72 pt = 96 px
    expect(UnitConversion.ptToPixel(72)).toBeCloseTo(96);
  });

  it('should convert Pixel to Pt correctly', () => {
    expect(UnitConversion.pixelToPt(96)).toBeCloseTo(72);
  });
});
