/**
 * 基础解析器抽象类
 *
 * 为 DocxParser, XlsxParser 等提供通用的解析流程骨架，
 * 实现了输入标准化、ZIP 解压、XML 读取等共用逻辑。
 */
import { ZipService } from '../zip';
import { XmlUtils } from '../xml';

export abstract class BaseParser<T> {
  protected files: Record<string, Uint8Array> = {};
  protected decoder: TextDecoder;

  constructor() {
    this.decoder = new TextDecoder();
  }

  /**
   * 解析入口方法
   * @param input 输入数据
   */
  abstract parse(input: File | ArrayBuffer | Uint8Array): Promise<T>;

  /**
   * 标准化输入数据
   *
   * 将 File | ArrayBuffer | Uint8Array 统一转换为 ArrayBuffer
   *
   * @param input 输入数据
   * @returns ArrayBuffer
   */
  protected async normalizeInput(input: File | ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
    if (input instanceof File) {
      return await input.arrayBuffer();
    } else if (input instanceof Uint8Array) {
      // Uint8Array -> ArrayBuffer
      // 注意：直接使用 .buffer 可能会包含 offset 之外的数据，建议拷贝
      return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
    } else if (input instanceof ArrayBuffer) {
      return input;
    } else {
      throw new Error('Unsupported input type. Expected File, ArrayBuffer, or Uint8Array.');
    }
  }

  /**
   * 初始化 ZIP 服务并解压文件
   * @param buffer ZIP 文件数据
   */
  protected async initZip(buffer: ArrayBuffer): Promise<void> {
    this.files = await ZipService.load(buffer);
  }

  /**
   * 获取文件文本内容
   * @param path ZIP 中的文件路径
   * @returns 文件文本内容，若文件不存在则返回 null
   */
  protected getText(path: string): string | null {
    const fileContent = this.files[path];
    if (!fileContent) {
      return null;
    }
    return this.decoder.decode(fileContent);
  }

  /**
   * 获取并解析 XML 文件
   * @param path ZIP 中的文件路径
   * @returns 解析后的 XML Document，若文件不存在则返回 null
   */
  protected getXml(path: string): Document | null {
    const xmlStr = this.getText(path);
    if (xmlStr === null) {
      return null;
    }
    return XmlUtils.parse(xmlStr);
  }
}
