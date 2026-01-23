/**
 * 表格渲染器
 *
 * 渲染 Table 元素为 DOM
 * 处理表格样式、合并单元格等
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '@ai-space/shared';
import { ParagraphRenderer, ParagraphRenderContext } from './ParagraphRenderer';
import type {
  Table,
  TableRow,
  TableCell,
  TableProperties,
  TableCellProperties,
  DocxElement,
  TableCellMargins,
  TableBorders
} from '../types';

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
    TableRenderer.applyTableStyles(tableEl, table.props, table.grid);

    // 渲染所有行
    const tbody = document.createElement('tbody');
    const rowCount = table.rows.length;

    table.rows.forEach((row, rowIndex) => {
      const isFirstRow = rowIndex === 0;
      const isLastRow = rowIndex === rowCount - 1;

      const rowEl = TableRenderer.renderRow(row, table.grid, table.props.cellMargins, isFirstRow, isLastRow, context);
      tbody.appendChild(rowEl);
    });
    tableEl.appendChild(tbody);

    return tableEl;
  }

  /**
   * 渲染表格行
   */
  private static renderRow(
    row: TableRow,
    grid: number[],
    tableMargins: TableCellMargins | undefined,
    isFirstRow: boolean,
    isLastRow: boolean,
    context?: TableRenderContext
  ): HTMLTableRowElement {
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
    const cellCount = row.cells.length;

    row.cells.forEach((cell, cellIndex) => {
      // 跳过垂直合并的继续单元格
      if (cell.props.vMerge === 'continue') {
        gridIndex += cell.props.gridSpan || 1;
        return;
      }

      const isFirstCol = cellIndex === 0;
      const isLastCol = cellIndex === cellCount - 1;

      const td = TableRenderer.renderCell(
        cell,
        grid,
        gridIndex,
        tableMargins,
        isFirstRow,
        isLastRow,
        isFirstCol,
        isLastCol,
        context
      );
      tr.appendChild(td);
      gridIndex += cell.props.gridSpan || 1;
    });

    return tr;
  }

  /**
   * 渲染单元格
   */
  private static renderCell(
    cell: TableCell,
    grid: number[],
    gridIndex: number,
    tableMargins: TableCellMargins | undefined,
    isFirstRow: boolean,
    isLastRow: boolean,
    isFirstCol: boolean,
    isLastCol: boolean,
    context?: TableRenderContext
  ): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'docx-table-cell';

    // 应用单元格样式
    TableRenderer.applyCellStyles(
      td,
      cell.props,
      grid,
      gridIndex,
      tableMargins,
      isFirstRow,
      isLastRow,
      isFirstCol,
      isLastCol
    );

    // 处理水平合并
    if (cell.props.gridSpan && cell.props.gridSpan > 1) {
      td.colSpan = cell.props.gridSpan;
    }

    // 渲染内容
    for (const child of cell.children) {
      const element = TableRenderer.renderCellChild(child, context);
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
   * 应用单元格样式
   */
  private static applyCellStyles(
    td: HTMLTableCellElement,
    props: TableCellProperties,
    grid: number[],
    gridIndex: number,
    tableMargins: TableCellMargins | undefined,
    isFirstRow: boolean,
    isLastRow: boolean,
    isFirstCol: boolean,
    isLastCol: boolean
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

    // 单元格边框 logic with inheritance fallback
    const getBorder = (side: keyof TableBorders, fallbackVar: string) => {
      if (props.borders && props.borders[side]) {
        return TableRenderer.formatBorder(props.borders[side]!);
      }
      return `var(${fallbackVar}, 1px solid black)`;
    };

    style.borderTop = getBorder('top', isFirstRow ? '--table-border-top' : '--table-border-inside-h');
    style.borderBottom = getBorder('bottom', isLastRow ? '--table-border-bottom' : '--table-border-inside-h');
    style.borderLeft = getBorder('left', isFirstCol ? '--table-border-left' : '--table-border-inside-v');
    style.borderRight = getBorder('right', isLastCol ? '--table-border-right' : '--table-border-inside-v');

    // 对角线边框 (模拟)
    const diagonals: string[] = [];
    if (props.borders?.tl2br && props.borders.tl2br.val !== 'nil') {
      const color =
        props.borders.tl2br.color && props.borders.tl2br.color !== 'auto' ? `#${props.borders.tl2br.color}` : '#000';
      const width = props.borders.tl2br.sz
        ? Math.max(UnitConverter.eighthPointsToPixels(props.borders.tl2br.sz), 1)
        : 1;
      diagonals.push(
        `linear-gradient(to bottom right, transparent calc(50% - ${width}px), ${color} calc(50% - ${width / 2}px), ${color} calc(50% + ${width / 2}px), transparent calc(50% + ${width}px))`
      );
    }

    if (props.borders?.tr2bl && props.borders.tr2bl.val !== 'nil') {
      const color =
        props.borders.tr2bl.color && props.borders.tr2bl.color !== 'auto' ? `#${props.borders.tr2bl.color}` : '#000';
      const width = props.borders.tr2bl.sz
        ? Math.max(UnitConverter.eighthPointsToPixels(props.borders.tr2bl.sz), 1)
        : 1;
      diagonals.push(
        `linear-gradient(to bottom left, transparent calc(50% - ${width}px), ${color} calc(50% - ${width / 2}px), ${color} calc(50% + ${width / 2}px), transparent calc(50% + ${width}px))`
      );
    }

    if (diagonals.length > 0) {
      style.backgroundImage = diagonals.join(', ');
    }

    // 单元格边距
    const margins = props.margins || tableMargins;

    if (margins) {
      const top = margins.top ? UnitConverter.twipsToPixels(margins.top) : 0;
      const right = margins.right ? UnitConverter.twipsToPixels(margins.right) : 0;
      const bottom = margins.bottom ? UnitConverter.twipsToPixels(margins.bottom) : 0;
      const left = margins.left ? UnitConverter.twipsToPixels(margins.left) : 0;
      style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    } else {
      style.padding = '0';
    }

    // 底纹
    // Handle w:shd which can have fill (bg color) and val (pattern)
    // Here we primarily support fill color
    if (props.shading) {
      if (props.shading.fill && props.shading.fill !== 'auto') {
        style.backgroundColor = `#${props.shading.fill}`;
      } else if (props.shading.val === 'clear' && props.shading.color && props.shading.color !== 'auto') {
        // Sometimes clear pattern with color is used for background? No, clear means no pattern.
        // If fill is auto/undefined, and val is clear, it's transparent.
      }
      // TODO: Handle patterns key words if needed
    }

    // 文字方向
    if (props.textDirection) {
      style.writingMode = TableRenderer.mapTextDirection(props.textDirection);
    }

    // 禁止换行
    if (props.noWrap) {
      style.whiteSpace = 'nowrap';
    }
  }

  /**
   * 渲染单元格内容
   */
  private static renderCellChild(child: DocxElement, context?: TableRenderContext): HTMLElement | null {
    switch (child.type) {
      case 'paragraph':
        return ParagraphRenderer.render(child, context);

      case 'table':
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
      TableRenderer.applyTableBorders(table, props.borders);
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
      style.setProperty('--table-border-top', TableRenderer.formatBorder(borders.top));
    }
    if (borders.bottom) {
      style.setProperty('--table-border-bottom', TableRenderer.formatBorder(borders.bottom));
    }
    if (borders.left) {
      style.setProperty('--table-border-left', TableRenderer.formatBorder(borders.left));
    }
    if (borders.right) {
      style.setProperty('--table-border-right', TableRenderer.formatBorder(borders.right));
    }
    if (borders.insideH) {
      style.setProperty('--table-border-inside-h', TableRenderer.formatBorder(borders.insideH));
    }
    if (borders.insideV) {
      style.setProperty('--table-border-inside-v', TableRenderer.formatBorder(borders.insideV));
    }

    // 应用外边框到表格
    if (borders.top) {
      style.borderTop = TableRenderer.formatBorder(borders.top);
    }
    if (borders.bottom) {
      style.borderBottom = TableRenderer.formatBorder(borders.bottom);
    }
    if (borders.left) {
      style.borderLeft = TableRenderer.formatBorder(borders.left);
    }
    if (borders.right) {
      style.borderRight = TableRenderer.formatBorder(borders.right);
    }
  }

  /**

    // 单元格边框 logic with inheritance fallback
    const getBorder = (side: keyof typeof props.borders, fallbackVar: string) => {
      if (props.borders && props.borders[side]) {
        return TableRenderer.formatBorder(props.borders[side]!);
      }
      return `var(${fallbackVar}, 1px solid black)`; 
    };

    style.borderTop = getBorder('top', isFirstRow ? '--table-border-top' : '--table-border-inside-h');
    style.borderBottom = getBorder('bottom', isLastRow ? '--table-border-bottom' : '--table-border-inside-h');
    style.borderLeft = getBorder('left', isFirstCol ? '--table-border-left' : '--table-border-inside-v');
    style.borderRight = getBorder('right', isLastCol ? '--table-border-right' : '--table-border-inside-v');

    // 对角线边框 (模拟)
    const diagonals: string[] = [];
    if (props.borders?.tl2br && props.borders.tl2br.val !== 'nil') {
      const color = props.borders.tl2br.color && props.borders.tl2br.color !== 'auto' ? `#${props.borders.tl2br.color}` : '#000';
      const width = props.borders.tl2br.sz ? Math.max(UnitConverter.eighthPointsToPixels(props.borders.tl2br.sz), 1) : 1;
      diagonals.push(`linear-gradient(to bottom right, transparent calc(50% - ${width}px), ${color} calc(50% - ${width/2}px), ${color} calc(50% + ${width/2}px), transparent calc(50% + ${width}px))`);
    }
    
    if (props.borders?.tr2bl && props.borders.tr2bl.val !== 'nil') {
      const color = props.borders.tr2bl.color && props.borders.tr2bl.color !== 'auto' ? `#${props.borders.tr2bl.color}` : '#000';
      const width = props.borders.tr2bl.sz ? Math.max(UnitConverter.eighthPointsToPixels(props.borders.tr2bl.sz), 1) : 1;
      diagonals.push(`linear-gradient(to bottom left, transparent calc(50% - ${width}px), ${color} calc(50% - ${width/2}px), ${color} calc(50% + ${width/2}px), transparent calc(50% + ${width}px))`);
    if (diagonals.length > 0) {
      style.backgroundImage = diagonals.join(', ');
    }
      const bottom = margins.bottom ? UnitConverter.twipsToPixels(margins.bottom) : 0;
      const left = margins.left ? UnitConverter.twipsToPixels(margins.left) : 0;
      style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    } else {
      style.padding = '0'; // default strict
    }

    // 底纹
    if (props.shading?.fill && props.shading.fill !== 'auto') {
      style.backgroundColor = `#${props.shading.fill}`;
    }

    // 文字方向
    if (props.textDirection) {
      style.writingMode = TableRenderer.mapTextDirection(props.textDirection);
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
    const styleType = TableRenderer.mapBorderStyle(border.val);

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
