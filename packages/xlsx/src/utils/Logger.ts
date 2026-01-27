import { Logger as SharedLogger, TaggedLogger, LogLevel } from '@ai-space/shared';
import type { LogConfig } from '@ai-space/shared';

// 创建 XLSX 专属日志实例
const xlsxLogger = new SharedLogger('XLSX');

export { LogLevel, TaggedLogger, LogConfig };

/**
 * XLSX 日志工具 (Wrapper)
 *
 * 保持与 DOCX Logger 一致的接口，底层代理到 @ai-space/shared 的 Logger 实例
 */
export class Logger {
  // 静态配置方法
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

  // 日志方法
  static debug(tag: string, message: string, data?: unknown): void {
    xlsxLogger.debug(tag, message, data);
  }

  static info(tag: string, message: string, data?: unknown): void {
    xlsxLogger.info(tag, message, data);
  }

  static warn(tag: string, message: string, data?: unknown): void {
    xlsxLogger.warn(tag, message, data);
  }

  static error(tag: string, message: string, error?: Error | unknown): void {
    xlsxLogger.error(tag, message, error);
  }

  static group(label: string): void {
    xlsxLogger.group(label);
  }

  static groupCollapsed(label: string): void {
    xlsxLogger.groupCollapsed(label);
  }

  static groupEnd(): void {
    xlsxLogger.groupEnd();
  }

  static table(tag: string, data: unknown): void {
    xlsxLogger.table(tag, data);
  }

  static time(label: string): void {
    xlsxLogger.time(label);
  }

  static timeEnd(label: string): void {
    xlsxLogger.timeEnd(label);
  }

  static createTagged(tag: string): TaggedLogger {
    return xlsxLogger.createTagged(tag);
  }
}
