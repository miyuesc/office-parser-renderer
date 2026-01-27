import { describe, it, expect } from 'vitest';
import { UnitConversion } from '../core/UnitConversion';

describe('UnitConversion', () => {
  it('should convert inch to EMU correctly', () => {
    expect(UnitConversion.inchToEmu(1)).toBe(914400);
  });

  it('should convert inch to px correctly via emu', () => {
    const emu = UnitConversion.inchToEmu(1);
    expect(UnitConversion.emuToPx(emu)).toBe(96);
  });

  it('should convert inch to pt correctly via emu', () => {
    const emu = UnitConversion.inchToEmu(1);
    expect(UnitConversion.emuToPt(emu)).toBe(72);
  });

  it('should convert cm to emu correctly', () => {
    // 1 inch = 2.54 cm
    // 1 inch = 914400 emu
    // 1 cm = 360000 emu
    expect(Math.round(UnitConversion.cmToEmu(1))).toBe(360000);
  });
});
