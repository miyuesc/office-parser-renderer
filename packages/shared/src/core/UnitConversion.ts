/**
 * 单位转换工具集
 * Office 文档常用单位:
 * - EMU (English Metric Units): 1 inch = 914400 EMU
 * - Point (磅): 1 inch = 72 pt
 * - Pixel (像素): 1 inch = 96 px (at 96 DPI)
 * - Twip (Twentieth of a Point): 1 pt = 20 twips
 */
export class UnitConversion {
  private static readonly DPI = 96;
  private static readonly EMU_PER_INCH = 914400;
  private static readonly PT_PER_INCH = 72;
  private static readonly TWIPS_PER_PT = 20;

  /**
   * EMU 转 像素
   * @param emu EMU 值
   * @returns 像素值
   */
  static emuToPixel(emu: number): number {
    return (emu / this.EMU_PER_INCH) * this.DPI;
  }

  /**
   * 像素 转 EMU
   * @param pixel 像素值
   * @returns EMU 值
   */
  static pixelToEmu(pixel: number): number {
    return Math.round((pixel / this.DPI) * this.EMU_PER_INCH);
  }

  /**
   * 磅 转 像素
   * @param pt 磅值
   * @returns 像素值
   */
  static ptToPixel(pt: number): number {
    return (pt / this.PT_PER_INCH) * this.DPI;
  }

  /**
   * 像素 转 磅
   * @param pixel 像素值
   * @returns 磅值
   */
  static pixelToPt(pixel: number): number {
    return (pixel / this.DPI) * this.PT_PER_INCH;
  }

  /**
   * Twip 转 像素
   * @param twip Twip 值
   * @returns 像素值
   */
  static twipToPixel(twip: number): number {
    return (twip / this.TWIPS_PER_PT / this.PT_PER_INCH) * this.DPI;
  }

  /**
   * 像素 转 Twip
   * @param pixel 像素值
   * @returns Twip 值
   */
  static pixelToTwip(pixel: number): number {
    return Math.round((pixel / this.DPI) * this.PT_PER_INCH * this.TWIPS_PER_PT);
  }
}
