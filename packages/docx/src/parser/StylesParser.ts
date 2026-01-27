/**
 * 样式解析器
 *
 * 解析 word/styles.xml
 * 处理段落样式、字符样式、表格样式
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { RunParser } from './RunParser';
import { ParagraphParser } from './ParagraphParser';
import type {
  DocxStyles,
  DocxStyle,
  DocumentDefaults,
  LatentStyles,
  ParagraphProperties,
  RunProperties,
} from '../types';

const log = Logger.createTagged('StylesParser');

/**
 * 样式解析器类
 */
export class StylesParser {
  /**
   * 解析样式 XML
   *
   * @param xml - styles.xml 内容
   * @returns DocxStyles 对象
   */
  static parse(xml: string): DocxStyles {
    const result: DocxStyles = {
      styles: {},
    };

    try {
      const doc = XmlUtils.parse(xml);

      // 解析文档默认值
      const docDefaultsNode = XmlUtils.query(doc, 'w\\:docDefaults, docDefaults');
      if (docDefaultsNode) {
        result.docDefaults = this.parseDocDefaults(docDefaultsNode);
      }

      // 解析潜在样式
      const latentStylesNode = XmlUtils.query(doc, 'w\\:latentStyles, latentStyles');
      if (latentStylesNode) {
        result.latentStyles = this.parseLatentStyles(latentStylesNode);
      }

      // 解析样式定义
      const styleNodes = XmlUtils.queryAll(doc, 'w\\:style, style');
      styleNodes.forEach((node: Element) => {
        const style = this.parseStyle(node);
        if (style && style.styleId) {
          result.styles[style.styleId] = style;
        }
      });

      log.info(`解析了 ${Object.keys(result.styles).length} 个样式`);
    } catch (e) {
      log.error('解析样式文件失败', e);
    }

    return result;
  }

  /**
   * 解析文档默认值
   *
   * @param node - docDefaults 元素
   * @returns DocumentDefaults 对象
   */
  private static parseDocDefaults(node: Element): DocumentDefaults {
    const defaults: DocumentDefaults = {};

    // 默认运行属性
    const rPrDefault = XmlUtils.query(node, 'w\\:rPrDefault, rPrDefault');
    if (rPrDefault) {
      const rPr = XmlUtils.query(rPrDefault, 'w\\:rPr, rPr');
      if (rPr) {
        defaults.rPrDefault = RunParser.parseProperties(rPr);
      }
    }

    // 默认段落属性
    const pPrDefault = XmlUtils.query(node, 'w\\:pPrDefault, pPrDefault');
    if (pPrDefault) {
      const pPr = XmlUtils.query(pPrDefault, 'w\\:pPr, pPr');
      if (pPr) {
        defaults.pPrDefault = ParagraphParser.parseProperties(pPr);
      }
    }

    return defaults;
  }

  /**
   * 解析潜在样式配置
   *
   * @param node - latentStyles 元素
   * @returns LatentStyles 对象
   */
  private static parseLatentStyles(node: Element): LatentStyles {
    return {
      defLockedState: node.getAttribute('w:defLockedState') === '1',
      defUIPriority: parseInt(node.getAttribute('w:defUIPriority') || '99', 10),
      defSemiHidden: node.getAttribute('w:defSemiHidden') === '1',
      defUnhideWhenUsed: node.getAttribute('w:defUnhideWhenUsed') === '1',
      defQFormat: node.getAttribute('w:defQFormat') === '1',
      count: parseInt(node.getAttribute('w:count') || '0', 10),
    };
  }

  /**
   * 解析单个样式
   *
   * @param node - style 元素
   * @returns DocxStyle 对象
   */
  private static parseStyle(node: Element): DocxStyle | null {
    const styleId = node.getAttribute('w:styleId');
    const type = node.getAttribute('w:type');

    if (!styleId || !type) {
      return null;
    }

    const style: DocxStyle = {
      styleId,
      type: type as DocxStyle['type'],
    };

    // 样式名称
    const nameNode = XmlUtils.query(node, 'w\\:name, name');
    if (nameNode) {
      style.name = nameNode.getAttribute('w:val') || undefined;
    }

    // 基于的样式
    const basedOn = XmlUtils.query(node, 'w\\:basedOn, basedOn');
    if (basedOn) {
      style.basedOn = basedOn.getAttribute('w:val') || undefined;
    }

    // 下一段落样式
    const next = XmlUtils.query(node, 'w\\:next, next');
    if (next) {
      style.next = next.getAttribute('w:val') || undefined;
    }

    // 链接样式
    const link = XmlUtils.query(node, 'w\\:link, link');
    if (link) {
      style.link = link.getAttribute('w:val') || undefined;
    }

    // 默认样式
    const isDefault = node.getAttribute('w:default');
    style.isDefault = isDefault === '1' || isDefault === 'true';

    // UI 优先级
    const uiPriority = XmlUtils.query(node, 'w\\:uiPriority, uiPriority');
    if (uiPriority) {
      style.uiPriority = parseInt(uiPriority.getAttribute('w:val') || '99', 10);
    }

    // 半隐藏
    const semiHidden = XmlUtils.query(node, 'w\\:semiHidden, semiHidden');
    if (semiHidden) {
      style.semiHidden = true;
    }

    // 使用时取消隐藏
    const unhideWhenUsed = XmlUtils.query(node, 'w\\:unhideWhenUsed, unhideWhenUsed');
    if (unhideWhenUsed) {
      style.unhideWhenUsed = true;
    }

    // 快速样式
    const qFormat = XmlUtils.query(node, 'w\\:qFormat, qFormat');
    if (qFormat) {
      style.qFormat = true;
    }

    // 段落属性
    const pPr = XmlUtils.query(node, 'w\\:pPr, pPr');
    if (pPr) {
      style.pPr = ParagraphParser.parseProperties(pPr);
    }

    // 运行属性
    const rPr = XmlUtils.query(node, 'w\\:rPr, rPr');
    if (rPr) {
      style.rPr = RunParser.parseProperties(rPr);
    }

    // 表格样式相关（暂时简化处理）
    // TODO: 完整实现表格样式解析

    return style;
  }

  /**
   * 解析样式文件（从 ZIP 文件映射）
   *
   * @param files - ZIP 文件映射
   * @param decoder - 文本解码器
   * @returns DocxStyles 对象
   */
  static parseFromFiles(files: Record<string, Uint8Array>, decoder: TextDecoder): DocxStyles {
    const stylesPath = 'word/styles.xml';
    const data = files[stylesPath];

    if (!data) {
      log.warn('样式文件不存在');
      return { styles: {} };
    }

    const xml = decoder.decode(data);
    return this.parse(xml);
  }

  /**
   * 解析继承的样式属性
   * 递归合并基础样式的属性
   *
   * @param styles - 样式定义集合
   * @param styleId - 样式 ID
   * @param type - 属性类型（pPr 或 rPr）
   * @returns 合并后的属性
   */
  static resolveInheritedProperties<T extends 'pPr' | 'rPr'>(
    styles: DocxStyles,
    styleId: string,
    type: T,
  ): T extends 'pPr' ? ParagraphProperties : RunProperties {
    const visited = new Set<string>();
    const propertyChain: Array<ParagraphProperties | RunProperties> = [];

    let currentStyleId: string | undefined = styleId;

    // 收集继承链上的所有属性
    while (currentStyleId && !visited.has(currentStyleId)) {
      visited.add(currentStyleId);
      const style: DocxStyle = styles.styles[currentStyleId];

      if (style) {
        const props = style[type];
        if (props) {
          propertyChain.unshift(props as ParagraphProperties | RunProperties);
        }
        currentStyleId = style.basedOn;
      } else {
        break;
      }
    }

    // 添加文档默认值
    if (styles.docDefaults) {
      const defaultProps =
        type === 'pPr' ? styles.docDefaults.pPrDefault : styles.docDefaults.rPrDefault;

      if (defaultProps) {
        propertyChain.unshift(defaultProps as ParagraphProperties | RunProperties);
      }
    }

    // 合并所有属性
    let merged = {} as ParagraphProperties | RunProperties;
    for (const props of propertyChain) {
      merged = { ...merged, ...props } as ParagraphProperties | RunProperties;
    }

    return merged as T extends 'pPr' ? ParagraphProperties : RunProperties;
  }

  /**
   * 获取默认段落样式
   *
   * @param styles - 样式定义集合
   * @returns 默认段落样式 ID
   */
  static getDefaultParagraphStyle(styles: DocxStyles): string | undefined {
    for (const [id, style] of Object.entries(styles.styles)) {
      if (style.type === 'paragraph' && style.isDefault) {
        return id;
      }
    }
    return undefined;
  }

  /**
   * 获取默认字符样式
   *
   * @param styles - 样式定义集合
   * @returns 默认字符样式 ID
   */
  static getDefaultCharacterStyle(styles: DocxStyles): string | undefined {
    for (const [id, style] of Object.entries(styles.styles)) {
      if (style.type === 'character' && style.isDefault) {
        return id;
      }
    }
    return undefined;
  }
}
