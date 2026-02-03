import JSZip from 'jszip';

/**
 * 文件处理工具类
 * 负责解压 Office文档 (ZIP) 和解析 XML
 */
export class FileHandler {
  /**
   * 解压 ZIP 文件
   * @param buffer 文件二进制数据
   * @returns 文件名到文件内容的映射
   */
  static async unzip(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
    const zip = await JSZip.loadAsync(buffer);
    const files = new Map<string, Uint8Array>();

    for (const [filename, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        const content = await file.async('uint8array');
        // 统一路径分隔符，移除开头的 ./ 或 /
        const normalizedPath = filename.replace(/\\/g, '/').replace(/^\.?\//, '');
        files.set(normalizedPath, content);
      }
    }

    return files;
  }

  /**
   * 解析 XML 字符串为 DOM
   * @param xmlString XML 字符串
   * @returns Document 对象
   */
  static parseXML(xmlString: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'application/xml');
  }

  /**
   * 从 Uint8Array 读取文本
   * @param data 二进制数据
   * @returns 文本字符串
   */
  static readText(data: Uint8Array): string {
    return new TextDecoder('utf-8').decode(data);
  }
}
