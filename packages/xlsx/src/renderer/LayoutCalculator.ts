/**
 * 布局计算器
 *
 * 负责计算 XLSX 工作表的布局度量，包括列宽、行高和合并单元格处理
 */

import type { XlsxSheet } from '../types';
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from './constants';

// Excel 列宽（字符单位）到像素的转换因子
const CHAR_WIDTH_TO_PX = 7.5;
// 行高（Points）到像素的转换因子
const PT_TO_PX = 96 / 72; // = 1.333...

/**
 * 布局计算器类
 */
export class LayoutCalculator {
  /**
   * 计算布局指标（列宽和行高度量）
   *
   * 遍历所有绘图对象以确定需要渲染的最大行和列范围
   * 同时填充 colWidths 和 rowHeights 数组
   *
   * 注意：返回的 colWidths 和 rowHeights 都是像素值，
   * 与表格渲染使用相同的转换逻辑
   *
   * @param sheet - 工作表数据
   * @returns 布局度量结果（均为像素值）
   */
  static calculateLayoutMetrics(sheet: XlsxSheet): {
    maxRow: number;
    maxCol: number;
    colWidths: number[];
    rowHeights: number[];
  } {
    // 获取行数据的最大行索引（sheet.rows 是 Record<number, XlsxRow>）
    const rowKeys = Object.keys(sheet.rows || {}).map(Number);
    let maxRow = rowKeys.length > 0 ? Math.max(...rowKeys) : 0;

    // 获取列定义的最大列索引（sheet.cols 是 XlsxColumn[]）
    let maxCol = 0;
    (sheet.cols || []).forEach((col: { max: number }) => {
      if (col.max > maxCol) maxCol = col.max;
    });

    const colWidths: number[] = [];
    const rowHeights: number[] = [];

    // 检查所有浮动元素，扩展渲染范围
    const check = (list: any[] | undefined) => {
      if (!list) return;
      for (const item of list) {
        const anchor = item.anchor;
        if (!anchor) continue;
        const toCol = anchor.to?.col ?? anchor.from?.col ?? 0;
        const toRow = anchor.to?.row ?? anchor.from?.row ?? 0;
        if (toCol + 1 > maxCol) maxCol = toCol + 1;
        if (toRow + 1 > maxRow) maxRow = toRow + 1;
      }
    };

    check(sheet.images);
    check(sheet.shapes);
    check(sheet.connectors);
    check(sheet.charts);
    check(sheet.groupShapes);

    // 辅助函数：根据列索引（1-based）查找列定义
    const getColDef = (idx: number) => {
      return (sheet.cols || []).find(col => idx >= col.min && idx <= col.max);
    };

    // 填充列宽数组（转换为像素）
    // 使用与 renderSheet 相同的转换逻辑：width * 7.5
    for (let c = 0; c < maxCol; c++) {
      const colDef = getColDef(c + 1); // 列索引是 1-based
      if (colDef?.width) {
        // Excel 列宽（字符单位）转换为像素
        colWidths.push(colDef.width * CHAR_WIDTH_TO_PX);
      } else {
        // 默认列宽（已经是像素）
        colWidths.push(DEFAULT_COL_WIDTH);
      }
    }

    // 填充行高数组（转换为像素）
    // 使用与 renderSheet 相同的转换逻辑：height * 1.33
    for (let r = 0; r < maxRow; r++) {
      const rowDef = sheet.rows?.[r + 1]; // 行索引是 1-based
      if (rowDef?.height) {
        // 行高（Points）转换为像素
        rowHeights.push(rowDef.height * PT_TO_PX);
      } else {
        // 默认行高（已经是像素）
        rowHeights.push(DEFAULT_ROW_HEIGHT);
      }
    }

    return { maxRow, maxCol, colWidths, rowHeights };
  }

  /**
   * 判断单元格是否处于被合并状态（非左上角的主单元格）
   *
   * 如果返回 true，则该单元格在渲染时应该被跳过
   *
   * @param r - 行索引（0-based）
   * @param c - 列索引（0-based）
   * @param merges - 合并单元格定义数组
   * @returns 是否被合并
   */
  static isMerged(r: number, c: number, merges: any[]): boolean {
    if (!merges) return false;
    for (const m of merges) {
      const { s, e } = m;
      // 如果在合并范围内，但不是左上角单元格
      if (r >= s.r && r <= e.r && c >= s.c && c <= e.c) {
        if (r !== s.r || c !== s.c) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 获取合并单元格的起始定义
   *
   * 如果当前单元格是一个合并块的左上角，返回该合并定义
   *
   * @param r - 行索引（0-based）
   * @param c - 列索引（0-based）
   * @param merges - 合并单元格定义数组
   * @returns 合并定义或 null
   */
  static getMergeStart(r: number, c: number, merges: any[]): any | null {
    if (!merges) return null;
    for (const m of merges) {
      if (m.s.r === r && m.s.c === c) {
        return m;
      }
    }
    return null;
  }
}
