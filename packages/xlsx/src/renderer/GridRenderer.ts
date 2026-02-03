import { Worksheet, Cell, XlsxDocument } from '../parser/types';
import { Logger } from '@opr/shared';

const logger = new Logger('GridRenderer');

export interface GridRendererOptions {
  width: number;
  height: number;
  rowHeight: number;
  colWidth: number;
}

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private worksheet: Worksheet | null = null;
  private worksheetDocument: XlsxDocument | null = null;
  private options: GridRendererOptions;

  constructor(container: HTMLElement, options: Partial<GridRendererOptions> = {}) {
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.options = {
      width: options.width || container.clientWidth || 800,
      height: options.height || container.clientHeight || 600,
      rowHeight: options.rowHeight || 25,
      colWidth: options.colWidth || 100
    };

    this.resize(this.options.width, this.options.height);
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.options.width = width;
    this.options.height = height;
    this.render();
  }

  setWorksheet(worksheet: Worksheet, doc?: XlsxDocument) {
    this.worksheet = worksheet;
    if (doc) this.worksheetDocument = doc;
    this.render();
  }

  render() {
    if (!this.worksheet) return;

    const { width, height } = this.options;
    const ctx = this.ctx;
    const { styles } = this.worksheetDocument || {}; // We need access to document styles

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const defaultRowHeight = this.options.rowHeight;
    const defaultColWidth = this.options.colWidth;

    // 基础字体设置
    const defaultFont = '12px Arial';
    ctx.font = defaultFont;
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;

    // 获取所有行并排序
    const rows = Array.from(this.worksheet.rows.values()).sort((a, b) => a.index - b.index);

    for (const row of rows) {
      const r = row.index;
      const rowH = row.height || defaultRowHeight;

      // MVP: 假设 row.index 是对的，我们计算 offset
      const y = (r - 1) * defaultRowHeight;

      if (y > height) break;

      let x = 0;
      // 遍历列 (MVP: 假设渲染前 26 列)
      for (let c = 1; c <= 26; c++) {
        // 获取列宽
        let colW = defaultColWidth;
        if (this.worksheet.cols.has(c)) {
          // column width in Excel is roughly number of characters
          // Approximate: width * 7 pixels
          colW = this.worksheet.cols.get(c)!.width * 7;
        }

        if (x > width) break;

        const cell = row.cells.get(c);
        let cellStyleStr = defaultFont;
        let fgColor = '#000000';
        let bgColor = 'transparent';
        let align = 'left';

        // 获取样式
        if (cell && cell.styleId !== undefined && styles && styles.cellXfs[cell.styleId]) {
          const xf = styles.cellXfs[cell.styleId];

          // Font
          if (xf.applyFont && styles.fonts[xf.fontId]) {
            const font = styles.fonts[xf.fontId];
            const size = font.size || 11;
            const name = font.name || 'Arial';
            const bold = font.bold ? 'bold ' : '';
            const italic = font.italic ? 'italic ' : '';
            cellStyleStr = `${italic}${bold}${size}px "${name}"`;
            if (font.color) fgColor = font.color;
          }

          // Fill
          if (xf.applyFill && styles.fills[xf.fillId]) {
            const fill = styles.fills[xf.fillId];
            if (fill.type === 'pattern' && fill.fgColor) {
              bgColor = fill.fgColor;
            }
          }

          // Alignment
          if (xf.alignment?.horizontal) {
            align = xf.alignment.horizontal;
          }
        }

        // 绘制背景
        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(x, y, colW, rowH);
        }

        // 绘制边框
        ctx.strokeStyle = '#e0e0e0';
        ctx.strokeRect(x, y, colW, rowH);

        // 绘制内容
        if (cell) {
          const text = this.getCellText(cell);
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + 1, y + 1, colW - 2, rowH - 2);
          ctx.clip();

          ctx.font = cellStyleStr;
          ctx.fillStyle = fgColor;

          let textX = x + 4;
          if (align === 'center') textX = x + colW / 2;
          else if (align === 'right') textX = x + colW - 4;

          ctx.textAlign = align as CanvasTextAlign;
          ctx.fillText(text, textX, y + rowH / 2);

          ctx.restore();
        }

        x += colW;
      }
    }
  }

  private getCellText(cell: Cell): string {
    if (cell.value === undefined || cell.value === null) return '';
    return String(cell.value);
  }

  destroy() {
    this.canvas.remove();
  }
}
