/**
 * 页面布局管理器
 *
 * 负责创建 DOCX 页面容器、内容区域和页面装饰元素
 */

import { UnitConverter } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import type { ResolvedPageConfig, DocxSection, DocxRenderOptions } from '../types';

const log = Logger.createTagged('PageLayoutManager');

/**
 * 页面布局管理器类
 */
export class PageLayoutManager {
  /**
   * 创建页面容器
   *
   * @param config - 页面配置
   * @param options - 渲染选项
   * @param section - 可选的分节配置（用于获取背景色等）
   * @param docBackground - 文档背景色
   * @param isCover - 是否为封面页
   * @returns 页面元素
   */
  static createPageContainer(
    config: ResolvedPageConfig,
    options: DocxRenderOptions,
    section?: DocxSection,
    docBackground?: string,
    isCover: boolean = false
  ): HTMLElement {
    const page = document.createElement('div');
    page.className = 'docx-page';

    const style = page.style;
    style.width = `${config.width}pt`;
    style.height = `${config.height}pt`;

    // 封面页超出隐藏，非封面页正常显示
    style.overflow = isCover ? 'hidden' : 'visible';

    style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    style.position = 'relative';
    style.boxSizing = 'border-box';

    // 应用背景色
    // 优先使用 API 设置的值，其次使用文档解析的值（如果启用）
    // Section background > Document background
    const bgColor =
      options.backgroundColor ||
      (options.useDocumentBackground !== false ? section?.backgroundColor || docBackground : undefined);

    style.backgroundColor = bgColor || 'white';

    // 应用缩放
    if (options.scale && options.scale !== 1) {
      style.transform = `scale(${options.scale})`;
      style.transformOrigin = 'top center';
    }

    // 调试模式下显示边界
    if (options.debug) {
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
  static addCornerMarks(page: HTMLElement, config: ResolvedPageConfig): void {
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
   * @param options - 渲染选项
   * @param section - 分节配置（用于分栏）
   * @returns 内容区域元素
   */
  static createContentArea(config: ResolvedPageConfig, options: DocxRenderOptions, section?: DocxSection): HTMLElement {
    const content = document.createElement('div');
    content.className = 'docx-content';

    const style = content.style;
    // 设置内边距（对应页边距）
    style.paddingTop = `${config.margins.top}pt`;
    style.paddingRight = `${config.margins.right}pt`;
    style.paddingBottom = `${config.margins.bottom}pt`;
    style.paddingLeft = `${config.margins.left}pt`;
    style.boxSizing = 'border-box';
    // 内容区域高度匹配页面高度
    style.height = '100%';

    // 处理分栏布局
    if (section?.columns && section.columns.num > 1) {
      // 设置分栏数量
      style.columnCount = String(section.columns.num);

      // 栏间距（从 twips 转换为像素）
      if (section.columns.space) {
        const gapPx = UnitConverter.twipsToPixels(section.columns.space);
        style.columnGap = `${gapPx}px`;
      }

      // 分隔线样式
      if (section.columns.sep) {
        style.columnRule = '1px solid #999';
      }

      // 防止内容在栏之间断开
      style.columnFill = 'auto';

      // 输出分栏渲染日志
      log.debug('渲染分栏布局', {
        num: section.columns.num,
        space: section.columns.space,
        gapPx: section.columns.space ? UnitConverter.twipsToPixels(section.columns.space) : 0,
        sep: section.columns.sep
      });
    }

    // 调试模式下显示边界
    if (options.debug) {
      style.outline = '1px dashed blue';
    }

    return content;
  }
}
