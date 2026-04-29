import { FileHandler, Logger, ColorUtils, ThemeModel } from '@opr/shared';
import { Styles, Font, Fill, CellXf, Alignment, Border, BorderPr } from './types';

const logger = new Logger('StylesParser');

export class StylesParser {
  static parse(xmlString: string, options: { theme?: ThemeModel } = {}): Styles {
    const styles: Styles = {
      fonts: [],
      fills: [],
      borders: [],
      cellXfs: [],
      numFmts: new Map(),
      theme: options.theme
    };

    try {
      const doc = FileHandler.parseXML(xmlString);

      // 1. NumFmts
      const numFmtsNode = doc.querySelector('numFmts');
      if (numFmtsNode) {
        const numFmtNodes = numFmtsNode.querySelectorAll('numFmt');
        for (let i = 0; i < numFmtNodes.length; i++) {
          const numFmtId = parseInt(numFmtNodes[i].getAttribute('numFmtId') || '0', 10);
          const formatCode = numFmtNodes[i].getAttribute('formatCode');
          if (formatCode) {
            styles.numFmts.set(numFmtId, formatCode);
          }
        }
      }

      // 2. Fonts
      const fontsNode = doc.querySelector('fonts');
      if (fontsNode) {
        const fontNodes = fontsNode.querySelectorAll('font');
        for (let i = 0; i < fontNodes.length; i++) {
          styles.fonts.push(this.parseFont(fontNodes[i], options.theme));
        }
      }

      // 3. Fills
      const fillsNode = doc.querySelector('fills');
      if (fillsNode) {
        const fillNodes = fillsNode.querySelectorAll('fill');
        for (let i = 0; i < fillNodes.length; i++) {
          styles.fills.push(this.parseFill(fillNodes[i], options.theme));
        }
      }

      // 4. Borders
      const bordersNode = doc.querySelector('borders');
      if (bordersNode) {
        const borderNodes = bordersNode.querySelectorAll('border');
        for (let i = 0; i < borderNodes.length; i++) {
          styles.borders.push(this.parseBorder(borderNodes[i], options.theme));
        }
      }

      // 5. CellXfs (Cell formats)
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

  private static parseFont(node: Element, theme?: ThemeModel): Font {
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
      const colorRef = ColorUtils.createColorRef(
        colorNode.getAttribute('rgb'),
        colorNode.getAttribute('theme'),
        colorNode.getAttribute('indexed'),
        colorNode.getAttribute('tint')
      );
      const resolved = ColorUtils.resolveColorRef(colorRef, theme);
      if (colorRef) font.colorRef = colorRef;
      if (resolved) font.color = resolved;
    }

    const scheme = node.querySelector('scheme')?.getAttribute('val') || undefined;
    if (scheme) font.scheme = scheme;

    // Bold / Italic / Underline / Strike
    if (node.querySelector('b')) font.bold = true;
    if (node.querySelector('i')) font.italic = true;
    if (node.querySelector('u')) font.underline = true;
    if (node.querySelector('strike')) font.strike = true;

    font.descriptor = {
      family: font.name || this.resolveThemeFontFamily(scheme, theme),
      scheme,
      size: font.size,
      bold: font.bold,
      italic: font.italic,
      underline: font.underline,
      strike: font.strike,
      color: font.color,
      colorRef: font.colorRef
    };
    font.fontFamily = font.descriptor.family;

    return font;
  }

  private static parseFill(node: Element, theme?: ThemeModel): Fill {
    const patternFill = node.querySelector('patternFill');
    if (patternFill) {
      const patternType = patternFill.getAttribute('patternType') || 'none';
      const fill: Fill = { type: 'pattern', patternType };

      const fgColor = patternFill.querySelector('fgColor');
      const bgColor = patternFill.querySelector('bgColor');

      if (fgColor) {
        const colorRef = ColorUtils.createColorRef(
          fgColor.getAttribute('rgb'),
          fgColor.getAttribute('theme'),
          fgColor.getAttribute('indexed'),
          fgColor.getAttribute('tint')
        );
        const resolved = ColorUtils.resolveColorRef(colorRef, theme);
        if (colorRef) fill.fgColorRef = colorRef;
        if (resolved) {
          fill.fgColor = resolved;
          fill.color = resolved;
        }
        fill.colorRef = colorRef;
      }
      if (bgColor) {
        const colorRef = ColorUtils.createColorRef(
          bgColor.getAttribute('rgb'),
          bgColor.getAttribute('theme'),
          bgColor.getAttribute('indexed'),
          bgColor.getAttribute('tint')
        );
        const resolved = ColorUtils.resolveColorRef(colorRef, theme);
        if (colorRef) fill.bgColorRef = colorRef;
        if (resolved) {
          fill.bgColor = resolved;
          fill.backgroundColor = resolved;
        }
        fill.backgroundColorRef = colorRef;
      }

      return fill;
    }

    // Gradient fill not supported in MVP
    return { type: 'pattern', patternType: 'none' };
  }

  private static parseBorder(node: Element, theme?: ThemeModel): Border {
    const border: Border = {};

    const parseSide = (sideNode: Element | null): BorderPr | undefined => {
      if (!sideNode) return undefined;
      const style = sideNode.getAttribute('style');
      if (!style) return undefined; // No style usually means no border

      const pr: BorderPr = { style };
      const colorNode = sideNode.querySelector('color');
      if (colorNode) {
        const colorRef = ColorUtils.createColorRef(
          colorNode.getAttribute('rgb'),
          colorNode.getAttribute('theme'),
          colorNode.getAttribute('indexed'),
          colorNode.getAttribute('tint')
        );
        const resolved = ColorUtils.resolveColorRef(colorRef, theme);
        if (colorRef) pr.colorRef = colorRef;
        if (resolved) pr.color = resolved;
      }
      return pr;
    };

    border.left = parseSide(node.querySelector('left'));
    border.right = parseSide(node.querySelector('right'));
    border.top = parseSide(node.querySelector('top'));
    border.bottom = parseSide(node.querySelector('bottom'));
    border.diagonal = parseSide(node.querySelector('diagonal'));

    return border;
  }

  private static resolveThemeFontFamily(scheme?: string, theme?: ThemeModel): string | undefined {
    if (!scheme || !theme) {
      return undefined;
    }

    if (scheme === 'major') {
      return theme.fontScheme.major.latin || theme.fontScheme.major.eastAsia || theme.fontScheme.major.complexScript;
    }

    if (scheme === 'minor') {
      return theme.fontScheme.minor.latin || theme.fontScheme.minor.eastAsia || theme.fontScheme.minor.complexScript;
    }

    return undefined;
  }

  // ...

  private static parseCellXf(node: Element): CellXf {
    const numFmtId = parseInt(node.getAttribute('numFmtId') || '0', 10);
    const fontId = parseInt(node.getAttribute('fontId') || '0', 10);
    const fillId = parseInt(node.getAttribute('fillId') || '0', 10);
    const borderId = parseInt(node.getAttribute('borderId') || '0', 10);
    const applyFont = node.getAttribute('applyFont') === '1';
    const applyFill = node.getAttribute('applyFill') === '1';
    const applyBorder = node.getAttribute('applyBorder') === '1';
    const applyNumberFormat = node.getAttribute('applyNumberFormat') === '1';

    const xf: CellXf = {
      numFmtId,
      fontId,
      fillId,
      borderId,
      applyFont,
      applyFill,
      applyBorder,
      applyNumberFormat
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
