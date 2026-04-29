import { FontMapping, ImageRenderer, OfficeImage, ParagraphStyle, TextStyle, WarningCollector } from '@opr/shared';
import { DocxLayoutPage, PageLayoutEngine } from '../layout';
import {
  DocxBlock,
  DocxDocument,
  DocxHeaderFooterPart,
  DocxNavigation,
  DocxParagraph,
  DocxRun,
  DocxTable,
  DocxTableCell
} from '../model';
import { DocxNavigationBuilder } from '../navigation';
import { normalizeLegacyListMarker } from '../parser/symbols';

export interface DocxRendererOptions {
  width?: number;
  pageGap?: number;
  showDeletedText?: boolean;
}

export interface DocxRendererStats {
  totalPages: number;
  totalCharacters: number;
  totalWords: number;
  headingCount: number;
  tocCount: number;
  tableCount: number;
}

export class DocxRenderer {
  readonly warnings = new WarningCollector();
  private navigation: DocxNavigation = { headings: [], toc: [], pages: [] };
  private currentDocument: DocxDocument | null = null;
  private imageCache = new Map<string, ImageBitmap>();
  private imageLoading = new Set<string>();
  private listPrefixCache = new WeakMap<DocxParagraph, string>();
  private pageScale = 1;
  private stats: DocxRendererStats = {
    totalPages: 0,
    totalCharacters: 0,
    totalWords: 0,
    headingCount: 0,
    tocCount: 0,
    tableCount: 0
  };

  constructor(private readonly container: HTMLElement, private readonly options: DocxRendererOptions = {}) {}

  render(docx: DocxDocument): void {
    this.currentDocument = docx;
    this.container.innerHTML = '';
    this.container.style.overflow = 'auto';
    this.container.style.background = '#f3f4f6';
    this.container.style.padding = `${this.options.pageGap ?? 24}px 0`;

    const layout = new PageLayoutEngine().layout(docx);
    this.pageScale = this.computePageScale(layout);
    this.listPrefixCache = this.buildListPrefixCache(docx);
    this.navigation = DocxNavigationBuilder.build(docx, layout);
    this.stats = this.computeStats(docx, layout);

    for (const page of layout) {
      const pageEl = this.createPageElement(page.pageBox.width, page.pageBox.height);
      pageEl.dataset.pageIndex = String(page.pageIndex);
      if (page.isCoverPage) {
        pageEl.dataset.coverPage = 'true';
      }

      const canvas = this.createCanvas(page.pageBox.width, page.pageBox.height);
      pageEl.appendChild(canvas);
      const textLayer = this.createTextLayer();
      pageEl.appendChild(textLayer);

      const renderContext = {
        pageIndex: page.pageIndex,
        totalPages: layout.length
      };

      this.renderPageCanvas(canvas, docx, page, renderContext);
      this.populateTextLayer(textLayer, docx, page, renderContext);

      this.container.appendChild(pageEl);
    }
  }

  getNavigation(): DocxNavigation {
    return this.navigation;
  }

  getStats(): DocxRendererStats {
    return this.stats;
  }

  jumpToHeading(headingId: string): boolean {
    const target = this.container.querySelector(`[data-heading-id="${headingId}"]`) as HTMLElement | null;
    if (!target) {
      return false;
    }

    target.scrollIntoView?.({ block: 'start' });
    return true;
  }

  jumpToPage(pageIndex: number): boolean {
    const target = this.container.querySelector(`[data-page-index="${pageIndex}"]`) as HTMLElement | null;
    if (!target) {
      return false;
    }

    target.scrollIntoView?.({ block: 'start' });
    return true;
  }

  private createPageElement(width: number, height: number): HTMLElement {
    const page = document.createElement('div');
    const pageWidth = Math.max(1, Math.round((width || 816) * this.pageScale));
    const pageHeight = Math.max(1, Math.round((height || 1056) * this.pageScale));

    page.dataset.testid = 'docx-page';
    page.style.position = 'relative';
    page.style.boxSizing = 'border-box';
    page.style.width = `${pageWidth}px`;
    page.style.height = `${pageHeight}px`;
    page.style.margin = `0 auto ${this.options.pageGap ?? 24}px`;
    page.style.background = '#ffffff';
    page.style.boxShadow = '0 1px 4px rgba(15, 23, 42, 0.18)';

    return page;
  }

  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const pageWidth = Math.max(1, Math.round((width || 816) * this.pageScale));
    const pageHeight = Math.max(1, Math.round((height || 1056) * this.pageScale));
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');

    canvas.dataset.testid = 'docx-page-canvas';
    canvas.width = Math.max(1, Math.round(pageWidth * dpr));
    canvas.height = Math.max(1, Math.round(pageHeight * dpr));
    canvas.style.width = `${pageWidth}px`;
    canvas.style.height = `${pageHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx && dpr !== 1) {
      ctx.scale(dpr, dpr);
    }

    return canvas;
  }

  private createTextLayer(): HTMLElement {
    const layer = document.createElement('div');
    layer.dataset.testid = 'docx-text-layer';
    layer.style.position = 'absolute';
    layer.style.left = '0';
    layer.style.top = '0';
    layer.style.width = '1px';
    layer.style.height = '1px';
    layer.style.overflow = 'hidden';
    layer.style.clipPath = 'inset(50%)';
    layer.style.whiteSpace = 'pre-wrap';
    return layer;
  }

  private renderPageCanvas(
    canvas: HTMLCanvasElement,
    documentModel: DocxDocument,
    page: DocxLayoutPage,
    context: { pageIndex: number; totalPages: number }
  ) {
    this.reportPageOverflow(page);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.warnings.unsupportedFeature('DOCX canvas rendering context is unavailable');
      return;
    }

    const scaleX = this.pageScale;
    const scaleY = this.pageScale;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, page.pageBox.width, page.pageBox.height);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1 / scaleX;
    ctx.strokeRect(0.5 / scaleX, 0.5 / scaleY, page.pageBox.width - 1 / scaleX, page.pageBox.height - 1 / scaleY);

    const header = this.resolveHeaderFooter(documentModel, 'header', page);
    if (header) {
      this.renderHeaderFooterCanvas(ctx, header, documentModel, page, context);
    }

    this.clipToContentArea(ctx, page, () => {
      for (const item of page.blocks) {
        this.renderBlockWithClip(ctx, item.block, documentModel, item.box.x, item.box.y, item.box.width, item.box.height, context);
      }
    });

    const footer = this.resolveHeaderFooter(documentModel, 'footer', page);
    if (footer) {
      this.renderHeaderFooterCanvas(ctx, footer, documentModel, page, context);
    }

    ctx.restore();
  }

  private reportPageOverflow(page: DocxLayoutPage) {
    for (const item of page.blocks) {
      if (item.overflow?.clipped) {
        this.warnings.unsupportedFeature(
          `DOCX block overflow clipped on page ${page.pageIndex + 1}; estimated height ${Math.round(item.overflow.estimatedHeight)}px`
        );
      }
    }
  }

  private populateTextLayer(
    layer: HTMLElement,
    documentModel: DocxDocument,
    page: DocxLayoutPage,
    context: { pageIndex: number; totalPages: number }
  ) {
    const header = this.resolveHeaderFooter(documentModel, 'header', page);
    if (header) {
      layer.appendChild(this.renderHeaderFooterDom(header, documentModel, this.navigation, context));
    }

    for (const item of page.blocks) {
      layer.appendChild(this.renderBlockDom(item.block, documentModel, this.navigation, context));
    }

    const footer = this.resolveHeaderFooter(documentModel, 'footer', page);
    if (footer) {
      layer.appendChild(this.renderHeaderFooterDom(footer, documentModel, this.navigation, context));
    }
  }

  private renderBlockCanvas(
    ctx: CanvasRenderingContext2D,
    block: DocxBlock,
    documentModel: DocxDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    context: { pageIndex: number; totalPages: number }
  ) {
    if (block.type === 'table') {
      this.renderTableCanvas(ctx, block, documentModel, x, y, width, height, context);
      return;
    }

    this.renderParagraphCanvas(ctx, block, documentModel, x, y, width, context);
  }

  private renderBlockWithClip(
    ctx: CanvasRenderingContext2D,
    block: DocxBlock,
    documentModel: DocxDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    context: { pageIndex: number; totalPages: number }
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    this.renderBlockCanvas(ctx, block, documentModel, x, y, width, height, context);
    ctx.restore();
  }

  private clipToContentArea(ctx: CanvasRenderingContext2D, page: DocxLayoutPage, render: () => void) {
    const margins = page.pageBox.margins;
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      margins.left,
      margins.top,
      Math.max(1, page.pageBox.width - margins.left - margins.right),
      Math.max(1, page.pageBox.height - margins.top - margins.bottom)
    );
    ctx.clip();
    render();
    ctx.restore();
  }

  private renderParagraphCanvas(
    ctx: CanvasRenderingContext2D,
    paragraph: DocxParagraph,
    documentModel: DocxDocument,
    x: number,
    y: number,
    width: number,
    context: { pageIndex: number; totalPages: number }
  ) {
    const paragraphStyle = this.resolveParagraphStyle(documentModel, paragraph);
    const paragraphTextStyle = paragraphStyle.text || this.resolveParagraphTextStyle(documentModel, paragraph);
    const runs = this.createRenderableRuns(paragraph, documentModel, context, paragraphTextStyle);
    const lineHeight = this.getLineHeight(paragraphTextStyle);
    const contentX = x + this.toPx(paragraphStyle.indent?.left || 0);
    const firstLineOffset = this.toPx((paragraphStyle.indent?.firstLine || 0) - (paragraphStyle.indent?.hanging || 0));
    const rightIndent = this.toPx(paragraphStyle.indent?.right || 0);
    const contentWidth = Math.max(1, width - (contentX - x) - rightIndent);
    const lineStartX = contentX + firstLineOffset + this.getListPrefixWidth(paragraph);
    let cursorX = lineStartX;
    let cursorY = y + this.toPx(paragraphStyle.spacing?.before || 0) + lineHeight;

    const prefix = this.getListPrefix(paragraph, documentModel);
    if (prefix) {
      this.applyTextStyle(ctx, paragraphTextStyle);
      ctx.fillText(prefix, contentX + firstLineOffset, cursorY);
    }

    for (const run of runs) {
      this.applyTextStyle(ctx, run.style);
      for (const image of run.images || []) {
        const imageWidth = Math.min(image.position.width, width);
        if (cursorX > lineStartX) {
          cursorX = lineStartX;
          cursorY += lineHeight;
        }
        const imageY = cursorY - lineHeight * 0.72;
        this.renderInlineImage(ctx, image, cursorX, imageY, imageWidth, image.position.height);
        cursorY += image.position.height + 8;
        cursorX = lineStartX;
      }

      const tokens = this.splitTextForWrap(run.text);
      for (const token of tokens) {
        if (token === '\n') {
          cursorX = lineStartX;
          cursorY += lineHeight;
          continue;
        }

        const tokenWidth = ctx.measureText(token).width;
        if (cursorX > lineStartX && cursorX + tokenWidth > contentX + contentWidth) {
          cursorX = contentX + this.getListPrefixWidth(paragraph);
          cursorY += lineHeight;
        }
        const drawX = this.alignTextX(ctx, token, cursorX, contentX, contentWidth, paragraphStyle);

        if (run.style.highlight) {
          ctx.fillStyle = this.toCssColor(run.style.highlight, '#fff2cc');
          ctx.fillRect(drawX, cursorY - lineHeight * 0.82, tokenWidth, lineHeight);
          this.applyTextStyle(ctx, run.style);
        }

        ctx.fillText(token, drawX, cursorY);
        this.renderTextDecorations(ctx, run.style, drawX, cursorY, tokenWidth);
        cursorX += tokenWidth;
      }
    }
  }

  private renderTableCanvas(
    ctx: CanvasRenderingContext2D,
    table: DocxTable,
    documentModel: DocxDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    context: { pageIndex: number; totalPages: number }
  ) {
    const rowHeight = table.rows.length > 0 ? height / table.rows.length : height;
    const maxColumns = Math.max(
      1,
      ...table.rows.map(row => row.cells.reduce((sum, cell) => sum + (cell.gridSpan || 1), 0))
    );
    const columnWidths = this.resolveTableColumnWidths(table, width);
    const tableWidth = columnWidths.reduce((sum, columnWidth) => sum + columnWidth, 0);
    let rowY = y;

    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, tableWidth, height);

    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
      const row = table.rows[rowIndex];
      let colIndex = 0;
      for (const cell of row.cells) {
        const colSpan = cell.gridSpan || 1;
        const rowSpan = cell.verticalMerge === 'restart' ? this.countVerticalMergeRows(table, rowIndex, colIndex) : 1;

        if (cell.verticalMerge === 'continue') {
          colIndex += colSpan;
          continue;
        }

        const colWidth = columnWidths.slice(colIndex, colIndex + colSpan).reduce((sum, columnWidth) => sum + columnWidth, 0);
        const colX = x + columnWidths.slice(0, colIndex).reduce((sum, columnWidth) => sum + columnWidth, 0);
        const cellHeight = rowHeight * rowSpan;
        colIndex += colSpan;

        if (cell.shading) {
          ctx.fillStyle = this.toCssColor(cell.shading, '#ffffff');
          ctx.fillRect(colX, rowY, colWidth, cellHeight);
        }

        this.renderCellBorders(ctx, table, cell, rowIndex, colIndex - colSpan, rowSpan, colSpan, maxColumns, colX, rowY, colWidth, cellHeight);
        let cellY = rowY + 6;
        for (const block of cell.blocks) {
          const blockHeight = Math.max(18, cellHeight - 12);
          this.renderBlockCanvas(ctx, block, documentModel, colX + 6, cellY, Math.max(1, colWidth - 12), blockHeight, context);
          cellY += blockHeight;
        }
      }
      rowY += rowHeight;
    }

    ctx.restore();
  }

  private renderHeaderFooterCanvas(
    ctx: CanvasRenderingContext2D,
    part: DocxHeaderFooterPart,
    documentModel: DocxDocument,
    page: DocxLayoutPage,
    context: { pageIndex: number; totalPages: number }
  ) {
    const margin = page.pageBox.margins;
    const x = margin.left;
    const width = page.pageBox.width - margin.left - margin.right;
    let y = part.type === 'header' ? Math.max(20, margin.top * 0.45) : page.pageBox.height - Math.max(28, margin.bottom * 0.45);

    for (const block of part.blocks) {
      this.renderBlockCanvas(ctx, block, documentModel, x, y, width, 24, context);
      y += 22;
    }
  }

  private renderBlockDom(
    block: DocxBlock,
    documentModel: DocxDocument,
    navigation: DocxNavigation,
    context: { pageIndex: number; totalPages: number }
  ): HTMLElement {
    if (block.type === 'table') {
      return this.renderTableDom(block, documentModel, navigation, context);
    }

    return this.renderParagraphDom(block, documentModel, navigation, context);
  }

  private renderParagraphDom(
    paragraph: DocxParagraph,
    documentModel: DocxDocument,
    navigation: DocxNavigation,
    context: { pageIndex: number; totalPages: number }
  ): HTMLElement {
    const p = document.createElement('p');
    p.dataset.styleId = paragraph.styleId || '';
    const blockIndex = documentModel.body.indexOf(paragraph);
    const heading = blockIndex >= 0 ? this.findHeadingByBlockIndex(navigation, blockIndex) : undefined;
    if (heading) {
      p.dataset.headingId = heading.id;
    }

    p.textContent = this.getListPrefix(paragraph, documentModel) + paragraph.runs.map(run => this.renderRunText(run, context)).join('');
    return p;
  }

  private renderTableDom(
    table: DocxTable,
    documentModel: DocxDocument,
    navigation: DocxNavigation,
    context: { pageIndex: number; totalPages: number }
  ): HTMLElement {
    const tableEl = document.createElement('table');

    for (const row of table.rows) {
      const tr = document.createElement('tr');
      for (const cell of row.cells) {
        const td = document.createElement('td');
        for (const block of cell.blocks) {
          td.appendChild(this.renderBlockDom(block, documentModel, navigation, context));
        }
        tr.appendChild(td);
      }
      tableEl.appendChild(tr);
    }

    this.warnings.unsupportedFeature('DOCX table layout uses MVP canvas table grid rendering');
    return tableEl;
  }

  private renderHeaderFooterDom(
    part: DocxHeaderFooterPart,
    documentModel: DocxDocument,
    navigation: DocxNavigation,
    context: { pageIndex: number; totalPages: number }
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.dataset.testid = `docx-${part.type}`;
    wrapper.dataset.variant = part.variant;

    for (const block of part.blocks) {
      wrapper.appendChild(this.renderBlockDom(block, documentModel, navigation, context));
    }

    return wrapper;
  }

  private resolveHeaderFooter(
    documentModel: DocxDocument,
    type: 'header' | 'footer',
    page: DocxLayoutPage
  ): DocxHeaderFooterPart | undefined {
    const refs = type === 'header' ? documentModel.sections[0]?.headerRefs : documentModel.sections[0]?.footerRefs;
    const parts = type === 'header' ? documentModel.headers : documentModel.footers;
    if (!refs || refs.length === 0) {
      return undefined;
    }

    const preferredType = page.isCoverPage ? 'first' : page.pageIndex % 2 === 1 ? 'even' : 'default';
    const ref =
      refs.find(item => item.type === preferredType && parts.has(item.relationshipId)) ||
      refs.find(item => item.type === 'default' && parts.has(item.relationshipId)) ||
      refs.find(item => parts.has(item.relationshipId));

    return ref ? parts.get(ref.relationshipId) : undefined;
  }

  private createRenderableRuns(
    paragraph: DocxParagraph,
    documentModel: DocxDocument,
    context: { pageIndex: number; totalPages: number },
    paragraphStyle: TextStyle
  ): Array<{ text: string; style: TextStyle; images?: OfficeImage[] }> {
    return paragraph.runs.flatMap(run => {
      const style = this.applyRevisionStyle({ ...paragraphStyle, ...this.resolveRunStyle(documentModel, run), ...run.style }, run);
      const text = this.renderRunText(run, context);
      const parts = text.split(/(\n)/g).filter(Boolean);
      const withBreaks = parts.length > 0 ? parts : [''];
      for (const br of run.breaks || []) {
        if (br === 'line' || br === 'page') {
          withBreaks.push('\n');
        }
      }
      const renderRuns = withBreaks.map(part => ({ text: part, style, images: undefined as OfficeImage[] | undefined }));
      if (run.images && run.images.length > 0) {
        renderRuns.push({ text: '', style, images: run.images });
      }
      return renderRuns;
    });
  }

  private renderInlineImage(
    ctx: CanvasRenderingContext2D,
    image: OfficeImage,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const bitmap = this.getOrQueueImageBitmap(image);
    if (!bitmap) {
      this.renderImagePlaceholder(ctx, x, y, width, height);
      return;
    }

    ImageRenderer.render(ctx, image, bitmap, x, y, width, height);
  }

  private getOrQueueImageBitmap(image: OfficeImage): ImageBitmap | undefined {
    if (this.imageCache.has(image.id)) {
      return this.imageCache.get(image.id);
    }

    if (!this.imageLoading.has(image.id)) {
      if (typeof createImageBitmap !== 'function') {
        this.warnings.unsupportedFeature('DOCX image bitmap decoding is unavailable in this environment');
        return undefined;
      }

      this.imageLoading.add(image.id);
      createImageBitmap(image.blob)
        .then(bitmap => {
          this.imageCache.set(image.id, bitmap);
          this.imageLoading.delete(image.id);
          if (this.currentDocument) {
            this.render(this.currentDocument);
          }
        })
        .catch(() => {
          this.imageLoading.delete(image.id);
          this.warnings.unsupportedFeature(`DOCX image could not be decoded: ${image.path || image.id}`);
        });
    }

    return undefined;
  }

  private renderImagePlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x, y, width, height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.moveTo(x + width, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();
    ctx.restore();
  }

  private renderRunText(run: DocxRun, context: { pageIndex: number; totalPages: number }): string {
    if (!this.options.showDeletedText && run.revision?.type === 'delete') {
      return '';
    }

    if (!run.fields || run.fields.length === 0) {
      return run.text;
    }

    const fieldText = run.fields
      .map(field => {
        if (field.type === 'page') return String(context.pageIndex + 1);
        if (field.type === 'numPages') return String(context.totalPages);
        return '';
      })
      .join('');

    return run.text + fieldText;
  }

  private resolveParagraphTextStyle(documentModel: DocxDocument, paragraph: DocxParagraph): TextStyle {
    const paragraphStyle = this.resolveParagraphStyle(documentModel, paragraph);
    return paragraphStyle.text || {
      fontFamily: 'Arial',
      size: 11,
      color: '#111111'
    };
  }

  private resolveParagraphStyle(documentModel: DocxDocument, paragraph: DocxParagraph): ParagraphStyle {
    const defaultParagraph = documentModel.styles.defaults?.paragraph || {};
    const defaultText = documentModel.styles.defaults?.run || {};
    const styleChain = paragraph.styleId ? this.resolveStyleChain(documentModel, paragraph.styleId) : [];
    const resolved = styleChain.reduce(
      (style, docxStyle) => ({
        ...style,
        ...docxStyle.paragraph,
        text: {
          ...(style.text || {}),
          ...(docxStyle.text || {}),
          ...(docxStyle.paragraph?.text || {})
        }
      }),
      {
        ...defaultParagraph,
        text: {
          fontFamily: 'Arial',
          size: 11,
          color: '#111111',
          ...defaultText,
          ...(defaultParagraph.text || {})
        }
      } as ParagraphStyle
    );

    return {
      ...resolved,
      ...paragraph.style,
      text: {
        ...(resolved.text || {}),
        ...(paragraph.style?.text || {})
      }
    };
  }

  private resolveStyleChain(documentModel: DocxDocument, styleId: string) {
    const chain = [];
    const seen = new Set<string>();
    let current = documentModel.styles.byId.get(styleId);
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      chain.unshift(current);
      current = current.basedOn ? documentModel.styles.byId.get(current.basedOn) : undefined;
    }
    return chain;
  }

  private resolveRunStyle(documentModel: DocxDocument, run: DocxRun): TextStyle {
    if (!run.styleId) {
      return {};
    }

    return this.resolveStyleChain(documentModel, run.styleId).reduce(
      (style, docxStyle) => ({
        ...style,
        ...(docxStyle.text || {})
      }),
      {} as TextStyle
    );
  }

  private applyRevisionStyle(style: TextStyle, run: DocxRun): TextStyle {
    if (run.revision?.type === 'insert') {
      return {
        ...style,
        color: style.color || '#15803d',
        underline: style.underline || true
      };
    }
    if (run.revision?.type === 'delete') {
      return {
        ...style,
        color: '#b91c1c',
        strike: true
      };
    }

    return style;
  }

  private applyTextStyle(ctx: CanvasRenderingContext2D, style: TextStyle) {
    const size = style.size || 11;
    const fontStyle = style.italic ? 'italic ' : '';
    const fontWeight = style.bold ? '700 ' : '';
    ctx.font = `${fontStyle}${fontWeight}${Math.round(size * 1.333)}px ${this.resolveCanvasFontFamily(style)}`;
    ctx.fillStyle = this.toCssColor(style.color, '#111111');
    ctx.textBaseline = 'alphabetic';
  }

  private renderTextDecorations(ctx: CanvasRenderingContext2D, style: TextStyle, x: number, baselineY: number, width: number) {
    if (!style.underline && !style.strike) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = this.toCssColor(style.color, '#111111');
    ctx.lineWidth = 1;
    if (style.underline) {
      this.drawLine(ctx, x, baselineY + 2, x + width);
    }
    if (style.strike) {
      this.drawLine(ctx, x, baselineY - this.getLineHeight(style) * 0.32, x + width);
    }
    ctx.restore();
  }

  private drawLine(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  private splitTextForWrap(text: string): string[] {
    if (text === '\n') {
      return ['\n'];
    }

    return text.split(/(\s+)/).filter(part => part.length > 0);
  }

  private getLineHeight(style: TextStyle) {
    return Math.round((style.size || 11) * 1.333 * 1.35);
  }

  private alignTextX(
    ctx: CanvasRenderingContext2D,
    token: string,
    cursorX: number,
    contentX: number,
    contentWidth: number,
    paragraphStyle: ParagraphStyle
  ) {
    if (paragraphStyle.alignment === 'center') {
      return contentX + (contentWidth - ctx.measureText(token).width) / 2;
    }
    if (paragraphStyle.alignment === 'right') {
      return contentX + contentWidth - ctx.measureText(token).width;
    }
    return cursorX;
  }

  private toPx(twips: number) {
    return Math.round(twips / 15);
  }

  private countVerticalMergeRows(table: DocxTable, startRow: number, colIndex: number) {
    let rowSpan = 1;
    for (let rowIndex = startRow + 1; rowIndex < table.rows.length; rowIndex++) {
      const cell = this.getCellAtGridColumn(table.rows[rowIndex].cells, colIndex);
      if (cell?.verticalMerge === 'continue') {
        rowSpan += 1;
        continue;
      }
      break;
    }

    return rowSpan;
  }

  private getCellAtGridColumn(cells: DocxTableCell[], targetColIndex: number): DocxTableCell | undefined {
    let colIndex = 0;
    for (const cell of cells) {
      const span = cell.gridSpan || 1;
      if (targetColIndex >= colIndex && targetColIndex < colIndex + span) {
        return cell;
      }
      colIndex += span;
    }

    return undefined;
  }

  private renderCellBorders(
    ctx: CanvasRenderingContext2D,
    table: DocxTable,
    cell: DocxTableCell,
    rowIndex: number,
    colIndex: number,
    rowSpan: number,
    colSpan: number,
    maxColumns: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const fallback = { color: '#9ca3af', size: 1 };
    const borders = cell.borders || {};
    const tableBorders = table.borders || {};
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex + rowSpan >= table.rows.length;
    const isFirstCol = colIndex === 0;
    const isLastCol = colIndex + colSpan >= maxColumns;

    this.drawBorderLine(
      ctx,
      x,
      y,
      x + width,
      y,
      borders.top || (isFirstRow ? tableBorders.top : tableBorders.insideH) || fallback
    );
    this.drawBorderLine(
      ctx,
      x + width,
      y,
      x + width,
      y + height,
      borders.right || (isLastCol ? tableBorders.right : tableBorders.insideV) || fallback
    );
    this.drawBorderLine(
      ctx,
      x,
      y + height,
      x + width,
      y + height,
      borders.bottom || (isLastRow ? tableBorders.bottom : tableBorders.insideH) || fallback
    );
    this.drawBorderLine(
      ctx,
      x,
      y,
      x,
      y + height,
      borders.left || (isFirstCol ? tableBorders.left : tableBorders.insideV) || fallback
    );
  }

  private drawBorderLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    border: { color?: string; size?: number; style?: string }
  ) {
    ctx.save();
    ctx.strokeStyle = this.toCssColor(border.color, '#9ca3af');
    ctx.lineWidth = Math.max(0.5, border.size || 1);
    if (border.style === 'dashed') {
      ctx.setLineDash([4, 3]);
    } else if (border.style === 'dotted') {
      ctx.setLineDash([1, 2]);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  private getListPrefix(paragraph: DocxParagraph, documentModel: DocxDocument) {
    return this.listPrefixCache.get(paragraph) || '';
  }

  private getListPrefixWidth(paragraph: DocxParagraph) {
    return paragraph.numbering ? 24 + Math.max(0, parseInt(paragraph.numbering.level || '0', 10)) * 14 : 0;
  }

  private getNumberingLevel(paragraph: DocxParagraph, documentModel: DocxDocument, levelOverride?: number) {
    const numId = paragraph.numbering?.numId;
    if (!numId) {
      return undefined;
    }

    const instance = documentModel.numbering.nums.get(numId);
    const abstractNum = instance?.abstractNumId ? documentModel.numbering.abstractNums.get(instance.abstractNumId) : undefined;
    return abstractNum?.levels.get(String(levelOverride ?? paragraph.numbering?.level ?? '0'));
  }

  private computeStats(docx: DocxDocument, layout: DocxLayoutPage[]): DocxRendererStats {
    const text = this.collectText(docx.body);
    const trimmed = text.trim();

    return {
      totalPages: layout.length,
      totalCharacters: [...text.replace(/\s/g, '')].length,
      totalWords: trimmed ? trimmed.split(/\s+/).length : 0,
      headingCount: this.navigation.toc.length,
      tocCount: this.navigation.toc.length,
      tableCount: this.countTables(docx.body)
    };
  }

  private collectText(blocks: DocxBlock[]): string {
    return blocks
      .map(block => {
        if (block.type === 'table') {
          return block.rows.map(row => row.cells.map(cell => this.collectText(cell.blocks)).join(' ')).join(' ');
        }

        return block.runs
          .map(run => (!this.options.showDeletedText && run.revision?.type === 'delete' ? '' : run.text))
          .join('');
      })
      .join(' ');
  }

  private countTables(blocks: DocxBlock[]): number {
    return blocks.reduce((count, block) => {
      if (block.type !== 'table') {
        return count;
      }

      const nested = block.rows.reduce(
        (sum, row) => sum + row.cells.reduce((cellSum, cell) => cellSum + this.countTables(cell.blocks), 0),
        0
      );
      return count + 1 + nested;
    }, 0);
  }

  private findHeadingByBlockIndex(navigation: DocxNavigation, blockIndex: number) {
    const stack = [...navigation.headings];
    while (stack.length > 0) {
      const heading = stack.shift();
      if (!heading) {
        continue;
      }
      if (heading.blockIndex === blockIndex) {
        return heading;
      }
      stack.push(...heading.children);
    }

    return undefined;
  }

  private toCssColor(color: string | undefined, fallback: string) {
    if (!color) {
      return fallback;
    }

    return color.startsWith('#') || color.startsWith('rgb') ? color : `#${color}`;
  }

  private computePageScale(layout: DocxLayoutPage[]) {
    const requestedWidth = this.options.width;
    const baseWidth = layout[0]?.pageBox.width;
    if (!requestedWidth || !baseWidth) {
      return 1;
    }

    return requestedWidth / baseWidth;
  }

  private resolveCanvasFontFamily(style: TextStyle) {
    const resolvedFamilies: string[] = [];
    const families = [style.fontFamily, ...(style.fontFallback || [])].filter((value): value is string => !!value);

    if (families.length === 0) {
      return 'Arial, sans-serif';
    }

    for (const family of families) {
      const mapped = FontMapping[family];
      if (mapped) {
        resolvedFamilies.push(
          ...mapped.safe_css_family
            .split(',')
            .map(part => part.trim())
            .filter(Boolean)
        );
      } else {
        resolvedFamilies.push(`"${family}"`);
      }
    }

    if (!resolvedFamilies.some(part => /^(serif|sans-serif|monospace|cursive|fantasy)$/i.test(part))) {
      resolvedFamilies.push('sans-serif');
    }

    return Array.from(new Set(resolvedFamilies)).join(', ');
  }

  private buildListPrefixCache(documentModel: DocxDocument) {
    const cache = new WeakMap<DocxParagraph, string>();
    const numberingState = new Map<string, number[]>();

    const visitBlocks = (blocks: DocxBlock[]) => {
      for (const block of blocks) {
        if (block.type === 'table') {
          for (const row of block.rows) {
            for (const cell of row.cells) {
              visitBlocks(cell.blocks);
            }
          }
          continue;
        }

        cache.set(block, this.computeListPrefix(block, documentModel, numberingState));
      }
    };

    visitBlocks(documentModel.body);
    for (const part of documentModel.headers.values()) {
      visitBlocks(part.blocks);
    }
    for (const part of documentModel.footers.values()) {
      visitBlocks(part.blocks);
    }

    return cache;
  }

  private computeListPrefix(paragraph: DocxParagraph, documentModel: DocxDocument, numberingState: Map<string, number[]>) {
    if (!paragraph.numbering) {
      return '';
    }

    const levelIndex = Math.max(0, parseInt(paragraph.numbering.level || '0', 10));
    const level = this.getNumberingLevel(paragraph, documentModel, levelIndex);
    const indent = '  '.repeat(levelIndex);

    if (level?.format === 'bullet') {
      return `${indent}${normalizeLegacyListMarker(level.text || '•', level.textStyle?.fontFamily)} `;
    }

    const key = paragraph.numbering.numId || '__default__';
    const counters = numberingState.get(key) || [];
    const start = level?.start || 1;

    if (typeof counters[levelIndex] !== 'number') {
      counters[levelIndex] = start;
    } else {
      counters[levelIndex] += 1;
    }

    counters.length = levelIndex + 1;
    numberingState.set(key, counters);

    const markerText = level?.text || `%${levelIndex + 1}.`;
    const resolvedMarker = markerText.replace(/%(\d+)/g, (_, token) => {
      const referencedLevel = Math.max(0, parseInt(token, 10) - 1);
      const referencedLevelDef = this.getNumberingLevel(paragraph, documentModel, referencedLevel);
      const fallbackValue = referencedLevelDef?.start || 1;
      const value = typeof counters[referencedLevel] === 'number' ? counters[referencedLevel] : fallbackValue;
      return this.formatListNumber(value, referencedLevelDef?.format);
    });

    return `${indent}${normalizeLegacyListMarker(resolvedMarker, level?.textStyle?.fontFamily)} `;
  }

  private formatListNumber(value: number, format?: string) {
    switch (format) {
      case 'upperLetter':
        return this.toAlphabetic(value, true);
      case 'lowerLetter':
        return this.toAlphabetic(value, false);
      case 'upperRoman':
        return this.toRoman(value).toUpperCase();
      case 'lowerRoman':
        return this.toRoman(value).toLowerCase();
      case 'decimal':
      default:
        return String(value);
    }
  }

  private toAlphabetic(value: number, upperCase: boolean) {
    if (value <= 0) {
      return '0';
    }

    let current = value;
    let output = '';
    while (current > 0) {
      current -= 1;
      output = String.fromCharCode((upperCase ? 65 : 97) + (current % 26)) + output;
      current = Math.floor(current / 26);
    }

    return output;
  }

  private toRoman(value: number) {
    if (value <= 0) {
      return String(value);
    }

    const numerals: Array<[number, string]> = [
      [1000, 'M'],
      [900, 'CM'],
      [500, 'D'],
      [400, 'CD'],
      [100, 'C'],
      [90, 'XC'],
      [50, 'L'],
      [40, 'XL'],
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I']
    ];

    let current = value;
    let output = '';
    for (const [threshold, numeral] of numerals) {
      while (current >= threshold) {
        output += numeral;
        current -= threshold;
      }
    }

    return output;
  }

  private resolvePreferredWidth(width: DocxTable['width'] | DocxTableCell['width'], availableWidth: number) {
    if (!width?.value) {
      return undefined;
    }

    if (width.type === 'pct') {
      return (availableWidth * width.value) / 5000;
    }

    return this.toPx(width.value);
  }

  private resolveTableColumnWidths(table: DocxTable, availableWidth: number) {
    const maxColumns = Math.max(1, ...table.rows.map(row => row.cells.reduce((sum, cell) => sum + (cell.gridSpan || 1), 0)));
    const tableWidth = Math.min(availableWidth, this.resolvePreferredWidth(table.width, availableWidth) || availableWidth);

    let columnWidths =
      table.gridWidths && table.gridWidths.length > 0
        ? table.gridWidths.slice(0, maxColumns).map(width => this.toPx(width))
        : [];

    if (columnWidths.length === 0) {
      columnWidths = new Array(maxColumns).fill(0);

      for (const row of table.rows) {
        let currentColumn = 0;
        for (const cell of row.cells) {
          const span = cell.gridSpan || 1;
          const preferredWidth = this.resolvePreferredWidth(cell.width, tableWidth);
          if (preferredWidth) {
            const perColumnWidth = preferredWidth / span;
            for (let index = 0; index < span; index++) {
              columnWidths[currentColumn + index] = Math.max(columnWidths[currentColumn + index] || 0, perColumnWidth);
            }
          }
          currentColumn += span;
        }
      }
    }

    if (columnWidths.length < maxColumns) {
      columnWidths.push(...new Array(maxColumns - columnWidths.length).fill(0));
    }

    const currentWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    if (currentWidth <= 0) {
      return new Array(maxColumns).fill(tableWidth / maxColumns);
    }

    const scale = tableWidth / currentWidth;
    return columnWidths.map(width => width * scale);
  }
}
