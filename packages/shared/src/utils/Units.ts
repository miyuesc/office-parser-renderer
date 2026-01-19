/**
 * Office Open XML (OOXML) 单位转换工具
 *
 * OOXML 的基础单位是 EMU（English Metric Unit，英制公制单位）
 * 换算关系：
 * - 1 英寸 = 914400 EMU
 * - 1 厘米 = 360000 EMU
 * - 1 磅 (pt) = 12700 EMU
 *
 * 屏幕渲染假设使用 96 DPI（Windows/Web 标准）
 * - 1 磅 = 1.333333 像素（96 DPI 下）
 * - 1 英寸 = 96 像素
 */

/** 每英寸的 EMU 数 */
export const EMU_PER_INCH = 914400;
/** 每厘米的 EMU 数 */
export const EMU_PER_CM = 360000;
/** 每磅的 EMU 数 */
export const EMU_PER_PT = 12700;
/** 屏幕 DPI（每英寸点数） */
export const DPI = 96;
/** 每磅的像素数（96 DPI 下为 1.3333...） */
export const PX_PER_PT = DPI / 72;

/**
 * 单位转换工具类
 */
export class Units {
  /**
   * 将 EMU 转换为磅 (Points)
   * @param emu - EMU 值
   * @returns 磅值
   */
  static emuToPt(emu: number): number {
    return emu / EMU_PER_PT;
  }

  /**
   * 将 EMU 转换为像素（96 DPI 下）
   * @param emu - EMU 值
   * @returns 像素值
   */
  static emuToPx(emu: number): number {
    return (emu / EMU_PER_PT) * PX_PER_PT;
  }

  /**
   * 将磅转换为像素（96 DPI 下）
   * @param pt - 磅值
   * @returns 像素值
   */
  static ptToPx(pt: number): number {
    return pt * PX_PER_PT;
  }

  /**
   * 将厘米转换为像素（通过 EMU 标准换算）
   * @param cm - 厘米值
   * @returns 像素值
   */
  static cmToPx(cm: number): number {
    return ((cm * EMU_PER_CM) / EMU_PER_PT) * PX_PER_PT;
  }

  /**
   * 将厘米转换为 EMU
   * @param cm - 厘米值
   * @returns EMU 值
   */
  static cmToEmu(cm: number): number {
    return cm * EMU_PER_CM;
  }

  /**
   * 将像素转换为 EMU（近似值）
   * @param px - 像素值
   * @returns EMU 值
   */
  static pxToEmu(px: number): number {
    return (px / PX_PER_PT) * EMU_PER_PT;
  }
}
