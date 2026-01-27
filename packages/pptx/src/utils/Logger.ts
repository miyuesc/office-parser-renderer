import { Logger as SharedLogger, TaggedLogger, LogLevel } from '@ai-space/shared';
import type { LogConfig } from '@ai-space/shared';

// 创建 PPTX 专属日志实例
const pptxLogger = new SharedLogger('PPTX');

export { LogLevel, TaggedLogger, LogConfig };

/**
 * PPTX 日志工具 (Wrapper)
 *
 * 保持与 DOCX/XLSX Logger 一致的接口，底层代理到 @ai-space/shared 的 Logger 实例
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
    pptxLogger.debug(tag, message, data);
  }

  static info(tag: string, message: string, data?: unknown): void {
    pptxLogger.info(tag, message, data);
  }

  static warn(tag: string, message: string, data?: unknown): void {
    pptxLogger.warn(tag, message, data);
  }

  static error(tag: string, message: string, error?: Error | unknown): void {
    pptxLogger.error(tag, message, error);
  }

  static group(label: string): void {
    pptxLogger.group(label);
  }

  static groupCollapsed(label: string): void {
    pptxLogger.groupCollapsed(label);
  }

  static groupEnd(): void {
    pptxLogger.groupEnd();
  }

  static table(tag: string, data: unknown): void {
    pptxLogger.table(tag, data);
  }

  static time(label: string): void {
    pptxLogger.time(label);
  }

  static timeEnd(label: string): void {
    pptxLogger.timeEnd(label);
  }

  static createTagged(tag: string): TaggedLogger {
    return pptxLogger.createTagged(tag);
  }
}
