/**
 * DOCX 单位转换工具
 *
 * OOXML 中使用多种单位：
 * - Twips: 1/20 点 (1440 twips = 1 inch)
 * - EMU: English Metric Units (914400 EMU = 1 inch)
 * - Half-points: 半点，用于字号 (2 half-points = 1 point)
 * - Points: 点 (72 points = 1 inch)
 */

/** 每英寸的 twips 数 */
const TWIPS_PER_INCH = 1440;
/** 每英寸的 EMU 数 */
const EMU_PER_INCH = 914400;
/** 每英寸的点数 */
const POINTS_PER_INCH = 72;
/** 标准 DPI */
const DEFAULT_DPI = 96;

/**
 * 单位转换工具类
 */
export class UnitConverter {
  /**
   * Twips 转换为像素
   *
   * @param twips - Twips 值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static twipsToPixels(twips: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    // twips -> inches -> pixels
    const inches = twips / TWIPS_PER_INCH;
    return inches * dpi;
  }

  /**
   * 像素转换为 Twips
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns Twips 值
   */
  static pixelsToTwips(pixels: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    const inches = pixels / dpi;
    return Math.round(inches * TWIPS_PER_INCH); // Twips usually integers
  }

  /**
   * Twips 转换为点
   *
   * @param twips - Twips 值
   * @returns 点值
   */
  static twipsToPoints(twips: number): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    return twips / 20;
  }

  /**
   * 点转换为 Twips
   *
   * @param points - 点值
   * @returns Twips 值
   */
  static pointsToTwips(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return points * 20;
  }

  /**
   * EMU 转换为像素
   *
   * @param emu - EMU 值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static emuToPixels(emu: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    const inches = emu / EMU_PER_INCH;
    return inches * dpi;
  }

  /**
   * 像素转换为 EMU
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns EMU 值
   */
  static pixelsToEmu(pixels: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    const inches = pixels / dpi;
    return Math.round(inches * EMU_PER_INCH);
  }

  /**
   * EMU 转换为点
   *
   * @param emu - EMU 值
   * @returns 点值
   */
  static emuToPoints(emu: number): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    const inches = emu / EMU_PER_INCH;
    return inches * POINTS_PER_INCH;
  }

  /**
   * 点转换为 EMU
   *
   * @param points - 点值
   * @returns EMU 值
   */
  static pointsToEmu(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    const inches = points / POINTS_PER_INCH;
    return Math.round(inches * EMU_PER_INCH);
  }

  /**
   * 半点转换为点
   *
   * @param halfPoints - 半点值（用于字号）
   * @returns 点值
   */
  static halfPointsToPoints(halfPoints: number): number {
    if (!Number.isFinite(halfPoints) || halfPoints === 0) return 0;
    return halfPoints / 2;
  }

  /**
   * 点转换为半点
   *
   * @param points - 点值
   * @returns 半点值
   */
  static pointsToHalfPoints(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return points * 2;
  }

  /**
   * 点转换为像素
   *
   * @param points - 点值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static pointsToPixels(points: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    const inches = points / POINTS_PER_INCH;
    return inches * dpi;
  }

  /**
   * 像素转换为点
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 点值
   */
  static pixelsToPoints(pixels: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    const inches = pixels / dpi;
    return inches * POINTS_PER_INCH;
  }

  /**
   * 百分比值转换为小数
   * OOXML 中百分比通常以 1000 为单位（100% = 100000）
   *
   * @param pct - 百分比值（OOXML 格式）
   * @returns 小数值 (0-1)
   */
  static percentToDecimal(pct: number): number {
    if (!Number.isFinite(pct)) return 1;
    return pct / 100000;
  }

  /**
   * 小数转换为百分比值
   *
   * @param decimal - 小数值 (0-1)
   * @returns 百分比值（OOXML 格式）
   */
  static decimalToPercent(decimal: number): number {
    if (!Number.isFinite(decimal)) return 100000;
    return Math.round(decimal * 100000);
  }

  /**
   * 八分之一点转换为像素
   * 用于边框宽度等
   *
   * @param eighthPoints - 八分之一点值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static eighthPointsToPixels(eighthPoints: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(eighthPoints) || eighthPoints === 0) return 0;
    const points = eighthPoints / 8;
    return this.pointsToPixels(points, dpi);
  }

  /**
   * 计算行距
   * 根据行距规则计算实际行高
   *
   * @param lineValue - 行距值
   * @param lineRule - 行距规则
   * @param fontSize - 字号（点）
   * @returns CSS line-height 值
   */
  static calculateLineHeight(
    lineValue: number | undefined,
    lineRule: 'auto' | 'exact' | 'atLeast' | undefined,
    fontSize: number = 12
  ): string {
    if (lineValue === undefined || lineValue === 0) {
      return '1.2'; // 默认行距
    }

    switch (lineRule) {
      case 'auto':
        // 行距值以 240 为单位（240 = 单倍行距）
        const multiplier = lineValue / 240;
        return String(multiplier);
      case 'exact':
        // 固定行高（twips）
        const exactPx = this.twipsToPixels(lineValue);
        return `${exactPx}px`;
      case 'atLeast':
        // 最小行高（twips），实际使用时可能需要更复杂的处理
        const atLeastPx = this.twipsToPixels(lineValue);
        return `${atLeastPx}px`;
      default:
        // 默认是 auto
        return String(lineValue / 240);
    }
  }

  /**
   * 获取预设纸张大小
   *
   * @param preset - 预设名称
   * @returns 纸张尺寸 (twips)
   */
  static getPresetPageSize(preset: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal'): { width: number; height: number } {
    // 尺寸单位：twips (1 inch = 1440 twips)
    const sizes: Record<string, { width: number; height: number }> = {
      A4: { width: 11906, height: 16838 }, // 210mm x 297mm
      A5: { width: 8391, height: 11906 }, // 148mm x 210mm
      A3: { width: 16838, height: 23811 }, // 297mm x 420mm
      Letter: { width: 12240, height: 15840 }, // 8.5in x 11in
      Legal: { width: 12240, height: 20160 } // 8.5in x 14in
    };
    return sizes[preset] || sizes['A4'];
  }

  /**
   * 获取默认页边距
   *
   * @returns 默认页边距 (twips)
   */
  static getDefaultMargins(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
    header: number;
    footer: number;
    gutter: number;
  } {
    return {
      top: 1440, // 1 inch
      right: 1440, // 1 inch
      bottom: 1440, // 1 inch
      left: 1440, // 1 inch
      header: 720, // 0.5 inch
      footer: 720, // 0.5 inch
      gutter: 0
    };
  }
}
