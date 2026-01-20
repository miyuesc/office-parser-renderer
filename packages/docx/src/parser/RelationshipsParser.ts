/**
 * 关系解析器
 *
 * 解析 OOXML 关系文件 (.rels)
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';

const log = Logger.createTagged('RelationshipsParser');

/**
 * 关系信息接口
 */
export interface RelationshipInfo {
  /** 关系 ID */
  id: string;
  /** 目标路径 */
  target: string;
  /** 关系类型 */
  type: string;
  /** 目标模式（Internal/External） */
  targetMode?: 'Internal' | 'External';
}

/**
 * 关系解析器类
 */
export class RelationshipsParser {
  /** 关系类型常量 */
  static readonly TYPES = {
    /** 文档 */
    DOCUMENT: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
    /** 样式 */
    STYLES: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
    /** 编号 */
    NUMBERING: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
    /** 设置 */
    SETTINGS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
    /** 字体表 */
    FONT_TABLE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',
    /** 主题 */
    THEME: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
    /** 页眉 */
    HEADER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
    /** 页脚 */
    FOOTER: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
    /** 图片 */
    IMAGE: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
    /** 超链接 */
    HYPERLINK: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
    /** 批注 */
    COMMENTS: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
    /** 脚注 */
    FOOTNOTES: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes',
    /** 尾注 */
    ENDNOTES: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes',
    /** 图表 */
    CHART: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart'
  };

  /**
   * 解析关系 XML
   *
   * @param xml - 关系 XML 字符串
   * @returns 关系 ID 到目标路径的映射
   */
  static parse(xml: string): Record<string, string> {
    const result: Record<string, string> = {};

    try {
      const doc = XmlUtils.parse(xml);
      const relationships = XmlUtils.queryAll(doc, 'Relationship');

      relationships.forEach((rel: Element) => {
        const id = rel.getAttribute('Id');
        const target = rel.getAttribute('Target');

        if (id && target) {
          result[id] = target;
        }
      });

      log.debug(`解析了 ${Object.keys(result).length} 个关系`);
    } catch (e) {
      log.error('解析关系文件失败', e);
    }

    return result;
  }

  /**
   * 解析关系 XML（详细信息版本）
   *
   * @param xml - 关系 XML 字符串
   * @returns 关系信息数组
   */
  static parseDetailed(xml: string): RelationshipInfo[] {
    const result: RelationshipInfo[] = [];

    try {
      const doc = XmlUtils.parse(xml);
      const relationships = XmlUtils.queryAll(doc, 'Relationship');

      relationships.forEach((rel: Element) => {
        const id = rel.getAttribute('Id');
        const target = rel.getAttribute('Target');
        const type = rel.getAttribute('Type');
        const targetMode = rel.getAttribute('TargetMode') as 'Internal' | 'External' | null;

        if (id && target && type) {
          result.push({
            id,
            target,
            type,
            targetMode: targetMode || 'Internal'
          });
        }
      });

      log.debug(`解析了 ${result.length} 个关系（详细）`);
    } catch (e) {
      log.error('解析关系文件失败', e);
    }

    return result;
  }

  /**
   * 根据类型过滤关系
   *
   * @param relationships - 关系信息数组
   * @param type - 关系类型
   * @returns 过滤后的关系信息数组
   */
  static filterByType(relationships: RelationshipInfo[], type: string): RelationshipInfo[] {
    return relationships.filter(rel => rel.type === type);
  }

  /**
   * 获取指定类型的第一个关系目标
   *
   * @param relationships - 关系信息数组
   * @param type - 关系类型
   * @returns 目标路径，如果不存在返回 undefined
   */
  static getFirstByType(relationships: RelationshipInfo[], type: string): string | undefined {
    const rel = relationships.find(r => r.type === type);
    return rel?.target;
  }

  /**
   * 解析包级别关系文件
   *
   * @param files - ZIP 文件映射
   * @param decoder - 文本解码器
   * @returns 关系信息数组
   */
  static parsePackageRels(files: Record<string, Uint8Array>, decoder: TextDecoder): RelationshipInfo[] {
    const relsPath = '_rels/.rels';
    const data = files[relsPath];

    if (!data) {
      log.warn('包级别关系文件不存在');
      return [];
    }

    const xml = decoder.decode(data);
    return this.parseDetailed(xml);
  }

  /**
   * 解析文档级别关系文件
   *
   * @param files - ZIP 文件映射
   * @param decoder - 文本解码器
   * @returns 关系信息数组
   */
  static parseDocumentRels(files: Record<string, Uint8Array>, decoder: TextDecoder): RelationshipInfo[] {
    const relsPath = 'word/_rels/document.xml.rels';
    const data = files[relsPath];

    if (!data) {
      log.warn('文档级别关系文件不存在');
      return [];
    }

    const xml = decoder.decode(data);
    return this.parseDetailed(xml);
  }

  /**
   * 解析指定文件的关系
   *
   * @param files - ZIP 文件映射
   * @param decoder - 文本解码器
   * @param filePath - 文件路径（如 word/header1.xml）
   * @returns 关系信息数组
   */
  static parseFileRels(files: Record<string, Uint8Array>, decoder: TextDecoder, filePath: string): RelationshipInfo[] {
    // 构造关系文件路径：word/header1.xml -> word/_rels/header1.xml.rels
    const parts = filePath.split('/');
    const fileName = parts.pop() || '';
    const dirPath = parts.join('/');
    const relsPath = dirPath ? `${dirPath}/_rels/${fileName}.rels` : `_rels/${fileName}.rels`;

    const data = files[relsPath];
    if (!data) {
      return [];
    }

    const xml = decoder.decode(data);
    return this.parseDetailed(xml);
  }

  /**
   * 解析目标路径（处理相对路径）
   *
   * @param basePath - 基础路径
   * @param target - 目标路径
   * @returns 完整路径
   */
  static resolveTarget(basePath: string, target: string): string {
    // 如果是绝对路径，去掉开头的 /
    if (target.startsWith('/')) {
      return target.substring(1);
    }

    // 处理相对路径
    const baseParts = basePath.split('/');
    baseParts.pop(); // 移除文件名

    const targetParts = target.split('/');
    for (const part of targetParts) {
      if (part === '..') {
        baseParts.pop();
      } else if (part !== '.') {
        baseParts.push(part);
      }
    }

    return baseParts.join('/');
  }
}
