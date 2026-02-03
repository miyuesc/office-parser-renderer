/**
 * 颜色解析与转换工具
 */
export class ColorParser {
  /**
   * 将 Office 颜色字符串解析为 CSS 颜色
   * 支持:
   * - 纯 Hex: "FF0000"
   * - 带透明度的 Hex: "AABBCCDD"
   * - 预设颜色名: "red", "blue"
   * @param colorString 颜色字符串
   * @returns CSS 颜色值
   */
  static toCSS(colorString: string): string {
    if (!colorString) return 'transparent';

    // 处理 Hex (RRGGBB)
    if (/^[0-9A-Fa-f]{6}$/.test(colorString)) {
      return `#${colorString}`;
    }

    // 处理 Hex (AARRGGBB) - Office 使用 ARGB
    if (/^[0-9A-Fa-f]{8}$/.test(colorString)) {
      const alpha = parseInt(colorString.substring(0, 2), 16) / 255;
      const rgb = colorString.substring(2);
      // 将 alpha 转换为百分比或使用 rgba
      const r = parseInt(rgb.substring(0, 2), 16);
      const g = parseInt(rgb.substring(2, 4), 16);
      const b = parseInt(rgb.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    }

    return colorString;
  }
}
