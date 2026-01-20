/**
 * DOCX 错误处理工具
 *
 * 提供统一的错误类型和处理机制
 */

/**
 * DOCX 错误代码枚举
 */
export enum DocxErrorCode {
  /** 无效的文件格式 */
  INVALID_FILE = 'INVALID_FILE',
  /** 缺少必需的文档部分 */
  MISSING_DOCUMENT = 'MISSING_DOCUMENT',
  /** 缺少必需的文件 */
  MISSING_FILE = 'MISSING_FILE',
  /** XML 解析错误 */
  XML_PARSE_ERROR = 'XML_PARSE_ERROR',
  /** ZIP 解压错误 */
  ZIP_ERROR = 'ZIP_ERROR',
  /** 样式解析错误 */
  STYLE_PARSE_ERROR = 'STYLE_PARSE_ERROR',
  /** 编号解析错误 */
  NUMBERING_PARSE_ERROR = 'NUMBERING_PARSE_ERROR',
  /** 渲染错误 */
  RENDER_ERROR = 'RENDER_ERROR',
  /** 不支持的功能 */
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  /** 图片加载错误 */
  IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR',
  /** 字体加载错误 */
  FONT_LOAD_ERROR = 'FONT_LOAD_ERROR',
  /** 分页计算错误 */
  PAGINATION_ERROR = 'PAGINATION_ERROR',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * DOCX 错误类
 */
export class DocxError extends Error {
  /** 错误代码 */
  readonly code: DocxErrorCode;
  /** 错误详情 */
  readonly details?: unknown;
  /** 原始错误 */
  readonly cause?: Error;

  /**
   * 构造函数
   *
   * @param code - 错误代码
   * @param message - 错误消息
   * @param details - 错误详情
   * @param cause - 原始错误
   */
  constructor(code: DocxErrorCode, message: string, details?: unknown, cause?: Error) {
    super(message);
    this.name = 'DocxError';
    this.code = code;
    this.details = details;
    this.cause = cause;

    // 保持正确的原型链
    Object.setPrototypeOf(this, DocxError.prototype);
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      cause: this.cause?.message,
      stack: this.stack
    };
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `[${this.name}:${this.code}] ${this.message}`;
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 创建无效文件错误
   *
   * @param message - 错误消息
   * @param details - 错误详情
   */
  static invalidFile(message: string, details?: unknown): DocxError {
    return new DocxError(DocxErrorCode.INVALID_FILE, message, details);
  }

  /**
   * 创建缺少文档错误
   *
   * @param path - 缺少的文件路径
   */
  static missingDocument(path: string): DocxError {
    return new DocxError(DocxErrorCode.MISSING_DOCUMENT, `缺少必需的文档部分: ${path}`, { path });
  }

  /**
   * 创建缺少文件错误
   *
   * @param path - 缺少的文件路径
   */
  static missingFile(path: string): DocxError {
    return new DocxError(DocxErrorCode.MISSING_FILE, `缺少文件: ${path}`, { path });
  }

  /**
   * 创建 XML 解析错误
   *
   * @param message - 错误消息
   * @param cause - 原始错误
   */
  static xmlParseError(message: string, cause?: Error): DocxError {
    return new DocxError(DocxErrorCode.XML_PARSE_ERROR, `XML 解析错误: ${message}`, undefined, cause);
  }

  /**
   * 创建 ZIP 错误
   *
   * @param message - 错误消息
   * @param cause - 原始错误
   */
  static zipError(message: string, cause?: Error): DocxError {
    return new DocxError(DocxErrorCode.ZIP_ERROR, `ZIP 解压错误: ${message}`, undefined, cause);
  }

  /**
   * 创建渲染错误
   *
   * @param message - 错误消息
   * @param element - 出错的元素
   * @param cause - 原始错误
   */
  static renderError(message: string, element?: unknown, cause?: Error): DocxError {
    return new DocxError(DocxErrorCode.RENDER_ERROR, `渲染错误: ${message}`, { element }, cause);
  }

  /**
   * 创建不支持功能错误
   *
   * @param feature - 不支持的功能名称
   */
  static unsupportedFeature(feature: string): DocxError {
    return new DocxError(DocxErrorCode.UNSUPPORTED_FEATURE, `不支持的功能: ${feature}`, { feature });
  }

  /**
   * 创建图片加载错误
   *
   * @param path - 图片路径
   * @param cause - 原始错误
   */
  static imageLoadError(path: string, cause?: Error): DocxError {
    return new DocxError(DocxErrorCode.IMAGE_LOAD_ERROR, `图片加载失败: ${path}`, { path }, cause);
  }

  /**
   * 创建分页计算错误
   *
   * @param message - 错误消息
   * @param cause - 原始错误
   */
  static paginationError(message: string, cause?: Error): DocxError {
    return new DocxError(DocxErrorCode.PAGINATION_ERROR, `分页计算错误: ${message}`, undefined, cause);
  }

  /**
   * 包装任意错误为 DocxError
   *
   * @param error - 任意错误
   * @param defaultMessage - 默认消息
   */
  static wrap(error: unknown, defaultMessage: string = '未知错误'): DocxError {
    if (error instanceof DocxError) {
      return error;
    }

    if (error instanceof Error) {
      return new DocxError(DocxErrorCode.UNKNOWN, error.message || defaultMessage, undefined, error);
    }

    return new DocxError(DocxErrorCode.UNKNOWN, String(error) || defaultMessage, error);
  }

  /**
   * 安全执行函数，捕获错误
   *
   * @param fn - 要执行的函数
   * @param fallback - 错误时的回退值
   * @returns 执行结果或回退值
   */
  static tryCatch<T>(fn: () => T, fallback: T): T {
    try {
      return fn();
    } catch (e) {
      console.warn('[DOCX] 操作失败，使用回退值', e);
      return fallback;
    }
  }

  /**
   * 安全执行异步函数，捕获错误
   *
   * @param fn - 要执行的异步函数
   * @param fallback - 错误时的回退值
   * @returns 执行结果或回退值
   */
  static async tryCatchAsync<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      console.warn('[DOCX] 异步操作失败，使用回退值', e);
      return fallback;
    }
  }

  /**
   * 断言条件为真，否则抛出错误
   *
   * @param condition - 条件
   * @param code - 错误代码
   * @param message - 错误消息
   */
  static assert(condition: unknown, code: DocxErrorCode, message: string): asserts condition {
    if (!condition) {
      throw new DocxError(code, message);
    }
  }

  /**
   * 断言值存在（非 null/undefined）
   *
   * @param value - 值
   * @param name - 值的名称
   */
  static assertExists<T>(value: T | null | undefined, name: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new DocxError(DocxErrorCode.MISSING_DOCUMENT, `${name} 不存在`, { name });
    }
  }
}
