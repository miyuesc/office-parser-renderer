/**
 * 统一单位转换器
 *
 * 提供 OOXML 文档中各种单位到像素的转换功能
 * 合并了 DOCX 和 XLSX 中重复的转换逻辑
 *
 * 支持的单位类型：
 * - EMU (English Metric Unit): DrawingML 中的基础单位
 * - Twips: 1/20 点，DOCX 中常用
 * - DXA: Twips 的别名
 * - Points (PT): 印刷单位，1/72 英寸
 * - Half Points: 半点，用于字号
 * - Eighth Points: 八分之一点，用于边框粗细
 * - 物理单位: 英寸、厘米、毫米、Pica
 * - 角度单位: OOXML 角度、VML 角度
 * - 百分比单位: OOXML 百分比
 */

import {
  EMU_PER_INCH,
  EMU_PER_CM,
  EMU_PER_MM,
  EMU_PER_POINT,
  EMU_PER_TWIP,
  TWIPS_PER_INCH,
  TWIPS_PER_POINT,
  TWIPS_PER_MM,
  TWIPS_PER_CM,
  POINTS_PER_INCH,
  PICAS_PER_INCH,
  MM_PER_INCH,
  CM_PER_INCH,
  DEFAULT_DPI,
  PRESET_PAGE_SIZES,
  DEFAULT_MARGINS,
  OOXML_ANGLE_UNIT,
  VML_ANGLE_UNIT,
  OOXML_PERCENT_BASE,
  PERMILLE_BASE,
  LINE_SPACING_UNIT,
} from '../../styles/constants';

/**
 * 统一单位转换器类
 *
 * 提供静态方法用于各种 Office 文档单位之间的转换
 */
export class UnitConverter {
  // ============================================
  // EMU (English Metric Unit) 转换
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
    return emu / EMU_PER_POINT;
  }

  /**
   * 点转换为 EMU
   *
   * @param points - 点值
   * @returns EMU 值
   */
  static pointsToEmu(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return Math.round(points * EMU_PER_POINT);
  }

  /**
   * EMU 转换为 Twips
   *
   * @param emu - EMU 值
   * @returns Twips 值
   */
  static emuToTwips(emu: number): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    return emu / EMU_PER_TWIP;
  }

  /**
   * Twips 转换为 EMU
   *
   * @param twips - Twips 值
   * @returns EMU 值
   */
  static twipsToEmu(twips: number): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    return Math.round(twips * EMU_PER_TWIP);
  }

  /**
   * EMU 转换为毫米
   *
   * @param emu - EMU 值
   * @returns 毫米值
   */
  static emuToMm(emu: number): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    return emu / EMU_PER_MM;
  }

  /**
   * 毫米转换为 EMU
   *
   * @param mm - 毫米值
   * @returns EMU 值
   */
  static mmToEmu(mm: number): number {
    if (!Number.isFinite(mm) || mm === 0) return 0;
    return Math.round(mm * EMU_PER_MM);
  }

  /**
   * EMU 转换为厘米
   *
   * @param emu - EMU 值
   * @returns 厘米值
   */
  static emuToCm(emu: number): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    return emu / EMU_PER_CM;
  }

  /**
   * 厘米转换为 EMU
   *
   * @param cm - 厘米值
   * @returns EMU 值
   */
  static cmToEmu(cm: number): number {
    if (!Number.isFinite(cm) || cm === 0) return 0;
    return Math.round(cm * EMU_PER_CM);
  }

  /**
   * EMU 转换为英寸
   *
   * @param emu - EMU 值
   * @returns 英寸值
   */
  static emuToInches(emu: number): number {
    if (!Number.isFinite(emu) || emu === 0) return 0;
    return emu / EMU_PER_INCH;
  }

  /**
   * 英寸转换为 EMU
   *
   * @param inches - 英寸值
   * @returns EMU 值
   */
  static inchesToEmu(inches: number): number {
    if (!Number.isFinite(inches) || inches === 0) return 0;
    return Math.round(inches * EMU_PER_INCH);
  }

  // ============================================
  // Twips / DXA 转换
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
    return twips / TWIPS_PER_POINT;
  }

  /**
   * 点转换为 Twips
   *
   * @param points - 点值
   * @returns Twips 值
   */
  static pointsToTwips(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return points * TWIPS_PER_POINT;
  }

  /**
   * Twips 转换为毫米
   *
   * @param twips - Twips 值
   * @returns 毫米值
   */
  static twipsToMm(twips: number): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    return twips / TWIPS_PER_MM;
  }

  /**
   * 毫米转换为 Twips
   *
   * @param mm - 毫米值
   * @returns Twips 值
   */
  static mmToTwips(mm: number): number {
    if (!Number.isFinite(mm) || mm === 0) return 0;
    return Math.round(mm * TWIPS_PER_MM);
  }

  /**
   * Twips 转换为厘米
   *
   * @param twips - Twips 值
   * @returns 厘米值
   */
  static twipsToCm(twips: number): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    return twips / TWIPS_PER_CM;
  }

  /**
   * 厘米转换为 Twips
   *
   * @param cm - 厘米值
   * @returns Twips 值
   */
  static cmToTwips(cm: number): number {
    if (!Number.isFinite(cm) || cm === 0) return 0;
    return Math.round(cm * TWIPS_PER_CM);
  }

  /**
   * Twips 转换为英寸
   *
   * @param twips - Twips 值
   * @returns 英寸值
   */
  static twipsToInches(twips: number): number {
    if (!Number.isFinite(twips) || twips === 0) return 0;
    return twips / TWIPS_PER_INCH;
  }

  /**
   * 英寸转换为 Twips
   *
   * @param inches - 英寸值
   * @returns Twips 值
   */
  static inchesToTwips(inches: number): number {
    if (!Number.isFinite(inches) || inches === 0) return 0;
    return Math.round(inches * TWIPS_PER_INCH);
  }

  /**
   * DXA 转换为像素 (DXA 是 Twips 的别名)
   *
   * @param dxa - DXA 值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static dxaToPixels(dxa: number, dpi: number = DEFAULT_DPI): number {
    return this.twipsToPixels(dxa, dpi);
  }

  /**
   * 像素转换为 DXA
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns DXA 值
   */
  static pixelsToDxa(pixels: number, dpi: number = DEFAULT_DPI): number {
    return this.pixelsToTwips(pixels, dpi);
  }

  // ============================================
  // Points (点) 转换
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
   * 点转换为毫米
   *
   * @param points - 点值
   * @returns 毫米值
   */
  static pointsToMm(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return (points / POINTS_PER_INCH) * MM_PER_INCH;
  }

  /**
   * 毫米转换为点
   *
   * @param mm - 毫米值
   * @returns 点值
   */
  static mmToPoints(mm: number): number {
    if (!Number.isFinite(mm) || mm === 0) return 0;
    return (mm / MM_PER_INCH) * POINTS_PER_INCH;
  }

  /**
   * 点转换为厘米
   *
   * @param points - 点值
   * @returns 厘米值
   */
  static pointsToCm(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return (points / POINTS_PER_INCH) * CM_PER_INCH;
  }

  /**
   * 厘米转换为点
   *
   * @param cm - 厘米值
   * @returns 点值
   */
  static cmToPoints(cm: number): number {
    if (!Number.isFinite(cm) || cm === 0) return 0;
    return (cm / CM_PER_INCH) * POINTS_PER_INCH;
  }

  /**
   * 点转换为英寸
   *
   * @param points - 点值
   * @returns 英寸值
   */
  static pointsToInches(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return points / POINTS_PER_INCH;
  }

  /**
   * 英寸转换为点
   *
   * @param inches - 英寸值
   * @returns 点值
   */
  static inchesToPoints(inches: number): number {
    if (!Number.isFinite(inches) || inches === 0) return 0;
    return inches * POINTS_PER_INCH;
  }

  // ============================================
  // 分数点单位转换 (Half/Eighth Points)
  // ============================================

  /**
   * 半点转换为点
   *
   * 用于 OOXML 字号 (w:sz)
   *
   * @param halfPoints - 半点值
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
   * 半点转换为像素
   *
   * @param halfPoints - 半点值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static halfPointsToPixels(halfPoints: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(halfPoints) || halfPoints === 0) return 0;
    return this.pointsToPixels(halfPoints / 2, dpi);
  }

  /**
   * 八分之一点转换为点
   *
   * 用于 OOXML 边框粗细
   *
   * @param eighthPoints - 八分之一点值
   * @returns 点值
   */
  static eighthPointsToPoints(eighthPoints: number): number {
    if (!Number.isFinite(eighthPoints) || eighthPoints === 0) return 0;
    return eighthPoints / 8;
  }

  /**
   * 点转换为八分之一点
   *
   * @param points - 点值
   * @returns 八分之一点值
   */
  static pointsToEighthPoints(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return points * 8;
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

  /**
   * 百分之一点转换为点
   *
   * 用于某些 OOXML 上下文
   *
   * @param hundredthPoints - 百分之一点值
   * @returns 点值
   */
  static hundredthPointsToPoints(hundredthPoints: number): number {
    if (!Number.isFinite(hundredthPoints) || hundredthPoints === 0) return 0;
    return hundredthPoints / 100;
  }

  /**
   * 点转换为百分之一点
   *
   * @param points - 点值
   * @returns 百分之一点值
   */
  static pointsToHundredthPoints(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return Math.round(points * 100);
  }

  // ============================================
  // Pica 转换
  // ============================================

  /**
   * Pica 转换为点
   *
   * 1 Pica = 12 Points
   *
   * @param picas - Pica 值
   * @returns 点值
   */
  static picasToPoints(picas: number): number {
    if (!Number.isFinite(picas) || picas === 0) return 0;
    return picas * 12;
  }

  /**
   * 点转换为 Pica
   *
   * @param points - 点值
   * @returns Pica 值
   */
  static pointsToPicas(points: number): number {
    if (!Number.isFinite(points) || points === 0) return 0;
    return points / 12;
  }

  /**
   * Pica 转换为像素
   *
   * @param picas - Pica 值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static picasToPixels(picas: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(picas) || picas === 0) return 0;
    return (picas / PICAS_PER_INCH) * dpi;
  }

  /**
   * Pica 转换为英寸
   *
   * @param picas - Pica 值
   * @returns 英寸值
   */
  static picasToInches(picas: number): number {
    if (!Number.isFinite(picas) || picas === 0) return 0;
    return picas / PICAS_PER_INCH;
  }

  // ============================================
  // 物理单位互转（毫米、厘米、英寸）
  // ============================================

  /**
   * 毫米转换为像素
   *
   * @param mm - 毫米值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static mmToPixels(mm: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(mm) || mm === 0) return 0;
    return (mm / MM_PER_INCH) * dpi;
  }

  /**
   * 像素转换为毫米
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 毫米值
   */
  static pixelsToMm(pixels: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    return (pixels / dpi) * MM_PER_INCH;
  }

  /**
   * 厘米转换为像素
   *
   * @param cm - 厘米值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static cmToPixels(cm: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(cm) || cm === 0) return 0;
    return (cm / CM_PER_INCH) * dpi;
  }

  /**
   * 像素转换为厘米
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 厘米值
   */
  static pixelsToCm(pixels: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    return (pixels / dpi) * CM_PER_INCH;
  }

  /**
   * 英寸转换为像素
   *
   * @param inches - 英寸值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 像素值
   */
  static inchesToPixels(inches: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(inches) || inches === 0) return 0;
    return inches * dpi;
  }

  /**
   * 像素转换为英寸
   *
   * @param pixels - 像素值
   * @param dpi - 屏幕 DPI，默认 96
   * @returns 英寸值
   */
  static pixelsToInches(pixels: number, dpi: number = DEFAULT_DPI): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    return pixels / dpi;
  }

  /**
   * 毫米转换为厘米
   *
   * @param mm - 毫米值
   * @returns 厘米值
   */
  static mmToCm(mm: number): number {
    if (!Number.isFinite(mm) || mm === 0) return 0;
    return mm / 10;
  }

  /**
   * 厘米转换为毫米
   *
   * @param cm - 厘米值
   * @returns 毫米值
   */
  static cmToMm(cm: number): number {
    if (!Number.isFinite(cm) || cm === 0) return 0;
    return cm * 10;
  }

  /**
   * 毫米转换为英寸
   *
   * @param mm - 毫米值
   * @returns 英寸值
   */
  static mmToInches(mm: number): number {
    if (!Number.isFinite(mm) || mm === 0) return 0;
    return mm / MM_PER_INCH;
  }

  /**
   * 英寸转换为毫米
   *
   * @param inches - 英寸值
   * @returns 毫米值
   */
  static inchesToMm(inches: number): number {
    if (!Number.isFinite(inches) || inches === 0) return 0;
    return inches * MM_PER_INCH;
  }

  /**
   * 厘米转换为英寸
   *
   * @param cm - 厘米值
   * @returns 英寸值
   */
  static cmToInches(cm: number): number {
    if (!Number.isFinite(cm) || cm === 0) return 0;
    return cm / CM_PER_INCH;
  }

  /**
   * 英寸转换为厘米
   *
   * @param inches - 英寸值
   * @returns 厘米值
   */
  static inchesToCm(inches: number): number {
    if (!Number.isFinite(inches) || inches === 0) return 0;
    return inches * CM_PER_INCH;
  }

  // ============================================
  // 角度转换
  // ============================================

  /**
   * OOXML 角度单位转换为度
   *
   * OOXML 角度以 1/60000 度为单位
   * 例如：5400000 = 90°
   *
   * @param ooxmlAngle - OOXML 角度值
   * @returns 度数
   */
  static ooxmlAngleToDegrees(ooxmlAngle: number): number {
    if (!Number.isFinite(ooxmlAngle)) return 0;
    return ooxmlAngle / OOXML_ANGLE_UNIT;
  }

  /**
   * 度转换为 OOXML 角度单位
   *
   * @param degrees - 度数
   * @returns OOXML 角度值
   */
  static degreesToOoxmlAngle(degrees: number): number {
    if (!Number.isFinite(degrees)) return 0;
    return Math.round(degrees * OOXML_ANGLE_UNIT);
  }

  /**
   * OOXML 角度单位转换为弧度
   *
   * @param ooxmlAngle - OOXML 角度值
   * @returns 弧度值
   */
  static ooxmlAngleToRadians(ooxmlAngle: number): number {
    const degrees = this.ooxmlAngleToDegrees(ooxmlAngle);
    return (degrees * Math.PI) / 180;
  }

  /**
   * 弧度转换为 OOXML 角度单位
   *
   * @param radians - 弧度值
   * @returns OOXML 角度值
   */
  static radiansToOoxmlAngle(radians: number): number {
    if (!Number.isFinite(radians)) return 0;
    const degrees = (radians * 180) / Math.PI;
    return this.degreesToOoxmlAngle(degrees);
  }

  /**
   * 度转换为弧度
   *
   * @param degrees - 度数
   * @returns 弧度值
   */
  static degreesToRadians(degrees: number): number {
    if (!Number.isFinite(degrees)) return 0;
    return (degrees * Math.PI) / 180;
  }

  /**
   * 弧度转换为度
   *
   * @param radians - 弧度值
   * @returns 度数
   */
  static radiansToDegrees(radians: number): number {
    if (!Number.isFinite(radians)) return 0;
    return (radians * 180) / Math.PI;
  }

  /**
   * VML 角度单位转换为度
   *
   * VML 中某些属性使用 1/65536 度为单位
   *
   * @param vmlAngle - VML 角度值
   * @returns 度数
   */
  static vmlAngleToDegrees(vmlAngle: number): number {
    if (!Number.isFinite(vmlAngle)) return 0;
    return vmlAngle / VML_ANGLE_UNIT;
  }

  /**
   * 度转换为 VML 角度单位
   *
   * @param degrees - 度数
   * @returns VML 角度值
   */
  static degreesToVmlAngle(degrees: number): number {
    if (!Number.isFinite(degrees)) return 0;
    return Math.round(degrees * VML_ANGLE_UNIT);
  }

  // ============================================
  // 百分比转换
  // ============================================

  /**
   * OOXML 百分比值转换为小数
   *
   * OOXML 中百分比以 1/1000 % 为单位（100% = 100000）
   *
   * @param pct - OOXML 百分比值
   * @returns 小数值 (0-1)
   */
  static percentToDecimal(pct: number): number {
    if (!Number.isFinite(pct)) return 1;
    return pct / OOXML_PERCENT_BASE;
  }

  /**
   * 小数转换为 OOXML 百分比值
   *
   * @param decimal - 小数值 (0-1)
   * @returns OOXML 百分比值
   */
  static decimalToPercent(decimal: number): number {
    if (!Number.isFinite(decimal)) return OOXML_PERCENT_BASE;
    return Math.round(decimal * OOXML_PERCENT_BASE);
  }

  /**
   * 千分比值转换为小数
   *
   * 某些属性使用 1000 = 100% 的格式
   *
   * @param permille - 千分比值
   * @returns 小数值 (0-1)
   */
  static permilleToDecimal(permille: number): number {
    if (!Number.isFinite(permille)) return 1;
    return permille / PERMILLE_BASE;
  }

  /**
   * 小数转换为千分比值
   *
   * @param decimal - 小数值 (0-1)
   * @returns 千分比值
   */
  static decimalToPermille(decimal: number): number {
    if (!Number.isFinite(decimal)) return PERMILLE_BASE;
    return Math.round(decimal * PERMILLE_BASE);
  }

  /**
   * 普通百分比转换为小数
   *
   * @param percent - 百分比值 (0-100)
   * @returns 小数值 (0-1)
   */
  static normalPercentToDecimal(percent: number): number {
    if (!Number.isFinite(percent)) return 1;
    return percent / 100;
  }

  /**
   * 小数转换为普通百分比
   *
   * @param decimal - 小数值 (0-1)
   * @returns 百分比值 (0-100)
   */
  static decimalToNormalPercent(decimal: number): number {
    if (!Number.isFinite(decimal)) return 100;
    return decimal * 100;
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
   * @param _fontSize - 字号（点），默认 12（保留参数，未来可能使用）
   * @returns CSS line-height 值
   */
  static calculateLineHeight(
    lineValue: number | undefined,
    lineRule: 'auto' | 'exact' | 'atLeast' | undefined,
    _fontSize: number = 12,
  ): string {
    if (lineValue === undefined || lineValue === 0) {
      return '1.2'; // 默认行距
    }

    switch (lineRule) {
      case 'auto': {
        // 行距值以 240 为单位（240 = 单倍行距）
        const multiplier = lineValue / LINE_SPACING_UNIT;
        return String(multiplier);
      }
      case 'exact': {
        // 固定行高（twips）
        const exactPx = this.twipsToPixels(lineValue);
        return `${exactPx}px`;
      }
      case 'atLeast': {
        // 最小行高（twips）
        const atLeastPx = this.twipsToPixels(lineValue);
        return `${atLeastPx}px`;
      }
      default:
        // 默认是 auto
        return String(lineValue / LINE_SPACING_UNIT);
    }
  }

  // ============================================
  // Excel 列宽转换
  // ============================================

  /**
   * Excel 字符宽度转换为像素
   *
   * Excel 列宽以字符数为单位，需要特殊转换
   *
   * @param charWidth - 字符宽度值
   * @param charPixelWidth - 每字符像素宽度，默认 7.5
   * @returns 像素值
   */
  static excelCharWidthToPixels(charWidth: number, charPixelWidth: number = 7.5): number {
    if (!Number.isFinite(charWidth) || charWidth === 0) return 0;
    // Excel 列宽公式：像素 = 取整((字符数 * 字符宽度 + 5) / 字符宽度) * 字符宽度
    // 简化版本
    return Math.round(charWidth * charPixelWidth + 5);
  }

  /**
   * 像素转换为 Excel 字符宽度
   *
   * @param pixels - 像素值
   * @param charPixelWidth - 每字符像素宽度，默认 7.5
   * @returns 字符宽度值
   */
  static pixelsToExcelCharWidth(pixels: number, charPixelWidth: number = 7.5): number {
    if (!Number.isFinite(pixels) || pixels === 0) return 0;
    return Math.max(0, (pixels - 5) / charPixelWidth);
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
  static getPresetPageSize(preset: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal'): {
    width: number;
    height: number;
  } {
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

  // ============================================
  // 通用解析与转换
  // ============================================

  /**
   * 解析带单位的字符串并转换为像素
   *
   * 支持的单位：px, pt, in, cm, mm, pc (pica), em (相对于 baseFontSize)
   *
   * @param value - 带单位的值字符串，如 "12pt", "2.5cm"
   * @param dpi - 屏幕 DPI，默认 96
   * @param baseFontSize - 基础字号（用于 em 单位），默认 16px
   * @returns 像素值
   */
  static parseToPixels(
    value: string,
    dpi: number = DEFAULT_DPI,
    baseFontSize: number = 16,
  ): number {
    if (!value || typeof value !== 'string') return 0;

    const trimmed = value.trim().toLowerCase();
    const num = parseFloat(trimmed);
    if (isNaN(num)) return 0;

    if (trimmed.endsWith('px')) {
      return num;
    } else if (trimmed.endsWith('pt')) {
      return this.pointsToPixels(num, dpi);
    } else if (trimmed.endsWith('in')) {
      return this.inchesToPixels(num, dpi);
    } else if (trimmed.endsWith('cm')) {
      return this.cmToPixels(num, dpi);
    } else if (trimmed.endsWith('mm')) {
      return this.mmToPixels(num, dpi);
    } else if (trimmed.endsWith('pc')) {
      return this.picasToPixels(num, dpi);
    } else if (trimmed.endsWith('em')) {
      return num * baseFontSize;
    } else if (trimmed.endsWith('rem')) {
      return num * baseFontSize;
    } else {
      // 默认按 pt 处理（VML 等常用 pt）
      return this.pointsToPixels(num, dpi);
    }
  }

  /**
   * 验证并限制数值在有效范围内
   *
   * @param value - 输入值
   * @param min - 最小值
   * @param max - 最大值
   * @param defaultValue - 无效时的默认值
   * @returns 有效范围内的值
   */
  static clamp(value: number, min: number, max: number, defaultValue: number = 0): number {
    if (!Number.isFinite(value)) return defaultValue;
    return Math.max(min, Math.min(max, value));
  }
}
