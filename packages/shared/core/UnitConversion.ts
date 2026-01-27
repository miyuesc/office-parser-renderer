import { UNITS } from '../constants/units';

/**
 * Unit Conversion Utilities
 *
 * Base unit relationships are defined in shared/constants/units.ts
 */

export class UnitConversion {
  // EMU conversions
  public static emuToPx(emu: number): number {
    return (emu / UNITS.EMUS_PER_INCH) * UNITS.PIXELS_PER_INCH;
  }

  public static emuToPt(emu: number): number {
    return (emu / UNITS.EMUS_PER_INCH) * UNITS.POINTS_PER_INCH;
  }

  public static emuToTwip(emu: number): number {
    return (emu / UNITS.EMUS_PER_INCH) * UNITS.TWIPS_PER_INCH;
  }

  public static emuToCm(emu: number): number {
    return emu / UNITS.EMUS_PER_CM;
  }

  // Pixel conversions
  public static pxToEmu(px: number): number {
    return (px / UNITS.PIXELS_PER_INCH) * UNITS.EMUS_PER_INCH;
  }

  public static pxToPt(px: number): number {
    return (px / UNITS.PIXELS_PER_INCH) * UNITS.POINTS_PER_INCH;
  }

  public static pxToTwip(px: number): number {
    return (px / UNITS.PIXELS_PER_INCH) * UNITS.TWIPS_PER_INCH;
  }

  public static pxToCm(px: number): number {
    return (px / UNITS.PIXELS_PER_INCH) * UNITS.CM_PER_INCH; // wait px / 96 * 2.54 = cm.
    // Correct
  }

  // Point conversions
  public static ptToEmu(pt: number): number {
    return pt * UNITS.EMUS_PER_PT;
  }

  public static ptToPx(pt: number): number {
    return (pt / UNITS.POINTS_PER_INCH) * UNITS.PIXELS_PER_INCH;
  }

  public static ptToTwip(pt: number): number {
    return pt * UNITS.TWIPS_PER_PT;
  }

  // Twip conversions
  public static twipToPx(twip: number): number {
    return (twip / UNITS.TWIPS_PER_INCH) * UNITS.PIXELS_PER_INCH;
  }

  public static twipToPt(twip: number): number {
    return twip / UNITS.TWIPS_PER_PT;
  }

  public static twipToEmu(twip: number): number {
    return twip * UNITS.EMUS_PER_TWIP;
  }

  // Other conversions
  public static inchToEmu(inch: number): number {
    return inch * UNITS.EMUS_PER_INCH;
  }

  public static cmToEmu(cm: number): number {
    return cm * UNITS.EMUS_PER_CM;
  }

  public static cmToPx(cm: number): number {
    return (cm / UNITS.CM_PER_INCH) * UNITS.PIXELS_PER_INCH;
  }
}
