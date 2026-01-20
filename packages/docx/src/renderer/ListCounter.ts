/**
 * 列表计数器
 *
 * 管理列表编号的计数状态
 */

import { Logger } from '../utils/Logger';
import { NumberingParser } from '../parser/NumberingParser';
import type { NumberingDefinition, NumberingLevel } from '../types';

const log = Logger.createTagged('ListCounter');

/**
 * 列表计数器类
 */
export class ListCounter {
  /** 计数器状态：numId -> level -> count */
  private counters: Map<string, Map<number, number>> = new Map();

  /** 上一个使用的编号 ID */
  private lastNumId: string | null = null;

  /** 上一个使用的级别 */
  private lastLevel: number = 0;

  /**
   * 构造函数
   *
   * @param numbering - 编号定义
   */
  constructor(private numbering: NumberingDefinition) {}

  /**
   * 获取下一个编号文本
   *
   * @param numId - 编号实例 ID
   * @param level - 级别索引 (0-based)
   * @returns 格式化的编号文本
   */
  getNextNumber(numId: string, level: number): string {
    // 获取级别定义
    const levelDef = NumberingParser.getLevel(this.numbering, numId, String(level));
    if (!levelDef) {
      log.warn(`未找到编号定义: numId=${numId}, level=${level}`);
      return '•';
    }

    // 获取或初始化计数器
    let numCounters = this.counters.get(numId);
    if (!numCounters) {
      numCounters = new Map();
      this.counters.set(numId, numCounters);
    }

    // 检查是否需要重置低级别计数器
    if (this.lastNumId === numId && level < this.lastLevel) {
      // 重置所有高于当前级别的计数器
      for (let l = level + 1; l <= 9; l++) {
        numCounters.delete(l);
      }
    }

    // 获取或初始化当前级别计数
    let count = numCounters.get(level);
    if (count === undefined) {
      count = levelDef.start - 1;
    }
    count++;
    numCounters.set(level, count);

    // 更新状态
    this.lastNumId = numId;
    this.lastLevel = level;

    // 格式化编号
    return this.formatNumber(levelDef, count, numId, level);
  }

  /**
   * 格式化编号
   *
   * @param level - 级别定义
   * @param value - 当前计数值
   * @param numId - 编号 ID
   * @param levelIndex - 级别索引
   * @returns 格式化的文本
   */
  private formatNumber(level: NumberingLevel, value: number, numId: string, levelIndex: number): string {
    let text = level.text;

    // 替换占位符
    // 占位符格式：%1, %2, ... 表示各级别的编号
    for (let l = 0; l <= levelIndex; l++) {
      const placeholder = `%${l + 1}`;
      if (text.includes(placeholder)) {
        let levelValue: number;

        if (l === levelIndex) {
          levelValue = value;
        } else {
          // 获取父级别的当前值
          const numCounters = this.counters.get(numId);
          levelValue = numCounters?.get(l) || 1;
        }

        // 获取该级别的格式
        const levelDef = NumberingParser.getLevel(this.numbering, numId, String(l));
        const formatted = levelDef ? this.formatSingleNumber(levelDef.format, levelValue) : String(levelValue);

        text = text.replace(placeholder, formatted);
      }
    }

    return text;
  }

  /**
   * 格式化单个数字
   *
   * @param format - 编号格式
   * @param value - 数值
   * @returns 格式化的字符串
   */
  private formatSingleNumber(format: string, value: number): string {
    switch (format) {
      case 'decimal':
        return String(value);

      case 'decimalZero':
        return value < 10 ? `0${value}` : String(value);

      case 'upperRoman':
        return this.toRoman(value).toUpperCase();

      case 'lowerRoman':
        return this.toRoman(value).toLowerCase();

      case 'upperLetter':
        return this.toLetter(value).toUpperCase();

      case 'lowerLetter':
        return this.toLetter(value).toLowerCase();

      case 'bullet':
        return '•';

      case 'ordinal':
        return this.toOrdinal(value);

      case 'chineseCounting':
      case 'chineseCountingThousand':
        return this.toChinese(value);

      case 'ideographDigital':
        return this.toIdeographDigital(value);

      case 'none':
        return '';

      default:
        return String(value);
    }
  }

  /**
   * 数字转罗马数字
   */
  private toRoman(num: number): string {
    if (num <= 0 || num > 3999) return String(num);

    const romanNumerals: [number, string][] = [
      [1000, 'm'],
      [900, 'cm'],
      [500, 'd'],
      [400, 'cd'],
      [100, 'c'],
      [90, 'xc'],
      [50, 'l'],
      [40, 'xl'],
      [10, 'x'],
      [9, 'ix'],
      [5, 'v'],
      [4, 'iv'],
      [1, 'i']
    ];

    let result = '';
    let n = num;
    for (const [value, symbol] of romanNumerals) {
      while (n >= value) {
        result += symbol;
        n -= value;
      }
    }
    return result;
  }

  /**
   * 数字转字母
   */
  private toLetter(num: number): string {
    if (num <= 0) return '';

    let result = '';
    let n = num;
    while (n > 0) {
      n--;
      result = String.fromCharCode(97 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  }

  /**
   * 数字转序数词
   */
  private toOrdinal(num: number): string {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  }

  /**
   * 数字转中文
   */
  private toChinese(num: number): string {
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (num < 10) return digits[num];

    if (num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return (ten === 1 ? '' : digits[ten]) + '十' + (one ? digits[one] : '');
    }

    return String(num);
  }

  /**
   * 数字转全角数字
   */
  private toIdeographDigital(num: number): string {
    const fullWidth = '０１２３４５６７８９';
    return String(num)
      .split('')
      .map(d => fullWidth[parseInt(d, 10)])
      .join('');
  }

  /**
   * 重置计数器
   *
   * @param numId - 编号 ID（可选，不提供则重置全部）
   */
  reset(numId?: string): void {
    if (numId) {
      this.counters.delete(numId);
    } else {
      this.counters.clear();
    }
    this.lastNumId = null;
    this.lastLevel = 0;
  }

  /**
   * 重置特定级别
   *
   * @param numId - 编号 ID
   * @param level - 级别
   * @param startValue - 起始值（可选）
   */
  resetLevel(numId: string, level: number, startValue?: number): void {
    const numCounters = this.counters.get(numId);
    if (numCounters) {
      if (startValue !== undefined) {
        numCounters.set(level, startValue - 1);
      } else {
        numCounters.delete(level);
      }
    }
  }

  /**
   * 获取当前计数值
   *
   * @param numId - 编号 ID
   * @param level - 级别
   * @returns 当前计数值
   */
  getCurrentCount(numId: string, level: number): number {
    return this.counters.get(numId)?.get(level) || 0;
  }
}
