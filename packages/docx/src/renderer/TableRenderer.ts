/**
 * 表格渲染器
 *
 * 渲染 Table 元素为 DOM
 * 处理表格样式、合并单元格等
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import { ParagraphRenderer, ParagraphRenderContext } from './ParagraphRenderer';
import type { Table, TableRow, TableCell, TableProperties, TableCellProperties, DocxElement } from '../types';

const log = Logger.createTagged('TableRenderer');

/**
 * 表格渲染上下文接口
 */
export interface TableRenderContext extends ParagraphRenderContext {
  /** 表格嵌套层级 */
  nestLevel?: number;
}

/**
 * 表格渲染器类
 */
export class TableRenderer {
  /**
   * 渲染表格
   *
   * @param table - Table 对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static render(table: Table, context?: TableRenderContext): HTMLElement {
    const tableEl = document.createElement('table');
    tableEl.className = 'docx-table';

    // 应用表格样式
    this.applyTableStyles(tableEl, table.props, table.grid);

    // 渲染所有行
    const tbody = document.createElement('tbody');
    for (const row of table.rows) {
      const rowEl = this.renderRow(row, table.grid, context);
      tbody.appendChild(rowEl);
    }
    tableEl.appendChild(tbody);

    return tableEl;
  }

  /**
   * 渲染表格行
   *
   * @param row - TableRow 对象
   * @param grid - 列宽网格
   * @param context - 渲染上下文
   * @returns HTMLTableRowElement
   */
  private static renderRow(row: TableRow, grid: number[], context?: TableRenderContext): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.className = 'docx-table-row';

    // 应用行样式
    if (row.props.height) {
      const heightPx = UnitConverter.twipsToPixels(row.props.height);

      if (row.props.heightRule === 'exact') {
        tr.style.height = `${heightPx}px`;
      } else {
        tr.style.minHeight = `${heightPx}px`;
      }
    }

    // 渲染单元格
    let gridIndex = 0;
    for (const cell of row.cells) {
      // 跳过垂直合并的继续单元格
      if (cell.props.vMerge === 'continue') {
        gridIndex += cell.props.gridSpan || 1;
        continue;
      }

      const td = this.renderCell(cell, grid, gridIndex, context);
      tr.appendChild(td);
      gridIndex += cell.props.gridSpan || 1;
    }

    return tr;
  }

  /**
   * 渲染单元格
   *
   * @param cell - TableCell 对象
   * @param grid - 列宽网格
   * @param gridIndex - 网格起始索引
   * @param context - 渲染上下文
   * @returns HTMLTableCellElement
   */
  private static renderCell(
    cell: TableCell,
    grid: number[],
    gridIndex: number,
    context?: TableRenderContext
  ): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'docx-table-cell';

    // 应用单元格样式
    this.applyCellStyles(td, cell.props, grid, gridIndex);

    // 处理水平合并
    if (cell.props.gridSpan && cell.props.gridSpan > 1) {
      td.colSpan = cell.props.gridSpan;
    }

    // 渲染内容
    for (const child of cell.children) {
      const element = this.renderCellChild(child, context);
      if (element) {
        td.appendChild(element);
      }
    }

    // 确保空单元格有高度
    if (td.childNodes.length === 0) {
      const nbsp = document.createElement('span');
      nbsp.innerHTML = '&nbsp;';
      td.appendChild(nbsp);
    }

    return td;
  }

  /**
   * 渲染单元格内容
   *
   * @param child - 子元素
   * @param context - 渲染上下文
   * @returns HTMLElement 或 null
   */
  private static renderCellChild(child: DocxElement, context?: TableRenderContext): HTMLElement | null {
    switch (child.type) {
      case 'paragraph':
        return ParagraphRenderer.render(child, context);

      case 'table':
        // 嵌套表格
        return TableRenderer.render(child, {
          ...context,
          nestLevel: (context?.nestLevel || 0) + 1
        });

      default:
        log.debug(`未处理的单元格内容类型: ${child.type}`);
        return null;
    }
  }

  /**
   * 应用表格样式
   *
   * @param table - 表格元素
   * @param props - 表格属性
   * @param grid - 列宽网格
   */
  private static applyTableStyles(table: HTMLTableElement, props: TableProperties, grid: number[]): void {
    const style = table.style;

    // 基础样式
    style.borderCollapse = 'collapse';
    style.tableLayout = props.layout === 'fixed' ? 'fixed' : 'auto';

    // 表格宽度
    if (props.width) {
      if (props.width.type === 'pct') {
        style.width = `${props.width.value / 50}%`;
      } else if (props.width.type === 'dxa') {
        const widthPx = UnitConverter.twipsToPixels(props.width.value);
        style.width = `${widthPx}px`;
      } else {
        style.width = '100%';
      }
    } else {
      // 根据列宽网格计算总宽度
      if (grid.length > 0) {
        const totalWidth = grid.reduce((sum, w) => sum + w, 0);
        const widthPx = UnitConverter.twipsToPixels(totalWidth);
        style.width = `${widthPx}px`;
      }
    }

    // 表格对齐
    if (props.alignment === 'center') {
      style.marginLeft = 'auto';
      style.marginRight = 'auto';
    } else if (props.alignment === 'right') {
      style.marginLeft = 'auto';
    }

    // 表格缩进
    if (props.indent) {
      const indentPx = UnitConverter.twipsToPixels(props.indent);
      style.marginLeft = `${indentPx}px`;
    }

    // 表格边框
    if (props.borders) {
      this.applyTableBorders(table, props.borders);
    }

    // 底纹
    if (props.shading?.fill && props.shading.fill !== 'auto') {
      style.backgroundColor = `#${props.shading.fill}`;
    }

    // 单元格间距
    if (props.cellSpacing) {
      const spacingPx = UnitConverter.twipsToPixels(props.cellSpacing);
      style.borderSpacing = `${spacingPx}px`;
      style.borderCollapse = 'separate';
    }
  }

  /**
   * 应用表格边框
   *
   * @param table - 表格元素
   * @param borders - 边框配置
   */
  private static applyTableBorders(table: HTMLTableElement, borders: TableProperties['borders']): void {
    if (!borders) return;

    // 使用 CSS 变量存储边框样式，供单元格使用
    const style = table.style;

    if (borders.top) {
      style.setProperty('--table-border-top', this.formatBorder(borders.top));
    }
    if (borders.bottom) {
      style.setProperty('--table-border-bottom', this.formatBorder(borders.bottom));
    }
    if (borders.left) {
      style.setProperty('--table-border-left', this.formatBorder(borders.left));
    }
    if (borders.right) {
      style.setProperty('--table-border-right', this.formatBorder(borders.right));
    }
    if (borders.insideH) {
      style.setProperty('--table-border-inside-h', this.formatBorder(borders.insideH));
    }
    if (borders.insideV) {
      style.setProperty('--table-border-inside-v', this.formatBorder(borders.insideV));
    }

    // 应用外边框到表格
    if (borders.top) {
      style.borderTop = this.formatBorder(borders.top);
    }
    if (borders.bottom) {
      style.borderBottom = this.formatBorder(borders.bottom);
    }
    if (borders.left) {
      style.borderLeft = this.formatBorder(borders.left);
    }
    if (borders.right) {
      style.borderRight = this.formatBorder(borders.right);
    }
  }

  /**
   * 应用单元格样式
   *
   * @param td - 单元格元素
   * @param props - 单元格属性
   * @param grid - 列宽网格
   * @param gridIndex - 网格索引
   */
  private static applyCellStyles(
    td: HTMLTableCellElement,
    props: TableCellProperties,
    grid: number[],
    gridIndex: number
  ): void {
    const style = td.style;

    // 单元格宽度
    if (props.width) {
      if (props.widthType === 'pct') {
        style.width = `${props.width / 50}%`;
      } else {
        const widthPx = UnitConverter.twipsToPixels(props.width);
        style.width = `${widthPx}px`;
      }
    } else {
      // 从网格计算宽度
      let totalWidth = 0;
      const span = props.gridSpan || 1;
      for (let i = gridIndex; i < gridIndex + span && i < grid.length; i++) {
        totalWidth += grid[i];
      }
      if (totalWidth > 0) {
        const widthPx = UnitConverter.twipsToPixels(totalWidth);
        style.width = `${widthPx}px`;
      }
    }

    // 垂直对齐
    if (props.vAlign) {
      style.verticalAlign = props.vAlign;
    }

    // 单元格边框
    if (props.borders) {
      if (props.borders.top) {
        style.borderTop = this.formatBorder(props.borders.top);
      }
      if (props.borders.bottom) {
        style.borderBottom = this.formatBorder(props.borders.bottom);
      }
      if (props.borders.left) {
        style.borderLeft = this.formatBorder(props.borders.left);
      }
      if (props.borders.right) {
        style.borderRight = this.formatBorder(props.borders.right);
      }
    } else {
      // 使用默认边框
      style.border = '1px solid #000';
    }

    // 单元格边距
    if (props.margins) {
      const top = props.margins.top ? UnitConverter.twipsToPixels(props.margins.top) : 0;
      const right = props.margins.right ? UnitConverter.twipsToPixels(props.margins.right) : 0;
      const bottom = props.margins.bottom ? UnitConverter.twipsToPixels(props.margins.bottom) : 0;
      const left = props.margins.left ? UnitConverter.twipsToPixels(props.margins.left) : 0;
      style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    } else {
      style.padding = '5px';
    }

    // 底纹
    if (props.shading?.fill && props.shading.fill !== 'auto') {
      style.backgroundColor = `#${props.shading.fill}`;
    }

    // 文字方向
    if (props.textDirection) {
      style.writingMode = this.mapTextDirection(props.textDirection);
    }

    // 禁止换行
    if (props.noWrap) {
      style.whiteSpace = 'nowrap';
    }
  }

  /**
   * 格式化边框样式
   *
   * @param border - 边框配置
   * @returns CSS border 属性值
   */
  private static formatBorder(border: { val: string; color?: string; sz?: number }): string {
    if (border.val === 'nil' || border.val === 'none') {
      return 'none';
    }

    const width = border.sz ? UnitConverter.eighthPointsToPixels(border.sz) : 1;
    const color = border.color && border.color !== 'auto' ? `#${border.color}` : '#000000';
    const styleType = this.mapBorderStyle(border.val);

    return `${Math.max(width, 1)}px ${styleType} ${color}`;
  }

  /**
   * 映射边框样式
   *
   * @param val - 边框类型
   * @returns CSS border-style 值
   */
  private static mapBorderStyle(val: string): string {
    const map: Record<string, string> = {
      single: 'solid',
      thick: 'solid',
      double: 'double',
      dotted: 'dotted',
      dashed: 'dashed',
      nil: 'none',
      none: 'none'
    };

    return map[val] || 'solid';
  }

  /**
   * 映射文字方向
   *
   * @param textDirection - 文字方向
   * @returns CSS writing-mode 值
   */
  private static mapTextDirection(textDirection: string): string {
    const map: Record<string, string> = {
      lrTb: 'horizontal-tb',
      tbRl: 'vertical-rl',
      btLr: 'vertical-lr',
      lrTbV: 'horizontal-tb',
      tbRlV: 'vertical-rl',
      tbLrV: 'vertical-lr'
    };

    return map[textDirection] || 'horizontal-tb';
  }
}
