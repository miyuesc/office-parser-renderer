import { ColorUtils } from '@ai-space/shared';
import { XlsxWorkbook, XlsxColor } from '../types';

export class CellStyleUtils {
  static getCss(workbook: XlsxWorkbook, styleIndex?: number): Partial<CSSStyleDeclaration> {
    if (styleIndex === undefined) return {};

    const xf = workbook.styles.cellXfs[styleIndex];
    if (!xf) return {};

    const css: any = {};

    // Font
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

    // Fill
    const fill = workbook.styles.fills[xf.fillId];
    if (fill) {
      // Check patternType
      if (fill.patternType === 'none') {
        // No background
      } else {
        const fg = this.resolveColor(fill.fgColor, workbook);
        // For solid fills, fgColor is the color.
        if (fg) css.backgroundColor = fg;
        else if (fill.bgColor) css.backgroundColor = this.resolveColor(fill.bgColor, workbook);
      }
    }

    // Alignment (omitted mostly unchanged, just context)
    if (xf.alignment) {
      // Relaxed check: ignore applyAlignment for robustness
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
      if (xf.alignment.wrapText) {
        css.whiteSpace = 'pre-wrap';
        css.wordWrap = 'break-word';
      } else {
        css.whiteSpace = 'nowrap';
      }
    } else {
      css.whiteSpace = 'nowrap';
    }

    // Borders
    const border = workbook.styles.borders[xf.borderId];
    if (border) {
      const getBorderCss = (side: any) => {
        if (!side || side.style === 'none') return 'none';

        let width = '1px';
        let style = 'solid';

        switch (side.style) {
          case 'hair':
            width = '1px';
            break; // thin
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

  static resolveColor(xlsxColor: XlsxColor | undefined, workbook: XlsxWorkbook): string | undefined {
    if (!xlsxColor) return undefined;

    let hex: string | undefined;

    if (xlsxColor.rgb) {
      // ARGB
      hex = xlsxColor.rgb;
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (hex.length === 9) hex = '#' + hex.substring(3);
    } else if (xlsxColor.theme !== undefined && workbook.theme) {
      // Theme lookup
      const key = String(xlsxColor.theme);
      if (workbook.theme.colorScheme[key]) {
        hex = '#' + workbook.theme.colorScheme[key];
      }
    } else if (xlsxColor.auto) {
      hex = '#000000';
    }

    if (hex && xlsxColor.tint !== undefined) {
      hex = ColorUtils.applyTint(hex, xlsxColor.tint);
    }

    return hex;
  }
}
