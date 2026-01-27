/**
 * 长度单位转换工具类
 *
 * 提供 OOXML 文档中常见长度单位与像素的转换
 */
export class LengthUtils {
  /**
   * 将 twips 转换为像素
   *
   * 换算关系：1 英寸 = 1440 twips，1 英寸 = 96 像素（标准屏幕 DPI）
   *
   * @param twips - twips 值
   * @returns 像素值
   */
  static twipsToPixels(twips: number): number {
    return (twips / 1440) * 96;
  }

  /**
   * 将 EMU 转换为像素
   *
   * 换算关系：1 英寸 = 914400 EMU
   *
   * @param emus - EMU 值
   * @returns 像素值
   */
  static emusToPixels(emus: number): number {
    return (emus / 914400) * 96;
  }

  /**
   * 将磅 (Points) 转换为像素
   *
   * 换算关系：1 英寸 = 72 磅
   *
   * @param pt - 磅值
   * @returns 像素值
   */
  static pointsToPixels(pt: number): number {
    return (pt / 72) * 96;
  }
}
