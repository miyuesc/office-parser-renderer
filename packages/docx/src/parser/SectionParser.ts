/**
 * 分节属性解析器
 *
 * 解析 w:sectPr 元素
 * 处理页面大小、页边距、页眉页脚引用等
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { UnitConverter } from '@ai-space/shared';
import type { DocxSection, PageSize, PageMargins, ColumnConfig, LineNumberConfig } from '../types';

const log = Logger.createTagged('SectionParser');

/**
 * 分节解析器类
 */
export class SectionParser {
  /**
   * 解析分节属性
   *
   * @param node - sectPr 元素
   * @returns 分节对象
   */
  static parse(node: Element): DocxSection {
    const section: DocxSection = {
      pageSize: this.parsePageSize(node),
      pageMargins: this.parsePageMargins(node)
    };

    // 解析分节类型
    const typeNode = XmlUtils.query(node, 'w\\:type, type');
    if (typeNode) {
      const typeVal = typeNode.getAttribute('w:val');
      if (typeVal) {
        section.type = typeVal as DocxSection['type'];
      }
    }

    // 解析首页不同
    const titlePgNode = XmlUtils.query(node, 'w\\:titlePg, titlePg');
    if (titlePgNode) {
      section.titlePg = true;
    }

    // 解析分栏
    const colsNode = XmlUtils.query(node, 'w\\:cols, cols');
    if (colsNode) {
      section.columns = this.parseColumns(colsNode);
    }

    // 解析行号
    const lnNumTypeNode = XmlUtils.query(node, 'w\\:lnNumType, lnNumType');
    if (lnNumTypeNode) {
      section.lineNumbers = this.parseLineNumbers(lnNumTypeNode);
    }

    // 解析页码起始值
    const pgNumTypeNode = XmlUtils.query(node, 'w\\:pgNumType, pgNumType');
    if (pgNumTypeNode) {
      const start = pgNumTypeNode.getAttribute('w:start');
      if (start) {
        section.pageNumberStart = parseInt(start, 10);
      }
    }

    // 解析页眉引用
    const headerRefs = XmlUtils.queryAll(node, 'w\\:headerReference, headerReference');
    headerRefs.forEach((ref: Element) => {
      const type = ref.getAttribute('w:type');
      const id = ref.getAttribute('r:id');
      if (id) {
        if (type === 'first') {
          section.firstHeader = { id, type: 'first', content: [] };
        } else if (type === 'even') {
          section.evenHeader = { id, type: 'even', content: [] };
        } else {
          section.header = { id, type: 'default', content: [] };
        }
      }
    });

    // 解析页脚引用
    const footerRefs = XmlUtils.queryAll(node, 'w\\:footerReference, footerReference');
    footerRefs.forEach((ref: Element) => {
      const type = ref.getAttribute('w:type');
      const id = ref.getAttribute('r:id');
      if (id) {
        if (type === 'first') {
          section.firstFooter = { id, type: 'first', content: [] };
        } else if (type === 'even') {
          section.evenFooter = { id, type: 'even', content: [] };
        } else {
          section.footer = { id, type: 'default', content: [] };
        }
      }
    });

    // 解析页面背景色
    const bgNode = XmlUtils.query(node, 'w\\:background, background');
    if (bgNode) {
      const color = bgNode.getAttribute('w:color');
      if (color && color !== 'auto') {
        section.backgroundColor = '#' + color;
      }
    }

    log.debug('解析分节属性', section);
    return section;
  }

  /**
   * 解析页面大小
   *
   * @param sectPr - sectPr 元素
   * @returns 页面大小对象
   */
  private static parsePageSize(sectPr: Element): PageSize {
    const pgSz = XmlUtils.query(sectPr, 'w\\:pgSz, pgSz');

    // 默认 A4 纸张大小
    const defaultSize = UnitConverter.getPresetPageSize('A4');

    if (!pgSz) {
      return {
        width: defaultSize.width,
        height: defaultSize.height,
        orientation: 'portrait'
      };
    }

    const width = pgSz.getAttribute('w:w');
    const height = pgSz.getAttribute('w:h');
    const orient = pgSz.getAttribute('w:orient');
    const code = pgSz.getAttribute('w:code');

    return {
      width: width ? parseInt(width, 10) : defaultSize.width,
      height: height ? parseInt(height, 10) : defaultSize.height,
      orientation: orient === 'landscape' ? 'landscape' : 'portrait',
      code: code ? parseInt(code, 10) : undefined
    };
  }

  /**
   * 解析页边距
   *
   * @param sectPr - sectPr 元素
   * @returns 页边距对象
   */
  private static parsePageMargins(sectPr: Element): PageMargins {
    const pgMar = XmlUtils.query(sectPr, 'w\\:pgMar, pgMar');

    // 默认页边距
    const defaults = UnitConverter.getDefaultMargins();

    if (!pgMar) {
      return defaults;
    }

    return {
      top: this.parseMargin(pgMar, 'top', defaults.top),
      right: this.parseMargin(pgMar, 'right', defaults.right),
      bottom: this.parseMargin(pgMar, 'bottom', defaults.bottom),
      left: this.parseMargin(pgMar, 'left', defaults.left),
      header: this.parseMargin(pgMar, 'header', defaults.header),
      footer: this.parseMargin(pgMar, 'footer', defaults.footer),
      gutter: this.parseMargin(pgMar, 'gutter', defaults.gutter)
    };
  }

  /**
   * 解析单个边距值
   *
   * @param pgMar - pgMar 元素
   * @param attr - 属性名
   * @param defaultValue - 默认值
   * @returns 边距值
   */
  private static parseMargin(pgMar: Element, attr: string, defaultValue: number): number {
    const value = pgMar.getAttribute(`w:${attr}`);
    if (value) {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  /**
   * 解析分栏配置
   *
   * @param colsNode - cols 元素
   * @returns 分栏配置
   */
  private static parseColumns(colsNode: Element): ColumnConfig {
    // 解析分栏数量，默认为 1
    const num = parseInt(colsNode.getAttribute('w:num') || '1', 10);
    // 解析栏间距（twips），默认 720 twips（约 0.5 英寸）
    const space = parseInt(colsNode.getAttribute('w:space') || '720', 10);
    // 是否等宽，默认为 true
    const equalWidth = colsNode.getAttribute('w:equalWidth') !== '0';
    // 是否显示分隔线
    const sep = colsNode.getAttribute('w:sep') === '1';

    const config: ColumnConfig = {
      num,
      space,
      equalWidth,
      sep
    };

    // 解析非等宽列的具体配置
    if (!equalWidth) {
      const colNodes = XmlUtils.queryAll(colsNode, 'w\\:col, col');
      if (colNodes.length > 0) {
        config.cols = colNodes.map((col: Element) => ({
          width: parseInt(col.getAttribute('w:w') || '0', 10),
          space: parseInt(col.getAttribute('w:space') || '0', 10)
        }));
      }
    }

    // 输出详细的分栏配置日志
    log.debug('解析分栏配置', {
      num: config.num,
      space: config.space,
      equalWidth: config.equalWidth,
      sep: config.sep,
      cols: config.cols
    });

    return config;
  }

  /**
   * 解析行号配置
   *
   * @param lnNumNode - lnNumType 元素
   * @returns 行号配置
   */
  private static parseLineNumbers(lnNumNode: Element): LineNumberConfig {
    return {
      start: parseInt(lnNumNode.getAttribute('w:start') || '1', 10),
      countBy: parseInt(lnNumNode.getAttribute('w:countBy') || '1', 10),
      distance: parseInt(lnNumNode.getAttribute('w:distance') || '360', 10),
      restart: (lnNumNode.getAttribute('w:restart') || 'newPage') as LineNumberConfig['restart']
    };
  }

  /**
   * 从纸张代码获取纸张大小
   *
   * @param code - 纸张代码
   * @returns 纸张大小 (twips) 或 null
   */
  static getPageSizeByCode(code: number): { width: number; height: number } | null {
    // 常见纸张代码映射（单位：twips）
    const paperSizes: Record<number, { width: number; height: number }> = {
      1: { width: 12240, height: 15840 }, // Letter (8.5" x 11")
      5: { width: 12240, height: 20160 }, // Legal (8.5" x 14")
      9: { width: 11906, height: 16838 }, // A4 (210mm x 297mm)
      11: { width: 10318, height: 14570 }, // A5 (148mm x 210mm)
      8: { width: 16838, height: 23811 }, // A3 (297mm x 420mm)
      12: { width: 7200, height: 10318 } // A6 (105mm x 148mm)
    };

    return paperSizes[code] || null;
  }

  /**
   * 计算内容区域尺寸
   *
   * @param section - 分节配置
   * @returns 内容区域尺寸 (twips)
   */
  static calculateContentArea(section: DocxSection): { width: number; height: number } {
    const { pageSize, pageMargins } = section;

    // 考虑纸张方向
    let width = pageSize.width;
    let height = pageSize.height;

    if (pageSize.orientation === 'landscape' && width < height) {
      [width, height] = [height, width];
    }

    // 减去页边距
    const contentWidth = width - pageMargins.left - pageMargins.right - pageMargins.gutter;
    const contentHeight = height - pageMargins.top - pageMargins.bottom;

    return { width: contentWidth, height: contentHeight };
  }

  /**
   * 计算页眉区域高度
   *
   * @param section - 分节配置
   * @returns 页眉区域高度 (twips)
   */
  static calculateHeaderHeight(section: DocxSection): number {
    return section.pageMargins.top - section.pageMargins.header;
  }

  /**
   * 计算页脚区域高度
   *
   * @param section - 分节配置
   * @returns 页脚区域高度 (twips)
   */
  static calculateFooterHeight(section: DocxSection): number {
    return section.pageMargins.bottom - section.pageMargins.footer;
  }

  /**
   * 获取默认分节配置
   *
   * @returns 默认分节配置
   */
  static getDefault(): DocxSection {
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
}
