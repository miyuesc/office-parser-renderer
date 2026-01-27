import { Logger as SharedLogger, TaggedLogger, LogLevel } from '@ai-space/shared';
import type { LogConfig } from '@ai-space/shared';

// 创建 DOCX 专属日志实例
const docxLogger = new SharedLogger('DOCX');

export { LogLevel, TaggedLogger, LogConfig };

/**
 * DOCX 日志工具 (Wrapper)
 *
 * 保持与原有 Logger 兼容的静态接口，底层代理到 @ai-space/shared 的 Logger 实例
 */
export class Logger {
  // 静态配置方法直接代理到 SharedLogger 类
  static configure(options: Partial<LogConfig>): void {
    SharedLogger.configure(options);
  }

  static enable(): void {
    SharedLogger.enable();
  }

  static disable(): void {
    SharedLogger.disable();
  }

  static setLevel(level: LogLevel): void {
    SharedLogger.setLevel(level);
  }

  static enableTags(...tags: string[]): void {
    SharedLogger.enableTags(...tags);
  }

  // 日志方法代理到 docxLogger 实例
  static debug(tag: string, message: string, data?: unknown): void {
    docxLogger.debug(tag, message, data);
  }

  static info(tag: string, message: string, data?: unknown): void {
    docxLogger.info(tag, message, data);
  }

  static warn(tag: string, message: string, data?: unknown): void {
    docxLogger.warn(tag, message, data);
  }

  static error(tag: string, message: string, error?: Error | unknown): void {
    docxLogger.error(tag, message, error);
  }

  static group(label: string): void {
    docxLogger.group(label);
  }

  static groupCollapsed(label: string): void {
    docxLogger.groupCollapsed(label);
  }

  static groupEnd(): void {
    docxLogger.groupEnd();
  }

  static table(tag: string, data: unknown): void {
    docxLogger.table(tag, data);
  }

  static time(label: string): void {
    docxLogger.time(label);
  }

  static timeEnd(label: string): void {
    docxLogger.timeEnd(label);
  }

  static createTagged(tag: string): TaggedLogger {
    return docxLogger.createTagged(tag);
  }
}
