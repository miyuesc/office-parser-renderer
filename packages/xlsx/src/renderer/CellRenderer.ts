import { Cell, Row, Styles } from '../parser/types';
import { UnitConversion, FontMapping, ColorUtils, NumberFormatter } from '@opr/shared';

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
    scale: number = 1
  ) {
    const cell = row.cells.get(c);
    let cellStyleStr = defaultFont;
    let fgColor = '#000000';
    let bgColor = 'transparent';

    let fontSize = 11;
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
        // Font
        if (styles.fonts[xf.fontId]) {
          const font = styles.fonts[xf.fontId];
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

    cellStyleStr = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;

    // Fill Background
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
    }

    if (cell) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      const padding = 2 * scale;
      const effectiveW = w - padding * 2;

      if (cell.richText && cell.richText.length > 0) {
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

        let curX = x + padding;
        if (align === 'center') curX = x + w / 2 - totalWidth / 2;
        else if (align === 'right') curX = x + w - totalWidth - padding;

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
      } else {
        const text = this.getCellText(cell, styles);
        ctx.font = cellStyleStr;
        ctx.fillStyle = fgColor;

        let textX = x + padding;
        if (align === 'center') textX = x + w / 2;
        else if (align === 'right') textX = x + w - padding;

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

  static getCellText(cell: Cell, styles?: Styles): string {
    if (cell.value === undefined || cell.value === null) return '';

    if (cell.type === 'number' && typeof cell.value === 'number' && styles && cell.styleId !== undefined) {
      const xf = styles.cellXfs[cell.styleId];
      if (xf && (xf.applyNumberFormat || xf.numFmtId !== undefined)) {
        const numFmtId = xf.numFmtId || 0;
        let formatCode = 'General';
        if (styles.numFmts && styles.numFmts.has(numFmtId)) {
          formatCode = styles.numFmts.get(numFmtId)!;
        } else {
          switch (numFmtId) {
            case 0:
              formatCode = 'General';
              break;
            case 1:
              formatCode = '0';
              break;
            case 2:
              formatCode = '0.00';
              break;
            case 9:
              formatCode = '0%';
              break;
            case 10:
              formatCode = '0.00%';
              break;
            case 14:
              formatCode = 'm/d/yy';
              break;
          }
        }

        if (formatCode !== 'General') {
          const isDateFormat = (fmt: string) => /y|m|d|h|s|am\/pm/i.test(fmt);
          if (isDateFormat(formatCode) || (numFmtId >= 14 && numFmtId <= 22)) {
            const dateValue = new Date(Math.round((cell.value - 25569) * 86400 * 1000));
            return NumberFormatter.format(dateValue, formatCode);
          }
          return NumberFormatter.format(cell.value, formatCode);
        }
      }
    }

    return String(cell.value);
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
