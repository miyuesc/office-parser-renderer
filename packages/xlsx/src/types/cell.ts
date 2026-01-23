/**
 * XLSX 单元格相关类型定义
 */

/**
 * XLSX 锚点接口
 */
export interface XlsxAnchor {
  /** 列索引 */
  col: number;
  /** 列偏移量 (EMU) */
  colOff: number;
  /** 行索引 */
  row: number;
  /** 行偏移量 (EMU) */
  rowOff: number;
}

/**
 * XLSX 行接口
 */
export interface XlsxRow {
  /** 行索引（1-based） */
  index: number;
  /** 行高 */
  height?: number;
  /** 是否自定义高度 */
  customHeight: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 单元格数据 */
  cells: Record<number, XlsxCell>;
}

/**
 * XLSX 列接口
 */
export interface XlsxColumn {
  /** 起始列索引 */
  min: number;
  /** 结束列索引 */
  max: number;
  /** 列宽 */
  width: number;
  /** 是否自定义宽度 */
  customWidth: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * XLSX 单元格接口
 */
export interface XlsxCell {
  /**
   * 单元格类型
   * - s: 共享字符串
   * - n: 数字
   * - b: 布尔值
   * - e: 错误
   * - str: 字符串
   * - inlineStr: 内联字符串
   * - d: 日期
   */
  type: 's' | 'n' | 'b' | 'e' | 'str' | 'inlineStr' | 'd';
  /** 单元格值 */
  value: string | number | boolean | Date;
  /** 公式 */
  formula?: string;
  /** 样式索引 */
  styleIndex?: number;
}

/**
 * XLSX 合并单元格接口
 */
export interface XlsxMergeCell {
  /** 起始位置 */
  s: { r: number; c: number };
  /** 结束位置 */
  e: { r: number; c: number };
}
