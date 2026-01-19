/**
 * 数字格式化工具
 *
 * 根据 Excel 格式字符串格式化数值
 */
export class NumberFormatUtils {
  /**
   * 根据 Excel 格式字符串格式化数值
   *
   * 部分实现 SSF (SpreadSheet Format) 规范
   *
   * @param value - 待格式化的值
   * @param formatCode - Excel 格式代码
   * @param date1904 - 是否使用 1904 日期系统
   * @returns 格式化后的字符串
   */
  static format(value: any, formatCode: string, date1904 = false): string {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'number') return String(value);
    if (!formatCode || formatCode === 'General') return String(value);

    // 处理分节（正数;负数;零;文本）
    const sections = formatCode.split(';');
    let activeFmt = sections[0];

    if (sections.length > 1) {
      if (value > 0) activeFmt = sections[0];
      else if (value < 0) activeFmt = sections[1] || sections[0];
      else if (value === 0) activeFmt = sections[2] || sections[0];
    }

    // 移除条件/颜色标记，如 [Red], [<=100] 等
    // 简化处理，仅用于内容渲染
    activeFmt = activeFmt.replace(/\[[^\]]*\]/g, '');

    // 日期/时间格式
    if (this.isDateFormat(activeFmt)) {
      const date = this.parseExcelDate(value, date1904);
      if (date) return this.formatDate(date, activeFmt);
    }

    // 百分比格式
    if (activeFmt.includes('%')) {
      return this.formatPercent(value, activeFmt);
    }

    // 科学计数法
    if (/E[+-]0+/i.test(activeFmt)) {
      return this.formatScientific(value, activeFmt);
    }

    // 分数格式
    if (activeFmt.includes('?/?')) {
      return this.formatFraction(value, activeFmt);
    }

    // 标准小数
    return this.formatDecimal(value, activeFmt);
  }

  /**
   * 判断是否为日期格式
   *
   * @param fmt - 格式字符串
   * @returns 是否为日期格式
   */
  private static isDateFormat(fmt: string): boolean {
    // 移除引号内的文字
    const cleaned = fmt.replace(/"[^"]*"/g, '');
    // 检查标准日期标记，排除 "General" 或纯数字字符
    // y: 年, m: 月/分, d: 日, h: 时, s: 秒, a/p: am/pm
    return /[ymdhs]/.test(cleaned.toLowerCase()) && !/^[0#\.,]+$/.test(cleaned);
  }

  /**
   * 解析 Excel 序列日期
   *
   * @param serial - Excel 日期序列号
   * @param date1904 - 是否使用 1904 日期系统
   * @returns Date 对象或 null
   */
  private static parseExcelDate(serial: number, date1904 = false): Date | null {
    if (serial < 1) {
      // 基础时间支持（0.5 = 12:00 PM），基于纪元计算
      // Serial 0 是 1900-01-00？
      // 视为从纪元起的偏移量用于时间提取
      const totalSeconds = Math.round(serial * 86400);
      const date = new Date(0);
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCSeconds(totalSeconds);
      return date;
    }

    // 1970-01-01 的偏移量
    // 1900 系统: 从 1899-12-30 到 1970-01-01 共 25569 天
    // 1904 系统: 从 1904-01-01 到 1970-01-01 共 24107 天
    const offset = date1904 ? 24107 : 25569;
    const utc_days = Math.floor(serial - offset);
    const utc_value = utc_days * 86400;
    // 添加小数部分（时间）
    const fractional_day = serial - Math.floor(serial);
    const total_seconds = utc_value + Math.round(fractional_day * 86400);

    return new Date(total_seconds * 1000);
  }

  /**
   * 格式化日期
   *
   * @param date - Date 对象
   * @param fmt - 格式字符串
   * @returns 格式化后的日期字符串
   */
  private static formatDate(date: Date, fmt: string): string {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const H = date.getUTCHours();
    const M = date.getUTCMinutes();
    const S = date.getUTCSeconds();

    // 分词器方式
    let out = '';
    let i = 0;
    const len = fmt.length;

    // 预计算值

    while (i < len) {
      const c = fmt[i];

      // 检查引号字符串
      if (c === '"') {
        i++;
        while (i < len && fmt[i] !== '"') {
          out += fmt[i];
          i++;
        }
        i++;
        continue;
      }

      // 检查标准标记（按长度降序）
      // yyyy, yy, mmmm, mmm, mm, m, dddd, ddd, dd, d, hh, h, ss, s, am/pm
      // 简单方式：检查特定标记
      // 'm' 的特殊处理（分钟 vs 月份）
      // 如果前一个标记是 h，或下一个是 s？需要上下文判断。

      // 实际上，正则替换更安全，可以分别处理 m vs min。
      // 为避免分词器错误，这次迭代回退到可靠的正则链。
      out += c; // 回退
      i++;
    }

    // 为安全性和逻辑修复回退到正则
    out = fmt;

    // 转义检查
    // ...

    // 1. 年份
    out = out.replace(/yyyy/gi, String(y));
    out = out.replace(/yy/gi, String(y % 100).padStart(2, '0'));

    // 2. 小时（H 默认为 24 小时制）
    out = out.replace(/hh/gi, String(H).padStart(2, '0'));
    out = out.replace(/h/gi, String(H));

    // 3. 秒
    out = out.replace(/ss/gi, String(S).padStart(2, '0'));
    out = out.replace(/s/gi, String(S));

    // 替换 mm:ss -> MIN:ss
    out = out.replace(/(m+)[:\s]+(s+)/gi, (match, mStr, _s) => {
      return match.replace(mStr, mStr.length > 1 ? String(M).padStart(2, '0') : String(M));
    });

    // 剩余的 m/mm 是月份
    out = out.replace(/mm/gi, String(m).padStart(2, '0'));
    out = out.replace(/m/gi, String(m));

    // 5. 日期
    out = out.replace(/dd/gi, String(d).padStart(2, '0'));
    out = out.replace(/d/gi, String(d));

    // 清理引号
    out = out.replace(/"/g, '');

    return out;
  }

  /**
   * 格式化百分比
   *
   * @param value - 数值
   * @param fmt - 格式字符串
   * @returns 格式化后的百分比字符串
   */
  private static formatPercent(value: number, fmt: string): string {
    const val = value * 100;
    // 清理格式字符串以找到小数位数
    // "0.00%" -> 2 位小数
    // 修复科学计数法: 0.00E+00 -> 2 位小数
    // 只计算点后、E 或 % 之前的 0 和 #
    const cleanDec = fmt.split('.')[1]?.match(/^[0#]+/)?.[0]?.length || 0;
    return val.toFixed(cleanDec) + '%';
  }

  /**
   * 格式化科学计数法
   *
   * @param value - 数值
   * @param fmt - 格式字符串
   * @returns 格式化后的科学计数法字符串
   */
  private static formatScientific(value: number, fmt: string): string {
    // 0.00E+00
    const afterDot = fmt.split('.')[1] || '';
    const decimals = afterDot.match(/^[0#]+/)?.[0]?.length || 2;
    const exp = value.toExponential(decimals).toUpperCase();

    const [mantissa, exponent] = exp.split('E');
    if (!exponent) return exp;

    // 检查指数所需的填充
    // fmt 包含 E+00 或 E-00 等
    const expFmt = fmt.match(/E[+-]([0]+)/i);
    if (expFmt) {
      const minWidth = expFmt[1].length; // 0 的数量
      const sign = exponent[0];
      const valStr = exponent.substring(1);
      const paddedVal = valStr.padStart(minWidth, '0');
      return `${mantissa}E${sign}${paddedVal}`;
    }

    return exp;
  }

  /**
   * 格式化小数
   *
   * @param value - 数值
   * @param fmt - 格式字符串
   * @returns 格式化后的小数字符串
   */
  private static formatDecimal(value: number, fmt: string): string {
    // 处理千位分隔符
    const useThousands = fmt.includes(',');
    // 小数位数
    const decimals = (fmt.split('.')[1] || '').replace(/[^0#]/g, '').length;

    let ret = value.toFixed(decimals);
    if (useThousands) {
      const parts = ret.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      ret = parts.join('.');
    }
    // 货币符号？
    // 例如 "¥#,##0.00"
    // 尝试保留非格式字符串
    // 这是复杂的正则
    // 快速方案：如果 fmt 以字符开头
    const prefix = fmt.match(/^[^#0\.]+/)?.[0] || '';
    const suffix = fmt.match(/[^#0\.]+$/)?.[0] || '';

    // 从字符串中移除格式字符用于逻辑处理
    return prefix.replace(/"/g, '') + ret + suffix.replace(/"/g, '');
  }

  /**
   * 格式化分数
   *
   * @param value - 数值
   * @param _fmt - 格式字符串（暂未使用）
   * @returns 格式化后的分数字符串
   */
  private static formatFraction(value: number, _fmt: string): string {
    // 简单假分数近似
    // "1 1/5"
    const intPart = Math.floor(value);
    const frac = value - intPart;
    if (Math.abs(frac) < 0.00001) return String(intPart);

    // 简化：查找最接近的分母（通常最多 2 位数）
    let bestNum = 1,
      bestDen = 1;
    let minErr = 1.0;

    for (let den = 1; den < 100; den++) {
      const num = Math.round(frac * den);
      const err = Math.abs(frac - num / den);
      if (err < minErr) {
        minErr = err;
        bestNum = num;
        bestDen = den;
      }
    }

    return `${intPart} ${bestNum}/${bestDen}`;
  }
}
