/**
 * 统一日志工具类
 * 支持分级日志 (Debug/Info/Warn/Error) 和性能打点
 */
export class Logger {
  private scope: string;
  private static isDebug = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;

  constructor(scope: string) {
    this.scope = scope;
  }

  /**
   * 格式化消息
   */
  private format(message: string): string {
    return `[${this.scope}] ${message}`;
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (Logger.isDebug) {
      console.debug(this.format(message), ...args);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    console.info(this.format(message), ...args);
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    console.warn(this.format(message), ...args);
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    console.error(this.format(message), ...args);
  }

  /**
   * 开始计时
   */
  time(label: string): void {
    if (Logger.isDebug) {
      console.time(this.format(label));
    }
  }

  /**
   * 结束计时
   */
  timeEnd(label: string): void {
    if (Logger.isDebug) {
      console.timeEnd(this.format(label));
    }
  }
}
