/**
 * 页面配置管理器
 *
 * 负责解析和管理 DOCX 页面配置，包括纸张大小、边距等
 */

import { UnitConverter } from '@ai-space/shared';
import type { DocxSection, ResolvedPageConfig, DocxRenderOptions } from '../types';

/**
 * 页面配置管理器类
 */
export class PageConfigManager {
  /**
   * 解析页面配置
   *
   * 根据分节配置和渲染选项，计算实际的页面配置
   *
   * @param section - 分节配置
   * @param options - 渲染选项
   * @returns 解析后的页面配置（单位：点）
   */
  static resolvePageConfig(section: DocxSection, options: DocxRenderOptions): ResolvedPageConfig {
    let pageWidth: number; // twips
    let pageHeight: number; // twips
    let margins = section.pageMargins;

    // 如果使用文档设置
    if (options.useDocumentSettings) {
      pageWidth = section.pageSize.width;
      pageHeight = section.pageSize.height;
      // 处理横向纸张方向：如果是横向且宽度小于高度，则交换宽高
      if (section.pageSize.orientation === 'landscape' && pageWidth < pageHeight) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      }

      // 如果没有明确定义宽高，使用默认
      if (!pageWidth) pageWidth = 11906; // A4
      if (!pageHeight) pageHeight = 16838; // A4
    } else {
      // 使用覆盖选项
      if (typeof options.pageSize === 'object') {
        pageWidth = UnitConverter.pointsToTwips(options.pageSize.width);
        pageHeight = UnitConverter.pointsToTwips(options.pageSize.height);
      } else {
        const preset = UnitConverter.getPresetPageSize(options.pageSize || 'A4');
        pageWidth = preset.width;
        pageHeight = preset.height;
      }

      // 使用自定义边距
      if (options.margins) {
        const defaultMargins = UnitConverter.getDefaultMargins();
        margins = {
          top:
            options.margins.top !== undefined ? UnitConverter.pointsToTwips(options.margins.top) : defaultMargins.top,
          right:
            options.margins.right !== undefined
              ? UnitConverter.pointsToTwips(options.margins.right)
              : defaultMargins.right,
          bottom:
            options.margins.bottom !== undefined
              ? UnitConverter.pointsToTwips(options.margins.bottom)
              : defaultMargins.bottom,
          left:
            options.margins.left !== undefined
              ? UnitConverter.pointsToTwips(options.margins.left)
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
  static getDefaultSection(): DocxSection {
    const defaultPageSize = UnitConverter.getPresetPageSize('A4');
    const defaultMargins = UnitConverter.getDefaultMargins();

    return {
      pageSize: defaultPageSize,
      pageMargins: defaultMargins
    };
  }

  /**
   * 获取可用的预设纸张大小
   *
   * @returns 预设纸张列表
   */
  static getAvailablePageSizes(): Array<{ name: string; width: number; height: number }> {
    const sizes = ['A4', 'A5', 'A3', 'Letter', 'Legal'] as const;
    return sizes.map(name => {
      const size = UnitConverter.getPresetPageSize(name);
      return {
        name,
        width: UnitConverter.twipsToPixels(size.width),
        height: UnitConverter.twipsToPixels(size.height)
      };
    });
  }
}
