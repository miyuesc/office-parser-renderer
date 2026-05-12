import {
  getElementsByLocalName,
  getFirstElementByLocalName,
  getOptionalAttr,
  parseNumberAttr,
  ParagraphStyle,
  TextStyle
} from '@opr/shared';

export function childElementsByLocalName(element: ParentNode, localName: string): Element[] {
  return Array.from(element.childNodes).filter(
    node => node.nodeType === 1 && ((node as Element).localName === localName || (node as Element).nodeName.split(':').pop() === localName)
  ) as Element[];
}

export function firstChildElementByLocalName(element: ParentNode, localName: string): Element | undefined {
  return childElementsByLocalName(element, localName)[0];
}

export function attr(element: Element, name: string): string | undefined {
  return getOptionalAttr(element, `w:${name}`) || getOptionalAttr(element, name);
}

export function textOfFirst(element: ParentNode, localName: string): string | undefined {
  return getFirstElementByLocalName(element, localName)?.textContent || undefined;
}

export function valueOfFirst(element: ParentNode, localName: string): string | undefined {
  const node = getFirstElementByLocalName(element, localName);
  return node ? attr(node, 'val') : undefined;
}

export function parseRunProperties(rPr?: Element): TextStyle | undefined {
  if (!rPr) {
    return undefined;
  }

  const style: TextStyle = {};
  const fonts = getFirstElementByLocalName(rPr, 'rFonts');
  const color = getFirstElementByLocalName(rPr, 'color');
  const highlight = getFirstElementByLocalName(rPr, 'highlight');
  const shading = getFirstElementByLocalName(rPr, 'shd');
  const size = valueOfFirst(rPr, 'sz');
  const underline = getFirstElementByLocalName(rPr, 'u');

  if (size) {
    style.size = parseNumberAttr(size) / 2;
  }
  if (color) {
    const value = attr(color, 'val');
    if (value && value !== 'auto') {
      style.color = `#${value}`;
    }
  }
  if (highlight) {
    style.highlight = mapHighlightColor(attr(highlight, 'val'));
  }
  if (shading) {
    const fill = attr(shading, 'fill');
    if (fill && fill !== 'auto') {
      style.highlight = fill.startsWith('#') ? fill : `#${fill}`;
    }
  }
  const bold = parseBooleanProperty(rPr, 'b');
  const italic = parseBooleanProperty(rPr, 'i');
  const strike = parseBooleanProperty(rPr, 'strike');
  if (bold !== undefined) style.bold = bold;
  if (italic !== undefined) style.italic = italic;
  if (strike !== undefined) style.strike = strike;
  if (underline) {
    const value = attr(underline, 'val');
    style.underline = value === 'none' || value === '0' || value === 'false' ? false : value || true;
  }

  if (fonts) {
    const resolvedFontNames = [
      attr(fonts, 'eastAsia') || resolveThemeFont(attr(fonts, 'eastAsiaTheme')),
      attr(fonts, 'ascii') || resolveThemeFont(attr(fonts, 'asciiTheme')),
      attr(fonts, 'hAnsi') || resolveThemeFont(attr(fonts, 'hAnsiTheme')),
      attr(fonts, 'cs') || resolveThemeFont(attr(fonts, 'csTheme') || attr(fonts, 'cstheme'))
    ].filter((value): value is string => !!value);

    if (resolvedFontNames.length > 0) {
      style.fontFamily = resolvedFontNames[0];
      if (resolvedFontNames.length > 1) {
        style.fontFallback = Array.from(new Set(resolvedFontNames.slice(1)));
      }
    }
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

export function parseParagraphProperties(pPr?: Element): ParagraphStyle | undefined {
  if (!pPr) {
    return undefined;
  }

  const style: ParagraphStyle = {};
  const jc = getFirstElementByLocalName(pPr, 'jc');
  const ind = getFirstElementByLocalName(pPr, 'ind');
  const spacing = getFirstElementByLocalName(pPr, 'spacing');
  const rPr = getFirstElementByLocalName(pPr, 'rPr');
  const snapToGrid = parseBooleanProperty(pPr, 'snapToGrid');

  if (jc) {
    style.alignment = attr(jc, 'val');
  }
  if (ind) {
    style.indent = {
      left: parseOptionalNumber(attr(ind, 'left')),
      right: parseOptionalNumber(attr(ind, 'right')),
      firstLine: parseOptionalNumber(attr(ind, 'firstLine')),
      hanging: parseOptionalNumber(attr(ind, 'hanging'))
    };
  }
  if (spacing) {
    style.spacing = {
      before: parseOptionalNumber(attr(spacing, 'before')),
      after: parseOptionalNumber(attr(spacing, 'after')),
      line: parseOptionalNumber(attr(spacing, 'line')),
      lineRule: attr(spacing, 'lineRule')
    };
  }
  if (snapToGrid !== undefined) {
    style.snapToGrid = snapToGrid;
  }
  if (rPr) {
    style.text = parseRunProperties(rPr);
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

function parseOptionalNumber(value?: string): number | undefined {
  return value === undefined ? undefined : parseNumberAttr(value);
}

function parseBooleanProperty(rPr: Element, localName: string): boolean | undefined {
  const property = getFirstElementByLocalName(rPr, localName);
  if (!property) {
    return undefined;
  }

  const value = attr(property, 'val');
  if (value === undefined || value === '') {
    return true;
  }

  return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'on';
}

function resolveThemeFont(value?: string): string | undefined {
  switch (value) {
    case 'majorEastAsia':
      return '微软雅黑';
    case 'minorEastAsia':
      return '等线';
    case 'majorHAnsi':
    case 'majorAscii':
    case 'majorBidi':
      return 'Cambria';
    case 'minorHAnsi':
    case 'minorAscii':
    case 'minorBidi':
      return 'Calibri';
    default:
      return undefined;
  }
}

function mapHighlightColor(value?: string): string | undefined {
  switch (value) {
    case 'yellow':
      return '#ffff00';
    case 'green':
      return '#00ff00';
    case 'cyan':
      return '#00ffff';
    case 'magenta':
      return '#ff00ff';
    case 'blue':
      return '#0000ff';
    case 'red':
      return '#ff0000';
    case 'darkBlue':
      return '#000080';
    case 'darkCyan':
      return '#008080';
    case 'darkGreen':
      return '#008000';
    case 'darkMagenta':
      return '#800080';
    case 'darkRed':
      return '#800000';
    case 'darkYellow':
      return '#808000';
    case 'darkGray':
      return '#808080';
    case 'lightGray':
      return '#c0c0c0';
    case 'black':
      return '#000000';
    case 'none':
    case undefined:
      return undefined;
    default:
      return value.startsWith('#') ? value : `#${value}`;
  }
}

export function localElements(root: ParentNode, localName: string): Element[] {
  return getElementsByLocalName(root, localName);
}
