import {
  ChartRenderer,
  CommonRendererOptions,
  FontMapping,
  ImageRenderer,
  OfficeImage,
  ParagraphStyle,
  TextStyle,
  WarningCollector,
  defaultCommonRendererOptions,
  serializeOfficeMath
} from '@opr/shared';
import { DocxLayoutPage, PageLayoutEngine } from '../layout';
import {
  DocxBlock,
  DocxDocument,
  DocxHeaderFooterPart,
  DocxNavigation,
  DocxParagraph,
  DocxRun,
  DocxTable,
  DocxTableCell,
  DocxWatermark
} from '../model';
import { DocxNavigationBuilder } from '../navigation';
import { normalizeLegacyListMarker } from '../parser/symbols';
import { DocxInteractionController } from './DocxInteractionController';
import { createDocxNavigationPane } from './DocxNavigationPane';
import './DocxRenderer.css';

export interface DocxRendererOptions extends CommonRendererOptions {
  width?: number;
  pageGap?: number;
  /** 页面缩放倍率，1 为当前适配宽度 */
  zoom?: number;
  /** 是否显示左侧目录导航，默认为 false */
  showNavigationPane?: boolean;
  /** 是否显示分页外观，默认为 true */
  showPagination?: boolean;
  /** 是否显示页眉/页脚，默认为 true */
  showHeaderFooter?: boolean;
  /** 是否显示封面，默认为 true */
  showCoverPage?: boolean;
  /** 是否显示修订增加内容，默认为 true */
  showInsertedRevisionText?: boolean;
  /** 是否显示修订删除内容，默认为 false */
  showDeletedRevisionText?: boolean;
  /** @deprecated use showDeletedRevisionText */
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

type DocxRenderableRun = {
  text: string;
  style: TextStyle;
  images?: OfficeImage[];
  isMath?: boolean;
  mathDisplayMode?: 'inline' | 'block';
};

type DocxTextLineItem = {
  type: 'text';
  text: string;
  style: TextStyle;
  width: number;
};

type DocxImageLineItem = {
  type: 'image';
  image: OfficeImage;
  width: number;
  height: number;
};

type DocxCanvasLine = {
  items: Array<DocxTextLineItem | DocxImageLineItem>;
  width: number;
  height: number;
  baselineOffset: number;
  x: number;
  availableWidth: number;
  isMathBlock?: boolean;
};

export class DocxRenderer {
  readonly warnings = new WarningCollector();
  private navigation: DocxNavigation = { headings: [], toc: [], pages: [] };
  private currentDocument: DocxDocument | null = null;
  private imageCache = new Map<string, ImageBitmap>();
  private imageLoading = new Set<string>();
  private listPrefixCache = new WeakMap<DocxParagraph, string>();
  private pageScale = 1;
  private interaction: DocxInteractionController;
  private pageContainer: HTMLElement | undefined;
  private stats: DocxRendererStats = {
    totalPages: 0,
    totalCharacters: 0,
    totalWords: 0,
    headingCount: 0,
    tocCount: 0,
    tableCount: 0
  };

  private options: Required<Omit<DocxRendererOptions, 'width' | 'pageGap' | 'showDeletedText'>> &
    Pick<DocxRendererOptions, 'width' | 'pageGap' | 'showDeletedText'>;

  constructor(private readonly container: HTMLElement, options: DocxRendererOptions = {}) {
    this.options = this.normalizeOptions(options);
    this.interaction = new DocxInteractionController({
      container,
      getDragSurface: () => this.pageContainer,
      initialZoom: this.options.zoom,
      canZoom: () => !!this.currentDocument,
      onZoomChange: zoom => {
        this.setRenderOptions({ zoom });
        this.container.dispatchEvent(new CustomEvent('docx-zoom-change', { detail: { zoom: this.options.zoom } }));
      }
    });
  }

  render(docx: DocxDocument): void {
    this.currentDocument = docx;
    this.container.innerHTML = '';
    this.container.classList.add('opr-docx-renderer');
    this.container.classList.toggle('opr-docx-renderer--paginated', this.options.showPagination);
    this.container.classList.toggle('opr-docx-renderer--with-navigation', this.options.showNavigationPane);
    this.container.style.padding =
      this.options.showPagination && !this.options.showNavigationPane ? `${this.options.pageGap ?? 24}px 0` : '';

    const layout = new PageLayoutEngine().layout(docx);
    this.pageScale = this.computePageScale(layout);
    this.listPrefixCache = this.buildListPrefixCache(docx);
    this.navigation = DocxNavigationBuilder.build(docx, layout);
    this.stats = this.computeStats(docx, layout);
    const pageContainer = this.createRenderShell();
    this.pageContainer = pageContainer;

    for (const page of layout) {
      if (!this.options.showCoverPage && page.isCoverPage) {
        continue;
      }

      const pageEl = this.createPageElement(page.pageBox.width, page.pageBox.height, this.getPageBackgroundColor(docx));
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

      pageContainer.appendChild(pageEl);
    }

    this.interaction.bindDragSurface();
  }

  getNavigation(): DocxNavigation {
    return this.navigation;
  }

  getStats(): DocxRendererStats {
    return this.stats;
  }

  getRenderOptions(): DocxRendererOptions {
    return { ...this.options };
  }

  destroy() {
    this.interaction.destroy();
    this.container.classList.remove(
      'opr-docx-renderer',
      'opr-docx-renderer--paginated',
      'opr-docx-renderer--with-navigation'
    );
  }

  getZoom() {
    return this.interaction.getZoom();
  }

  zoomTo(scale: number) {
    return this.interaction.setZoom(scale);
  }

  zoomIn(step = 0.1) {
    return this.interaction.zoomIn(step);
  }

  zoomOut(step = 0.1) {
    return this.interaction.zoomOut(step);
  }

  setRenderOptions(options: Partial<DocxRendererOptions>): void {
    this.options = this.normalizeOptions({ ...this.options, ...options });
    if (options.zoom !== undefined) {
      this.interaction.setZoom(this.options.zoom, false);
    }
    if (this.currentDocument) {
      this.render(this.currentDocument);
    }
  }

  setShowCharts(show: boolean) {
    this.setRenderOptions({ showCharts: show });
  }

  toggleShowCharts(show?: boolean) {
    const next = show ?? !this.options.showCharts;
    this.setShowCharts(next);
    return next;
  }

  setShowInsertedElements(show: boolean) {
    this.setRenderOptions({ showInsertedElements: show });
  }

  toggleShowInsertedElements(show?: boolean) {
    const next = show ?? !this.options.showInsertedElements;
    this.setShowInsertedElements(next);
    return next;
  }

  setShowImages(show: boolean) {
    this.setRenderOptions({ showImages: show });
  }

  toggleShowImages(show?: boolean) {
    const next = show ?? !this.options.showImages;
    this.setShowImages(next);
    return next;
  }

  setShowAudio(show: boolean) {
    this.setRenderOptions({ showAudio: show });
  }

  toggleShowAudio(show?: boolean) {
    const next = show ?? !this.options.showAudio;
    this.setShowAudio(next);
    return next;
  }

  setShowVideo(show: boolean) {
    this.setRenderOptions({ showVideo: show });
  }

  toggleShowVideo(show?: boolean) {
    const next = show ?? !this.options.showVideo;
    this.setShowVideo(next);
    return next;
  }

  setShowComments(show: boolean) {
    this.setRenderOptions({ showComments: show });
  }

  toggleShowComments(show?: boolean) {
    const next = show ?? !this.options.showComments;
    this.setShowComments(next);
    return next;
  }

  setShowNavigationPane(show: boolean) {
    this.setRenderOptions({ showNavigationPane: show });
  }

  toggleNavigationPane(show?: boolean) {
    const next = show ?? !this.options.showNavigationPane;
    this.setShowNavigationPane(next);
    return next;
  }

  setShowPagination(show: boolean) {
    this.setRenderOptions({ showPagination: show });
  }

  togglePagination(show?: boolean) {
    const next = show ?? !this.options.showPagination;
    this.setShowPagination(next);
    return next;
  }

  setShowHeaderFooter(show: boolean) {
    this.setRenderOptions({ showHeaderFooter: show });
  }

  toggleHeaderFooter(show?: boolean) {
    const next = show ?? !this.options.showHeaderFooter;
    this.setShowHeaderFooter(next);
    return next;
  }

  setShowCoverPage(show: boolean) {
    this.setRenderOptions({ showCoverPage: show });
  }

  toggleCoverPage(show?: boolean) {
    const next = show ?? !this.options.showCoverPage;
    this.setShowCoverPage(next);
    return next;
  }

  setShowInsertedRevisionText(show: boolean) {
    this.setRenderOptions({ showInsertedRevisionText: show });
  }

  toggleInsertedRevisionText(show?: boolean) {
    const next = show ?? !this.options.showInsertedRevisionText;
    this.setShowInsertedRevisionText(next);
    return next;
  }

  setShowDeletedRevisionText(show: boolean) {
    this.setRenderOptions({ showDeletedRevisionText: show, showDeletedText: show });
  }

  toggleDeletedRevisionText(show?: boolean) {
    const next = show ?? !this.options.showDeletedRevisionText;
    this.setShowDeletedRevisionText(next);
    return next;
  }

  jumpToHeading(headingId: string): boolean {
    const target =
      (this.container.querySelector(`[data-testid="docx-text-layer"] [data-heading-id="${headingId}"]`) as HTMLElement | null) ||
      (this.container.querySelector(`[data-heading-id="${headingId}"]`) as HTMLElement | null);
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

  private normalizeOptions(options: DocxRendererOptions) {
    const showDeletedRevisionText = options.showDeletedRevisionText ?? options.showDeletedText ?? false;

    return {
      ...defaultCommonRendererOptions,
      width: options.width,
      pageGap: options.pageGap,
      zoom: this.normalizeZoom(options.zoom ?? 1),
      showDeletedText: options.showDeletedText,
      showNavigationPane: options.showNavigationPane ?? false,
      showPagination: options.showPagination ?? true,
      showHeaderFooter: options.showHeaderFooter ?? true,
      showCoverPage: options.showCoverPage ?? true,
      showInsertedRevisionText: options.showInsertedRevisionText ?? true,
      showDeletedRevisionText,
      showCharts: options.showCharts ?? defaultCommonRendererOptions.showCharts,
      showInsertedElements: options.showInsertedElements ?? defaultCommonRendererOptions.showInsertedElements,
      showImages: options.showImages ?? defaultCommonRendererOptions.showImages,
      showAudio: options.showAudio ?? defaultCommonRendererOptions.showAudio,
      showVideo: options.showVideo ?? defaultCommonRendererOptions.showVideo,
      showComments: options.showComments ?? defaultCommonRendererOptions.showComments
    };
  }

  private normalizeZoom(value: number) {
    if (!Number.isFinite(value)) {
      return 1;
    }

    return Math.min(3, Math.max(0.25, value));
  }

  private createRenderShell(): HTMLElement {
    if (!this.options.showNavigationPane) {
      return this.container;
    }

    const nav = createDocxNavigationPane({
      navigation: this.navigation,
      onHeadingClick: headingId => this.jumpToHeading(headingId)
    });

    const pages = document.createElement('div');
    pages.dataset.testid = 'docx-page-container';
    pages.className = 'opr-docx-page-container';
    pages.classList.toggle('opr-docx-page-container--paginated', this.options.showPagination);
    pages.style.padding = this.options.showPagination ? `${this.options.pageGap ?? 24}px 0` : '';

    this.container.appendChild(nav);
    this.container.appendChild(pages);
    return pages;
  }

  private createPageElement(width: number, height: number, backgroundColor = '#ffffff'): HTMLElement {
    const page = document.createElement('div');
    const pageWidth = Math.max(1, Math.round((width || 816) * this.pageScale));
    const pageHeight = Math.max(1, Math.round((height || 1056) * this.pageScale));

    page.dataset.testid = 'docx-page';
    page.className = 'opr-docx-page';
    page.classList.toggle('opr-docx-page--paginated', this.options.showPagination);
    page.style.width = `${pageWidth}px`;
    page.style.height = `${pageHeight}px`;
    page.style.margin = this.options.showPagination ? `0 auto ${this.options.pageGap ?? 24}px` : '0 auto';
    page.style.background = backgroundColor;

    return page;
  }

  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const pageWidth = Math.max(1, Math.round((width || 816) * this.pageScale));
    const pageHeight = Math.max(1, Math.round((height || 1056) * this.pageScale));
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');

    canvas.dataset.testid = 'docx-page-canvas';
    canvas.className = 'opr-docx-canvas';
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
    layer.className = 'opr-docx-text-layer';
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
    ctx.fillStyle = this.getPageBackgroundColor(documentModel);
    ctx.fillRect(0, 0, page.pageBox.width, page.pageBox.height);
    if (this.options.showPagination) {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1 / scaleX;
      ctx.strokeRect(0.5 / scaleX, 0.5 / scaleY, page.pageBox.width - 1 / scaleX, page.pageBox.height - 1 / scaleY);
    }
    const floatingDrawings = this.collectPageFloatingDrawings(page);

    this.renderWatermarksCanvas(ctx, documentModel, page);
    this.renderFloatingDrawingsCanvas(ctx, page, floatingDrawings, 'behind');

    const header = this.resolveHeaderFooter(documentModel, 'header', page);
    if (header) {
      this.renderHeaderFooterCanvas(ctx, header, documentModel, page, context);
    }

    this.clipToContentArea(ctx, page, () => {
      for (const item of page.blocks) {
        this.renderBlockWithClip(ctx, item.block, documentModel, item.box.x, item.box.y, item.box.width, item.box.height, context, page.section);
      }
    });

    this.renderFloatingDrawingsCanvas(ctx, page, floatingDrawings, 'front');

    const footer = this.resolveHeaderFooter(documentModel, 'footer', page);
    if (footer) {
      this.renderHeaderFooterCanvas(ctx, footer, documentModel, page, context);
    }

    ctx.restore();
  }

  private reportPageOverflow(page: DocxLayoutPage) {
    for (const item of page.blocks) {
      if (item.overflow?.clipped) {
        this.warnings.clippedContent(
          `DOCX block overflow clipped on page ${page.pageIndex + 1}; estimated height ${Math.round(item.overflow.estimatedHeight)}px`
        );
      }
    }
  }

  private getPageBackgroundColor(documentModel: DocxDocument) {
    return this.toCssColor(documentModel.background?.color, '#ffffff');
  }

  private renderWatermarksCanvas(ctx: CanvasRenderingContext2D, documentModel: DocxDocument, page: DocxLayoutPage) {
    const watermarks = this.resolvePageWatermarks(documentModel, page);
    for (const watermark of watermarks) {
      this.renderTextWatermarkCanvas(ctx, page, watermark);
    }
  }

  private resolvePageWatermarks(documentModel: DocxDocument, page: DocxLayoutPage): DocxWatermark[] {
    const header = this.resolveHeaderFooter(documentModel, 'header', page, true);
    const footer = this.resolveHeaderFooter(documentModel, 'footer', page, true);
    return [...(header?.watermarks || []), ...(footer?.watermarks || [])];
  }

  private renderTextWatermarkCanvas(ctx: CanvasRenderingContext2D, page: DocxLayoutPage, watermark: DocxWatermark) {
    if (watermark.type !== 'text' || !watermark.text) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = watermark.opacity ?? 0.18;
    ctx.fillStyle = this.toCssColor(watermark.color, '#9ca3af');
    ctx.font = `700 ${Math.round(watermark.fontSize || 54)}px ${watermark.fontFamily || 'Arial'}, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(page.pageBox.width / 2, page.pageBox.height / 2);
    ctx.rotate(((watermark.rotation ?? 315) * Math.PI) / 180);
    ctx.fillText(watermark.text, 0, 0);
    ctx.restore();
  }

  private collectPageFloatingDrawings(page: DocxLayoutPage) {
    return page.blocks
      .flatMap(item => {
        if (item.block.type !== 'paragraph' || !item.block.floatingDrawings?.length) {
          return [];
        }

        return item.block.floatingDrawings.map(floating => ({
          floating,
          paragraph: item.block,
          box: item.box
        }));
      })
      .sort((left, right) => (left.floating.anchor.relativeHeight || 0) - (right.floating.anchor.relativeHeight || 0));
  }

  private renderFloatingDrawingsCanvas(
    ctx: CanvasRenderingContext2D,
    page: DocxLayoutPage,
    floatingDrawings: ReturnType<DocxRenderer['collectPageFloatingDrawings']>,
    layer: 'behind' | 'front'
  ) {
    for (const item of floatingDrawings) {
      const isBehind = item.floating.anchor.behindDoc === true;
      if ((layer === 'behind' && !isBehind) || (layer === 'front' && isBehind)) {
        continue;
      }

      this.renderFloatingDrawingCanvas(ctx, page, item.floating, item.box);
    }
  }

  private renderFloatingDrawingCanvas(
    ctx: CanvasRenderingContext2D,
    page: DocxLayoutPage,
    floating: NonNullable<DocxParagraph['floatingDrawings']>[number],
    paragraphBox: { x: number; y: number; width: number; height: number }
  ) {
    if (!this.shouldRenderFloatingDrawing(floating)) {
      return;
    }

    const drawing = floating.drawing;
    if (!drawing) {
      return;
    }

    const rect = this.resolveFloatingDrawingRect(page, floating, paragraphBox);
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    if ('blob' in drawing) {
      const bitmap = this.getOrQueueImageBitmap(drawing);
      if (!bitmap) {
        this.renderImagePlaceholder(ctx, rect.x, rect.y, rect.width, rect.height);
        return;
      }

      ImageRenderer.render(ctx, drawing, bitmap, rect.x, rect.y, rect.width, rect.height);
      return;
    }

    if (drawing.type === 'chart') {
      new ChartRenderer(drawing.chartData).render(ctx, rect);
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
    context: { pageIndex: number; totalPages: number },
    section?: DocxLayoutPage['section']
  ) {
    if (block.type === 'table') {
      this.renderTableCanvas(ctx, block, documentModel, x, y, width, height, context, section);
      return;
    }

    this.renderParagraphCanvas(ctx, block, documentModel, x, y, width, context, section);
  }

  private renderBlockWithClip(
    ctx: CanvasRenderingContext2D,
    block: DocxBlock,
    documentModel: DocxDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    context: { pageIndex: number; totalPages: number },
    section?: DocxLayoutPage['section']
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    this.renderBlockCanvas(ctx, block, documentModel, x, y, width, height, context, section);
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
    context: { pageIndex: number; totalPages: number },
    section?: DocxLayoutPage['section']
  ) {
    const paragraphStyle = this.resolveParagraphStyle(documentModel, paragraph);
    const paragraphTextStyle = paragraphStyle.text || this.resolveParagraphTextStyle(documentModel, paragraph);
    const runs = this.createRenderableRuns(paragraph, documentModel, context, paragraphTextStyle);
    const contentX = x + this.toPx(paragraphStyle.indent?.left || 0);
    const firstLineOffset = this.toPx((paragraphStyle.indent?.firstLine || 0) - (paragraphStyle.indent?.hanging || 0));
    const rightIndent = this.toPx(paragraphStyle.indent?.right || 0);
    const contentWidth = Math.max(1, width - (contentX - x) - rightIndent);
    const prefix = this.getListPrefix(paragraph, documentModel);
    const tabStopWidth = this.toPx(documentModel.settings.defaultTabStop || 720);
    const sectionLinePitch = this.getSectionLinePitch(section);

    const lines = this.layoutParagraphLines(
      ctx,
      paragraph,
      paragraphStyle,
      paragraphTextStyle,
      runs,
      prefix,
      contentX,
      contentWidth,
      firstLineOffset,
      tabStopWidth,
      sectionLinePitch
    );
    let lineY = y + this.toPx(paragraphStyle.spacing?.before || 0);

    for (const line of lines) {
      let cursorX = this.alignLineX(line, paragraphStyle);
      const baselineY = lineY + line.baselineOffset;

      for (const item of line.items) {
        if (item.type === 'image') {
          this.renderInlineImage(ctx, item.image, cursorX, lineY, item.width, item.height);
          cursorX += item.width;
          continue;
        }

        if (item.style.highlight) {
          ctx.fillStyle = this.toCssColor(item.style.highlight, '#fff2cc');
          ctx.fillRect(cursorX, lineY, item.width, line.height);
        }

        this.applyTextStyle(ctx, item.style);
        ctx.fillText(item.text, cursorX, baselineY);
        this.renderTextDecorations(ctx, item.style, cursorX, baselineY, item.width);
        cursorX += item.width;
      }

      lineY += line.height;
    }
  }

  private layoutParagraphLines(
    ctx: CanvasRenderingContext2D,
    paragraph: DocxParagraph,
    paragraphStyle: ParagraphStyle,
    paragraphTextStyle: TextStyle,
    runs: DocxRenderableRun[],
    prefix: string,
    contentX: number,
    contentWidth: number,
    firstLineOffset: number,
    tabStopWidth = 48,
    sectionLinePitch?: number
  ): DocxCanvasLine[] {
    const defaultLineHeight = this.getLineHeight(paragraphTextStyle, paragraphStyle, sectionLinePitch);
    const lines: DocxCanvasLine[] = [];
    let isFirstLine = true;
    let line = this.createCanvasLine(contentX, contentWidth, firstLineOffset, 0, defaultLineHeight, isFirstLine);

    const pushLine = () => {
      if (line.items.length === 0) {
        line.height = Math.max(line.height, defaultLineHeight);
      }
      lines.push(line);
      isFirstLine = false;
      line = this.createCanvasLine(contentX, contentWidth, 0, 0, defaultLineHeight, isFirstLine);
    };

    const addTextToken = (text: string, style: TextStyle, isMathBlock = false) => {
      if (/^[^\S\n\t]+$/.test(text) && line.items.length === 0) {
        return;
      }

      this.applyTextStyle(ctx, style);
      const isTab = text === '\t';
      const width = isTab ? this.measureTabWidth(line, tabStopWidth) : this.measureTextWidth(ctx, text, style);
      if (!isTab && this.isCjkTextToken(text) && text.length > 1 && (width > line.availableWidth || line.width + width > line.availableWidth)) {
        for (const character of Array.from(text)) {
          addTextToken(character, style, isMathBlock);
        }
        return;
      }

      if (line.items.length > 0 && line.width + width > line.availableWidth) {
        pushLine();
        if (/^[^\S\n\t]+$/.test(text)) {
          return;
        }
      }

      if (width > line.availableWidth && text.length > 1) {
        for (const character of Array.from(text)) {
          addTextToken(character, style, isMathBlock);
        }
        return;
      }

      line.items.push({ type: 'text', text: isTab ? '' : text, style, width });
      line.width += width;
      line.isMathBlock = line.isMathBlock || isMathBlock;
      this.expandLineMetrics(line, this.getLineHeight(style, paragraphStyle, sectionLinePitch));
    };

    if (prefix) {
      addTextToken(prefix, paragraphTextStyle);
    }

    for (const run of runs) {
      if (run.mathDisplayMode === 'block' && line.items.length > 0) {
        pushLine();
      }

      for (const image of run.images || []) {
        const imageWidth = Math.min(image.position.width, Math.max(1, line.availableWidth));
        if (line.items.length > 0) {
          pushLine();
        }
        line.items.push({
          type: 'image',
          image,
          width: imageWidth,
          height: image.position.height
        });
        line.width = imageWidth;
        this.expandLineMetrics(line, image.position.height + 8);
        pushLine();
      }

      for (const token of this.splitTextForWrap(run.text)) {
        if (token === '\n') {
          pushLine();
          continue;
        }
        addTextToken(token, run.style, run.mathDisplayMode === 'block');
      }

      if (run.mathDisplayMode === 'block' && line.items.length > 0) {
        pushLine();
      }
    }

    if (line.items.length > 0 || lines.length === 0) {
      lines.push(line);
    }

    return lines;
  }

  private createCanvasLine(
    contentX: number,
    contentWidth: number,
    firstLineOffset: number,
    hangingOffset: number,
    lineHeight: number,
    isFirstLine: boolean
  ): DocxCanvasLine {
    const x = contentX + (isFirstLine ? firstLineOffset : hangingOffset);
    const availableWidth = Math.max(1, contentX + contentWidth - x);
    return {
      items: [],
      width: 0,
      height: lineHeight,
      baselineOffset: Math.max(1, Math.round(lineHeight * 0.78)),
      x,
      availableWidth
    };
  }

  private expandLineMetrics(line: DocxCanvasLine, itemHeight: number) {
    if (itemHeight <= line.height) {
      return;
    }

    line.height = Math.ceil(itemHeight);
    line.baselineOffset = Math.max(1, Math.round(line.height * 0.78));
  }

  private renderTableCanvas(
    ctx: CanvasRenderingContext2D,
    table: DocxTable,
    documentModel: DocxDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    context: { pageIndex: number; totalPages: number },
    section?: DocxLayoutPage['section']
  ) {
    const maxColumns = Math.max(
      1,
      ...table.rows.map(row => row.cells.reduce((sum, cell) => sum + (cell.gridSpan || 1), 0))
    );
    const columnWidths = this.resolveTableColumnWidths(table, width);
    const tableWidth = columnWidths.reduce((sum, columnWidth) => sum + columnWidth, 0);
    const rowHeights = this.resolveTableRowHeights(ctx, table, documentModel, columnWidths, context, section);
    const tableHeight = Math.max(height, rowHeights.reduce((sum: number, rowHeight: number) => sum + rowHeight, 0));
    let rowY = y;

    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, tableWidth, tableHeight);

    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
      const row = table.rows[rowIndex];
      const rowHeight = rowHeights[rowIndex] || 28;
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
        const cellHeight =
          rowHeights.slice(rowIndex, rowIndex + rowSpan).reduce((sum: number, height: number) => sum + height, 0) || rowHeight;
        colIndex += colSpan;

        ctx.save();
        ctx.beginPath();
        ctx.rect(colX, rowY, colWidth, cellHeight);
        ctx.clip();

        if (cell.shading) {
          ctx.fillStyle = this.toCssColor(cell.shading, '#ffffff');
          ctx.fillRect(colX, rowY, colWidth, cellHeight);
        }

        const margins = this.resolveCellMargins(table, cell);
        let cellY = rowY + margins.top;
        for (const block of cell.blocks) {
          const contentWidth = Math.max(1, colWidth - margins.left - margins.right);
          const remainingHeight = Math.max(1, rowY + cellHeight - margins.bottom - cellY);
          const blockHeight = Math.min(
            remainingHeight,
            this.measureBlockHeight(ctx, block, documentModel, contentWidth, context, section, {
              disableSectionLinePitch: true
            })
          );
          this.renderBlockCanvas(ctx, block, documentModel, colX + margins.left, cellY, contentWidth, blockHeight, context, undefined);
          cellY += blockHeight;
        }
        ctx.restore();
        this.renderCellBorders(ctx, table, cell, rowIndex, colIndex - colSpan, rowSpan, colSpan, maxColumns, colX, rowY, colWidth, cellHeight);
      }
      rowY += rowHeight;
    }

    ctx.restore();
  }

  private resolveTableRowHeights(
    ctx: CanvasRenderingContext2D,
    table: DocxTable,
    documentModel: DocxDocument,
    columnWidths: number[],
    context: { pageIndex: number; totalPages: number },
    section?: DocxLayoutPage['section']
  ): number[] {
    return table.rows.map(row => {
      let colIndex = 0;
      const cellHeights: number[] = row.cells.map(cell => {
        const colSpan = cell.gridSpan || 1;
        if (cell.verticalMerge === 'continue') {
          colIndex += colSpan;
          return 0;
        }

        const cellWidth = columnWidths.slice(colIndex, colIndex + colSpan).reduce((sum, columnWidth) => sum + columnWidth, 0);
        colIndex += colSpan;
        const margins = this.resolveCellMargins(table, cell);
        const contentWidth = Math.max(1, cellWidth - margins.left - margins.right);
        const contentHeight: number = cell.blocks.reduce(
          (height: number, block: DocxBlock) =>
            height +
            this.measureBlockHeight(ctx, block, documentModel, contentWidth, context, section, {
              disableSectionLinePitch: true
            }),
          margins.top + margins.bottom
        );
        return contentHeight;
      });

      return Math.max(this.resolveRowMinimumHeight(row), ...cellHeights);
    });
  }

  private measureBlockHeight(
    ctx: CanvasRenderingContext2D,
    block: DocxBlock,
    documentModel: DocxDocument,
    width: number,
    context: { pageIndex: number; totalPages: number },
    section?: DocxLayoutPage['section'],
    options: { disableSectionLinePitch?: boolean } = {}
  ): number {
    if (block.type === 'table') {
      const columnWidths = this.resolveTableColumnWidths(block, width);
      return this.resolveTableRowHeights(ctx, block, documentModel, columnWidths, context, section).reduce(
        (sum: number, rowHeight: number) => sum + rowHeight,
        0
      );
    }

    const paragraphStyle = this.resolveParagraphStyle(documentModel, block);
    const paragraphTextStyle = paragraphStyle.text || this.resolveParagraphTextStyle(documentModel, block);
    const runs = this.createRenderableRuns(block, documentModel, context, paragraphTextStyle);
    const contentX = this.toPx(paragraphStyle.indent?.left || 0);
    const rightIndent = this.toPx(paragraphStyle.indent?.right || 0);
    const firstLineOffset = this.toPx((paragraphStyle.indent?.firstLine || 0) - (paragraphStyle.indent?.hanging || 0));
    const contentWidth = Math.max(1, width - contentX - rightIndent);
    const prefix = this.getListPrefix(block, documentModel);
    const tabStopWidth = this.toPx(documentModel.settings.defaultTabStop || 720);
    const sectionLinePitch = options.disableSectionLinePitch ? undefined : this.getSectionLinePitch(section);
    const lines = this.layoutParagraphLines(
      ctx,
      block,
      paragraphStyle,
      paragraphTextStyle,
      runs,
      prefix,
      contentX,
      contentWidth,
      firstLineOffset,
      tabStopWidth,
      sectionLinePitch
    );
    return (
      this.toPx(paragraphStyle.spacing?.before || 0) +
      lines.reduce((height, line) => height + line.height, 0) +
      this.toPx(paragraphStyle.spacing?.after || 0)
    );
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
      this.renderBlockCanvas(ctx, block, documentModel, x, y, width, 24, context, page.section);
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

    const prefix = this.getListPrefix(paragraph, documentModel);
    if (prefix) {
      p.appendChild(document.createTextNode(prefix));
    }

    for (const run of paragraph.runs) {
      this.appendRunDom(p, run, context);
    }

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

    this.warnings.degradedFeature('DOCX table layout uses MVP canvas table grid rendering');
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
    page: DocxLayoutPage,
    force = false
  ): DocxHeaderFooterPart | undefined {
    if (!this.options.showHeaderFooter && !force) {
      return undefined;
    }

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
  ): DocxRenderableRun[] {
    return paragraph.runs.flatMap(run => {
      const resolvedStyle = this.applyRevisionStyle(
        this.applyMathStyle(
          this.applyHyperlinkStyle({ ...paragraphStyle, ...this.resolveRunStyle(documentModel, run), ...run.style }, run),
          run
        ),
        run
      );
      const text = this.renderRunText(run, context);
      const parts = text.split(/(\n)/g).filter(Boolean);
      const withBreaks = parts.length > 0 ? parts : [''];
      for (const br of run.breaks || []) {
        if (br === 'renderedPage') {
          continue;
        }
        if (br === 'line' || br === 'page') {
          withBreaks.push('\n');
        }
      }
      const renderRuns: DocxRenderableRun[] = withBreaks.map(part => ({
        text: part,
        style: resolvedStyle,
        images: undefined as OfficeImage[] | undefined,
        isMath: !!run.math,
        mathDisplayMode: run.math?.displayMode
      }));
      if (this.options.showInsertedElements && this.options.showImages && run.images && run.images.length > 0) {
        renderRuns.push({ text: '', style: resolvedStyle, images: run.images });
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
    if (!this.options.showInsertedElements || !this.options.showImages) {
      return;
    }

    const bitmap = this.getOrQueueImageBitmap(image);
    if (!bitmap) {
      this.renderImagePlaceholder(ctx, x, y, width, height);
      return;
    }

    ImageRenderer.render(ctx, image, bitmap, x, y, width, height);
  }

  private shouldRenderFloatingDrawing(floating: NonNullable<DocxParagraph['floatingDrawings']>[number]) {
    if (!this.options.showInsertedElements) {
      return false;
    }

    if (floating.objectType === 'image') {
      return this.options.showImages;
    }

    if (floating.objectType === 'chart') {
      return this.options.showCharts;
    }

    return true;
  }

  private getOrQueueImageBitmap(image: OfficeImage): ImageBitmap | undefined {
    if (this.imageCache.has(image.id)) {
      return this.imageCache.get(image.id);
    }

    if (!this.imageLoading.has(image.id)) {
      if (typeof createImageBitmap !== 'function') {
        this.warnings.fallbackFeature('DOCX image bitmap decoding is unavailable in this environment');
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
          this.warnings.fallbackFeature(`DOCX image could not be decoded: ${image.path || image.id}`);
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
    if (!this.options.showInsertedRevisionText && run.revision?.type === 'insert') {
      return '';
    }

    if (!this.options.showDeletedRevisionText && run.revision?.type === 'delete') {
      return '';
    }

    const mathText = run.math ? serializeOfficeMath(run.math) : '';
    const baseText = run.text + mathText;

    if (!run.fields || run.fields.length === 0) {
      return baseText;
    }

    const fieldText = run.fields
      .map(field => {
        if (field.type === 'page') return String(context.pageIndex + 1);
        if (field.type === 'numPages') return String(context.totalPages);
        return '';
      })
      .join('');

    return baseText + fieldText;
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
    const styleId = paragraph.styleId || documentModel.styles.defaultParagraphStyleId;
    const styleChain = styleId ? this.resolveStyleChain(documentModel, styleId) : [];
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

  private applyHyperlinkStyle(style: TextStyle, run: DocxRun): TextStyle {
    if (!run.hyperlink) {
      return style;
    }

    return {
      ...style,
      color: style.color || '#0563c1',
      underline: style.underline || true
    };
  }

  private applyMathStyle(style: TextStyle, run: DocxRun): TextStyle {
    if (!run.math) {
      return style;
    }

    return {
      ...style,
      fontFamily: 'Cambria Math',
      fontFallback: ['STIXGeneral', 'Times New Roman', ...(style.fontFallback || [])],
      size: Math.max(style.size || 11, run.math.displayMode === 'block' ? 16 : 12),
      color: style.color || '#111111'
    };
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

    const tokens: string[] = [];
    let word = '';
    let cjkRun = '';

    const flushWord = () => {
      if (word) {
        tokens.push(word);
        word = '';
      }
    };
    const flushCjkRun = () => {
      if (cjkRun) {
        tokens.push(cjkRun);
        cjkRun = '';
      }
    };

    for (const char of Array.from(text)) {
      if (char === '\n' || char === '\t' || /^[^\S\n\t]$/.test(char)) {
        flushWord();
        flushCjkRun();
        tokens.push(char);
        continue;
      }

      if (this.isCjkWrapCharacter(char)) {
        flushWord();
        cjkRun += char;
        continue;
      }

      flushCjkRun();
      word += char;
    }

    flushWord();
    flushCjkRun();
    return tokens;
  }

  private isCjkWrapCharacter(char: string) {
    return /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(char);
  }

  private isCjkTextToken(text: string) {
    return Array.from(text).every(char => this.isCjkWrapCharacter(char));
  }

  private measureTextWidth(ctx: CanvasRenderingContext2D, text: string, style: TextStyle) {
    if (/^[^\S\n\t]+$/.test(text)) {
      const fontPx = (style.size || 11) * 1.333;
      return Array.from(text).reduce((width, char) => width + (char === '\u3000' ? fontPx : fontPx * 0.5), 0);
    }

    return ctx.measureText(text).width;
  }

  private measureTabWidth(line: DocxCanvasLine, tabStopWidth: number) {
    const tabStop = Math.max(1, tabStopWidth);
    const current = Math.max(0, line.width);
    const offset = current % tabStop;
    return offset === 0 ? tabStop : tabStop - offset;
  }

  private getLineHeight(style: TextStyle, paragraphStyle?: ParagraphStyle, sectionLinePitch?: number) {
    const fontHeight = (style.size || 11) * 1.333;
    const defaultLineHeight = Math.max(fontHeight * 1.45, fontHeight + 6);
    const effectiveSectionLinePitch = paragraphStyle?.snapToGrid === false ? undefined : sectionLinePitch;
    const spacing = paragraphStyle?.spacing;
    if (!spacing?.line) {
      if (effectiveSectionLinePitch) {
        return Math.ceil(Math.max(fontHeight + 2, effectiveSectionLinePitch));
      }
      return Math.ceil(defaultLineHeight);
    }

    if (spacing.lineRule === 'exact') {
      return Math.max(1, this.toPx(spacing.line));
    }

    if (spacing.lineRule === 'atLeast') {
      return Math.ceil(Math.max(defaultLineHeight, this.toPx(spacing.line)));
    }

    return Math.ceil(Math.max(fontHeight + 2, fontHeight * (spacing.line / 240)));
  }

  private resolveCellMargins(table: DocxTable, cell: DocxTableCell) {
    return {
      top: this.resolveCellMargin(table, cell, 'top', 6),
      right: this.resolveCellMargin(table, cell, 'right', 6),
      bottom: this.resolveCellMargin(table, cell, 'bottom', 6),
      left: this.resolveCellMargin(table, cell, 'left', 6)
    };
  }

  private resolveCellMargin(
    table: DocxTable,
    cell: DocxTableCell,
    side: 'top' | 'right' | 'bottom' | 'left',
    fallbackPx: number
  ) {
    const value = cell.cellMargins?.[side] ?? table.cellMargins?.[side];
    return value === undefined ? fallbackPx : this.toPx(value);
  }

  private resolveRowMinimumHeight(row: DocxTable['rows'][number]) {
    if (row.height?.value === undefined || row.height.rule === 'auto') {
      return 28;
    }

    return Math.max(0, this.toPx(row.height.value));
  }

  private getSectionLinePitch(section?: DocxLayoutPage['section']) {
    const docGrid = section?.docGrid;
    if (!docGrid?.linePitch || docGrid.type === 'snapToChars') {
      return undefined;
    }

    const pitch = this.toPx(docGrid.linePitch);
    return docGrid.type === 'lines' || docGrid.type === 'linesAndChars' ? Math.ceil(pitch * 1.7) : pitch;
  }

  private alignLineX(line: DocxCanvasLine, paragraphStyle: ParagraphStyle) {
    if (paragraphStyle.alignment === 'center' || line.isMathBlock) {
      return line.x + Math.max(0, (line.availableWidth - line.width) / 2);
    }
    if (paragraphStyle.alignment === 'right') {
      return line.x + Math.max(0, line.availableWidth - line.width);
    }
    return line.x;
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
          .map(run => {
            if (!this.options.showInsertedRevisionText && run.revision?.type === 'insert') {
              return '';
            }
            if (!this.options.showDeletedRevisionText && run.revision?.type === 'delete') {
              return '';
            }
            return run.math ? serializeOfficeMath(run.math) : run.text;
          })
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

  private resolveFloatingDrawingRect(
    page: DocxLayoutPage,
    floating: NonNullable<DocxParagraph['floatingDrawings']>[number],
    paragraphBox: { x: number; y: number; width: number; height: number }
  ) {
    const fallbackWidth = floating.drawing?.position.width || 0;
    const fallbackHeight = floating.drawing?.position.height || 0;
    const width = floating.anchor.size?.width || fallbackWidth;
    const height = floating.anchor.size?.height || fallbackHeight;

    if (floating.anchor.useSimplePosition && floating.anchor.simplePosition) {
      return {
        x: floating.anchor.simplePosition.x,
        y: floating.anchor.simplePosition.y,
        width,
        height
      };
    }

    return {
      x: this.resolveFloatingAxisPosition(
        floating.anchor.horizontalPosition,
        width,
        this.getHorizontalReferenceRect(page, paragraphBox, floating.anchor.horizontalPosition?.relativeFrom),
        paragraphBox.x
      ),
      y: this.resolveFloatingAxisPosition(
        floating.anchor.verticalPosition,
        height,
        this.getVerticalReferenceRect(page, paragraphBox, floating.anchor.verticalPosition?.relativeFrom),
        paragraphBox.y
      ),
      width,
      height
    };
  }

  private resolveFloatingAxisPosition(
    position: { align?: string; offset?: number } | undefined,
    size: number,
    reference: { start: number; length: number },
    fallback: number
  ) {
    if (!position) {
      return fallback;
    }

    if (typeof position.offset === 'number') {
      return reference.start + position.offset;
    }

    switch (position.align) {
      case 'center':
        return reference.start + (reference.length - size) / 2;
      case 'right':
      case 'bottom':
      case 'outside':
        return reference.start + reference.length - size;
      case 'left':
      case 'top':
      case 'inside':
        return reference.start;
      default:
        return fallback;
    }
  }

  private getHorizontalReferenceRect(
    page: DocxLayoutPage,
    paragraphBox: { x: number; y: number; width: number; height: number },
    relativeFrom?: string
  ) {
    const margins = page.pageBox.margins;
    const pageWidth = page.pageBox.width;
    const marginRect = {
      start: margins.left,
      length: Math.max(1, pageWidth - margins.left - margins.right)
    };
    const leftMarginRect = { start: 0, length: margins.left };
    const rightMarginRect = { start: pageWidth - margins.right, length: margins.right };
    const insideRect = page.pageIndex % 2 === 0 ? leftMarginRect : rightMarginRect;
    const outsideRect = page.pageIndex % 2 === 0 ? rightMarginRect : leftMarginRect;

    switch (relativeFrom) {
      case 'page':
        return { start: 0, length: pageWidth };
      case 'margin':
        return marginRect;
      case 'leftMargin':
        return leftMarginRect;
      case 'rightMargin':
        return rightMarginRect;
      case 'insideMargin':
        return insideRect;
      case 'outsideMargin':
        return outsideRect;
      case 'column':
      case 'character':
      case 'paragraph':
      default:
        return { start: paragraphBox.x, length: paragraphBox.width };
    }
  }

  private getVerticalReferenceRect(
    page: DocxLayoutPage,
    paragraphBox: { x: number; y: number; width: number; height: number },
    relativeFrom?: string
  ) {
    const margins = page.pageBox.margins;
    const pageHeight = page.pageBox.height;

    switch (relativeFrom) {
      case 'page':
        return { start: 0, length: pageHeight };
      case 'margin':
        return { start: margins.top, length: Math.max(1, pageHeight - margins.top - margins.bottom) };
      case 'topMargin':
        return { start: 0, length: margins.top };
      case 'bottomMargin':
        return { start: pageHeight - margins.bottom, length: margins.bottom };
      case 'line':
      case 'paragraph':
      default:
        return { start: paragraphBox.y, length: paragraphBox.height };
    }
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

  private appendRunDom(parent: HTMLElement, run: DocxRun, context: { pageIndex: number; totalPages: number }) {
    for (const bookmark of run.bookmarks || []) {
      const marker = document.createElement('span');
      marker.id = this.getBookmarkDomId(bookmark.target);
      marker.dataset.bookmarkId = bookmark.id;
      marker.dataset.bookmarkName = bookmark.name;
      marker.dataset.testid = 'docx-bookmark';
      parent.appendChild(marker);
    }

    const text = this.renderRunText(run, context);
    if (!text) {
      return;
    }

    if (run.math) {
      const math = document.createElement(run.math.displayMode === 'block' ? 'div' : 'span');
      math.textContent = text;
      math.dataset.testid = 'docx-math';
      math.dataset.displayMode = run.math.displayMode;
      math.className = `opr-docx-math opr-docx-math--${run.math.displayMode}`;
      parent.appendChild(math);
      return;
    }

    if (!run.hyperlink) {
      parent.appendChild(document.createTextNode(text));
      return;
    }

    const anchor = document.createElement('a');
    anchor.textContent = text;
    anchor.href = run.hyperlink.target;
    anchor.dataset.hyperlinkMode = run.hyperlink.targetMode;
    anchor.dataset.testid = 'docx-hyperlink';
    if (run.hyperlink.anchor) {
      anchor.dataset.bookmarkTarget = run.hyperlink.anchor;
    }
    if (run.hyperlink.tooltip) {
      anchor.title = run.hyperlink.tooltip;
    }
    if (run.hyperlink.targetMode === 'External') {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }

    parent.appendChild(anchor);
  }

  private getBookmarkDomId(target: string) {
    return target.startsWith('#') ? target.slice(1) : target;
  }

  private computePageScale(layout: DocxLayoutPage[]) {
    const requestedWidth = this.options.width;
    const baseWidth = layout[0]?.pageBox.width;
    if (!requestedWidth || !baseWidth) {
      return this.options.zoom;
    }

    return (requestedWidth / baseWidth) * this.options.zoom;
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
