import * as fflate from 'fflate';
import { sharedLogger } from '../utils/Logger';

const log = sharedLogger.createTagged('ZipService');

/**
 * ZIP 解压服务
 *
 * 使用 fflate 库进行高性能的 ZIP 文件解压，
 * 用于解析 Office Open XML 格式文档（xlsx, pptx, docx）
 */
export class ZipService {
  /**
   * 解压 ZIP 文件，返回所有文件的二进制内容
   * @param buffer - ZIP 文件的 ArrayBuffer
   * @returns 文件路径到内容的映射，内容为 Uint8Array
   */
  static async load(buffer: ArrayBuffer): Promise<Record<string, Uint8Array>> {
    return new Promise((resolve, reject) => {
      log.time('Unzip');
      const data = new Uint8Array(buffer);
      fflate.unzip(data, (err, unzipped) => {
        if (err || !unzipped) {
          log.error(' 解压失败', err as Error);
          return reject(err || new Error('Unzip failed'));
        }
        log.timeEnd('Unzip');
        log.info('解压完成', { fileCount: Object.keys(unzipped).length });

        resolve(unzipped);
      });
    });
  }

  /**
   * 解压 ZIP 文件，仅返回 XML 和 RELS 文件的文本内容
   *
   * 仅解码 .xml 和 .rels 文件以节省处理时间，
   * 图片等二进制文件需使用 load() 方法获取
   *
   * @param buffer - ZIP 文件的 ArrayBuffer
   * @returns 文件路径到文本内容的映射
   */
  static async loadText(buffer: ArrayBuffer): Promise<Record<string, string>> {
    const files = await this.load(buffer);
    const textFiles: Record<string, string> = {};
    const decoder = new TextDecoder();

    for (const [path, content] of Object.entries(files)) {
      // 仅解码 XML 或 RELS 文件为文本以节省时间
      if (path.endsWith('.xml') || path.endsWith('.rels')) {
        textFiles[path] = decoder.decode(content);
      }
    }
    return textFiles;
  }
}
