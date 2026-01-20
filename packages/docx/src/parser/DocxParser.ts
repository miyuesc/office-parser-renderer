/**
 * DOCX 主解析器
 *
 * 解析完整的 DOCX 文件，协调各个子解析器
 */

import { ZipService } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { ErrorHandler, DocxErrorCode } from '../utils/ErrorHandler';
import { DocumentParser } from './DocumentParser';
import { StylesParser } from './StylesParser';
import { NumberingParser } from './NumberingParser';
import { SectionParser } from './SectionParser';
import { HeaderFooterParser } from './HeaderFooterParser';
import { RelationshipsParser } from './RelationshipsParser';
import { MediaParser } from './MediaParser';
import type { DocxDocument, DocxStyles, NumberingDefinition, DocxSection } from '../types';

const log = Logger.createTagged('DocxParser');

/**
 * DOCX 解析器类
 */
export class DocxParser {
  /**
   * 解析 DOCX 文件
   *
   * 支持多种输入格式：File、ArrayBuffer、Uint8Array
   *
   * @param input - 输入数据
   * @returns 解析后的文档对象
   */
  async parse(input: File | ArrayBuffer | Uint8Array): Promise<DocxDocument> {
    Logger.group('解析 DOCX 文件');
    Logger.time('解析耗时');

    try {
      // 1. 统一转换输入格式
      const buffer = await this.normalizeInput(input);
      log.info('输入转换完成', { size: buffer.byteLength });

      // 2. 解压 ZIP 文件
      const files = await ZipService.load(buffer);
      const decoder = new TextDecoder();
      log.info('ZIP 解压完成', { fileCount: Object.keys(files).length });

      // 3. 解析包级别关系
      const packageRels = RelationshipsParser.parsePackageRels(files, decoder);
      log.debug('包级别关系', packageRels);

      // 4. 解析文档级别关系
      const documentRels = RelationshipsParser.parseDocumentRels(files, decoder);
      log.debug('文档级别关系', documentRels);

      // 创建关系映射（简化版，用于兼容）
      const relationships: Record<string, string> = {};
      for (const rel of documentRels) {
        relationships[rel.id] = rel.target;
      }

      // 5. 解析样式
      const styles = StylesParser.parseFromFiles(files, decoder);
      log.info('样式解析完成', { styleCount: Object.keys(styles.styles).length });

      // 6. 解析编号
      let numbering: NumberingDefinition = { abstractNums: {}, nums: {} };
      const numberingPath = 'word/numbering.xml';
      if (files[numberingPath]) {
        const numberingXml = decoder.decode(files[numberingPath]);
        numbering = NumberingParser.parse(numberingXml);
        log.info('编号解析完成');
      }

      // 7. 解析文档内容
      const context = { styles: styles.styles, numbering, relationships };
      const documentResult = DocumentParser.parseFromFiles(files, decoder, context);
      log.info('文档内容解析完成', {
        elementCount: documentResult.body.length,
        sectionCount: documentResult.sections.length
      });

      // 8. 解析页眉页脚
      const headerFooterResult = HeaderFooterParser.parse(files, decoder, documentRels, context);

      // 将页眉页脚内容填充到分节配置中
      this.fillHeaderFooterContent(documentResult.sections, headerFooterResult);
      this.fillHeaderFooterContent([documentResult.lastSection], headerFooterResult);
      log.info('页眉页脚解析完成');

      // 9. 解析媒体资源
      const mediaResult = MediaParser.parse(files, documentRels);
      const images: Record<string, string> = mediaResult.imageUrls;
      log.info('媒体资源解析完成', { imageCount: Object.keys(images).length });

      // 10. 构建最终文档对象
      const document: DocxDocument = {
        body: documentResult.body,
        sections: documentResult.sections.length > 0 ? documentResult.sections : [documentResult.lastSection],
        styles,
        numbering,
        relationships,
        images
      };

      Logger.timeEnd('解析耗时');
      Logger.groupEnd();

      return document;
    } catch (error) {
      Logger.timeEnd('解析耗时');
      Logger.groupEnd();
      log.error('解析失败', error);
      throw ErrorHandler.wrap(error, '解析 DOCX 文件失败');
    }
  }

  /**
   * 标准化输入数据
   *
   * @param input - 输入数据
   * @returns ArrayBuffer
   */
  private async normalizeInput(input: File | ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
    if (input instanceof ArrayBuffer) {
      return input;
    }

    if (input instanceof Uint8Array) {
      return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
    }

    if (input instanceof File) {
      return await input.arrayBuffer();
    }

    throw ErrorHandler.invalidFile('不支持的输入类型');
  }

  /**
   * 填充页眉页脚内容到分节配置
   *
   * @param sections - 分节列表
   * @param headerFooterResult - 页眉页脚解析结果
   */
  private fillHeaderFooterContent(
    sections: DocxSection[],
    headerFooterResult: ReturnType<typeof HeaderFooterParser.parse>
  ): void {
    for (const section of sections) {
      // 填充默认页眉
      if (section.header?.id) {
        const content = headerFooterResult.headers[section.header.id];
        if (content) {
          section.header.content = content.content;
        }
      }

      // 填充默认页脚
      if (section.footer?.id) {
        const content = headerFooterResult.footers[section.footer.id];
        if (content) {
          section.footer.content = content.content;
        }
      }

      // 填充首页页眉
      if (section.firstHeader?.id) {
        const content = headerFooterResult.headers[section.firstHeader.id];
        if (content) {
          section.firstHeader.content = content.content;
        }
      }

      // 填充首页页脚
      if (section.firstFooter?.id) {
        const content = headerFooterResult.footers[section.firstFooter.id];
        if (content) {
          section.firstFooter.content = content.content;
        }
      }

      // 填充偶数页页眉
      if (section.evenHeader?.id) {
        const content = headerFooterResult.headers[section.evenHeader.id];
        if (content) {
          section.evenHeader.content = content.content;
        }
      }

      // 填充偶数页页脚
      if (section.evenFooter?.id) {
        const content = headerFooterResult.footers[section.evenFooter.id];
        if (content) {
          section.evenFooter.content = content.content;
        }
      }
    }
  }

  /**
   * 解析文档并提取纯文本
   *
   * @param input - 输入数据
   * @returns 纯文本字符串
   */
  async extractText(input: File | ArrayBuffer | Uint8Array): Promise<string> {
    const doc = await this.parse(input);
    return DocumentParser.extractText(doc.body);
  }

  /**
   * 获取文档页面配置
   *
   * @param input - 输入数据
   * @returns 分节配置数组
   */
  async getPageSettings(input: File | ArrayBuffer | Uint8Array): Promise<DocxSection[]> {
    const doc = await this.parse(input);
    return doc.sections;
  }
}
