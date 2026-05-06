import {
  BookmarkResource,
  ChartParser,
  DrawingElement,
  FileHandler,
  getFirstElementByLocalName,
  MediaRegistry,
  OfficeChart,
  OfficeImage,
  PackageReader,
  RelationshipTarget,
  WarningCollector,
  parseNumberAttr,
  UnitConversion
} from '@opr/shared';
import { DocxBlock, DocxField, DocxFloatingDrawing, DocxHeaderFooterRef, DocxParagraph, DocxRun, DocxSection, DocxTable, DocxTableCell } from '../model';
import {
  attr,
  childElementsByLocalName,
  firstChildElementByLocalName,
  parseRunProperties,
  parseParagraphProperties,
  valueOfFirst
} from './xml';
import { normalizeLegacySymbolText } from './symbols';
import { MathParser } from './MathParser';

interface DocumentParserOptions {
  pkg?: PackageReader;
  sourcePartPath?: string;
  warnings?: WarningCollector;
}

export class DocumentParser {
  static parse(xmlString: string, options: DocumentParserOptions = {}): { body: DocxBlock[]; sections: DocxSection[] } {
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

  static parseBlocksFromElement(container: ParentNode, options: DocumentParserOptions = {}): DocxBlock[] {
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

  private static parseParagraph(node: Element, options: DocumentParserOptions): DocxParagraph {
    const pPr = firstChildElementByLocalName(node, 'pPr');
    const styleId = pPr ? valueOfFirst(pPr, 'pStyle') : undefined;
    const numPr = pPr ? firstChildElementByLocalName(pPr, 'numPr') : undefined;
    const sectPr = pPr ? firstChildElementByLocalName(pPr, 'sectPr') : undefined;
    const content = this.parseParagraphContent(node, options);

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
      runs: content.runs,
      floatingDrawings: content.floatingDrawings.length > 0 ? content.floatingDrawings : undefined,
      section: sectPr ? this.parseSection(sectPr) : undefined
    };
  }

  private static parseParagraphContent(node: Element, options: DocumentParserOptions): {
    runs: DocxRun[];
    floatingDrawings: DocxFloatingDrawing[];
  } {
    const parsed = this.parseRunsFromContainer(node, options);
    if (parsed.trailingBookmarks.length > 0) {
      parsed.runs.push({
        text: '',
        bookmarks: parsed.trailingBookmarks
      });
    }

    return {
      runs: parsed.runs,
      floatingDrawings: parsed.floatingDrawings
    };
  }

  private static parseRunsFromContainer(
    container: ParentNode,
    options: DocumentParserOptions,
    context: {
      revision?: DocxRun['revision'];
      hyperlink?: DocxRun['hyperlink'];
      leadingBookmarks?: BookmarkResource[];
    } = {}
  ): { runs: DocxRun[]; floatingDrawings: DocxFloatingDrawing[]; trailingBookmarks: BookmarkResource[] } {
    const runs: DocxRun[] = [];
    const floatingDrawings: DocxFloatingDrawing[] = [];
    let pendingBookmarks = [...(context.leadingBookmarks || [])];

    for (const child of Array.from(container.childNodes)) {
      if (child.nodeType !== 1) {
        continue;
      }

      const element = child as Element;
      if (element.localName === 'bookmarkStart') {
        const bookmark = this.parseBookmark(element, options);
        if (bookmark) {
          pendingBookmarks.push(bookmark);
        }
        continue;
      }

      if (element.localName === 'bookmarkEnd') {
        continue;
      }

      if (element.localName === 'r') {
        const parsedRun = this.parseRun(element, options, {
          revision: context.revision,
          hyperlink: context.hyperlink,
          bookmarks: pendingBookmarks
        });
        runs.push(parsedRun.run);
        floatingDrawings.push(...parsedRun.floatingDrawings);
        pendingBookmarks = [];
        continue;
      }

      if (element.localName === 'oMath' || element.localName === 'oMathPara') {
        runs.push({
          text: '',
          math: MathParser.parse(element, {
            warnings: options.warnings,
            partPath: options.sourcePartPath
          }),
          hyperlink: context.hyperlink,
          bookmarks: pendingBookmarks.length > 0 ? [...pendingBookmarks] : undefined,
          revision: context.revision
        });
        pendingBookmarks = [];
        continue;
      }

      if (element.localName === 'ins' || element.localName === 'del') {
        const parsed = this.parseRunsFromContainer(element, options, {
          revision: {
            type: element.localName === 'ins' ? 'insert' : 'delete',
            id: attr(element, 'id'),
            author: attr(element, 'author'),
            date: attr(element, 'date')
          },
          hyperlink: context.hyperlink,
          leadingBookmarks: pendingBookmarks
        });
        runs.push(...parsed.runs);
        floatingDrawings.push(...parsed.floatingDrawings);
        pendingBookmarks = parsed.trailingBookmarks;
        continue;
      }

      if (element.localName === 'hyperlink') {
        const parsed = this.parseRunsFromContainer(element, options, {
          revision: context.revision,
          hyperlink: this.parseHyperlink(element, options),
          leadingBookmarks: pendingBookmarks
        });
        runs.push(...parsed.runs);
        floatingDrawings.push(...parsed.floatingDrawings);
        pendingBookmarks = parsed.trailingBookmarks;
      }
    }

    return {
      runs,
      floatingDrawings,
      trailingBookmarks: pendingBookmarks
    };
  }

  private static parseRun(
    node: Element,
    options: DocumentParserOptions,
    context: {
      revision?: DocxRun['revision'];
      hyperlink?: DocxRun['hyperlink'];
      bookmarks?: BookmarkResource[];
    } = {}
  ): { run: DocxRun; floatingDrawings: DocxFloatingDrawing[] } {
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
    const floatingDrawings = this.parseRunFloatingDrawings(node, options);

    return {
      run: {
        text: text + deletedText + symbolText,
        style: resolvedStyle,
        styleId,
        breaks: breaks.length > 0 ? breaks : undefined,
        fields: fields.length > 0 ? fields : undefined,
        images: this.parseRunImages(node, options),
        hyperlink: context.hyperlink,
        bookmarks: context.bookmarks && context.bookmarks.length > 0 ? [...context.bookmarks] : undefined,
        revision: context.revision
      },
      floatingDrawings
    };
  }

  private static parseTable(node: Element, options: DocumentParserOptions): DocxTable {
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

  private static parseTableCell(cell: Element, options: DocumentParserOptions): DocxTableCell {
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
    options: DocumentParserOptions
  ): OfficeImage[] | undefined {
    if (!options.pkg || !options.sourcePartPath) {
      return undefined;
    }

    const drawings = childElementsByLocalName(node, 'drawing');
    const images = drawings.flatMap(drawing => this.parseDrawingImages(drawing, options.pkg!, options.sourcePartPath!));
    return images.length > 0 ? images : undefined;
  }

  private static parseRunFloatingDrawings(node: Element, options: DocumentParserOptions): DocxFloatingDrawing[] {
    if (!options.pkg || !options.sourcePartPath) {
      return [];
    }

    const drawings = childElementsByLocalName(node, 'drawing');
    return drawings.flatMap(drawing => this.parseDrawingFloatingDrawings(drawing, options));
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

  private static parseDrawingFloatingDrawings(drawing: Element, options: DocumentParserOptions): DocxFloatingDrawing[] {
    const anchors = this.findDescendantsByLocalName(drawing, 'anchor');

    return anchors
      .map(anchor => this.parseFloatingDrawing(anchor, options))
      .filter((item): item is DocxFloatingDrawing => !!item);
  }

  private static parseFloatingDrawing(anchor: Element, options: DocumentParserOptions): DocxFloatingDrawing | undefined {
    if (!options.pkg || !options.sourcePartPath) {
      return undefined;
    }

    const anchorMetadata = this.parseFloatingAnchorMetadata(anchor);
    const drawing = this.parseFloatingDrawingElement(anchor, options.pkg, options.sourcePartPath);
    const objectType = this.getFloatingDrawingType(drawing);
    const wrapType = anchorMetadata.wrap?.type;

    if (wrapType && wrapType !== 'none') {
      options.warnings?.unsupportedFeature(`DOCX floating drawing wrap mode is parsed but not rendered: ${wrapType}`, options.sourcePartPath);
    }

    if (!drawing) {
      options.warnings?.unsupportedFeature('DOCX floating drawing metadata was parsed but the drawing payload is not yet supported', options.sourcePartPath);
    }

    return {
      objectType,
      drawing,
      anchor: anchorMetadata
    };
  }

  private static parseFloatingDrawingElement(anchor: Element, pkg: PackageReader, sourcePartPath: string): DrawingElement | undefined {
    const image = this.parseFloatingImage(anchor, pkg, sourcePartPath);
    if (image) {
      return image;
    }

    return this.parseFloatingChart(anchor, pkg, sourcePartPath);
  }

  private static parseFloatingImage(anchor: Element, pkg: PackageReader, sourcePartPath: string): OfficeImage | undefined {
    const blip = this.firstDescendantByLocalName(anchor, 'blip');
    const relationshipId = blip ? this.getDrawingRelationshipId(blip) : undefined;
    if (!relationshipId) {
      return undefined;
    }

    const resource = new MediaRegistry(pkg).resolveRelationship(sourcePartPath, relationshipId);
    if (!resource?.data || resource.kind !== 'image') {
      return undefined;
    }

    const docPr = firstChildElementByLocalName(anchor, 'docPr');
    const extent = firstChildElementByLocalName(anchor, 'extent');
    const width = UnitConversion.emuToPixel(parseNumberAttr(extent ? extent.getAttribute('cx') || undefined : undefined));
    const height = UnitConversion.emuToPixel(parseNumberAttr(extent ? extent.getAttribute('cy') || undefined : undefined));
    const drawingId = (docPr ? attr(docPr, 'id') : undefined) || relationshipId;

    return {
      id: `${sourcePartPath}:${relationshipId}:${drawingId}`,
      blob: new Blob([resource.data as BlobPart], {
        type: resource.contentType || this.getMimeType(resource.extension || '')
      }),
      extension: resource.extension || 'png',
      path: resource.path,
      contentType: resource.contentType,
      source: this.toResourceRef(
        {
          id: relationshipId,
          target: resource.target,
          targetMode: resource.targetMode,
          resolvedTarget: resource.resolvedTarget
        } as RelationshipTarget,
        pkg
      ),
      position: {
        type: 'absolute',
        width: width || 120,
        height: height || 80
      },
      style: undefined
    };
  }

  private static parseFloatingChart(anchor: Element, pkg: PackageReader, sourcePartPath: string): OfficeChart | undefined {
    const graphicData = this.firstDescendantByLocalName(anchor, 'graphicData');
    if (!graphicData || graphicData.getAttribute('uri') !== 'http://schemas.openxmlformats.org/drawingml/2006/chart') {
      return undefined;
    }

    const chartRef = this.firstDescendantByLocalName(graphicData, 'chart');
    const relationshipId = chartRef ? this.getRelationshipId(chartRef) : undefined;
    if (!relationshipId) {
      return undefined;
    }

    const relationship = pkg.getRelationships(sourcePartPath).get(relationshipId);
    if (!relationship?.resolvedTarget) {
      return undefined;
    }

    const xmlString = pkg.readText(relationship.resolvedTarget);
    if (!xmlString) {
      return undefined;
    }

    const chartData = new ChartParser().parse(xmlString);
    if (!chartData) {
      return undefined;
    }

    if (chartData.externalData) {
      const externalDataRelationship = pkg.getRelationships(relationship.resolvedTarget).get(chartData.externalData.relationshipId);
      if (externalDataRelationship) {
        chartData.externalData = {
          ...chartData.externalData,
          target: externalDataRelationship.target,
          targetMode: externalDataRelationship.targetMode,
          resolvedTarget: externalDataRelationship.resolvedTarget,
          contentType: externalDataRelationship.resolvedTarget
            ? pkg.getPart(externalDataRelationship.resolvedTarget)?.contentType
            : undefined
        };
      }
    }

    const docPr = firstChildElementByLocalName(anchor, 'docPr');
    const extent = firstChildElementByLocalName(anchor, 'extent');
    const width = UnitConversion.emuToPixel(parseNumberAttr(extent ? extent.getAttribute('cx') || undefined : undefined));
    const height = UnitConversion.emuToPixel(parseNumberAttr(extent ? extent.getAttribute('cy') || undefined : undefined));

    return {
      id: (docPr ? attr(docPr, 'id') : undefined) || relationshipId,
      name: (docPr ? attr(docPr, 'name') : undefined) || 'Chart',
      type: 'chart',
      chartData,
      source: this.toResourceRef(relationship, pkg),
      position: {
        type: 'absolute',
        width: width || 120,
        height: height || 80
      }
    };
  }

  private static parseFloatingAnchorMetadata(anchor: Element): DocxFloatingDrawing['anchor'] {
    const docPr = firstChildElementByLocalName(anchor, 'docPr');
    const extent = firstChildElementByLocalName(anchor, 'extent');
    const effectExtent = firstChildElementByLocalName(anchor, 'effectExtent');
    const simplePos = firstChildElementByLocalName(anchor, 'simplePos');

    return {
      drawingId: docPr ? attr(docPr, 'id') : undefined,
      name: docPr ? attr(docPr, 'name') : undefined,
      relativeHeight: parseNumberAttr(anchor.getAttribute('relativeHeight') || undefined),
      behindDoc: this.parseBooleanValue(anchor.getAttribute('behindDoc')),
      locked: this.parseBooleanValue(anchor.getAttribute('locked')),
      layoutInCell: this.parseBooleanValue(anchor.getAttribute('layoutInCell')),
      allowOverlap: this.parseBooleanValue(anchor.getAttribute('allowOverlap')),
      useSimplePosition: this.parseBooleanValue(anchor.getAttribute('simplePos')),
      simplePosition: simplePos
        ? {
            x: UnitConversion.emuToPixel(parseNumberAttr(simplePos.getAttribute('x') || undefined)),
            y: UnitConversion.emuToPixel(parseNumberAttr(simplePos.getAttribute('y') || undefined))
          }
        : undefined,
      horizontalPosition: this.parseFloatingPosition(firstChildElementByLocalName(anchor, 'positionH')),
      verticalPosition: this.parseFloatingPosition(firstChildElementByLocalName(anchor, 'positionV')),
      size: extent
        ? {
            width: UnitConversion.emuToPixel(parseNumberAttr(extent.getAttribute('cx') || undefined)),
            height: UnitConversion.emuToPixel(parseNumberAttr(extent.getAttribute('cy') || undefined))
          }
        : undefined,
      effectExtent: effectExtent
        ? {
            left: UnitConversion.emuToPixel(parseNumberAttr(effectExtent.getAttribute('l') || undefined)),
            top: UnitConversion.emuToPixel(parseNumberAttr(effectExtent.getAttribute('t') || undefined)),
            right: UnitConversion.emuToPixel(parseNumberAttr(effectExtent.getAttribute('r') || undefined)),
            bottom: UnitConversion.emuToPixel(parseNumberAttr(effectExtent.getAttribute('b') || undefined))
          }
        : undefined,
      wrap: this.parseFloatingWrap(anchor)
    };
  }

  private static parseFloatingPosition(node?: Element) {
    if (!node) {
      return undefined;
    }

    const align = firstChildElementByLocalName(node, 'align');
    const posOffset = firstChildElementByLocalName(node, 'posOffset');

    return {
      relativeFrom: node.getAttribute('relativeFrom') || undefined,
      align: align?.textContent || undefined,
      offset: posOffset?.textContent ? UnitConversion.emuToPixel(parseNumberAttr(posOffset.textContent)) : undefined
    };
  }

  private static parseFloatingWrap(anchor: Element) {
    const wrapNode =
      firstChildElementByLocalName(anchor, 'wrapNone') ||
      firstChildElementByLocalName(anchor, 'wrapSquare') ||
      firstChildElementByLocalName(anchor, 'wrapTight') ||
      firstChildElementByLocalName(anchor, 'wrapThrough') ||
      firstChildElementByLocalName(anchor, 'wrapTopAndBottom');
    if (!wrapNode) {
      return undefined;
    }

    const localName = wrapNode.localName || wrapNode.nodeName.split(':').pop() || 'wrapNone';

    return {
      type: localName.replace(/^wrap/, '').replace(/^./, char => char.toLowerCase()),
      textWrap: wrapNode.getAttribute('wrapText') || undefined,
      distances: {
        top: this.parseDistanceValue(wrapNode.getAttribute('distT') || anchor.getAttribute('distT') || undefined),
        right: this.parseDistanceValue(wrapNode.getAttribute('distR') || anchor.getAttribute('distR') || undefined),
        bottom: this.parseDistanceValue(wrapNode.getAttribute('distB') || anchor.getAttribute('distB') || undefined),
        left: this.parseDistanceValue(wrapNode.getAttribute('distL') || anchor.getAttribute('distL') || undefined)
      }
    };
  }

  private static getFloatingDrawingType(drawing?: DrawingElement): DocxFloatingDrawing['objectType'] {
    if (!drawing) {
      return 'unknown';
    }

    if ('blob' in drawing) {
      return 'image';
    }

    return drawing.type;
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

  private static toResourceRef(relationship: RelationshipTarget, pkg: PackageReader) {
    return {
      relationshipId: relationship.id,
      target: relationship.target,
      targetMode: relationship.targetMode,
      resolvedTarget: relationship.resolvedTarget,
      contentType: relationship.resolvedTarget ? pkg.getPart(relationship.resolvedTarget)?.contentType : undefined
    };
  }

  private static findDescendantsByLocalName(node: ParentNode, localName: string): Element[] {
    return Array.from((node as Element).querySelectorAll('*')).filter(child => child.localName === localName) as Element[];
  }

  private static firstDescendantByLocalName(node: ParentNode, localName: string): Element | undefined {
    return this.findDescendantsByLocalName(node, localName)[0];
  }

  private static parseBooleanValue(value?: string | null): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'on';
  }

  private static parseDistanceValue(value?: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    return UnitConversion.emuToPixel(parseNumberAttr(value));
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

  private static parseHyperlink(
    node: Element,
    options: { pkg?: PackageReader; sourcePartPath?: string }
  ): DocxRun['hyperlink'] | undefined {
    const anchor = attr(node, 'anchor');
    const tooltip = attr(node, 'tooltip');
    const relationshipId = this.getRelationshipId(node);
    const sourcePartPath = options.sourcePartPath || 'word/document.xml';

    if (relationshipId && options.pkg && options.sourcePartPath) {
      const resource = new MediaRegistry(options.pkg).resolveRelationship(options.sourcePartPath, relationshipId);
      if (resource?.kind === 'hyperlink') {
        return {
          id: resource.id,
          kind: 'hyperlink',
          relationshipId: resource.relationshipId,
          target: resource.target,
          targetMode: resource.targetMode,
          resolvedTarget: resource.resolvedTarget,
          path: resource.path,
          extension: resource.extension,
          contentType: resource.contentType,
          data: resource.data,
          tooltip,
          anchor
        };
      }
    }

    if (!anchor) {
      return undefined;
    }

    return {
      id: relationshipId || `${sourcePartPath}#${anchor}`,
      kind: 'hyperlink',
      relationshipId,
      target: `#${this.toBookmarkTargetId(anchor)}`,
      targetMode: 'Internal',
      resolvedTarget: `${sourcePartPath}#${anchor}`,
      tooltip,
      anchor
    };
  }

  private static parseBookmark(
    node: Element,
    options: { pkg?: PackageReader; sourcePartPath?: string }
  ): BookmarkResource | undefined {
    const id = attr(node, 'id');
    const name = attr(node, 'name') || id;
    if (!id || !name) {
      return undefined;
    }

    const target = `#${this.toBookmarkTargetId(name)}`;
    if (options.pkg) {
      return new MediaRegistry(options.pkg).registerBookmark(id, name, target);
    }

    return {
      id,
      kind: 'bookmark',
      name,
      target,
      targetMode: 'Internal',
      resolvedTarget: target
    };
  }

  private static toBookmarkTargetId(name: string): string {
    const normalized = name.trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    return `docx-bookmark-${normalized || 'target'}`;
  }
}
