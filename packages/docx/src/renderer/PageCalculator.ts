/**
 * 分页计算器
 *
 * 计算文档分页
 * 基于 DOM 测量进行分页计算
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import type { DocxDocument, DocxSection, DocxElement, ResolvedPageConfig } from '../types';

const log = Logger.createTagged('PageCalculator');

/**
 * 分页结果接口
 */
export interface PageBreakResult {
  /** 总页数 */
  totalPages: number;
  /** 每页包含的元素索引范围 */
  pageRanges: Array<{ start: number; end: number; sectionIndex: number }>;
}

/**
 * 分页计算器类
 */
export class PageCalculator {
  /** 临时测量容器 */
  private measureContainer: HTMLElement | null = null;

  /**
   * 构造函数
   *
   * @param document - 文档对象
   * @param sections - 分节列表
   */
  constructor(
    private document: DocxDocument,
    private sections: DocxSection[]
  ) {}

  /**
   * 计算分页
   *
   * 注意：此方法需要在 DOM 中进行测量，
   * 因此需要临时将内容渲染到隐藏容器中
   *
   * @returns 分页结果
   */
  calculate(): PageBreakResult {
    // 简化的分页计算
    // 实际实现需要进行 DOM 测量

    const result: PageBreakResult = {
      totalPages: 1,
      pageRanges: []
    };

    // 获取第一个分节配置
    const section = this.sections[0] || this.getDefaultSection();
    this.resolvePageConfig(section);

    // 简单估算：假设每页可容纳的元素数量
    const estimatedElementsPerPage = 20;
    const totalElements = this.document.body.length;
    const estimatedPages = Math.max(1, Math.ceil(totalElements / estimatedElementsPerPage));

    result.totalPages = estimatedPages;

    // 生成页面范围
    for (let i = 0; i < estimatedPages; i++) {
      const start = i * estimatedElementsPerPage;
      const end = Math.min((i + 1) * estimatedElementsPerPage, totalElements);
      result.pageRanges.push({ start, end, sectionIndex: 0 });
    }

    log.info(`估算页数: ${result.totalPages}`);
    return result;
  }

  /**
   * 解析页面配置
   *
   * @param section - 分节配置
   * @returns 解析后的页面配置
   */
  resolvePageConfig(section: DocxSection): ResolvedPageConfig {
    // 转换为像素

    // 转换为点
    const widthPt = UnitConverter.twipsToPoints(section.pageSize.width);
    const heightPt = UnitConverter.twipsToPoints(section.pageSize.height);

    const marginsPt = {
      top: UnitConverter.twipsToPoints(section.pageMargins.top),
      right: UnitConverter.twipsToPoints(section.pageMargins.right),
      bottom: UnitConverter.twipsToPoints(section.pageMargins.bottom),
      left: UnitConverter.twipsToPoints(section.pageMargins.left),
      header: UnitConverter.twipsToPoints(section.pageMargins.header),
      footer: UnitConverter.twipsToPoints(section.pageMargins.footer)
    };

    const contentWidth = widthPt - marginsPt.left - marginsPt.right;
    const contentHeight = heightPt - marginsPt.top - marginsPt.bottom;

    return {
      width: widthPt,
      height: heightPt,
      margins: marginsPt,
      contentWidth,
      contentHeight
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
   * 检查元素是否强制分页
   *
   * @param element - 文档元素
   * @returns 是否强制分页
   */
  isForcePageBreak(element: DocxElement): boolean {
    if (element.type === 'paragraph') {
      if (element.props.pageBreakBefore) {
        return true;
      }

      // 检查段落中是否包含分页符
      for (const child of element.children) {
        if (child.type === 'break' && child.breakType === 'page') {
          return true;
        }

        // 检查 Run 内部是否有分页符 (由 RunParser 解析为 \x0C)
        if (child.type === 'run' && child.text.includes('\x0C')) {
          return true;
        }
      }
    }

    if (element.type === 'sectionBreak') {
      const sectionType = element.sectPr.type;
      return sectionType === 'nextPage' || sectionType === 'evenPage' || sectionType === 'oddPage';
    }

    return false;
  }

  /**
   * 使用 DOM 测量计算实际分页
   *
   * @param renderedElements - 已渲染的元素数组
   * @param pageConfig - 页面配置
   * @returns 分页结果
   */
  calculateWithMeasurement(renderedElements: HTMLElement[], pageConfig: ResolvedPageConfig): PageBreakResult {
    const result: PageBreakResult = {
      totalPages: 1,
      pageRanges: []
    };

    let currentPageStart = 0;
    let currentHeight = 0;
    let currentSectionIndex = 0;
    const contentHeightPx = UnitConverter.pointsToPixels(pageConfig.contentHeight);

    for (let i = 0; i < renderedElements.length; i++) {
      const element = renderedElements[i];
      // Use getBoundingClientRect for sub-pixel precision
      const elementHeight = element.getBoundingClientRect().height;
      const docxElement = (element as any)._docxElement as DocxElement | undefined;

      // 检查强制分页
      const forceBreak = docxElement && this.isForcePageBreak(docxElement);

      // 检查是否需要分页
      // 如果强制分页，或者高度超标（且不是页面第一个元素）
      if ((forceBreak || currentHeight + elementHeight > contentHeightPx) && currentHeight > 0) {
        // 添加当前页范围
        result.pageRanges.push({
          start: currentPageStart,
          end: i,
          sectionIndex: currentSectionIndex
        });

        // 开始新页
        result.totalPages++;
        currentPageStart = i;
        currentHeight = elementHeight;
      } else {
        currentHeight += elementHeight;
      }

      // 更新分节索引
      // 如果当前元素是分节符，后续内容属于下一节
      if (docxElement && docxElement.type === 'sectionBreak') {
        currentSectionIndex = Math.min(currentSectionIndex + 1, this.sections.length - 1);

        // 如果分节符导致了分页（NextPage），上面的 forceBreak 逻辑已经处理了分页
        // 这里只需要确保新的页面使用新的 sectionIndex

        // 注意：如果是 Continuous 分节符且未分页，当前页面的 sectionIndex 可能不准确
        // 但由于 renderer 目前每页只支持一个配置，这是对 NextPage 场景的妥协支持
      }
    }

    // 添加最后一页
    if (currentPageStart < renderedElements.length) {
      result.pageRanges.push({
        start: currentPageStart,
        end: renderedElements.length,
        sectionIndex: currentSectionIndex
      });
    }

    return result;
  }

  /**
   * 获取页面内容区域高度（像素）
   *
   * @param section - 分节配置
   * @returns 高度（像素）
   */
  getContentHeight(section: DocxSection): number {
    const pageHeight = section.pageSize.height;
    const topMargin = section.pageMargins.top;
    const bottomMargin = section.pageMargins.bottom;
    const contentHeight = pageHeight - topMargin - bottomMargin;

    return UnitConverter.twipsToPixels(contentHeight);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.measureContainer && this.measureContainer.parentNode) {
      this.measureContainer.parentNode.removeChild(this.measureContainer);
    }
    this.measureContainer = null;
  }
}
