/**
 * 布局计算器
 *
 * 负责计算 XLSX 工作表的布局度量，包括列宽、行高和合并单元格处理
 */

import type { XlsxSheet } from '../types';
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, EMU_TO_PX } from './constants';

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
   * @param sheet - 工作表数据
   * @returns 布局度量结果
   */
  static calculateLayoutMetrics(sheet: XlsxSheet): {
    maxRow: number;
    maxCol: number;
    colWidths: number[];
    rowHeights: number[];
  } {
    let maxRow = (sheet.rows || []).length;
    let maxCol = (sheet.columns || []).length;

    const colWidths: number[] = [];
    const rowHeights: number[] = [];

    // 检查所有浮动元素，扩展渲染范围
    const check = (list: any[] | undefined) => {
      if (!list) return;
      for (const item of list) {
        const anchor = item.anchor;
        if (!anchor) continue;
        const toCol = anchor.to?.col ?? anchor.col;
        const toRow = anchor.to?.row ?? anchor.row;
        if (toCol !== undefined && toCol + 1 > maxCol) maxCol = toCol + 1;
        if (toRow !== undefined && toRow + 1 > maxRow) maxRow = toRow + 1;
      }
    };

    check(sheet.images);
    check(sheet.shapes);
    check(sheet.connectors);
    check(sheet.charts);
    check(sheet.groups);

    // 填充列宽数组
    for (let c = 0; c < maxCol; c++) {
      const colDef = (sheet.columns || []).find(col => col.min <= c + 1 && col.max >= c + 1);
      const w = colDef?.width ?? DEFAULT_COL_WIDTH;
      colWidths.push(w);
    }

    // 填充行高数组
    for (let r = 0; r < maxRow; r++) {
      const rowDef = (sheet.rows || []).find(row => row.r === r + 1);
      const h = rowDef?.ht ?? DEFAULT_ROW_HEIGHT;
      rowHeights.push(h);
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
