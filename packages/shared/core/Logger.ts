export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private level: LogLevel;
  private namespace: string;
  private timers: Map<string, number> = new Map();

  constructor(namespace: string, level: LogLevel = LogLevel.INFO) {
    this.namespace = namespace;
    this.level = level;
  }

  public setLevel(level: LogLevel) {
    this.level = level;
  }

  public debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[${this.namespace}] [DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[${this.namespace}] [INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[${this.namespace}] [WARN] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[${this.namespace}] [ERROR] ${message}`, ...args);
    }
  }

  public time(label: string) {
    if (this.level <= LogLevel.DEBUG) {
      this.timers.set(label, performance.now());
    }
  }

  public timeEnd(label: string) {
    if (this.level <= LogLevel.DEBUG && this.timers.has(label)) {
      const startTime = this.timers.get(label)!;
      const duration = performance.now() - startTime;
      console.debug(`[${this.namespace}] [TIME] ${label}: ${duration.toFixed(3)}ms`);
      this.timers.delete(label);
    }
  }
}
