/**
 * 页眉页脚渲染器
 *
 * 渲染页眉和页脚内容
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '@ai-space/shared';
import { ParagraphRenderer, ParagraphRenderContext } from './ParagraphRenderer';
import { TableRenderer } from './TableRenderer';
import { DrawingRenderer } from './DrawingRenderer';
import type { DocxHeaderFooter, DocxSection, DocxElement } from '../types';

const log = Logger.createTagged('HeaderFooterRenderer');

/**
 * 页眉页脚渲染上下文接口
 */
export interface HeaderFooterRenderContext extends ParagraphRenderContext {
  /** 当前页码 */
  pageNumber?: number;
  /** 总页数 */
  totalPages?: number;
}

/**
 * 页眉页脚渲染器类
 */
export class HeaderFooterRenderer {
  /**
   * 渲染页眉
   *
   * @param headerFooter - 页眉对象
   * @param section - 分节配置
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static renderHeader(
    headerFooter: DocxHeaderFooter | undefined,
    section: DocxSection,
    context?: HeaderFooterRenderContext
  ): HTMLElement | null {
    if (!headerFooter) {
      return null;
    }

    const container = document.createElement('div');
    container.className = 'docx-header';

    // 应用样式
    this.applyHeaderStyles(container, section);

    // 渲染内容
    if (headerFooter?.content) {
      this.renderContent(container, headerFooter.content, context);
    }

    return container;
  }

  /**
   * 渲染页脚
   *
   * @param headerFooter - 页脚对象
   * @param section - 分节配置
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static renderFooter(
    headerFooter: DocxHeaderFooter | undefined,
    section: DocxSection,
    context?: HeaderFooterRenderContext
  ): HTMLElement | null {
    if (!headerFooter) {
      return null;
    }

    const container = document.createElement('div');
    container.className = 'docx-footer';

    // 应用样式
    this.applyFooterStyles(container, section);

    // 渲染内容
    if (headerFooter?.content) {
      this.renderContent(container, headerFooter.content, context);
    }

    return container;
  }

  /**
   * 应用页眉样式
   *
   * @param container - 容器元素
   * @param section - 分节配置
   */
  private static applyHeaderStyles(container: HTMLElement, section: DocxSection): void {
    const style = container.style;

    // 位置
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.right = '0';

    // 高度
    const headerTopPx = UnitConverter.twipsToPixels(section.pageMargins.header);
    const topMarginPx = UnitConverter.twipsToPixels(section.pageMargins.top);
    const headerHeightPx = topMarginPx - headerTopPx;

    style.paddingTop = `${headerTopPx}px`;
    style.minHeight = `${headerHeightPx}px`;
    style.paddingLeft = `${UnitConverter.twipsToPixels(section.pageMargins.left)}px`;
    style.paddingRight = `${UnitConverter.twipsToPixels(section.pageMargins.right)}px`;

    // 边框（可选调试用）
    // style.borderBottom = '1px dashed #ccc';

    style.boxSizing = 'border-box';
  }

  /**
   * 应用页脚样式
   *
   * @param container - 容器元素
   * @param section - 分节配置
   */
  private static applyFooterStyles(container: HTMLElement, section: DocxSection): void {
    const style = container.style;

    // 位置
    style.position = 'absolute';
    style.bottom = '0';
    style.left = '0';
    style.right = '0';

    // 高度
    const footerBottomPx = UnitConverter.twipsToPixels(section.pageMargins.footer);
    const bottomMarginPx = UnitConverter.twipsToPixels(section.pageMargins.bottom);
    const footerHeightPx = bottomMarginPx - footerBottomPx;

    style.paddingBottom = `${footerBottomPx}px`;
    style.minHeight = `${footerHeightPx}px`;
    style.paddingLeft = `${UnitConverter.twipsToPixels(section.pageMargins.left)}px`;
    style.paddingRight = `${UnitConverter.twipsToPixels(section.pageMargins.right)}px`;

    // 边框（可选调试用）
    // style.borderTop = '1px dashed #ccc';

    style.boxSizing = 'border-box';
  }

  /**
   * 渲染页眉/页脚内容
   *
   * @param container - 容器元素
   * @param content - 内容元素数组
   * @param context - 渲染上下文
   */
  private static renderContent(
    container: HTMLElement,
    content: DocxElement[],
    context?: HeaderFooterRenderContext
  ): void {
    for (const element of content) {
      const rendered = this.renderElement(element, context);
      if (rendered) {
        container.appendChild(rendered);
      }
    }

    // 处理页码字段
    this.processPageFields(container, context);
  }

  /**
   * 渲染单个元素
   *
   * @param element - 文档元素
   * @param context - 渲染上下文
   * @returns HTMLElement 或 null
   */
  private static renderElement(element: DocxElement, context?: HeaderFooterRenderContext): HTMLElement | null {
    switch (element.type) {
      case 'paragraph':
        return ParagraphRenderer.render(element, context);
      case 'table':
        return TableRenderer.render(element, context);
      case 'drawing':
        return DrawingRenderer.render(element, {
          document: context?.document,
          images: context?.document?.images
        });
      default:
        log.debug(`未处理的页眉/页脚元素类型: ${element.type}`);
        return null;
    }
  }

  /**
   * 处理页码字段
   *
   * @param container - 容器元素
   * @param context - 渲染上下文
   */
  private static processPageFields(container: HTMLElement, context?: HeaderFooterRenderContext): void {
    // 查找并替换页码字段
    const pageFields = container.querySelectorAll('[data-field="PAGE"]');
    pageFields.forEach(field => {
      field.textContent = String(context?.pageNumber || 1);
    });

    // 查找并替换总页数字段
    const numPagesFields = container.querySelectorAll('[data-field="NUMPAGES"]');
    numPagesFields.forEach(field => {
      field.textContent = String(context?.totalPages || 1);
    });
  }

  /**
   * 根据页面位置选择正确的页眉
   *
   * @param section - 分节配置
   * @param pageIndex - 页面索引（0-based）
   * @param isEvenOddDifferent - 是否奇偶页不同
   * @returns 页眉对象或 undefined
   */
  static selectHeader(
    section: DocxSection,
    pageIndex: number,
    isEvenOddDifferent: boolean = false
  ): DocxHeaderFooter | undefined {
    // 首页
    if (pageIndex === 0 && section.titlePg) {
      return section.firstHeader;
    }

    // 偶数页
    if (isEvenOddDifferent && (pageIndex + 1) % 2 === 0 && section.evenHeader) {
      return section.evenHeader;
    }

    // 默认页眉
    return section.header;
  }

  /**
   * 根据页面位置选择正确的页脚
   *
   * @param section - 分节配置
   * @param pageIndex - 页面索引（0-based）
   * @param isEvenOddDifferent - 是否奇偶页不同
   * @returns 页脚对象或 undefined
   */
  static selectFooter(
    section: DocxSection,
    pageIndex: number,
    isEvenOddDifferent: boolean = false
  ): DocxHeaderFooter | undefined {
    // 首页
    if (pageIndex === 0 && section.titlePg) {
      return section.firstFooter;
    }

    // 偶数页
    if (isEvenOddDifferent && (pageIndex + 1) % 2 === 0 && section.evenFooter) {
      return section.evenFooter;
    }

    // 默认页脚
    return section.footer;
  }
}
