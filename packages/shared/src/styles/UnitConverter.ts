/**
 * 统一单位转换器
 *
 * 提供 OOXML 文档中各种单位到像素的转换功能
 * 合并了 DOCX 和 XLSX 中重复的转换逻辑
 */

import {
  EMU_PER_INCH,
  TWIPS_PER_INCH,
  POINTS_PER_INCH,
  DEFAULT_DPI,
  PT_TO_PX,
  TWIPS_TO_PX,
  PRESET_PAGE_SIZES,
  DEFAULT_MARGINS
} from './constants';

/**
 * 统一单位转换器类
 */
export class UnitConverter {
  // ============================================
  // Twips 转换
  // ============================================

  /**
   * Twips 转换为像素
   *
   * @param twips - Twips 值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static twipsToPixels(twips: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    return (twips / TWIPS_PER_INCH) * dpi;
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
    return Math.round((pixels / dpi) * TWIPS_PER_INCH);
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

  // ============================================
  // EMU 转换
  // ============================================

  /**
   * EMU 转换为像素
   *
   * @param emu - EMU 值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static emuToPixels(emu: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    return (emu / EMU_PER_INCH) * dpi;
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
    return Math.round((pixels / dpi) * EMU_PER_INCH);
  }

  /**
   * EMU 转换为点
   *
   * @param emu - EMU 值
   * @returns 点值
   */
  static emuToPoints(emu: number): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    return (emu / EMU_PER_INCH) * POINTS_PER_INCH;
  }

  /**
   * 点转换为 EMU
   *
   * @param points - 点值
   * @returns EMU 值
   */
  static pointsToEmu(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return Math.round((points / POINTS_PER_INCH) * EMU_PER_INCH);
  }

  // ============================================
  // Points 转换
  // ============================================

  /**
   * 点转换为像素
   *
   * @param points - 点值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static pointsToPixels(points: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return (points / POINTS_PER_INCH) * dpi;
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
    return (pixels / dpi) * POINTS_PER_INCH;
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
   * 八分之一点转换为像素
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

  // ============================================
  // 百分比转换
  // ============================================

  /**
   * OOXML 百分比值转换为小数
   *
   * OOXML 中百分比以 1000 为单位（100% = 100000）
   *
   * @param pct - OOXML 百分比值
   * @returns 小数值 (0-1)
   */
  static percentToDecimal(pct: number): number {
    if (!Number.isFinite(pct)) return 1;
    return pct / 100000;
  }

  /**
   * 小数转换为 OOXML 百分比值
   *
   * @param decimal - 小数值 (0-1)
   * @returns OOXML 百分比值
   */
  static decimalToPercent(decimal: number): number {
    if (!Number.isFinite(decimal)) return 100000;
    return Math.round(decimal * 100000);
  }

  // ============================================
  // 行距计算
  // ============================================

  /**
   * 计算行距
   *
   * 根据行距规则计算实际行高
   *
   * @param lineValue - 行距值
   * @param lineRule - 行距规则 ('auto' | 'exact' | 'atLeast')
   * @param fontSize - 字号（点），默认 12
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
        // 最小行高（twips）
        const atLeastPx = this.twipsToPixels(lineValue);
        return `${atLeastPx}px`;
      default:
        // 默认是 auto
        return String(lineValue / 240);
    }
  }

  // ============================================
  // 预设尺寸
  // ============================================

  /**
   * 获取预设纸张大小
   *
   * @param preset - 预设名称
   * @returns 纸张尺寸 (twips)
   */
  static getPresetPageSize(preset: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal'): { width: number; height: number } {
    return PRESET_PAGE_SIZES[preset] || PRESET_PAGE_SIZES.A4;
  }

  /**
   * 获取默认页边距
   *
   * @returns 默认页边距 (twips)
   */
  static getDefaultMargins(): typeof DEFAULT_MARGINS {
    return { ...DEFAULT_MARGINS };
  }
}
