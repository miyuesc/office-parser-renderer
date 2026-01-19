/**
 * 单元格样式工具
 *
 * 将 XLSX 单元格样式转换为 CSS 样式
 */
import { ColorUtils } from '@ai-space/shared';
import { XlsxWorkbook, XlsxColor } from '../types';

export class CellStyleUtils {
  /**
   * 获取单元格的 CSS 样式
   *
   * @param workbook - 工作簿对象
   * @param styleIndex - 样式索引
   * @returns CSS 样式对象
   */
  static getCss(workbook: XlsxWorkbook, styleIndex?: number): Partial<CSSStyleDeclaration> {
    if (styleIndex === undefined) return {};

    const xf = workbook.styles.cellXfs[styleIndex];
    if (!xf) return {};

    const css: any = {};

    // 字体
    const font = workbook.styles.fonts[xf.fontId];
    if (font) {
      css.fontFamily = font.name || 'Calibri';
      css.fontSize = (font.sz || 11) + 'pt';
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
      // 检查图案类型
      if (fill.patternType === 'none') {
        // 无背景
      } else {
        const fg = this.resolveColor(fill.fgColor, workbook);
        // 对于纯色填充，fgColor 就是颜色
        if (fg) css.backgroundColor = fg;
        else if (fill.bgColor) css.backgroundColor = this.resolveColor(fill.bgColor, workbook);
      }
    }

    // 对齐（为了健壮性放宽检查，忽略 applyAlignment）
    if (xf.alignment) {
      // 水平对齐
      if (xf.alignment.horizontal) {
        switch (xf.alignment.horizontal) {
          case 'center':
            css.textAlign = 'center';
            break;
          case 'right':
            css.textAlign = 'right';
            break;
          case 'justify':
            css.textAlign = 'justify';
            break;
          default:
            css.textAlign = 'left';
        }
      }
      // 垂直对齐
      if (xf.alignment.vertical) {
        switch (xf.alignment.vertical) {
          case 'top':
            css.verticalAlign = 'top';
            break;
          case 'center':
            css.verticalAlign = 'middle';
            break;
          case 'bottom':
            css.verticalAlign = 'bottom';
            break;
          default:
            css.verticalAlign = 'bottom';
        }
      }
      // 自动换行
      if (xf.alignment.wrapText) {
        css.whiteSpace = 'pre-wrap';
        css.wordWrap = 'break-word';
      } else {
        css.whiteSpace = 'nowrap';
      }
    } else {
      css.whiteSpace = 'nowrap';
    }

    // 边框
    const border = workbook.styles.borders[xf.borderId];
    if (border) {
      /**
       * 获取边框 CSS 值
       * @param side - 边框边对象
       * @returns CSS 边框字符串
       */
      const getBorderCss = (side: any) => {
        if (!side || side.style === 'none') return 'none';

        let width = '1px';
        let style = 'solid';

        switch (side.style) {
          case 'hair':
            width = '1px'; // 细线
            break;
          case 'dotted':
            style = 'dotted';
            break;
          case 'dashDot':
          case 'dashDotDot':
          case 'dashed':
            style = 'dashed';
            break;
          case 'medium':
            width = '2px';
            break;
          case 'mediumDashed':
            width = '2px';
            style = 'dashed';
            break;
          case 'thick':
            width = '3px';
            break;
          case 'double':
            width = '3px';
            style = 'double';
            break;
          default:
            width = '1px';
            style = 'solid';
        }

        const color = this.resolveColor(side.color, workbook) || '#000000';
        return `${width} ${style} ${color}`;
      };

      if (border.left) css.borderLeft = getBorderCss(border.left);
      if (border.right) css.borderRight = getBorderCss(border.right);
      if (border.top) css.borderTop = getBorderCss(border.top);
      if (border.bottom) css.borderBottom = getBorderCss(border.bottom);
    }

    return css;
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
