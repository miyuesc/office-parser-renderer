import { FileHandler, Logger, ColorParser } from '@opr/shared';
import { Styles, Font, Fill, CellXf, Alignment } from './types';

const logger = new Logger('StylesParser');

export class StylesParser {
  static parse(xmlString: string): Styles {
    const styles: Styles = {
      fonts: [],
      fills: [],
      cellXfs: []
    };

    try {
      const doc = FileHandler.parseXML(xmlString);

      // 1. Fonts
      const fontsNode = doc.querySelector('fonts');
      if (fontsNode) {
        const fontNodes = fontsNode.querySelectorAll('font');
        for (let i = 0; i < fontNodes.length; i++) {
          styles.fonts.push(this.parseFont(fontNodes[i]));
        }
      }

      // 2. Fills
      const fillsNode = doc.querySelector('fills');
      if (fillsNode) {
        const fillNodes = fillsNode.querySelectorAll('fill');
        for (let i = 0; i < fillNodes.length; i++) {
          styles.fills.push(this.parseFill(fillNodes[i]));
        }
      }

      // 3. CellXfs (Cell formats)
      const cellXfsNode = doc.querySelector('cellXfs');
      if (cellXfsNode) {
        const xfNodes = cellXfsNode.querySelectorAll('xf');
        for (let i = 0; i < xfNodes.length; i++) {
          styles.cellXfs.push(this.parseCellXf(xfNodes[i]));
        }
      }
    } catch (e) {
      logger.error('Failed to parse styles', e);
    }

    return styles;
  }

  private static parseFont(node: Element): Font {
    const font: Font = {};

    // Name
    const nameNode = node.querySelector('name');
    if (nameNode) font.name = nameNode.getAttribute('val') || undefined;

    // Size
    const szNode = node.querySelector('sz');
    if (szNode) font.size = parseFloat(szNode.getAttribute('val') || '11');

    // Color
    const colorNode = node.querySelector('color');
    if (colorNode) {
      const rgb = colorNode.getAttribute('rgb');
      const theme = colorNode.getAttribute('theme'); // Not supported in MVP yet
      if (rgb) {
        font.color = ColorParser.toCSS(rgb);
      }
      // TODO: Handler theme colors
    }

    // Bold / Italic
    if (node.querySelector('b')) font.bold = true;
    if (node.querySelector('i')) font.italic = true;

    return font;
  }

  private static parseFill(node: Element): Fill {
    const patternFill = node.querySelector('patternFill');
    if (patternFill) {
      const patternType = patternFill.getAttribute('patternType') || 'none';
      const fill: Fill = { type: 'pattern', patternType };

      const fgColor = patternFill.querySelector('fgColor');
      const bgColor = patternFill.querySelector('bgColor');

      if (fgColor) {
        const rgb = fgColor.getAttribute('rgb');
        // TODO: Handle theme, indexed
        if (rgb) fill.fgColor = ColorParser.toCSS(rgb);
      }
      if (bgColor) {
        const rgb = bgColor.getAttribute('rgb');
        if (rgb) fill.bgColor = ColorParser.toCSS(rgb);
      }

      return fill;
    }

    // Gradient fill not supported in MVP
    return { type: 'pattern', patternType: 'none' };
  }

  private static parseCellXf(node: Element): CellXf {
    const fontId = parseInt(node.getAttribute('fontId') || '0', 10);
    const fillId = parseInt(node.getAttribute('fillId') || '0', 10);
    const applyFont = node.getAttribute('applyFont') === '1';
    const applyFill = node.getAttribute('applyFill') === '1';

    const xf: CellXf = {
      fontId,
      fillId,
      applyFont,
      applyFill
    };

    const alignmentNode = node.querySelector('alignment');
    if (alignmentNode) {
      const align: Alignment = {};
      const horizontal = alignmentNode.getAttribute('horizontal');
      const vertical = alignmentNode.getAttribute('vertical');
      const wrapText = alignmentNode.getAttribute('wrapText');

      if (horizontal && ['left', 'center', 'right'].includes(horizontal)) {
        align.horizontal = horizontal as any;
      }
      if (vertical && ['top', 'center', 'bottom'].includes(vertical)) {
        align.vertical = vertical as any;
      }
      if (wrapText === '1') {
        align.wrapText = true;
      }

      xf.alignment = align;
    }

    return xf;
  }
}
