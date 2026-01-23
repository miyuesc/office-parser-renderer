/**
 * DOCX 主渲染器
 *
 * 负责将解析后的 DOCX 文档渲染到 DOM
 */

import { Logger } from '../utils/Logger';
import { PageCalculator } from './PageCalculator';
import { ParagraphRenderer, ParagraphRenderContext } from './ParagraphRenderer';
import { TableRenderer } from './TableRenderer';
import { DrawingRenderer } from './DrawingRenderer';
import { HeaderFooterRenderer } from './HeaderFooterRenderer';
import { ListCounter } from './ListCounter';
import { PageConfigManager } from './PageConfigManager';
import { WatermarkRenderer } from './WatermarkRenderer';
import { PageLayoutManager } from './PageLayoutManager';
import { StyleInjector } from './StyleInjector';
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
  useDocumentWatermark: true,
  injectStyles: true // 默认自动注入样式，设为 false 时需手动引入 CSS
};

/**
 * DOCX 渲染器类
 *
 * 核心逻辑：
 * 负责将结构化的 DocxDocument 对象渲染为浏览器可显示的 DOM 结构。
 * 支持两种模式：
 * 1. 单页模式 (Single Page)：所有内容在一个连续的容器中渲染，类似 Web 视图。
 * 2. 分页模式 (Pagination)：模拟真实打印分页，精确计算元素高度并进行分页处理。
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
   * 渲染文档（入口方法）
   *
   * 核心逻辑：
   * 1. 初始化：清空容器，重置状态。
   * 2. 配置解析：解析文档首页的分节配置，确定页面尺寸等基准信息。
   * 3. 上下文构建：创建用于渲染段落、列表的上下文对象 (ParagraphRenderContext)。
   * 4. 模式分发：根据 `options.enablePagination` 决定调用单页渲染还是多页分页渲染。
   *
   * @param doc - 解析后的文档对象 (DocxDocument)
   * @returns Promise<DocxRenderResult> - 渲染结果信息，包含生成的所有页面元素
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
      const section = doc.sections[0] || PageConfigManager.getDefaultSection();
      const pageConfig = PageConfigManager.resolvePageConfig(section, this.options);

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
   * 单页渲染模式（不分页）
   *
   * 核心逻辑：
   * 1. 创建页面容器：创建一个单一的、连续的页面容器，高度不限。
   * 2. 渲染背景与水印：如果配置启用，应用文档背景色和水印层。
   * 3. 渲染组件：依次渲染页眉、页脚（除封面外）。
   * 4. 内容流渲染：
   *    - 遍历文档 Body 中的所有元素。
   *    - 遇到分节符 (Section Break) 时，应用新的分栏配置创建新的内容区块。
   *    - 调用 `renderElement` 将元素渲染到底层 DOM 并通过 `appendChild` 加入文档流。
   *
   * @param doc - 文档对象
   * @param section - 初始分节
   * @param pageConfig - 初始页面配置
   * @param context - 渲染上下文
   * @returns DocxRenderResult - 渲染结果
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
    const pageContainer = PageLayoutManager.createPageContainer(
      pageConfig,
      this.options,
      section,
      this.currentDoc?.background,
      true
    );
    this.container.appendChild(pageContainer);

    // 渲染水印层（在内容下方）
    // 优先使用 API 设置的值，其次使用文档解析的值（如果启用）
    const watermarkConfig =
      this.options.watermark || (this.options.useDocumentWatermark !== false ? section.watermark : undefined);
    if (watermarkConfig) {
      const watermarkLayer = WatermarkRenderer.createWatermarkLayer(watermarkConfig);
      pageContainer.appendChild(watermarkLayer);
    }

    // 创建内容区域
    // 重要：第一个分节的配置是 sections[0]（如果存在的话）
    // 在 OOXML 中，sectPr 定义的是该段落及其之前内容的分节属性
    const firstSection = doc.sections[0] || section;
    const firstSectionConfig = PageConfigManager.resolvePageConfig(firstSection, this.options);
    const contentArea = PageLayoutManager.createContentArea(firstSectionConfig, this.options, firstSection);
    pageContainer.appendChild(contentArea);

    // 输出第一个分节的配置日志
    log.debug('第一个分节配置', {
      columns: firstSection.columns,
      pageSize: firstSection.pageSize
    });

    // 封面页不渲染页眉页脚
    // 注意：这里 isCover = true 表示是第一页
    // 封面页通常不显示页眉页脚，即使文档中定义了它们
    const isCoverPage = true; // 单页模式下第一页视为封面

    // 渲染页眉（封面页跳过）
    if (this.options.showHeaderFooter && section.header && !isCoverPage) {
      const header = HeaderFooterRenderer.renderHeader(section.header, section, {
        ...context,
        pageNumber: 1,
        totalPages: 1
      });
      if (header) {
        pageContainer.appendChild(header);
      }
    }

    // 渲染页脚（封面页跳过）
    if (this.options.showHeaderFooter && section.footer && !isCoverPage) {
      const footer = HeaderFooterRenderer.renderFooter(section.footer, section, {
        ...context,
        pageNumber: 1,
        totalPages: 1
      });
      if (footer) {
        pageContainer.appendChild(footer);
      }
    }

    // 渲染文档内容
    // 需要根据分节符分隔内容，每个分节使用自己的配置
    let currentSectionIndex = 0;
    let currentSection = firstSection;
    context.section = currentSection;

    // 创建当前分节的内容区域
    let currentContentArea = contentArea;

    for (const element of doc.body) {
      // 遇到分节符时，创建新的内容区域来应用新分节的分栏配置
      if (element.type === 'sectionBreak') {
        currentSectionIndex++;
        const nextSection = doc.sections[currentSectionIndex];

        log.debug(`处理分节符 #${currentSectionIndex}`, {
          hasSection: !!nextSection,
          columns: nextSection?.columns
        });

        if (nextSection) {
          currentSection = nextSection;
          context.section = currentSection;

          // 为新分节创建新的内容区域（应用分栏配置）
          const nextPageConfig = PageConfigManager.resolvePageConfig(currentSection, this.options);
          currentContentArea = PageLayoutManager.createContentArea(nextPageConfig, this.options, currentSection);
          pageContainer.appendChild(currentContentArea);

          // 输出分节切换日志
          log.debug('切换到新分节', {
            sectionIndex: currentSectionIndex,
            columns: currentSection.columns?.num,
            type: currentSection.type
          });
        } else {
          log.warn(`未找到索引为 ${currentSectionIndex} 的分节配置`);
        }
        continue; // 分节符本身不需要渲染
      }

      // 渲染元素到当前分节的内容区域
      const rendered = this.renderElement(element, context);
      if (rendered) {
        currentContentArea.appendChild(rendered);
      }
    }

    // 回调
    this.options.onPageRender?.(0, pageContainer);

    // 应用样式表（可通过选项禁用，改为手动引入 CSS）
    if (this.options.injectStyles !== false) {
      StyleInjector.injectStyles();
    }

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
   *
   * 核心逻辑：
   * 1. 预渲染测量：
   *    - 创建一个不可见的测量容器。
   *    - 将所有元素预渲染到该容器中，获取其实际渲染高度。
   * 2. 分页计算：
   *    - 初始化 `PageCalculator`。
   *    - 遍历预渲染元素列表，累加高度。
   *    - 当高度超过内容区域高度时，触发分页断点。
   * 3. 实际页面生成：
   *    - 根据计算出的分页点 (Page Breaks)，创建多个页面容器。
   *    - 将预渲染的 DOM 节点（克隆或移动）分配到对应的页面中。
   *    - 为每一页独立渲染页眉和页脚（支持奇偶页不同）。
   *
   * @param doc - 文档对象
   * @param section - 初始分节
   * @param pageConfig - 初始页面配置
   * @param context - 渲染上下文
   * @returns DocxRenderResult - 渲染结果，包含多个页面元素
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

    let currentSectionIndex = 0;
    // Initial section
    context.section = doc.sections[0] || section;

    for (const element of doc.body) {
      const rendered = this.renderElement(element, context);
      if (rendered) {
        measureContainer.appendChild(rendered);
        renderedElements.push(rendered);
      }

      // Update section context after encountering a break
      if (element.type === 'sectionBreak') {
        currentSectionIndex++;
        if (doc.sections[currentSectionIndex]) {
          context.section = doc.sections[currentSectionIndex];
        }
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
      const currentPageConfig = PageConfigManager.resolvePageConfig(currentSection, this.options);

      // 创建页面容器
      const isCover = pageIndex === 0;
      const page = PageLayoutManager.createPageContainer(
        currentPageConfig,
        this.options,
        currentSection,
        doc.background,
        isCover
      );
      this.container.appendChild(page);

      // 渲染水印层
      // 优先使用 API 设置的值，其次使用文档解析的值（如果启用）
      const watermarkConfig =
        this.options.watermark || (this.options.useDocumentWatermark !== false ? currentSection.watermark : undefined);
      if (this.options.useDocumentWatermark && watermarkConfig) {
        const watermark = WatermarkRenderer.createWatermarkLayer(watermarkConfig);
        page.appendChild(watermark);
      }

      // 创建内容区域
      const contentArea = PageLayoutManager.createContentArea(currentPageConfig, this.options, currentSection);
      page.appendChild(contentArea);

      // 渲染页眉（封面页跳过）
      if (this.options.showHeaderFooter && !isCover) {
        const headerContent = HeaderFooterRenderer.selectHeader(section, pageIndex, doc.settings?.evenAndOddHeaders);
        const header = HeaderFooterRenderer.renderHeader(headerContent, section, {
          ...context,
          pageNumber,
          totalPages
        });
        if (header) {
          page.appendChild(header);
        }
      }

      // 渲染页脚（封面页跳过）
      if (this.options.showHeaderFooter && !isCover) {
        const footerContent = HeaderFooterRenderer.selectFooter(section, pageIndex, doc.settings?.evenAndOddHeaders);
        const footer = HeaderFooterRenderer.renderFooter(footerContent, section, {
          ...context,
          pageNumber,
          totalPages
        });
        if (footer) {
          page.appendChild(footer);
        }
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
      this.options.onPageRender?.(pageIndex, page);

      pageElements.push(page);
    }

    // 应用样式表（可通过选项禁用，改为手动引入 CSS）
    if (this.options.injectStyles !== false) {
      StyleInjector.injectStyles();
    }

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
   * 渲染单个元素
   *
   * 核心逻辑：
   * 根据元素类型 (paragraph, table, drawing, etc.) 分发给对应的专用渲染器。
   *
   * @param element - 文档元素对象
   * @param context - 渲染上下文，包含样式、列表状态等
   * @returns HTMLElement | null - 渲染生成的 DOM 节点，如果是分节符等非可视元素可能返回特殊的占位符或 null
   */
  private renderElement(element: DocxElement, context: ParagraphRenderContext): HTMLElement | null {
    let rendered: HTMLElement | null = null;

    switch (element.type) {
      case 'paragraph':
        // 渲染段落
        rendered = ParagraphRenderer.render(element, context);
        break;

      case 'table':
        // 渲染表格
        rendered = TableRenderer.render(element, context);
        break;

      case 'drawing':
        // 渲染绘图元素（图表、图片、形状）
        rendered = DrawingRenderer.render(element, {
          document: context.document,
          images: context.document?.images,
          section: context.section // 传递 section 信息用于定位计算
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
