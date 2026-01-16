/**
 * Unit conversion utilities for Office Open XML (OOXML)
 *
 * Base unit in OOXML is EMU (English Metric Unit).
 * 1 Inch = 914400 EMU
 * 1 cm = 360000 EMU
 * 1 pt = 12700 EMU
 *
 * Screen Rendering assumes 96 DPI (Standard Windows/Web)
 * 1 pt = 1.333333 px (at 96 DPI)
 * 1 Inch = 96 px
 */

export const EMU_PER_INCH = 914400;
export const EMU_PER_CM = 360000;
export const EMU_PER_PT = 12700;
export const DPI = 96;
export const PX_PER_PT = DPI / 72; // 1.3333...

export class Units {
  /**
   * Convert EMU to Points
   */
  static emuToPt(emu: number): number {
    return emu / EMU_PER_PT;
  }

  /**
   * Convert EMU to Pixels (at 96 DPI)
   */
  static emuToPx(emu: number): number {
    return (emu / EMU_PER_PT) * PX_PER_PT;
  }

  /**
   * Convert Points to Pixels (at 96 DPI)
   */
  static ptToPx(pt: number): number {
    return pt * PX_PER_PT;
  }

  /**
   * Convert Centimeters to Pixels (via EMU standard)
   */
  static cmToPx(cm: number): number {
    return ((cm * EMU_PER_CM) / EMU_PER_PT) * PX_PER_PT;
  }

  /**
   * Convert Centimeters to EMU
   */
  static cmToEmu(cm: number): number {
    return cm * EMU_PER_CM;
  }

  /**
   * Convert Pixels to EMU (approximate)
   */
  static pxToEmu(px: number): number {
    return (px / PX_PER_PT) * EMU_PER_PT;
  }
}
