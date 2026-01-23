/**
 * 文档内容解析器
 *
 * 解析 word/document.xml
 * 处理文档主体结构
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { ParagraphParser, ParagraphParserContext } from './ParagraphParser';
import { TableParser } from './TableParser';
import { SectionParser } from './SectionParser';
import type { DocxElement, DocxSection, Paragraph, SectionBreak } from '../types';

const log = Logger.createTagged('DocumentParser');

/**
 * 文档解析结果接口
 */
export interface DocumentParseResult {
  /** 文档主体元素 */
  body: DocxElement[];
  /** 分节列表 */
  sections: DocxSection[];
  /** 文档最后一个分节属性 */
  lastSection: DocxSection;
  /** 背景色 */
  background?: string;
}

/**
 * 文档解析器类
 */
export class DocumentParser {
  /**
   * 解析文档 XML
   *
   * 核心逻辑：
   * 1. 根节点解析：解析 XML 字符串为 DOM 树。
   * 2. 页面背景：提取文档背景色配置（如 <w:background>）。
   * 3. 主体定位：查找 `w:body` 节点。
   * 4. 递归解析：调用 `parseBody` 递归处理 Body 内部的所有子节点（段落、表格、结构化标签等）。
   * 5. 分节处理：提取并追加最后一个分节属性 (sectPr)，确保文档完整的分节结构。
   *
   * @param xml - document.xml 的内容字符串
   * @param context - 解析上下文，包含编号、样式等引用
   * @returns DocumentParseResult - 文档解析结果，包含解析出的元素树和分节信息
   */
  static parse(xml: string, context?: ParagraphParserContext): DocumentParseResult {
    const body: DocxElement[] = [];
    const sections: DocxSection[] = [];

    try {
      const doc = XmlUtils.parse(xml);

      // 解析背景色
      let background: string | undefined;
      const backgroundNode = XmlUtils.query(doc, 'w\\:background, background');
      if (backgroundNode) {
        // w:background usually has w:color attribute
        background = backgroundNode.getAttribute('w:color') || undefined;
        // Sometimes it has w:themeColor etc which we might process later?
        // For now just take color.
      }

      // 查找文档主体
      const bodyNode = XmlUtils.query(doc, 'w\\:body, body');
      if (!bodyNode) {
        log.error('未找到文档主体');
        return {
          body: [],
          sections: [SectionParser.getDefault()],
          lastSection: SectionParser.getDefault()
        };
      }

      // 解析主体内容
      const result = this.parseBody(bodyNode, context);
      body.push(...result.elements);
      sections.push(...result.sections);

      // 获取文档级分节属性（最后一个 sectPr）
      const lastSectPr = XmlUtils.query(bodyNode, 'w\\:sectPr, sectPr');
      const lastSection = lastSectPr ? SectionParser.parse(lastSectPr) : SectionParser.getDefault();

      // 始终添加最后一个分节（因为它定义了最后一部分内容的属性）
      sections.push(lastSection);

      log.info(`解析文档: ${body.length} 个元素, ${sections.length} 个分节`);

      return { body, sections, lastSection, background };
    } catch (e) {
      log.error('解析文档失败', e);
      return {
        body: [],
        sections: [SectionParser.getDefault()],
        lastSection: SectionParser.getDefault()
      };
    }
  }

  /**
   * 解析文档主体
   *
   * 核心逻辑：
   * 递归遍历 XML 节点，根据标签名分发解析任务：
   * - `w:p`: 解析段落，并检查段落属性中是否包含分节符。
   * - `w:tbl`: 解析表格。
   * - `w:sdt`: 递归解析结构化文档标签内容。
   * - `w:customXml`: 递归解析自定义 XML 内容。
   *
   * @param bodyNode - XML 元素节点 (如 w:body, w:sdtContent)
   * @param context - 解析上下文
   * @returns { elements, sections } - 解析出的文档元素列表和分节列表
   */
  public static parseBody(
    bodyNode: Element,
    context?: ParagraphParserContext
  ): { elements: DocxElement[]; sections: DocxSection[] } {
    const elements: DocxElement[] = [];
    const sections: DocxSection[] = [];

    for (const child of Array.from(bodyNode.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 'p':
          // 段落
          const para = ParagraphParser.parse(child, context);
          elements.push(para);

          // 检查段落中是否包含分节属性
          const sectPr = XmlUtils.query(child, 'w\\:pPr w\\:sectPr, pPr sectPr');
          if (sectPr) {
            const section = SectionParser.parse(sectPr);
            sections.push(section);

            // 添加分节符元素
            elements.push({
              type: 'sectionBreak',
              sectPr: section
            } as SectionBreak);
          }
          break;

        case 'tbl':
          // 表格
          const table = TableParser.parse(child, context);
          elements.push(table);
          break;

        case 'sdt':
          // 结构化文档标签（内容控件）
          const sdtContent = XmlUtils.query(child, 'w\\:sdtContent, sdtContent');
          if (sdtContent) {
            const sdtResult = this.parseBody(sdtContent, context);
            elements.push(...sdtResult.elements);
            sections.push(...sdtResult.sections);
          }
          break;

        case 'sectpr':
          // 文档级分节属性（在 parseDocument 中处理）
          break;

        case 'bookmarkstart':
        case 'bookmarkend':
          // 书签在段落级别处理
          break;

        case 'customxml':
          // 自定义 XML
          const customXmlContent = this.parseBody(child, context);
          elements.push(...customXmlContent.elements);
          sections.push(...customXmlContent.sections);
          break;

        default:
          log.debug(`未处理的文档主体元素: ${localName}`);
          break;
      }
    }

    return { elements, sections };
  }

  /**
   * 从 ZIP 文件中解析文档
   *
   * 核心逻辑：
   * 1. 从解压后的文件映射中读取 `word/document.xml`。
   * 2. 将二进制数据解码为文本字符串。
   * 3. 调用 `parse` 方法进行解析。
   *
   * @param files - ZIP 包中的文件映射 (路径 -> 数据)
   * @param decoder - 文本解码器
   * @param context - 解析上下文
   * @returns DocumentParseResult - 文档解析结果
   */
  static parseFromFiles(
    files: Record<string, Uint8Array>,
    decoder: TextDecoder,
    context?: ParagraphParserContext
  ): DocumentParseResult {
    const documentPath = 'word/document.xml';
    const data = files[documentPath];

    if (!data) {
      log.error('文档文件不存在');
      return {
        body: [],
        sections: [SectionParser.getDefault()],
        lastSection: SectionParser.getDefault()
      };
    }

    const xml = decoder.decode(data);
    return this.parse(xml, context);
  }

  /**
   * 提取文档中的所有段落
   *
   * @param elements - 文档元素列表
   * @returns 段落列表
   */
  static extractParagraphs(elements: DocxElement[]): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (const element of elements) {
      if (element.type === 'paragraph') {
        paragraphs.push(element);
      } else if (element.type === 'table') {
        // 递归提取表格中的段落
        for (const row of element.rows) {
          for (const cell of row.cells) {
            const cellParagraphs = this.extractParagraphs(cell.children);
            paragraphs.push(...cellParagraphs);
          }
        }
      }
    }

    return paragraphs;
  }

  /**
   * 提取文档纯文本
   *
   * @param elements - 文档元素列表
   * @returns 纯文本字符串
   */
  static extractText(elements: DocxElement[]): string {
    const parts: string[] = [];

    for (const element of elements) {
      if (element.type === 'paragraph') {
        const paraText = this.extractParagraphText(element);
        if (paraText) {
          parts.push(paraText);
        }
      } else if (element.type === 'table') {
        // 递归提取表格中的文本
        const tableText = this.extractText(element.rows.flatMap(row => row.cells.flatMap(cell => cell.children)));
        if (tableText) {
          parts.push(tableText);
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * 提取段落纯文本
   *
   * @param paragraph - 段落元素
   * @returns 纯文本字符串
   */
  private static extractParagraphText(paragraph: Paragraph): string {
    const parts: string[] = [];

    for (const child of paragraph.children) {
      if (child.type === 'run') {
        parts.push(child.text);
      } else if (child.type === 'tab') {
        parts.push('\t');
      } else if (child.type === 'break') {
        parts.push('\n');
      } else if (child.type === 'hyperlink') {
        for (const run of child.children) {
          parts.push(run.text);
        }
      }
    }

    return parts.join('');
  }
}
