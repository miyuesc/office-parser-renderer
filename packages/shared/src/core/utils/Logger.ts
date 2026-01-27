/**
 * 通用日志工具
 *
 * 提供统一的日志输出接口，支持按标签分类和级别过滤
 */

/** 日志级别 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/** 日志配置 */
export interface LogConfig {
  /** 是否启用日志 */
  enabled: boolean;
  /** 最低日志级别 */
  level: LogLevel;
  /** 是否在控制台分组 */
  useGroups: boolean;
  /** 启用的标签列表（空表示全部启用） */
  enabledTags: string[];
}

/**
 * 共享日志工具类
 */
export class Logger {
  /** 默认配置 */
  private static config: LogConfig = {
    enabled: true,
    level: LogLevel.INFO,
    useGroups: true,
    enabledTags: []
  };

  /** 前缀 */
  private prefix: string;

  /**
   * 构造函数
   * @param prefix 日志前缀 (如 DOCX, XLSX)
   */
  constructor(prefix: string) {
    this.prefix = `[${prefix}]`;
  }

  /**
   * 配置全局日志
   *
   * @param options - 配置选项
   */
  static configure(options: Partial<LogConfig>): void {
    this.config = { ...this.config, ...options };
  }

  /**
   * 启用日志
   */
  static enable(): void {
    this.config.enabled = true;
  }

  /**
   * 禁用日志
   */
  static disable(): void {
    this.config.enabled = false;
  }

  /**
   * 设置日志级别
   *
   * @param level - 日志级别
   */
  static setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * 启用特定标签
   *
   * @param tags - 标签列表
   */
  static enableTags(...tags: string[]): void {
    this.config.enabledTags = tags;
  }

  /**
   * 检查标签是否启用
   *
   * @param tag - 标签
   * @returns 是否启用
   */
  private static isTagEnabled(tag: string): boolean {
    if (this.config.enabledTags.length === 0) return true;
    return this.config.enabledTags.includes(tag);
  }

  /**
   * 格式化消息
   *
   * @param tag - 标签
   * @param message - 消息
   * @returns 格式化后的消息
   */
  private format(tag: string, message: string): string {
    return `${this.prefix}:${tag}] ${message}`;
  }

  /**
   * 输出调试日志
   *
   * @param tag - 标签
   * @param message - 消息
   * @param data - 附加数据
   */
  debug(tag: string, message: string, data?: unknown): void {
    if (!Logger.config.enabled || Logger.config.level > LogLevel.DEBUG) return;
    if (!Logger.isTagEnabled(tag)) return;
    console.debug(`[${this.format(tag, message)}`, data ?? '');
  }

  /**
   * 输出信息日志
   *
   * @param tag - 标签
   * @param message - 消息
   * @param data - 附加数据
   */
  info(tag: string, message: string, data?: unknown): void {
    if (!Logger.config.enabled || Logger.config.level > LogLevel.INFO) return;
    if (!Logger.isTagEnabled(tag)) return;
    console.log(`[${this.format(tag, message)}`, data ?? '');
  }

  /**
   * 输出警告日志
   *
   * @param tag - 标签
   * @param message - 消息
   * @param data - 附加数据
   */
  warn(tag: string, message: string, data?: unknown): void {
    if (!Logger.config.enabled || Logger.config.level > LogLevel.WARN) return;
    console.warn(`[${this.format(tag, message)} ⚠️`, data ?? '');
  }

  /**
   * 输出错误日志
   *
   * @param tag - 标签
   * @param message - 消息
   * @param error - 错误对象
   */
  error(tag: string, message: string, error?: Error | unknown): void {
    if (!Logger.config.enabled || Logger.config.level > LogLevel.ERROR) return;
    console.error(`[${this.format(tag, message)} ❌`, error ?? '');
  }

  /**
   * 开始日志分组
   *
   * @param label - 分组标签
   */
  group(label: string): void {
    if (!Logger.config.enabled || !Logger.config.useGroups) return;
    console.group(`${this.prefix} ${label}`);
  }

  /**
   * 开始折叠的日志分组
   *
   * @param label - 分组标签
   */
  groupCollapsed(label: string): void {
    if (!Logger.config.enabled || !Logger.config.useGroups) return;
    console.groupCollapsed(`${this.prefix} ${label}`);
  }

  /**
   * 结束日志分组
   */
  groupEnd(): void {
    if (!Logger.config.enabled || !Logger.config.useGroups) return;
    console.groupEnd();
  }

  /**
   * 输出表格数据
   *
   * @param tag - 标签
   * @param data - 表格数据
   */
  table(tag: string, data: unknown): void {
    if (!Logger.config.enabled || Logger.config.level > LogLevel.DEBUG) return;
    if (!Logger.isTagEnabled(tag)) return;
    console.log(`[${this.prefix}:${tag}] Table:`);
    console.table(data);
  }

  /**
   * 计时开始
   *
   * @param label - 计时标签
   */
  time(label: string): void {
    if (!Logger.config.enabled) return;
    console.time(`${this.prefix} ${label}`);
  }

  /**
   * 计时结束
   *
   * @param label - 计时标签
   */
  timeEnd(label: string): void {
    if (!Logger.config.enabled) return;
    console.timeEnd(`${this.prefix} ${label}`);
  }

  /**
   * 创建带标签的日志器
   *
   * @param tag - 标签
   * @returns 带标签的日志器
   */
  createTagged(tag: string): TaggedLogger {
    return new TaggedLogger(this, tag);
  }
}

/**
 * 带标签的日志器
 */
export class TaggedLogger {
  constructor(
    private readonly logger: Logger,
    private readonly tag: string
  ) {}

  debug(message: string, data?: unknown): void {
    this.logger.debug(this.tag, message, data);
  }

  info(message: string, data?: unknown): void {
    this.logger.info(this.tag, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(this.tag, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    this.logger.error(this.tag, message, error);
  }

  group(label: string): void {
    this.logger.group(`${this.tag}: ${label}`);
  }

  groupEnd(): void {
    this.logger.groupEnd();
  }

  time(label: string): void {
    this.logger.time(`${this.tag}: ${label}`);
  }

  timeEnd(label: string): void {
    this.logger.timeEnd(`${this.tag}: ${label}`);
  }
}

/**
 * 共享包默认日志实例
 */
export const sharedLogger = new Logger('SHARED');
