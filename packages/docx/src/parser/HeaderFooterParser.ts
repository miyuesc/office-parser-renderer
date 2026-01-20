/**
 * 页眉页脚解析器
 *
 * 解析 word/header{N}.xml 和 word/footer{N}.xml
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { ParagraphParser, ParagraphParserContext } from './ParagraphParser';
import { TableParser } from './TableParser';
import { RelationshipsParser, RelationshipInfo } from './RelationshipsParser';
import type { DocxElement, DocxHeaderFooter } from '../types';

const log = Logger.createTagged('HeaderFooterParser');

/**
 * 页眉页脚解析结果接口
 */
export interface HeaderFooterParseResult {
  /** 页眉映射 (rId -> 内容) */
  headers: Record<string, DocxHeaderFooter>;
  /** 页脚映射 (rId -> 内容) */
  footers: Record<string, DocxHeaderFooter>;
}

/**
 * 页眉页脚解析器类
 */
export class HeaderFooterParser {
  /**
   * 解析所有页眉页脚
   *
   * @param files - ZIP 文件映射
   * @param decoder - 文本解码器
   * @param relationships - 关系信息数组
   * @param context - 解析上下文
   * @returns 页眉页脚解析结果
   */
  static parse(
    files: Record<string, Uint8Array>,
    decoder: TextDecoder,
    relationships: RelationshipInfo[],
    context?: ParagraphParserContext
  ): HeaderFooterParseResult {
    const result: HeaderFooterParseResult = {
      headers: {},
      footers: {}
    };

    // 过滤出页眉和页脚关系
    const headerRels = RelationshipsParser.filterByType(relationships, RelationshipsParser.TYPES.HEADER);
    const footerRels = RelationshipsParser.filterByType(relationships, RelationshipsParser.TYPES.FOOTER);

    // 解析所有页眉
    for (const rel of headerRels) {
      const headerContent = this.parseHeaderFooterFile(files, decoder, rel.target, 'header', context);
      if (headerContent) {
        result.headers[rel.id] = headerContent;
      }
    }

    // 解析所有页脚
    for (const rel of footerRels) {
      const footerContent = this.parseHeaderFooterFile(files, decoder, rel.target, 'footer', context);
      if (footerContent) {
        result.footers[rel.id] = footerContent;
      }
    }

    log.info(`解析了 ${Object.keys(result.headers).length} 个页眉, ` + `${Object.keys(result.footers).length} 个页脚`);

    return result;
  }

  /**
   * 解析单个页眉/页脚文件
   *
   * @param files - ZIP 文件映射
   * @param decoder - 文本解码器
   * @param target - 目标路径
   * @param type - 类型（header 或 footer）
   * @param context - 解析上下文
   * @returns DocxHeaderFooter 对象
   */
  private static parseHeaderFooterFile(
    files: Record<string, Uint8Array>,
    decoder: TextDecoder,
    target: string,
    type: 'header' | 'footer',
    context?: ParagraphParserContext
  ): DocxHeaderFooter | null {
    // 解析路径
    const path = RelationshipsParser.resolveTarget('word/document.xml', target);
    const data = files[path];

    if (!data) {
      log.warn(`${type} 文件不存在: ${path}`);
      return null;
    }

    try {
      const xml = decoder.decode(data);
      const content = this.parseContent(xml, type, context);

      // 从文件名提取类型信息
      const fileName = path.split('/').pop() || '';
      let headerType: DocxHeaderFooter['type'] = 'default';
      if (fileName.includes('first')) {
        headerType = 'first';
      } else if (fileName.includes('even')) {
        headerType = 'even';
      }

      return {
        id: target,
        type: headerType,
        content
      };
    } catch (e) {
      log.error(`解析 ${type} 失败: ${path}`, e);
      return null;
    }
  }

  /**
   * 解析页眉/页脚内容
   *
   * @param xml - XML 内容
   * @param type - 类型
   * @param context - 解析上下文
   * @returns 元素数组
   */
  private static parseContent(xml: string, type: 'header' | 'footer', context?: ParagraphParserContext): DocxElement[] {
    const elements: DocxElement[] = [];
    const doc = XmlUtils.parse(xml);

    // 根据类型选择根元素
    const rootTagName = type === 'header' ? 'hdr' : 'ftr';
    const root = XmlUtils.query(doc, `w\\:${rootTagName}, ${rootTagName}`);

    if (!root) {
      log.warn(`未找到 ${type} 根元素`);
      return elements;
    }

    // 解析子元素
    for (const child of Array.from(root.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 'p':
          const para = ParagraphParser.parse(child, context);
          elements.push(para);
          break;

        case 'tbl':
          const table = TableParser.parse(child, context);
          elements.push(table);
          break;

        case 'sdt':
          const sdtContent = XmlUtils.query(child, 'w\\:sdtContent, sdtContent');
          if (sdtContent) {
            const sdtElements = this.parseContentNode(sdtContent, context);
            elements.push(...sdtElements);
          }
          break;

        default:
          log.debug(`未处理的 ${type} 子元素: ${localName}`);
          break;
      }
    }

    return elements;
  }

  /**
   * 解析内容节点
   *
   * @param node - 内容节点
   * @param context - 解析上下文
   * @returns 元素数组
   */
  private static parseContentNode(node: Element, context?: ParagraphParserContext): DocxElement[] {
    const elements: DocxElement[] = [];

    for (const child of Array.from(node.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 'p':
          const para = ParagraphParser.parse(child, context);
          elements.push(para);
          break;

        case 'tbl':
          const table = TableParser.parse(child, context);
          elements.push(table);
          break;

        default:
          break;
      }
    }

    return elements;
  }

  /**
   * 提取页眉/页脚中的纯文本
   *
   * @param headerFooter - 页眉/页脚对象
   * @returns 纯文本
   */
  static extractText(headerFooter: DocxHeaderFooter): string {
    const parts: string[] = [];

    for (const element of headerFooter.content) {
      if (element.type === 'paragraph') {
        for (const child of element.children) {
          if (child.type === 'run') {
            parts.push(child.text);
          }
        }
      }
    }

    return parts.join('');
  }

  /**
   * 检查页眉/页脚是否包含页码域
   *
   * @param headerFooter - 页眉/页脚对象
   * @returns 是否包含页码
   */
  static containsPageNumber(headerFooter: DocxHeaderFooter): boolean {
    for (const element of headerFooter.content) {
      if (element.type === 'paragraph') {
        for (const child of element.children) {
          if (child.type === 'field') {
            const instruction = child.instruction.toUpperCase();
            if (instruction.includes('PAGE') || instruction.includes('NUMPAGES')) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * 获取页眉/页脚中的域代码
   *
   * @param headerFooter - 页眉/页脚对象
   * @returns 域代码列表
   */
  static getFieldCodes(headerFooter: DocxHeaderFooter): string[] {
    const fields: string[] = [];

    for (const element of headerFooter.content) {
      if (element.type === 'paragraph') {
        for (const child of element.children) {
          if (child.type === 'field') {
            fields.push(child.instruction);
          }
        }
      }
    }

    return fields;
  }
}
