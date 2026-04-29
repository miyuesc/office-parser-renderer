import {
  FileHandler,
  getFirstElementByLocalName,
  MediaRegistry,
  OfficeImage,
  PackageReader,
  parseNumberAttr,
  UnitConversion
} from '@opr/shared';
import { DocxBlock, DocxField, DocxHeaderFooterRef, DocxParagraph, DocxRun, DocxSection, DocxTable, DocxTableCell } from '../model';
import {
  attr,
  childElementsByLocalName,
  firstChildElementByLocalName,
  parseRunProperties,
  parseParagraphProperties,
  valueOfFirst
} from './xml';
import { normalizeLegacySymbolText } from './symbols';

export class DocumentParser {
  static parse(xmlString: string, options: { pkg?: PackageReader; sourcePartPath?: string } = {}): { body: DocxBlock[]; sections: DocxSection[] } {
    const doc = FileHandler.parseXML(xmlString);
    const body = getFirstElementByLocalName(doc, 'body');
    const blocks: DocxBlock[] = [];
    const sections: DocxSection[] = [];

    if (!body) {
      return { body: blocks, sections };
    }

    for (const child of Array.from(body.childNodes)) {
      if (child.nodeType !== 1) {
        continue;
      }

      const element = child as Element;
      if (element.localName === 'p') {
        const paragraph = this.parseParagraph(element, options);
        if (paragraph.section) {
          sections.push(paragraph.section);
        }
        blocks.push(paragraph);
      } else if (element.localName === 'tbl') {
        blocks.push(this.parseTable(element, options));
      }
    }

    const bodySectPr = firstChildElementByLocalName(body, 'sectPr');
    if (bodySectPr) {
      sections.push(this.parseSection(bodySectPr));
    }

    return { body: blocks, sections };
  }

  static parseBlocksFromElement(container: ParentNode, options: { pkg?: PackageReader; sourcePartPath?: string } = {}): DocxBlock[] {
    const blocks: DocxBlock[] = [];

    for (const child of Array.from(container.childNodes)) {
      if (child.nodeType !== 1) {
        continue;
      }

      const element = child as Element;
      if (element.localName === 'p') {
        blocks.push(this.parseParagraph(element, options));
      } else if (element.localName === 'tbl') {
        blocks.push(this.parseTable(element, options));
      }
    }

    return blocks;
  }

  private static parseParagraph(node: Element, options: { pkg?: PackageReader; sourcePartPath?: string }): DocxParagraph {
    const pPr = firstChildElementByLocalName(node, 'pPr');
    const styleId = pPr ? valueOfFirst(pPr, 'pStyle') : undefined;
    const numPr = pPr ? firstChildElementByLocalName(pPr, 'numPr') : undefined;
    const sectPr = pPr ? firstChildElementByLocalName(pPr, 'sectPr') : undefined;

    return {
      type: 'paragraph',
      styleId,
      style: parseParagraphProperties(pPr),
      numbering: numPr
        ? {
            level: valueOfFirst(numPr, 'ilvl'),
            numId: valueOfFirst(numPr, 'numId')
          }
        : undefined,
      runs: this.parseParagraphRuns(node, options),
      section: sectPr ? this.parseSection(sectPr) : undefined
    };
  }

  private static parseParagraphRuns(node: Element, options: { pkg?: PackageReader; sourcePartPath?: string }): DocxRun[] {
    const runs: DocxRun[] = [];

    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== 1) {
        continue;
      }

      const element = child as Element;
      if (element.localName === 'r') {
        runs.push(this.parseRun(element, options));
      } else if (element.localName === 'ins' || element.localName === 'del') {
        const revision = {
          type: element.localName === 'ins' ? 'insert' : 'delete',
          id: attr(element, 'id'),
          author: attr(element, 'author'),
          date: attr(element, 'date')
        } as const;
        for (const run of childElementsByLocalName(element, 'r')) {
          runs.push(this.parseRun(run, options, revision));
        }
      }
    }

    return runs;
  }

  private static parseRun(
    node: Element,
    options: { pkg?: PackageReader; sourcePartPath?: string },
    revision?: DocxRun['revision']
  ): DocxRun {
    const rPr = firstChildElementByLocalName(node, 'rPr');
    const styleId = rPr ? valueOfFirst(rPr, 'rStyle') : undefined;
    const breaks = childElementsByLocalName(node, 'br').map(br => attr(br, 'type') || 'line');
    const style = parseRunProperties(rPr);
    const text = childElementsByLocalName(node, 't')
      .map(textNode => textNode.textContent || '')
      .join('');
    const deletedText = childElementsByLocalName(node, 'delText')
      .map(textNode => textNode.textContent || '')
      .join('');
    const symbolNodes = childElementsByLocalName(node, 'sym');
    const symbolText = symbolNodes.map(sym => this.parseSymbol(sym)).join('');
    const symbolFontFamily = symbolNodes.map(sym => attr(sym, 'font')).find((value): value is string => !!value);
    const fields = childElementsByLocalName(node, 'instrText')
      .map(instrText => this.parseFieldInstruction(instrText.textContent || ''))
      .filter(field => field !== undefined);
    const resolvedStyle =
      symbolFontFamily && !style?.fontFamily
        ? {
            ...(style || {}),
            fontFamily: symbolFontFamily
          }
        : style;

    return {
      text: text + deletedText + symbolText,
      style: resolvedStyle,
      styleId,
      breaks: breaks.length > 0 ? breaks : undefined,
      fields: fields.length > 0 ? fields : undefined,
      images: this.parseRunImages(node, options),
      revision
    };
  }

  private static parseTable(node: Element, options: { pkg?: PackageReader; sourcePartPath?: string }): DocxTable {
    const tblPr = firstChildElementByLocalName(node, 'tblPr');
    const tblGrid = firstChildElementByLocalName(node, 'tblGrid');

    return {
      type: 'table',
      width: this.parseWidth(tblPr ? firstChildElementByLocalName(tblPr, 'tblW') : undefined),
      gridWidths: tblGrid
        ? childElementsByLocalName(tblGrid, 'gridCol')
            .map(gridCol => parseNumberAttr(attr(gridCol, 'w'), 0))
            .filter(value => value > 0)
        : undefined,
      borders: tblPr ? this.parseTableBorders(firstChildElementByLocalName(tblPr, 'tblBorders')) : undefined,
      rows: childElementsByLocalName(node, 'tr').map(row => ({
        cells: childElementsByLocalName(row, 'tc').map(cell => this.parseTableCell(cell, options))
      }))
    };
  }

  private static parseTableCell(cell: Element, options: { pkg?: PackageReader; sourcePartPath?: string }): DocxTableCell {
    const tcPr = firstChildElementByLocalName(cell, 'tcPr');
    const gridSpan = tcPr ? parseNumberAttr(valueOfFirst(tcPr, 'gridSpan'), 1) : undefined;
    const vMerge = tcPr ? firstChildElementByLocalName(tcPr, 'vMerge') : undefined;
    const shading = tcPr ? firstChildElementByLocalName(tcPr, 'shd') : undefined;

    return {
      blocks: [
        ...childElementsByLocalName(cell, 'p').map(paragraph => this.parseParagraph(paragraph, options)),
        ...childElementsByLocalName(cell, 'tbl').map(table => this.parseTable(table, options))
      ],
      width: this.parseWidth(tcPr ? firstChildElementByLocalName(tcPr, 'tcW') : undefined),
      gridSpan: gridSpan && gridSpan > 1 ? gridSpan : undefined,
      verticalMerge: vMerge ? ((attr(vMerge, 'val') === 'restart' ? 'restart' : 'continue') as DocxTableCell['verticalMerge']) : undefined,
      shading: this.parseShading(shading),
      borders: tcPr ? this.parseCellBorders(firstChildElementByLocalName(tcPr, 'tcBorders')) : undefined
    };
  }

  private static parseWidth(node?: Element) {
    if (!node) {
      return undefined;
    }

    const type = attr(node, 'type') || 'dxa';
    const value = parseNumberAttr(attr(node, 'w'));
    if (type === 'auto' && value === undefined) {
      return { type };
    }
    if (value === undefined) {
      return undefined;
    }

    return {
      type,
      value
    };
  }

  private static parseCellBorders(tcBorders?: Element) {
    if (!tcBorders) {
      return undefined;
    }

    const borders = {
      top: this.parseBorderNode(firstChildElementByLocalName(tcBorders, 'top')),
      right: this.parseBorderNode(firstChildElementByLocalName(tcBorders, 'right')),
      bottom: this.parseBorderNode(firstChildElementByLocalName(tcBorders, 'bottom')),
      left: this.parseBorderNode(firstChildElementByLocalName(tcBorders, 'left'))
    };

    return Object.values(borders).some(Boolean) ? borders : undefined;
  }

  private static parseTableBorders(tblBorders?: Element) {
    if (!tblBorders) {
      return undefined;
    }

    const borders = {
      top: this.parseBorderNode(firstChildElementByLocalName(tblBorders, 'top')),
      right: this.parseBorderNode(firstChildElementByLocalName(tblBorders, 'right')),
      bottom: this.parseBorderNode(firstChildElementByLocalName(tblBorders, 'bottom')),
      left: this.parseBorderNode(firstChildElementByLocalName(tblBorders, 'left')),
      insideH: this.parseBorderNode(firstChildElementByLocalName(tblBorders, 'insideH')),
      insideV: this.parseBorderNode(firstChildElementByLocalName(tblBorders, 'insideV'))
    };

    return Object.values(borders).some(Boolean) ? borders : undefined;
  }

  private static parseBorderNode(border?: Element) {
    if (!border || attr(border, 'val') === 'nil' || attr(border, 'val') === 'none') {
      return undefined;
    }

    const color = attr(border, 'color');
    return {
      style: attr(border, 'val'),
      color: color && color !== 'auto' ? `#${color}` : '#9ca3af',
      size: parseNumberAttr(attr(border, 'sz'), 4) / 8
    };
  }

  private static parseShading(shading?: Element) {
    const fill = shading ? attr(shading, 'fill') : undefined;
    if (!fill || fill === 'auto') {
      return undefined;
    }

    return fill.startsWith('#') ? fill : `#${fill}`;
  }

  private static parseSymbol(sym: Element) {
    const raw = attr(sym, 'char');
    if (!raw) {
      return '';
    }

    const codePoint = parseInt(raw, 16);
    if (!Number.isFinite(codePoint)) {
      return '';
    }

    return normalizeLegacySymbolText(String.fromCodePoint(codePoint), attr(sym, 'font'));
  }

  private static parseRunImages(
    node: Element,
    options: { pkg?: PackageReader; sourcePartPath?: string }
  ): OfficeImage[] | undefined {
    if (!options.pkg || !options.sourcePartPath) {
      return undefined;
    }

    const drawings = childElementsByLocalName(node, 'drawing');
    const images = drawings.flatMap(drawing => this.parseDrawingImages(drawing, options.pkg!, options.sourcePartPath!));
    return images.length > 0 ? images : undefined;
  }

  private static parseDrawingImages(drawing: Element, pkg: PackageReader, sourcePartPath: string): OfficeImage[] {
    const registry = new MediaRegistry(pkg);
    const images: OfficeImage[] = [];
    const containers = Array.from(drawing.querySelectorAll('*')).filter(
      node => node.localName === 'inline' || node.localName === 'anchor'
    ) as Element[];

    for (const container of containers) {
      const blip = Array.from(container.querySelectorAll('*')).find(node => node.localName === 'blip') as Element | undefined;
      const relationshipId = blip ? this.getDrawingRelationshipId(blip) : undefined;
      if (!relationshipId) {
        continue;
      }

      const resource = registry.resolveRelationship(sourcePartPath, relationshipId);
      if (!resource?.data || resource.kind !== 'image') {
        continue;
      }

      const extent = Array.from(container.children).find(child => child.localName === 'extent') as Element | undefined;
      const width = UnitConversion.emuToPixel(parseNumberAttr(extent ? attr(extent, 'cx') : undefined));
      const height = UnitConversion.emuToPixel(parseNumberAttr(extent ? attr(extent, 'cy') : undefined));
      const name =
        (Array.from(container.querySelectorAll('*')).find(node => node.localName === 'docPr') as Element | undefined)?.getAttribute(
          'name'
        ) || relationshipId;

      images.push({
        id: `${sourcePartPath}:${relationshipId}:${images.length}`,
        blob: new Blob([resource.data as BlobPart], {
          type: resource.contentType || this.getMimeType(resource.extension || '')
        }),
        extension: resource.extension || 'png',
        path: resource.path,
        contentType: resource.contentType,
        source: {
          relationshipId,
          target: resource.target,
          targetMode: resource.targetMode,
          resolvedTarget: resource.resolvedTarget,
          contentType: resource.contentType
        },
        position: {
          type: 'absolute',
          width: width || 120,
          height: height || 80
        },
        style: undefined,
        name
      } as OfficeImage & { name?: string });
    }

    return images;
  }

  private static getDrawingRelationshipId(node: Element): string | undefined {
    const direct = node.getAttribute('r:embed') || node.getAttribute('r:link');
    if (direct) {
      return direct;
    }

    for (let i = 0; i < node.attributes.length; i++) {
      const item = node.attributes.item(i);
      if (item?.name.endsWith(':embed') || item?.name.endsWith(':link')) {
        return item.value;
      }
    }

    return undefined;
  }

  private static getMimeType(extension: string): string {
    switch (extension.toLowerCase()) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

  private static parseSection(node: Element): DocxSection {
    const pgSz = firstChildElementByLocalName(node, 'pgSz');
    const pgMar = firstChildElementByLocalName(node, 'pgMar');

    return {
      headerRefs: childElementsByLocalName(node, 'headerReference').map(ref => this.parseHeaderFooterRef(ref)),
      footerRefs: childElementsByLocalName(node, 'footerReference').map(ref => this.parseHeaderFooterRef(ref)),
      titlePage: !!firstChildElementByLocalName(node, 'titlePg'),
      pageSize: pgSz
        ? {
            width: parseNumberAttr(attr(pgSz, 'w')),
            height: parseNumberAttr(attr(pgSz, 'h')),
            orientation: attr(pgSz, 'orient')
          }
        : undefined,
      margins: pgMar
        ? {
            top: parseNumberAttr(attr(pgMar, 'top')),
            right: parseNumberAttr(attr(pgMar, 'right')),
            bottom: parseNumberAttr(attr(pgMar, 'bottom')),
            left: parseNumberAttr(attr(pgMar, 'left')),
            header: parseNumberAttr(attr(pgMar, 'header')),
            footer: parseNumberAttr(attr(pgMar, 'footer')),
            gutter: parseNumberAttr(attr(pgMar, 'gutter'))
          }
        : undefined
    };
  }

  private static parseHeaderFooterRef(node: Element): DocxHeaderFooterRef {
    return {
      type: attr(node, 'type') || 'default',
      relationshipId: this.getRelationshipId(node) || ''
    };
  }

  private static getRelationshipId(node: Element): string | undefined {
    const direct = node.getAttribute('r:id');
    if (direct) {
      return direct;
    }

    for (let i = 0; i < node.attributes.length; i++) {
      const item = node.attributes.item(i);
      if (item?.name.endsWith(':id')) {
        return item.value;
      }
    }

    return undefined;
  }

  private static parseFieldInstruction(instruction: string): DocxField | undefined {
    const normalized = instruction.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!normalized) {
      return undefined;
    }

    const type = normalized.startsWith('PAGE')
      ? 'page'
      : normalized.startsWith('NUMPAGES')
        ? 'numPages'
        : 'unknown';

    return {
      instruction: instruction.trim(),
      type
    };
  }
}
