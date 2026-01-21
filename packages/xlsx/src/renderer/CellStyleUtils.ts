/**
 * 单元格样式工具
 *
 * 将 XLSX 单元格样式转换为 CSS 样式
 */
import { ColorUtils, FontManager, AlignmentStyles, BorderStyles, DEFAULT_FONT_SIZE_PT } from '@ai-space/shared';
import { XlsxWorkbook, XlsxColor } from '../types';

/**
 * 单元格样式工具类
 */
export class CellStyleUtils {
  /**
   * 获取单元格的 CSS 样式
   *
   * @param workbook - 工作簿对象
   * @param styleIndex - 样式索引
   * @returns CSS 样式对象和字体 CSS 类名
   */
  static getCss(
    workbook: XlsxWorkbook,
    styleIndex?: number
  ): { css: Partial<CSSStyleDeclaration>; fontClassName?: string } {
    if (styleIndex === undefined) return { css: {} };

    const xf = workbook.styles.cellXfs[styleIndex];
    if (!xf) return { css: {} };

    const css: Record<string, string> = {};
    let fontClassName: string | undefined;

    // 字体 - 使用 FontManager
    const font = workbook.styles.fonts[xf.fontId];
    if (font) {
      const fontName = font.name || 'Calibri';
      // 使用 FontManager 获取带降级的字体族
      css.fontFamily = FontManager.getFontFamily(fontName);
      // 获取 CSS 类名
      fontClassName = FontManager.getFontClassName(fontName);

      css.fontSize = (font.sz || DEFAULT_FONT_SIZE_PT) + 'pt';
      if (font.b) css.fontWeight = 'bold';
      if (font.i) css.fontStyle = 'italic';
      if (font.u) css.textDecoration = 'underline';
      if (font.strike) css.textDecoration = (css.textDecoration ? css.textDecoration + ' ' : '') + 'line-through';

      const color = this.resolveColor(font.color, workbook);
      if (color) css.color = color;
    }

    // 填充
    const fill = workbook.styles.fills[xf.fillId];
    if (fill) {
      if (fill.patternType !== 'none') {
        const fg = this.resolveColor(fill.fgColor, workbook);
        if (fg) css.backgroundColor = fg;
        else if (fill.bgColor) css.backgroundColor = this.resolveColor(fill.bgColor, workbook) || '';
      }
    }

    // 对齐 - 使用 AlignmentStyles
    if (xf.alignment) {
      if (xf.alignment.horizontal) {
        css.textAlign = AlignmentStyles.mapHorizontalAlignment(xf.alignment.horizontal);
      }
      if (xf.alignment.vertical) {
        css.verticalAlign = AlignmentStyles.mapVerticalAlignment(xf.alignment.vertical, 'bottom');
      }
      if (xf.alignment.wrapText) {
        css.whiteSpace = 'pre-wrap';
        css.wordWrap = 'break-word';
      } else {
        css.whiteSpace = 'nowrap';
      }
    } else {
      css.whiteSpace = 'nowrap';
    }

    // 边框 - 使用 BorderStyles
    const border = workbook.styles.borders[xf.borderId];
    if (border) {
      if (border.left) css.borderLeft = this.getBorderCss(border.left, workbook);
      if (border.right) css.borderRight = this.getBorderCss(border.right, workbook);
      if (border.top) css.borderTop = this.getBorderCss(border.top, workbook);
      if (border.bottom) css.borderBottom = this.getBorderCss(border.bottom, workbook);
    }

    return { css: css as Partial<CSSStyleDeclaration>, fontClassName };
  }

  /**
   * 获取边框 CSS 值
   *
   * @param side - 边框边对象
   * @param workbook - 工作簿对象
   * @returns CSS 边框字符串
   */
  private static getBorderCss(side: { style?: string; color?: XlsxColor }, workbook: XlsxWorkbook): string {
    if (!side || side.style === 'none') return 'none';

    const style = BorderStyles.mapBorderStyle(side.style || 'thin');
    const width = this.getBorderWidth(side.style || 'thin');
    const color = this.resolveColor(side.color, workbook) || '#000000';

    return `${width} ${style} ${color}`;
  }

  /**
   * 根据边框类型获取边框宽度
   *
   * @param borderStyle - Excel 边框样式
   * @returns CSS 宽度值
   */
  private static getBorderWidth(borderStyle: string): string {
    switch (borderStyle) {
      case 'hair':
      case 'thin':
        return '1px';
      case 'medium':
      case 'mediumDashed':
      case 'mediumDashDot':
      case 'mediumDashDotDot':
        return '2px';
      case 'thick':
      case 'double':
        return '3px';
      default:
        return '1px';
    }
  }

  /**
   * 解析颜色
   *
   * 将 XLSX 颜色对象转换为十六进制颜色字符串
   *
   * @param xlsxColor - XLSX 颜色对象
   * @param workbook - 工作簿对象
   * @returns 十六进制颜色字符串
   */
  static resolveColor(xlsxColor: XlsxColor | undefined, workbook: XlsxWorkbook): string | undefined {
    if (!xlsxColor) return undefined;

    let hex: string | undefined;

    if (xlsxColor.rgb) {
      // ARGB 格式
      hex = xlsxColor.rgb;
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (hex.length === 9) hex = '#' + hex.substring(3);
    } else if (xlsxColor.theme !== undefined && workbook.theme) {
      // 主题颜色查找
      const key = String(xlsxColor.theme);
      if (workbook.theme.colorScheme[key]) {
        hex = '#' + workbook.theme.colorScheme[key];
      }
    } else if (xlsxColor.auto) {
      hex = '#000000';
    }

    // 应用色调调整
    if (hex && xlsxColor.tint !== undefined) {
      hex = ColorUtils.applyTint(hex, xlsxColor.tint);
    }

    return hex;
  }
}
