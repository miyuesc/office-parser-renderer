/**
 * DOCX 主解析器
 *
 * 解析完整的 DOCX 文件，协调各个子解析器
 */

import { BaseParser } from '@ai-space/shared';

import { Logger } from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';
import { DocumentParser } from './DocumentParser';
import { StylesParser } from './StylesParser';
import { NumberingParser } from './NumberingParser';

import { HeaderFooterParser } from './HeaderFooterParser';
import { RelationshipsParser } from './RelationshipsParser';
import { MediaParser } from './MediaParser';
import { ChartParser } from './ChartParser';
import { ThemeParser } from './ThemeParser';
import type {
  DocxDocument,
  NumberingDefinition,
  DocxSection,
  DocxElement,
  Drawing,
  DocxTheme,
} from '../types';

const log = Logger.createTagged('DocxParser');

/**
 * DOCX 解析器类
 */
export class DocxParser extends BaseParser<DocxDocument> {
  /**
   * 解析 DOCX 文件
   *
   * 核心逻辑：
   * 1. 统一输入：将 File、ArrayBuffer 等多种输入格式统一转换为 ArrayBuffer。
   * 2. 解压文件：使用 ZipService 解压 DOCX (ZIP) 包，获取内部 XML 文件映射。
   * 3. 解析依赖：优先解析 `_rels` 关系文件，建立资源索引。
   * 4. 全局配置：解析样式表 (Styles)、列表编号 (Numbering)、主题 (Theme) 等全局配置。
   * 5. 文档内容：解析主文档 (document.xml) 结构，生成虚拟 DOM 树。
   * 6. 辅助内容：解析页眉页脚、脚注尾注、媒体资源。
   * 7. 组装对象：将所有解析后的数据组装成统一的 `DocxDocument` 对象返回。
   *
   * @param input - 输入数据，支持浏览器 File 对象、二进制 ArrayBuffer 或 Uint8Array。
   * @returns Promise<DocxDocument> - 解析完成的文档对象，包含正文、样式、图片映射等所有文档数据。
   */
  async parse(input: File | ArrayBuffer | Uint8Array): Promise<DocxDocument> {
    Logger.group('解析 DOCX 文件');
    Logger.time('解析耗时');

    try {
      // 1. 统一转换输入格式
      const buffer = await this.normalizeInput(input);
      log.info('输入转换完成', { size: buffer.byteLength });

      // 2. 解压 ZIP 文件
      await this.initZip(buffer);
      const files = this.files;
      const decoder = this.decoder;
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

      // 解析主题
      let theme: DocxTheme | undefined;
      const themePath = 'word/theme/theme1.xml';
      if (files[themePath]) {
        const themeXml = decoder.decode(files[themePath]);
        theme = ThemeParser.parse(themeXml);
        log.info('主题解析完成', { colorCount: Object.keys(theme.colorScheme).length });
      }

      // 7. 解析文档内容
      const context = { styles: styles.styles, numbering, relationships };
      const documentResult = DocumentParser.parseFromFiles(files, decoder, context);
      log.info('文档内容解析完成', {
        elementCount: documentResult.body.length,
        sectionCount: documentResult.sections.length,
      });
      documentResult.sections.forEach((sect, idx) => {
        log.debug(`Section [${idx}] info`, { type: sect.type, pageSize: sect.pageSize });
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

      // 10. 解析图表数据
      this.parseChartData(documentResult.body, files, decoder, relationships);
      log.info('图表解析完成');

      // 11. 构建最终文档对象
      const document: DocxDocument = {
        body: documentResult.body,
        sections:
          documentResult.sections.length > 0
            ? documentResult.sections
            : [documentResult.lastSection],
        styles,
        numbering,
        relationships,
        images,
        theme,
        // 文档背景色（如果有的话需要加上 # 前缀）
        background: documentResult.background ? `#${documentResult.background}` : undefined,
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
   * 填充页眉页脚内容到分节配置
   *
   * 核心逻辑：
   * 遍历文档的每个分节 (Section)，根据分节属性中定义的页眉/页脚 ID (headerId/footerId)，
   * 从已解析的页眉页脚集合中查找对应的内容，并将其注入到分节对象中。
   * 支持首页 (First)、偶数页 (Even) 和默认 (Default) 三种类型的页眉页脚。
   *
   * @param sections - 文档的分节列表
   * @param headerFooterResult - 页眉页脚的解析结果映射表
   */
  private fillHeaderFooterContent(
    sections: DocxSection[],
    headerFooterResult: ReturnType<typeof HeaderFooterParser.parse>,
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
   * 核心逻辑：
   * 1. 调用 `parse` 方法完全解析文档。
   * 2. 遍历解析后的文档 Body，递归提取所有段落和文本运行 (Run) 中的文本内容。
   * 3. 将所有文本拼接为字符串返回。
   *
   * @param input - 输入数据 (File | ArrayBuffer | Uint8Array)
   * @returns Promise<string> - 文档中的纯文本内容
   */
  async extractText(input: File | ArrayBuffer | Uint8Array): Promise<string> {
    const doc = await this.parse(input);
    return DocumentParser.extractText(doc.body);
  }

  /**
   * 获取文档页面配置
   *
   * 核心逻辑：
   * 解析文档并仅返回分节信息，包含页面大小 (PageSize)、页边距 (Margins)、分栏 (Columns) 等设置。
   *
   * @param input - 输入数据
   * @returns Promise<DocxSection[]> - 分节配置数组
   */
  async getPageSettings(input: File | ArrayBuffer | Uint8Array): Promise<DocxSection[]> {
    const doc = await this.parse(input);
    return doc.sections;
  }

  /**
   * 解析图表数据
   *
   * 核心逻辑：
   * 1. 递归遍历文档元素树（包括段落、表格、表格单元格）。
   * 2. 查找包含图表引用的 Drawing 元素。
   * 3. 通过关系 ID (rId) 在 `relationships` 中查找对应的图表 XML 文件路径。
   * 4. 读取并解析图表 XML，将解析结果合并回 Drawing 元素的 chart 属性中。
   *
   * @param elements - 当前层级的文档元素列表
   * @param files - 所有解压后的文件数据映射
   * @param decoder - 文本解码器
   * @param relationships - 文档的关系映射表 (rId -> Target)
   */
  private parseChartData(
    elements: DocxElement[],
    files: Record<string, Uint8Array>,
    decoder: TextDecoder,
    relationships: Record<string, string>,
  ): void {
    for (const element of elements) {
      if (element.type === 'paragraph') {
        // 遍历段落子元素
        for (const child of element.children) {
          if (child.type === 'drawing' && (child as Drawing).chart) {
            const drawing = child as Drawing;
            const chart = drawing.chart!;
            const chartPath = this.resolveChartPath(chart.rId, relationships);

            if (chartPath && files[chartPath]) {
              const chartXml = decoder.decode(files[chartPath]);
              const parsedChart = ChartParser.parse(chartXml, chart.cx, chart.cy, chart.rId);
              // 合并解析结果
              Object.assign(chart, parsedChart);
              log.debug(`解析图表: ${chartPath}`, parsedChart);
            }
          }
        }
      } else if (element.type === 'table') {
        // 递归处理表格中的内容
        for (const row of element.rows) {
          for (const cell of row.cells) {
            this.parseChartData(cell.children, files, decoder, relationships);
          }
        }
      }
    }
  }

  /**
   * 解析图表文件路径
   *
   * 核心逻辑：
   * 根据关系 ID 查找目标路径。如果路径是相对路径（不以 / 开头），则自动拼接 'word/' 前缀，
   * 确保能正确在 ZIP 包中找到文件。
   *
   * @param rId - 图表的关系 ID
   * @param relationships - 关系映射表
   * @returns string | null - 图表文件的完整路径，若未找到关系则返回 null
   */
  private resolveChartPath(rId: string, relationships: Record<string, string>): string | null {
    const target = relationships[rId];
    if (!target) {
      log.warn(`未找到图表关系: ${rId}`);
      return null;
    }

    // 解析相对路径 (通常是 charts/chartN.xml，需要转换为 word/charts/chartN.xml)
    if (target.startsWith('/')) {
      return target.substring(1);
    } else {
      return 'word/' + target;
    }
  }
  /**
   * 异步解析 DOCX 文件（尝试使用 Web Worker）
   *
   * @param input - 输入文件数据
   * @returns Promise<DocxDocument>
   */
  static async parseAsync(input: File | ArrayBuffer | Uint8Array): Promise<DocxDocument> {
    // 检测是否支持 Worker 环境
    if (typeof Worker !== 'undefined') {
      return new Promise((resolve, reject) => {
        try {
          // 创建 Worker
          // 注意：这里假设构建工具能正确处理 Worker 路径
          const worker = new Worker(new URL('../worker/docx.worker.ts', import.meta.url), {
            type: 'module',
          });

          worker.onmessage = (e) => {
            const { success, data, error } = e.data;
            worker.terminate();

            if (success) {
              resolve(data);
            } else {
              // Worker 解析失败（可能是环境缺失或文件错误）
              // 尝试回退到主线程执行，以确保功能可用性
              console.warn('Docx Worker failed, falling back to main thread:', error);
              new DocxParser().parse(input).then(resolve).catch(reject);
            }
          };

          worker.onerror = (err) => {
            reject(err);
            worker.terminate();
          };

          // 发送解析请求
          worker.postMessage({ type: 'parse', input });
        } catch (e) {
          // Worker 创建失败（可能是 CSP 限制或路径问题），回退到主线程
          console.warn('Failed to create Docx Worker, falling back to main thread:', e);
          new DocxParser().parse(input).then(resolve).catch(reject);
        }
      });
    } else {
      // 不支持 Worker，回退到主线程
      return new DocxParser().parse(input);
    }
  }
}
