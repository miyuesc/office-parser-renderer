/**
 * DOCX 主渲染器
 *
 * 负责将解析后的 DOCX 文档渲染到 DOM
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import { PageCalculator } from './PageCalculator';
import { ParagraphRenderer, ParagraphRenderContext } from './ParagraphRenderer';
import { TableRenderer } from './TableRenderer';
import { DrawingRenderer } from './DrawingRenderer';
import { HeaderFooterRenderer } from './HeaderFooterRenderer';
import { ListCounter } from './ListCounter';
import type {
  DocxDocument,
  DocxElement,
  DocxSection,
  DocxRenderOptions,
  DocxRenderResult,
  ResolvedPageConfig,
  WatermarkConfig,
  PageInfo
} from '../types';

const log = Logger.createTagged('DocxRenderer');

/**
 * 默认渲染选项
 */
const DEFAULT_OPTIONS: DocxRenderOptions = {
  pageSize: 'A4',
  useDocumentSettings: true,
  scale: 1,
  showHeaderFooter: true,
  showPageNumber: true,
  enablePagination: false,
  debug: false,
  useDocumentBackground: true,
  useDocumentWatermark: true
};

/**
 * DOCX 渲染器类
 */
export class DocxRenderer {
  /** 渲染容器 */
  private container: HTMLElement;

  /** 渲染选项 */
  private options: DocxRenderOptions;

  /** 当前文档 */
  private currentDoc: DocxDocument | null = null;

  /** 页面信息列表 */
  private pageInfoList: PageInfo[] = [];

  /**
   * 构造函数
   *
   * @param container - 渲染目标容器
   * @param options - 渲染选项
   */
  constructor(container: HTMLElement, options?: Partial<DocxRenderOptions>) {
    this.container = container;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 渲染文档
   *
   * @param doc - 解析后的文档对象
   * @returns 渲染结果
   */
  async render(doc: DocxDocument): Promise<DocxRenderResult> {
    Logger.group('渲染 DOCX 文档');
    Logger.time('渲染耗时');

    try {
      // 保存当前文档
      this.currentDoc = doc;
      this.pageInfoList = [];

      // 清空容器
      this.container.innerHTML = '';
      this.container.className = 'docx-container';

      // 获取页面配置
      const section = doc.sections[0] || this.getDefaultSection();
      const pageConfig = this.resolvePageConfig(section);

      // 创建渲染上下文
      const listCounter = new ListCounter(doc.numbering);
      const context: ParagraphRenderContext = {
        styles: doc.styles,
        numbering: doc.numbering,
        listCounter,
        document: doc,
        defaultFontSize: 12,
        defaultFont: '宋体',
        defaultTabWidth: 48
      };

      // 如果启用分页，进行真正的多页渲染
      if (this.options.enablePagination) {
        return this.renderWithPagination(doc, section, pageConfig, context);
      }

      // 默认单页渲染模式（所有内容在一个页面容器中）
      return this.renderSinglePage(doc, section, pageConfig, context);
    } catch (error) {
      Logger.timeEnd('渲染耗时');
      Logger.groupEnd();
      log.error('渲染失败', error);
      throw error;
    }
  }

  /**
   * 单页渲染模式（不分页，所有内容在一个容器中）
   */
  private renderSinglePage(
    doc: DocxDocument,
    section: DocxSection,
    pageConfig: ResolvedPageConfig,
    context: ParagraphRenderContext
  ): DocxRenderResult {
    // 创建页面容器
    // For single page mode, we treat it as cover if it's the only page, or just apply logic
    // Actually single page mode usually means just one long page or just testing.
    // But if we want to support "cover page" logic, we should probably treat it as cover.
    const pageContainer = this.createPageContainer(pageConfig, section, this.currentDoc?.background, true);
    this.container.appendChild(pageContainer);

    // 渲染水印层（在内容下方）
    // 优先使用 API 设置的值，其次使用文档解析的值（如果启用）
    const watermarkConfig =
      this.options.watermark || (this.options.useDocumentWatermark !== false ? section.watermark : undefined);
    if (watermarkConfig) {
      const watermarkLayer = this.createWatermarkLayer(watermarkConfig);
      pageContainer.appendChild(watermarkLayer);
    }

    // 创建内容区域
    const contentArea = this.createContentArea(pageConfig, section);
    pageContainer.appendChild(contentArea);

    // 渲染页眉
    if (this.options.showHeaderFooter && section.header) {
      const header = HeaderFooterRenderer.renderHeader(section.header, section, {
        ...context,
        pageNumber: 1,
        totalPages: 1
      });
      pageContainer.appendChild(header);
    }

    // 渲染页脚
    if (this.options.showHeaderFooter && section.footer) {
      const footer = HeaderFooterRenderer.renderFooter(section.footer, section, {
        ...context,
        pageNumber: 1,
        totalPages: 1
      });
      pageContainer.appendChild(footer);
    }

    // 渲染文档内容
    for (const element of doc.body) {
      const rendered = this.renderElement(element, context);
      if (rendered) {
        contentArea.appendChild(rendered);
      }
    }

    // 回调
    this.options.onPageRender?.(0, pageContainer);

    // 应用样式表
    this.injectStyles();

    const result: DocxRenderResult = {
      totalPages: 1,
      pageConfig,
      pages: [pageContainer]
    };

    Logger.timeEnd('渲染耗时');
    Logger.groupEnd();

    return result;
  }

  /**
   * 多页渲染模式（启用分页）
   */
  private renderWithPagination(
    doc: DocxDocument,
    section: DocxSection,
    pageConfig: ResolvedPageConfig,
    context: ParagraphRenderContext
  ): DocxRenderResult {
    // 创建临时测量容器
    const measureContainer = document.createElement('div');
    measureContainer.className = 'docx-measure-container';
    measureContainer.style.position = 'absolute';
    measureContainer.style.visibility = 'hidden';
    measureContainer.style.width = `${pageConfig.contentWidth}pt`;
    document.body.appendChild(measureContainer);

    // 渲染所有元素到测量容器
    const renderedElements: HTMLElement[] = [];
    for (const element of doc.body) {
      const rendered = this.renderElement(element, context);
      if (rendered) {
        measureContainer.appendChild(rendered);
        renderedElements.push(rendered);
      }
    }

    // 使用 PageCalculator 计算分页
    const calculator = new PageCalculator(doc, doc.sections);
    const pageBreaks = calculator.calculateWithMeasurement(renderedElements, pageConfig);
    calculator.dispose();

    // 移除测量容器
    document.body.removeChild(measureContainer);

    // 根据分页结果创建页面
    const pageElements: HTMLElement[] = [];
    const totalPages = pageBreaks.totalPages;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageRange = pageBreaks.pageRanges[pageIndex];
      const pageNumber = pageIndex + 1;

      // 获取当前页面的分节配置
      const currentSection = doc.sections[pageRange.sectionIndex] || section;
      const currentPageConfig = this.resolvePageConfig(currentSection);

      // 创建页面容器
      const isCover = pageIndex === 0;
      const pageContainer = this.createPageContainer(currentPageConfig, currentSection, doc.background, isCover);
      this.container.appendChild(pageContainer);

      // 渲染水印层
      // 优先使用 API 设置的值，其次使用文档解析的值（如果启用）
      const watermarkConfig =
        this.options.watermark || (this.options.useDocumentWatermark !== false ? currentSection.watermark : undefined);
      if (watermarkConfig) {
        const watermarkLayer = this.createWatermarkLayer(watermarkConfig);
        pageContainer.appendChild(watermarkLayer);
      }

      // 创建内容区域
      const contentArea = this.createContentArea(currentPageConfig, currentSection);
      pageContainer.appendChild(contentArea);

      // 渲染页眉
      if (this.options.showHeaderFooter) {
        const headerContent = HeaderFooterRenderer.selectHeader(section, pageIndex, doc.settings?.evenAndOddHeaders);
        const header = HeaderFooterRenderer.renderHeader(headerContent, section, {
          ...context,
          pageNumber,
          totalPages
        });
        pageContainer.appendChild(header);
      }

      // 渲染页脚
      if (this.options.showHeaderFooter) {
        const footerContent = HeaderFooterRenderer.selectFooter(section, pageIndex, doc.settings?.evenAndOddHeaders);
        const footer = HeaderFooterRenderer.renderFooter(footerContent, section, {
          ...context,
          pageNumber,
          totalPages
        });
        pageContainer.appendChild(footer);
      }

      // 克隆该页的元素并添加到内容区域
      for (let i = pageRange.start; i < pageRange.end; i++) {
        if (renderedElements[i]) {
          const cloned = renderedElements[i].cloneNode(true) as HTMLElement;
          contentArea.appendChild(cloned);
        }
      }

      // 保存页面信息
      this.pageInfoList.push({
        index: pageIndex,
        pageNumber,
        sectionIndex: pageRange.sectionIndex,
        startElementIndex: pageRange.start,
        endElementIndex: pageRange.end,
        pageConfig,
        section
      });

      // 回调
      this.options.onPageRender?.(pageIndex, pageContainer);

      pageElements.push(pageContainer);
    }

    // 应用样式表
    this.injectStyles();

    const result: DocxRenderResult = {
      totalPages,
      pageConfig,
      pages: pageElements
    };

    Logger.timeEnd('渲染耗时');
    Logger.groupEnd();

    return result;
  }

  /**
   * 创建水印层
   *
   * @param config - 水印配置
   * @param pageConfig - 页面配置
   * @returns HTMLElement
   */
  private createWatermarkLayer(config: WatermarkConfig): HTMLElement {
    const layer = document.createElement('div');
    layer.className = 'docx-watermark';

    const style = layer.style;
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.width = '100%';
    style.height = '100%';
    style.display = 'flex';
    style.justifyContent = 'center';
    style.alignItems = 'center';
    style.pointerEvents = 'none';
    style.zIndex = '0';
    style.overflow = 'hidden';

    if (config.type === 'text' && config.text) {
      layer.textContent = config.text;
      style.fontSize = `${config.fontSize || 72}pt`;
      style.fontFamily = config.font || '宋体';
      style.color = config.color || '#cccccc';
      style.opacity = String(config.opacity ?? 0.5);
      style.transform = `rotate(${config.rotation ?? -45}deg)`;
      style.whiteSpace = 'nowrap';
    } else if (config.type === 'image' && config.imageSrc) {
      const img = document.createElement('img');
      img.src = config.imageSrc;
      img.style.maxWidth = '80%';
      img.style.maxHeight = '80%';
      img.style.opacity = String(config.opacity ?? 0.5);
      img.style.transform = `rotate(${config.rotation ?? 0}deg)`;
      layer.appendChild(img);
    }

    return layer;
  }

  /**
   * 渲染单个元素
   *
   * @param element - 文档元素
   * @param context - 渲染上下文
   * @returns HTMLElement 或 null
   */
  private renderElement(element: DocxElement, context: ParagraphRenderContext): HTMLElement | null {
    let rendered: HTMLElement | null = null;

    switch (element.type) {
      case 'paragraph':
        rendered = ParagraphRenderer.render(element, context);
        break;

      case 'table':
        rendered = TableRenderer.render(element, context);
        break;

      case 'drawing':
        rendered = DrawingRenderer.render(element, {
          document: context.document,
          images: context.document?.images
        });
        break;

      case 'sectionBreak':
        // 分节符渲染为零高度元素，以便在分页计算中被捕获
        rendered = document.createElement('div');
        rendered.setAttribute('data-type', 'sectionBreak');
        break;

      default:
        log.debug(`未处理的元素类型: ${(element as DocxElement).type}`);
        return null;
    }

    if (rendered) {
      // 附加原始元素引用，供分页计算使用
      (rendered as any)._docxElement = element;
    }

    return rendered;
  }

  /**
   * 创建页面容器
   *
   * @param config - 页面配置
   * @param section - 可选的分节配置（用于获取背景色等）
   * @param docBackground - 文档背景色
   * @param isCover - 是否为封面页
   * @returns HTMLElement
   */
  private createPageContainer(
    config: ResolvedPageConfig,
    section?: DocxSection,
    docBackground?: string,
    isCover: boolean = false
  ): HTMLElement {
    const page = document.createElement('div');
    page.className = 'docx-page'; // Add docx-cover if isCover?

    const style = page.style;
    style.width = `${config.width}pt`;
    style.height = `${config.height}pt`; // Fixed height
    // style.minHeight = `${config.height}pt`; // Removed minHeight

    // 封面页超出隐藏，非封面页正常显示但固定大小
    style.overflow = isCover ? 'hidden' : 'visible';

    style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    style.position = 'relative';
    style.boxSizing = 'border-box';
    // 不设置 margin，使用容器的 gap 控制间距

    // 应用背景色
    // 优先使用 API 设置的值，其次使用文档解析的值（如果启用）
    // Section background > Document background
    const bgColor =
      this.options.backgroundColor ||
      (this.options.useDocumentBackground !== false ? section?.backgroundColor || docBackground : undefined);

    style.backgroundColor = bgColor || 'white';

    // 应用缩放
    if (this.options.scale && this.options.scale !== 1) {
      style.transform = `scale(${this.options.scale})`;
      style.transformOrigin = 'top center';
    }

    // 调试模式下显示边界
    if (this.options.debug) {
      style.outline = '1px dashed red';
    }

    // 添加纸张角标
    this.addCornerMarks(page, config);

    return page;
  }

  /**
   * 添加纸张角标（位于正文区域四角）
   *
   * @param page - 页面元素
   * @param config - 页面配置（用于获取边距）
   */
  private addCornerMarks(page: HTMLElement, config: ResolvedPageConfig): void {
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    // 使用边距定位
    const margins = config.margins;

    for (const corner of corners) {
      const mark = document.createElement('div');
      mark.className = `docx-corner-mark ${corner}`;

      // 设置内联样式以适应不同页面的边距
      if (corner.includes('top')) mark.style.top = `${margins.top}pt`;
      if (corner.includes('bottom')) mark.style.bottom = `${margins.bottom}pt`;
      if (corner.includes('left')) mark.style.left = `${margins.left}pt`;
      if (corner.includes('right')) mark.style.right = `${margins.right}pt`;

      page.appendChild(mark);
    }
  }

  /**
   * 创建内容区域
   *
   * @param config - 页面配置
   * @param section - 分节配置（用于分栏）
   * @returns HTMLElement
   */
  private createContentArea(config: ResolvedPageConfig, section?: DocxSection): HTMLElement {
    const content = document.createElement('div');
    content.className = 'docx-content';

    const style = content.style;
    style.paddingTop = `${config.margins.top}pt`;
    style.paddingRight = `${config.margins.right}pt`;
    style.paddingBottom = `${config.margins.bottom}pt`;
    style.paddingLeft = `${config.margins.left}pt`;
    style.boxSizing = 'border-box';
    // Content area should not constrain height if overflow is visible,
    // but the page container is fixed.
    // style.minHeight = `${config.height}pt`;
    style.height = '100%'; // Match page height

    // 处理分栏
    if (section?.columns && section.columns.num > 1) {
      style.columnCount = String(section.columns.num);

      // 栏间距
      if (section.columns.space) {
        const gapPx = UnitConverter.twipsToPixels(section.columns.space);
        style.columnGap = `${gapPx}px`;
      }

      // 分隔线
      if (section.columns.sep) {
        style.columnRule = '1px solid #ccc'; // 默认样式，OOXML separator is just a line
      }
    }

    // 调试模式下显示边界
    if (this.options.debug) {
      style.outline = '1px dashed blue';
    }

    return content;
  }

  /**
   * 解析页面配置
   *
   * @param section - 分节配置
   * @returns 解析后的页面配置
   */
  private resolvePageConfig(section: DocxSection): ResolvedPageConfig {
    let pageWidth: number;
    let pageHeight: number;
    let margins = section.pageMargins;

    // 如果使用文档设置
    if (this.options.useDocumentSettings) {
      pageWidth = section.pageSize.width;
      pageHeight = section.pageSize.height;
      // 处理横向纸张方向：如果是横向且宽度小于高度，则交换宽高
      // 注意：A4 (11906x16838), Letter (12240x15840) 等预设值通常是准确的 Twips 值
      if (section.pageSize.orientation === 'landscape' && pageWidth < pageHeight) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      }

      // 如果没有明确定义宽高（rare），使用默认
      if (!pageWidth) pageWidth = 11906; // A4
      if (!pageHeight) pageHeight = 16838; // A4
    } else {
      // 使用覆盖选项
      if (typeof this.options.pageSize === 'object') {
        pageWidth = UnitConverter.pointsToTwips(this.options.pageSize.width);
        pageHeight = UnitConverter.pointsToTwips(this.options.pageSize.height);
      } else {
        const preset = UnitConverter.getPresetPageSize(this.options.pageSize || 'A4');
        pageWidth = preset.width;
        pageHeight = preset.height;
      }

      // 使用自定义边距
      if (this.options.margins) {
        const defaultMargins = UnitConverter.getDefaultMargins();
        margins = {
          top:
            this.options.margins.top !== undefined
              ? UnitConverter.pointsToTwips(this.options.margins.top)
              : defaultMargins.top,
          right:
            this.options.margins.right !== undefined
              ? UnitConverter.pointsToTwips(this.options.margins.right)
              : defaultMargins.right,
          bottom:
            this.options.margins.bottom !== undefined
              ? UnitConverter.pointsToTwips(this.options.margins.bottom)
              : defaultMargins.bottom,
          left:
            this.options.margins.left !== undefined
              ? UnitConverter.pointsToTwips(this.options.margins.left)
              : defaultMargins.left,
          header: defaultMargins.header,
          footer: defaultMargins.footer,
          gutter: defaultMargins.gutter
        };
      }
    }

    // 转换为点
    const widthPt = UnitConverter.twipsToPoints(pageWidth);
    const heightPt = UnitConverter.twipsToPoints(pageHeight);
    const marginsPt = {
      top: UnitConverter.twipsToPoints(margins.top),
      right: UnitConverter.twipsToPoints(margins.right),
      bottom: UnitConverter.twipsToPoints(margins.bottom),
      left: UnitConverter.twipsToPoints(margins.left),
      header: UnitConverter.twipsToPoints(margins.header),
      footer: UnitConverter.twipsToPoints(margins.footer)
    };

    return {
      width: widthPt,
      height: heightPt,
      margins: marginsPt,
      contentWidth: widthPt - marginsPt.left - marginsPt.right,
      contentHeight: heightPt - marginsPt.top - marginsPt.bottom
    };
  }

  /**
   * 获取默认分节配置
   *
   * @returns 默认分节
   */
  private getDefaultSection(): DocxSection {
    const defaultSize = UnitConverter.getPresetPageSize('A4');
    const defaultMargins = UnitConverter.getDefaultMargins();

    return {
      pageSize: {
        width: defaultSize.width,
        height: defaultSize.height,
        orientation: 'portrait'
      },
      pageMargins: defaultMargins
    };
  }

  /**
   * 注入样式表
   */
  private injectStyles(): void {
    const styleId = 'docx-renderer-styles';

    // 检查是否已注入
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .docx-container {
        font-family: '宋体', 'SimSun', 'Microsoft YaHei', sans-serif;
        font-size: 12pt;
        line-height: 1.2;
        color: #000;
        background-color: #808080;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .docx-page {
        page-break-after: always;
        flex-shrink: 0;
      }

      .docx-page:last-child {
        page-break-after: auto;
      }

      .docx-paragraph {
        margin: 0;
        padding: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .docx-run {
        white-space: pre-wrap;
      }

      .docx-table {
        border-collapse: collapse;
        margin: 10px 0;
      }

      .docx-table-cell {
        vertical-align: top;
      }

      .docx-hyperlink {
        color: #0563C1;
        text-decoration: underline;
        cursor: pointer;
      }

      .docx-hyperlink:hover {
        color: #0563C1;
        text-decoration: underline;
      }

      .docx-image {
        display: inline-block;
        vertical-align: middle;
      }

      .docx-image-content {
        max-width: 100%;
        height: auto;
      }

      .docx-drawing {
        display: inline-block;
        vertical-align: middle;
      }

      .docx-list-marker {
        display: inline-block;
        min-width: 20px;
        margin-right: 8px;
      }

      .docx-field {
        /* 域代码样式 */
      }

      .docx-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        box-sizing: border-box;
        z-index: 1;
      }

      .docx-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        box-sizing: border-box;
        z-index: 1;
      }

      .docx-content {
        position: relative;
        z-index: 1;
      }

      .docx-watermark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }

      .docx-measure-container {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
      }

      /* 纸张角标样式 */
      .docx-corner-mark {
        position: absolute;
        width: 30px;
        height: 30px;
        pointer-events: none;
        z-index: 2;
      }
      .docx-corner-mark.top-left {
        border-top: 1px solid #999;
        border-left: 1px solid #999;
      }
      .docx-corner-mark.top-right {
        border-top: 1px solid #999;
        border-right: 1px solid #999;
      }
      .docx-corner-mark.bottom-left {
        border-bottom: 1px solid #999;
        border-left: 1px solid #999;
      }
      .docx-corner-mark.bottom-right {
        border-bottom: 1px solid #999;
        border-right: 1px solid #999;
      }

      @media print {
        .docx-container {
          background-color: white;
          padding: 0;
          gap: 0;
        }

        .docx-page {
          box-shadow: none;
          margin: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 更新渲染选项
   *
   * @param options - 新选项
   */
  setOptions(options: Partial<DocxRenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 设置纸张大小
   *
   * @param pageSize - 纸张大小（预设值或自定义尺寸）
   */
  setPageSize(pageSize: DocxRenderOptions['pageSize']): void {
    this.options.pageSize = pageSize;
    this.options.useDocumentSettings = false;
  }

  /**
   * 设置页边距
   *
   * @param margins - 页边距配置 (pt)
   */
  setMargins(margins: { top?: number; right?: number; bottom?: number; left?: number }): void {
    this.options.margins = { ...this.options.margins, ...margins };
    this.options.useDocumentSettings = false;
  }

  /**
   * 设置缩放比例
   *
   * @param scale - 缩放比例 (0.5 - 2.0)
   */
  setScale(scale: number): void {
    this.options.scale = Math.max(0.5, Math.min(2.0, scale));
  }

  /**
   * 切换页眉页脚显示
   *
   * @param show - 是否显示
   */
  setShowHeaderFooter(show: boolean): void {
    this.options.showHeaderFooter = show;
  }

  /**
   * 使用文档内置设置
   */
  useDocumentPageSettings(): void {
    this.options.useDocumentSettings = true;
  }

  /**
   * 获取当前渲染选项
   *
   * @returns 当前选项
   */
  getOptions(): DocxRenderOptions {
    return { ...this.options };
  }

  /**
   * 获取可用的预设纸张大小
   *
   * @returns 预设纸张列表
   */
  static getAvailablePageSizes(): Array<{ name: string; width: number; height: number }> {
    return [
      { name: 'A4', width: 595, height: 842 }, // 210mm x 297mm
      { name: 'A5', width: 420, height: 595 }, // 148mm x 210mm
      { name: 'A3', width: 842, height: 1191 }, // 297mm x 420mm
      { name: 'Letter', width: 612, height: 792 }, // 8.5in x 11in
      { name: 'Legal', width: 612, height: 1008 } // 8.5in x 14in
    ];
  }

  /**
   * 设置页面背景色
   *
   * @param color - CSS 颜色值，传入 null 清除
   */
  setBackgroundColor(color: string | null): void {
    this.options.backgroundColor = color || undefined;
  }

  /**
   * 设置水印
   *
   * @param config - 水印配置，传入 null 清除水印
   */
  setWatermark(config: WatermarkConfig | null): void {
    this.options.watermark = config || undefined;
  }

  /**
   * 获取页面总数
   *
   * @returns 总页数
   */
  getPageCount(): number {
    return this.pageInfoList.length || 1;
  }

  /**
   * 获取指定页面信息
   *
   * @param pageIndex - 页面索引 (0-based)
   * @returns 页面信息或 null
   */
  getPageInfo(pageIndex: number): PageInfo | null {
    return this.pageInfoList[pageIndex] || null;
  }

  /**
   * 启用/禁用分页模式
   *
   * @param enable - 是否启用
   */
  setEnablePagination(enable: boolean): void {
    this.options.enablePagination = enable;
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.container.innerHTML = '';
    this.currentDoc = null;
    this.pageInfoList = [];
  }
}
