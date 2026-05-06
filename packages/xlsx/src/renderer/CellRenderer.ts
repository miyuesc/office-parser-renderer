import { Cell, ConditionalRenderStyle, Row, Styles } from '../parser/types';
import { UnitConversion, FontMapping, ColorUtils, NumberFormatter } from '@opr/shared';
import { CellFormatUtils } from '../utils/CellFormatUtils';

export type FormulaDisplayMode = 'auto' | 'value' | 'formula';

export class CellRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    row: Row,
    c: number,
    x: number,
    y: number,
    w: number,
    h: number,
    styles: Styles | undefined,
    defaultFont: string,
    scale: number = 1,
    formulaDisplay: FormulaDisplayMode = 'auto',
    conditionalStyle?: ConditionalRenderStyle
  ) {
    const cell = row.cells.get(c);
    let cellStyleStr = defaultFont;
    let fgColor = '#000000';
    let bgColor = 'transparent';

    let fontSize = UnitConversion.ptToPixel(11) * scale;
    let fontFamily = 'Arial';
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrike = false;

    let align = 'left';
    let vAlign = 'bottom';
    let wrapText = false;

    // Apply Style
    if (styles && cell && cell.styleId !== undefined) {
      const xf = styles.cellXfs[cell.styleId];
      if (xf) {
        const rowStyleId = row.styleId;
        const rowXf = rowStyleId !== undefined && rowStyleId !== cell.styleId ? styles.cellXfs[rowStyleId] : undefined;
        const fontXf = xf.applyFont !== true && rowXf?.applyFont === true ? rowXf : xf;

        // Font
        if (styles.fonts[fontXf.fontId]) {
          const font = styles.fonts[fontXf.fontId];
          const sizePt = font.size || 11;
          fontSize = UnitConversion.ptToPixel(sizePt) * scale;

          const rawName = font.name || 'Arial';
          fontFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

          if (font.bold) isBold = true;
          if (font.italic) isItalic = true;
          if (font.underline) isUnderline = true;
          if (font.strike) isStrike = true;

          if (font.color) {
            fgColor = ColorUtils.formatColor(font.color) || '#000000';
          }
        }

        // Fill
        if (styles.fills[xf.fillId]) {
          const fill = styles.fills[xf.fillId];
          if (fill.fgColor) bgColor = ColorUtils.formatColor(fill.fgColor) || 'transparent';
        }

        // Alignment
        if (xf.alignment) {
          if (xf.alignment.horizontal) align = xf.alignment.horizontal;
          if (xf.alignment.vertical) vAlign = xf.alignment.vertical;
          if (xf.alignment.wrapText) wrapText = true;
        }
      }
    }

    if (cell?.hyperlink) {
      fgColor = '#0563c1';
      isUnderline = true;
    }

    if (conditionalStyle?.font) {
      const font = conditionalStyle.font;
      const sizePt = font.size || font.descriptor?.size;
      if (sizePt) {
        fontSize = UnitConversion.ptToPixel(sizePt) * scale;
      }

      const rawName = font.name || font.descriptor?.family;
      if (rawName) {
        fontFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;
      }

      if (font.bold !== undefined) isBold = Boolean(font.bold);
      if (font.italic !== undefined) isItalic = Boolean(font.italic);
      if (font.underline !== undefined) isUnderline = Boolean(font.underline);
      if (font.strike !== undefined) isStrike = Boolean(font.strike);
      if (font.color) {
        fgColor = ColorUtils.formatColor(font.color) || fgColor;
      }
    }

    if (conditionalStyle?.fill?.fgColor) {
      bgColor = ColorUtils.formatColor(conditionalStyle.fill.fgColor) || bgColor;
    }

    cellStyleStr = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;

    // Fill Background
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
    }

    if (cell || conditionalStyle) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      const padding = 2 * scale;
      const iconSlotWidth = conditionalStyle?.iconSet ? Math.max(14 * scale, fontSize * 1.15) : 0;
      const contentStartX = x + padding + iconSlotWidth;
      const contentEndX = x + w - padding;
      const effectiveW = Math.max(0, contentEndX - contentStartX);
      const showCellText = conditionalStyle?.dataBar?.showValue !== false && conditionalStyle?.iconSet?.showValue !== false;

      if (conditionalStyle?.dataBar && conditionalStyle.dataBar.widthRatio > 0) {
        this.renderDataBar(ctx, x, y, w, h, padding, effectiveW, scale, conditionalStyle.dataBar);
      }

      if (conditionalStyle?.iconSet) {
        this.renderIconSet(ctx, x, y, h, padding, iconSlotWidth, fontSize, scale, conditionalStyle.iconSet);
      }

      if (showCellText && cell?.richText && cell.richText.length > 0) {
        let totalWidth = 0;
        for (const run of cell.richText) {
          const f = run.font;
          let fStr = cellStyleStr;
          if (f) {
            const sizePt = f.size || 11;
            const sizePx = UnitConversion.ptToPixel(sizePt) * scale;

            const rawName = f.name || 'Arial';
            const safeFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

            const bold = f.bold ? 'bold ' : '';
            const italic = f.italic ? 'italic ' : '';
            fStr = `${italic}${bold}${sizePx}px ${safeFamily}`;
          }
          ctx.font = fStr;
          totalWidth += ctx.measureText(run.text).width;
        }

        let curX = contentStartX;
        if (align === 'center') curX = contentStartX + effectiveW / 2 - totalWidth / 2;
        else if (align === 'right') curX = contentEndX - totalWidth;

        let curY = y + h / 2;
        if (vAlign === 'top') curY = y + padding + fontSize / 2;
        else if (vAlign === 'bottom') curY = y + h - padding - fontSize / 2;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        for (const run of cell.richText) {
          const f = run.font;
          let fStr = cellStyleStr;
          let fColor = fgColor;
          if (f) {
            const sizePt = f.size || 11;
            const sizePx = UnitConversion.ptToPixel(sizePt) * scale;

            const rawName = f.name || 'Arial';
            const safeFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

            const bold = f.bold ? 'bold ' : '';
            const italic = f.italic ? 'italic ' : '';
            fStr = `${italic}${bold}${sizePx}px ${safeFamily}`;
            if (f.color) fColor = ColorUtils.formatColor(f.color) || '#000000';
          }
          ctx.font = fStr;
          ctx.fillStyle = fColor;
          ctx.fillText(run.text, curX, curY);

          // Decorations
          const textMetric = ctx.measureText(run.text);
          const textW = textMetric.width;

          if (f && f.underline) {
            ctx.beginPath();
            ctx.moveTo(curX, curY + fontSize / 2 + 1);
            ctx.lineTo(curX + textW, curY + fontSize / 2 + 1);
            ctx.strokeStyle = fColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          if (f && f.strike) {
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(curX + textW, curY);
            ctx.strokeStyle = fColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          curX += textW;
        }
      } else if (showCellText && cell) {
        const text = this.getCellText(cell, styles, formulaDisplay);
        ctx.font = cellStyleStr;
        ctx.fillStyle = fgColor;

        let textX = contentStartX;
        if (align === 'center') textX = contentStartX + effectiveW / 2;
        else if (align === 'right') textX = contentEndX;

        ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

        const lines = wrapText ? this.breakTextIntoLines(ctx, text, effectiveW) : [text];
        const lineHeight = fontSize * 1.3;
        const totalTextHeight = lines.length * lineHeight;

        let startY = y + (h - totalTextHeight) / 2 + lineHeight / 2;
        if (vAlign === 'top') startY = y + padding + lineHeight / 2;
        else if (vAlign === 'bottom') startY = y + h - padding - totalTextHeight + lineHeight / 2;

        for (let i = 0; i < lines.length; i++) {
          const lineY = Math.round(startY + i * lineHeight);
          const lineX = Math.round(textX);
          ctx.fillText(lines[i], lineX, lineY);

          // Decorations
          if (isUnderline || isStrike) {
            const textW = ctx.measureText(lines[i]).width;
            // Alignment adjustment for line start X
            let startLX = lineX;
            if (align === 'center') startLX = lineX - textW / 2;
            else if (align === 'right') startLX = lineX - textW;

            if (isUnderline) {
              ctx.beginPath();
              ctx.moveTo(startLX, lineY + fontSize / 2 + 1);
              ctx.lineTo(startLX + textW, lineY + fontSize / 2 + 1);
              ctx.strokeStyle = fgColor;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            if (isStrike) {
              ctx.beginPath();
              ctx.moveTo(startLX, lineY);
              ctx.lineTo(startLX + textW, lineY);
              ctx.strokeStyle = fgColor;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }
      ctx.restore();
    }
  }

  private static renderDataBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    padding: number,
    effectiveW: number,
    scale: number,
    dataBar: NonNullable<ConditionalRenderStyle['dataBar']>
  ) {
    const barWidth = Math.max(0, effectiveW * dataBar.widthRatio);
    if (barWidth <= 0) {
      return;
    }

    const barX = x + padding + effectiveW * dataBar.xRatio;
    const barHeight = Math.max(4 * scale, Math.min(h - padding * 2, h * 0.55));
    const barY = y + (h - barHeight) / 2;

    ctx.fillStyle = ColorUtils.formatColor(dataBar.color) || dataBar.color;
    ctx.fillRect(barX, barY, barWidth, barHeight);
  }

  private static renderIconSet(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    h: number,
    padding: number,
    iconSlotWidth: number,
    fontSize: number,
    scale: number,
    iconSet: NonNullable<ConditionalRenderStyle['iconSet']>
  ) {
    const glyph = this.resolveIconGlyph(iconSet.name, iconSet.iconIndex, iconSet.iconCount);
    if (!glyph) {
      return;
    }

    ctx.save();
    ctx.font = `${Math.max(fontSize, 12 * scale)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = glyph.color;
    ctx.fillText(glyph.text, x + padding + iconSlotWidth / 2, y + h / 2);
    ctx.restore();
  }

  private static resolveIconGlyph(name: string, iconIndex: number, iconCount: number) {
    const normalized = name || `${iconCount}Arrows`;

    if (normalized.includes('Arrows')) {
      const colored = !normalized.includes('Gray');
      const palette = colored
        ? ['#d13438', '#ff8c00', '#ffb900', '#498205', '#107c10']
        : ['#8a8886', '#a19f9d', '#c8c6c4', '#a19f9d', '#8a8886'];
      const glyphs =
        iconCount === 5 ? ['↓', '↘', '→', '↗', '↑'] : iconCount === 4 ? ['↓', '→', '↗', '↑'] : ['↓', '→', '↑'];
      return this.pickIconGlyph(glyphs, palette, iconIndex);
    }

    if (normalized.includes('TrafficLights')) {
      return this.pickIconGlyph(
        ['●', '●', '●', '●'],
        ['#d13438', '#ffb900', '#92c353', '#107c10'],
        iconIndex
      );
    }

    if (normalized.includes('Flags')) {
      return this.pickIconGlyph(['⚑', '⚑', '⚑'], ['#d13438', '#ffb900', '#107c10'], iconIndex);
    }

    if (normalized.includes('Signs')) {
      return this.pickIconGlyph(['◆', '▲', '●'], ['#d13438', '#ffb900', '#107c10'], iconIndex);
    }

    if (normalized.includes('Symbols')) {
      return this.pickIconGlyph(['✕', '!', '✓'], ['#d13438', '#ffb900', '#107c10'], iconIndex);
    }

    if (normalized.includes('Rating')) {
      const glyphs = iconCount === 5 ? ['▁', '▂', '▃', '▄', '▅'] : ['▁', '▃', '▄', '▅'];
      const palette = ['#d13438', '#f7630c', '#ffb900', '#92c353', '#107c10'];
      return this.pickIconGlyph(glyphs, palette, iconIndex);
    }

    if (normalized.includes('Quarters')) {
      return this.pickIconGlyph(['○', '◔', '◑', '◕', '●'], ['#8a8886', '#8a8886', '#8a8886', '#8a8886', '#8a8886'], iconIndex);
    }

    if (normalized.includes('RedToBlack')) {
      return this.pickIconGlyph(['●', '●', '●', '●'], ['#d13438', '#f7630c', '#ffb900', '#323130'], iconIndex);
    }

    return this.pickIconGlyph(
      iconCount === 5 ? ['○', '◔', '◑', '◕', '●'] : iconCount === 4 ? ['○', '◔', '◕', '●'] : ['○', '◑', '●'],
      ['#d13438', '#ffb900', '#107c10', '#107c10', '#107c10'],
      iconIndex
    );
  }

  private static pickIconGlyph(glyphs: string[], colors: string[], iconIndex: number) {
    const safeIndex = Math.min(Math.max(iconIndex, 0), glyphs.length - 1);
    return {
      text: glyphs[safeIndex],
      color: colors[Math.min(safeIndex, colors.length - 1)] || '#8a8886'
    };
  }

  static getCellText(cell: Cell, styles?: Styles, formulaDisplay: FormulaDisplayMode = 'auto'): string {
    const formulaText = cell.formula ? `=${cell.formula}` : '';
    if (formulaDisplay === 'formula' && formulaText) {
      return formulaText;
    }

    if (formulaDisplay === 'auto' && formulaText && !this.hasVisibleFormulaResult(cell)) {
      return formulaText;
    }

    if (cell.value === undefined || cell.value === null) return '';

    if (cell.type === 'number' && typeof cell.value === 'number' && styles && cell.styleId !== undefined) {
      const numberFormat = CellFormatUtils.resolveNumberFormat(cell, styles);
      if (numberFormat && numberFormat.formatCode !== 'General') {
        if (CellFormatUtils.isDateFormat(numberFormat.formatCode, numberFormat.numFmtId)) {
          const dateValue = CellFormatUtils.getDateValue(cell, styles);
          if (dateValue) {
            return NumberFormatter.format(dateValue, numberFormat.formatCode);
          }
        }

        return NumberFormatter.format(cell.value, numberFormat.formatCode);
      }
    }

    return String(cell.value);
  }

  private static hasVisibleFormulaResult(cell: Cell) {
    if (!cell.formula) {
      return false;
    }

    if (cell.hasFormulaResult !== undefined) {
      return cell.hasFormulaResult;
    }

    if (typeof cell.value === 'number') {
      return !Number.isNaN(cell.value);
    }

    if (typeof cell.value === 'boolean') {
      return true;
    }

    return String(cell.value ?? '').length > 0;
  }

  static breakTextIntoLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const para of paragraphs) {
      if (ctx.measureText(para).width <= maxWidth) {
        lines.push(para);
        continue;
      }

      let currentLine = '';
      for (let i = 0; i < para.length; i++) {
        const char = para[i];
        const testLine = currentLine + char;
        if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.length > 0) lines.push(currentLine);
    }
    return lines;
  }
}
