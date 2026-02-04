import { Worksheet, XlsxDocument, Styles } from '../parser/types';
import { UnitConversion, FontMapping, ImageRenderer } from '@opr/shared';
import { VirtualScrollbar } from './VirtualScrollbar';
import { CellRenderer } from './CellRenderer';
import { BorderRenderer, DrawCmd } from './BorderRenderer';

export interface GridRendererOptions {
  width: number;
  height: number;
  rowHeight: number;
  colWidth: number;
}

interface MergeInfo {
  isMaster: boolean;
  masterRow: number;
  masterCol: number;
  rowSpan: number;
  colSpan: number;
  width: number;
  height: number;
}

export class GridRenderer {
  private container: HTMLElement;
  private canvasWrapper: HTMLElement;
  private tabBar: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private worksheet: Worksheet | null = null;
  private worksheetDocument: XlsxDocument | null = null;
  private options: GridRendererOptions;
  private mergeIndex: Map<string, MergeInfo> = new Map();
  private autoRowHeights: Map<number, number> = new Map();

  public scrollX = 0;
  public scrollY = 0;

  private totalWidth = 0;
  private totalHeight = 0;

  // Components
  private scrollbar: VirtualScrollbar;
  private scrollbarHideTimer: number | null = null;

  // Image Cache
  private imageCache: Map<string, ImageBitmap> = new Map();
  private imageLoading: Set<string> = new Set();

  // Event Handlers
  private _handleWheel: (e: WheelEvent) => void;
  private _handleMouseDown: (e: MouseEvent) => void;
  private _handleMouseMove: (e: MouseEvent) => void;
  private _handleMouseUp: (e: MouseEvent) => void;
  private _handleMouseEnter: (e: MouseEvent) => void;
  private _handleMouseLeave: (e: MouseEvent) => void;

  constructor(container: HTMLElement, options: Partial<GridRendererOptions> = {}) {
    this.container = container;

    // Create styles for Tabs
    this.injectStyles();

    // Setup DOM Structure
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.overflow = 'hidden';

    // Canvas Wrapper
    this.canvasWrapper = document.createElement('div');
    this.canvasWrapper.style.flex = '1';
    this.canvasWrapper.style.position = 'relative';
    this.canvasWrapper.style.overflow = 'hidden';
    this.container.appendChild(this.canvasWrapper);

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvasWrapper.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    // Tab Bar
    this.tabBar = document.createElement('div');
    this.tabBar.className = 'xlsx-tab-bar';
    this.container.appendChild(this.tabBar);

    this.options = {
      width: options.width || this.canvasWrapper.clientWidth || 800,
      height: options.height || this.canvasWrapper.clientHeight || 600,
      rowHeight: options.rowHeight || 25,
      colWidth: options.colWidth || 100
    };

    // Initialize Scrollbar with render request callback
    this.scrollbar = new VirtualScrollbar(() => this.render());

    // Bind Events (store references for removal)
    this._handleWheel = this.handleWheel.bind(this);
    this._handleMouseDown = this.handleMouseDown.bind(this);
    this._handleMouseMove = this.handleMouseMove.bind(this);
    this._handleMouseUp = this.handleMouseUp.bind(this);
    this._handleMouseEnter = this.handleMouseEnter.bind(this);
    this._handleMouseLeave = this.handleMouseLeave.bind(this);

    this.canvas.addEventListener('wheel', this._handleWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this._handleMouseDown);

    // Scrollbar Interaction Events
    this.canvasWrapper.addEventListener('mouseenter', this._handleMouseEnter);
    this.canvasWrapper.addEventListener('mouseleave', this._handleMouseLeave);
    this.canvasWrapper.addEventListener('mousemove', this._handleMouseEnter); // Reset hide timer on move

    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp);

    // Resize Observer
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.canvasWrapper);

    // Initial Resize
    this.resize();
  }

  private injectStyles() {
    if (document.getElementById('xlsx-renderer-styles')) return;
    const style = document.createElement('style');
    style.id = 'xlsx-renderer-styles';
    style.innerHTML = `
      .xlsx-tab-bar {
        height: 32px;
        background: #f3f3f3;
        display: flex;
        overflow-x: auto;
        border-top: 1px solid #e1e1e1;
        align-items: flex-end;
        padding-left: 5px;
        user-select: none;
      }
      .xlsx-tab {
        padding: 5px 15px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 13px;
        color: #444;
        cursor: pointer;
        border-right: 1px solid #e0e0e0;
        border-top: 1px solid transparent;
        background: #f3f3f3;
        transition: background 0.2s;
        margin-right: 2px;
        white-space: nowrap;
      }
      .xlsx-tab:hover {
        background: #e6e6e6;
      }
      .xlsx-tab.active {
        background: #ffffff;
        color: #217346;
        font-weight: 600;
        border-top: 2px solid #217346;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
    `;
    document.head.appendChild(style);
  }

  private handleMouseEnter() {
    // Cancel any pending hide timer
    if (this.scrollbarHideTimer) {
      clearTimeout(this.scrollbarHideTimer);
      this.scrollbarHideTimer = null;
    }
    // Fade in
    this.scrollbar.fadeIn();
  }

  private handleMouseLeave() {
    this.scrollbarHideTimer = window.setTimeout(() => {
      this.scrollbar.fadeOut();
    }, 2000); // 2 seconds delay
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();

    const { contentWidth, contentHeight } = this.calculateContentSize();
    const maxScrollX = Math.max(0, contentWidth - this.options.width);
    const maxScrollY = Math.max(0, contentHeight - this.options.height);

    this.scrollX += event.deltaX;
    this.scrollY += event.deltaY;

    // Clamp
    this.scrollX = Math.max(0, Math.min(this.scrollX, maxScrollX));
    this.scrollY = Math.max(0, Math.min(this.scrollY, maxScrollY));

    // If scrolling happens, ensure scrollbar is visible
    this.handleMouseEnter();

    this.render();
  }

  private handleMouseDown(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const { width, height } = this.options;

    // Delegate to Scrollbar
    const handled = this.scrollbar.handleMouseDown(
      e,
      rect,
      { width, height },
      { totalWidth: this.totalWidth, totalHeight: this.totalHeight },
      { scrollX: this.scrollX, scrollY: this.scrollY }
    );

    if (handled) return;
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const { width, height } = this.options;

    // Delegate
    const newScroll = this.scrollbar.handleMouseMove(
      e,
      rect,
      { width, height },
      { totalWidth: this.totalWidth, totalHeight: this.totalHeight }
    );

    if (newScroll) {
      if (newScroll.scrollX !== undefined) this.scrollX = newScroll.scrollX;
      if (newScroll.scrollY !== undefined) this.scrollY = newScroll.scrollY;
      this.render();
      return;
    }
  }

  private handleMouseUp() {
    this.scrollbar.handleMouseUp();
  }

  private calculateContentSize() {
    if (!this.worksheet) return { contentWidth: 0, contentHeight: 0 };

    let contentWidth = 0;

    let maxCol = 0;
    if (this.worksheet.dimension) {
      maxCol = this.worksheet.dimension.endCol;
    } else {
      for (const r of this.worksheet.rows.values()) {
        for (const c of r.cells.keys()) {
          if (c > maxCol) maxCol = c;
        }
      }
    }
    maxCol += 2; // Buffer

    for (let c = 1; c <= maxCol; c++) {
      contentWidth += this.getColWidth(c);
    }

    let contentHeight = 0;
    const rows = Array.from(this.worksheet.rows.values());
    if (rows.length > 0) {
      // Precise calculation
      let currentY = 0;
      let prevIdx = 0;
      // Sort rows
      const sortedRows = rows.sort((a, b) => a.index - b.index);

      for (const row of sortedRows) {
        const gap = row.index - prevIdx - 1;
        if (gap > 0) currentY += gap * this.options.rowHeight;
        currentY += this.getRowHeight(row.index);
        prevIdx = row.index;
      }
      contentHeight = currentY;
    }
    contentHeight += 100; // Padding

    this.totalWidth = contentWidth;
    this.totalHeight = contentHeight;

    return { contentWidth, contentHeight };
  }

  resize(width?: number, height?: number) {
    // If not provided, take from wrapper
    const newW = width || this.canvasWrapper.clientWidth;
    const newH = height || this.canvasWrapper.clientHeight;

    if (newW === 0 || newH === 0) return; // Hidden or not attached

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = newW * dpr;
    this.canvas.height = newH * dpr;
    this.canvas.style.width = `${newW}px`;
    this.canvas.style.height = `${newH}px`;
    this.ctx.scale(dpr, dpr);

    this.options.width = newW;
    this.options.height = newH;

    this.render();
  }

  setWorksheet(worksheet: Worksheet, doc?: XlsxDocument) {
    this.worksheet = worksheet;
    if (doc) {
      this.worksheetDocument = doc;
      this.renderTabs();
    } else {
      this.updateTabsActiveState();
    }

    this.prepareMerges();
    this.calculateAutoRowHeights();

    // Reset Scroll
    this.scrollX = 0;
    this.scrollY = 0;
    this.calculateContentSize();

    this.render();
  }

  private renderTabs() {
    this.tabBar.innerHTML = '';
    if (!this.worksheetDocument) return;

    this.worksheetDocument.worksheets.forEach((sheet, id) => {
      const tab = document.createElement('div');
      tab.className = 'xlsx-tab';
      tab.textContent = sheet.name;
      if (this.worksheet && sheet === this.worksheet) {
        tab.classList.add('active');
      }

      tab.onclick = () => {
        // Switch
        if (this.worksheet !== sheet) {
          this.setWorksheet(sheet);
        }
      };

      this.tabBar.appendChild(tab);
    });
  }

  private updateTabsActiveState() {
    const tabs = Array.from(this.tabBar.children);
    let idx = 0;
    if (!this.worksheetDocument) return;

    this.worksheetDocument.worksheets.forEach(sheet => {
      if (idx < tabs.length) {
        if (sheet === this.worksheet) {
          tabs[idx].classList.add('active');
        } else {
          tabs[idx].classList.remove('active');
        }
      }
      idx++;
    });
  }

  private calculateAutoRowHeights() {
    this.autoRowHeights.clear();
    if (!this.worksheet) return;

    const styles = this.worksheetDocument?.styles;
    const defaultFont = '12px Arial';
    this.ctx.font = defaultFont;

    for (const row of this.worksheet.rows.values()) {
      if (row.customHeight) continue;

      let maxH = this.getRowHeight(row.index, true);

      for (const [colIndex, cell] of row.cells) {
        const mergeInfo = this.mergeIndex.get(`${row.index},${colIndex}`);
        if (mergeInfo && !mergeInfo.isMaster) continue;

        let wrapText = false;
        let fontSize = 11;
        let fontFamily = 'Arial';
        let isBold = false;
        let isItalic = false;

        if (cell.styleId !== undefined && styles && styles.cellXfs[cell.styleId]) {
          const xf = styles.cellXfs[cell.styleId];
          if (xf.alignment?.wrapText) wrapText = true;

          if (xf.applyFont && styles.fonts[xf.fontId]) {
            const font = styles.fonts[xf.fontId];
            const sizePt = font.size || 11;
            fontSize = UnitConversion.ptToPixel(sizePt);
            const rawName = font.name || 'Arial';
            fontFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;
            if (font.bold) isBold = true;
            if (font.italic) isItalic = true;
          }
        }

        if (wrapText) {
          const fontStr = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
          this.ctx.font = fontStr;

          const colW = mergeInfo ? mergeInfo.width : this.getColWidth(colIndex);
          const padding = 2;
          const effectiveW = colW - padding;

          const text = CellRenderer.getCellText(cell, styles);
          const lines = CellRenderer.breakTextIntoLines(this.ctx, text, effectiveW);

          const lineHeight = fontSize * 1.25;
          const neededHeight = lines.length * lineHeight + 2;

          if (mergeInfo) {
            let currentTotalH = 0;
            for (let r = mergeInfo.masterRow; r < mergeInfo.masterRow + mergeInfo.rowSpan; r++) {
              currentTotalH += this.getRowHeight(r, true);
            }
            if (neededHeight > currentTotalH) {
              const diff = neededHeight - currentTotalH;
              maxH = Math.max(maxH, this.getRowHeight(row.index, true) + diff);
            }
          } else {
            maxH = Math.max(maxH, neededHeight);
          }
        }
      }
      if (maxH > this.getRowHeight(row.index, true)) {
        this.autoRowHeights.set(row.index, maxH);
      }
    }
  }

  private getColWidth(colIndex: number): number {
    if (this.worksheet?.cols.has(colIndex)) {
      return this.worksheet.cols.get(colIndex)!.width * 6.6 + 2;
    }
    return this.options.colWidth;
  }

  private getRowHeight(rowIndex: number, ignoreAuto = false): number {
    if (!ignoreAuto && this.autoRowHeights.has(rowIndex)) {
      return this.autoRowHeights.get(rowIndex)!;
    }
    if (this.worksheet?.rows.has(rowIndex)) {
      const h = this.worksheet.rows.get(rowIndex)!.height;
      if (h !== undefined) return UnitConversion.ptToPixel(h);
    }
    return this.options.rowHeight;
  }

  private prepareMerges() {
    this.mergeIndex.clear();
    if (!this.worksheet || !this.worksheet.merges) return;

    for (const ref of this.worksheet.merges) {
      const range = this.parseRange(ref);
      let totalWidth = 0;
      let totalHeight = 0;
      for (let c = range.startCol; c <= range.endCol; c++) {
        totalWidth += this.getColWidth(c);
      }
      for (let r = range.startRow; r <= range.endRow; r++) {
        totalHeight += this.getRowHeight(r);
      }

      const rowSpan = range.endRow - range.startRow + 1;
      const colSpan = range.endCol - range.startCol + 1;

      for (let r = range.startRow; r <= range.endRow; r++) {
        for (let c = range.startCol; c <= range.endCol; c++) {
          const isMaster = r === range.startRow && c === range.startCol;
          this.mergeIndex.set(`${r},${c}`, {
            isMaster,
            masterRow: range.startRow,
            masterCol: range.startCol,
            rowSpan,
            colSpan,
            width: totalWidth,
            height: totalHeight
          });
        }
      }
    }
  }

  private parseRange(ref: string) {
    const parts = ref.split(':');
    const start = parts[0];
    const end = parts.length > 1 ? parts[1] : start;

    const getColIndex = (colStr: string) => {
      let index = 0;
      for (let i = 0; i < colStr.length; i++) {
        index = index * 26 + (colStr.charCodeAt(i) - 64);
      }
      return index;
    };

    const parsePart = (p: string) => {
      const colMatch = p.match(/[A-Z]+/);
      const rowMatch = p.match(/[0-9]+/);
      return {
        col: colMatch ? getColIndex(colMatch[0]) : 1,
        row: rowMatch ? parseInt(rowMatch[0], 10) : 1
      };
    };

    const s = parsePart(start);
    const e = parsePart(end);

    return {
      startRow: s.row,
      endRow: e.row,
      startCol: s.col,
      endCol: e.col
    };
  }

  render() {
    if (!this.worksheet) return;

    // Ensure accurate metrics before render
    this.calculateContentSize();

    const { width, height } = this.options;
    const ctx = this.ctx;
    const { styles } = this.worksheetDocument || {};

    const frozen = this.worksheet.frozen;
    const frozenCols = frozen?.state === 'frozen' && frozen.xSplit ? frozen.xSplit : 0;
    const frozenRows = frozen?.state === 'frozen' && frozen.ySplit ? frozen.ySplit : 0;

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Font
    const defaultFont = '12px Arial';
    ctx.font = defaultFont;
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;

    // Fixed Dimensions
    let fixedWidth = 0;
    let fixedHeight = 0;
    for (let c = 1; c <= frozenCols; c++) fixedWidth += this.getColWidth(c);
    for (let r = 1; r <= frozenRows; r++) fixedHeight += this.getRowHeight(r);

    const rows = Array.from(this.worksheet.rows.values()).sort((a, b) => a.index - b.index);
    const borderCmds = new Map<string, DrawCmd>();
    const renderedMerges = new Set<string>();

    let currentY = 0;
    let previousRowIndex = 0;

    for (const row of rows) {
      const r = row.index;
      const rowH = this.getRowHeight(r);
      const rowsGap = r - previousRowIndex - 1;
      if (rowsGap > 0) currentY += rowsGap * this.options.rowHeight;
      const rawY = currentY;
      currentY += rowH;
      previousRowIndex = r;

      let screenY = rawY;
      let isVisibleY = true;

      if (r > frozenRows) {
        screenY = rawY - this.scrollY;
        if (screenY < fixedHeight) {
          if (screenY + rowH <= fixedHeight) isVisibleY = false;
        }
      }

      if (!isVisibleY || screenY > height) continue;

      let rawX = 0;
      for (let c = 1; c <= 26; c++) {
        const colW = this.getColWidth(c);
        let screenX = rawX;
        let isVisibleX = true;

        if (c > frozenCols) {
          screenX = rawX - this.scrollX;
          if (screenX < fixedWidth) {
            if (screenX + colW <= fixedWidth) isVisibleX = false;
          }
        }

        if (isVisibleX && screenX < width) {
          const mergeInfo = this.mergeIndex.get(`${r},${c}`);
          let renderW = colW;
          let renderH = rowH;
          let rowSpan = 1;
          let colSpan = 1;
          let shouldRender = true;
          let targetR = r;
          let targetC = c;
          let targetScreenX = screenX;
          let targetScreenY = screenY;
          let targetRow = row;

          if (mergeInfo) {
            const masterKey = `${mergeInfo.masterRow},${mergeInfo.masterCol}`;
            if (renderedMerges.has(masterKey)) {
              shouldRender = false;
            } else {
              renderedMerges.add(masterKey);
              if (!mergeInfo.isMaster) {
                const masterPos = this.getPixelPos(mergeInfo.masterCol - 1, mergeInfo.masterRow - 1, 0, 0);
                targetScreenX = masterPos.x - (mergeInfo.masterCol > frozenCols ? this.scrollX : 0);
                targetScreenY = masterPos.y - (mergeInfo.masterRow > frozenRows ? this.scrollY : 0);
                targetR = mergeInfo.masterRow;
                targetC = mergeInfo.masterCol;
                targetRow = this.worksheet.rows.get(targetR)!;
              }
              renderW = mergeInfo.width;
              renderH = mergeInfo.height;
              rowSpan = mergeInfo.rowSpan;
              colSpan = mergeInfo.colSpan;
              shouldRender = true;
            }
          }

          if (shouldRender) {
            ctx.save();
            ctx.strokeStyle = '#e6e6e6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(Math.floor(targetScreenX + renderW) + 0.5, Math.floor(targetScreenY));
            ctx.lineTo(Math.floor(targetScreenX + renderW) + 0.5, Math.floor(targetScreenY + renderH));
            ctx.moveTo(Math.floor(targetScreenX), Math.floor(targetScreenY + renderH) + 0.5);
            ctx.lineTo(Math.floor(targetScreenX + renderW), Math.floor(targetScreenY + renderH) + 0.5);
            ctx.stroke();
            ctx.restore();

            if (targetRow) {
              CellRenderer.render(
                ctx,
                targetRow,
                targetC,
                targetScreenX,
                targetScreenY,
                renderW,
                renderH,
                styles,
                defaultFont
              );
            }

            if (styles) {
              BorderRenderer.calculateBordersForCell(
                this.worksheet,
                styles,
                borderCmds,
                targetR,
                targetC,
                rowSpan,
                colSpan,
                targetScreenX,
                targetScreenY,
                renderW,
                renderH
              );
            }
          }
        }
        rawX += colW;
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    for (const cmd of borderCmds.values()) {
      BorderRenderer.renderCmd(ctx, cmd, frozenRows, frozenCols, fixedWidth, fixedHeight);
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    if (frozenCols > 0) {
      ctx.moveTo(fixedWidth, 0);
      ctx.lineTo(fixedWidth, height);
    }
    if (frozenRows > 0) {
      ctx.moveTo(0, fixedHeight);
      ctx.lineTo(width, fixedHeight);
    }
    ctx.stroke();

    this.renderImages(ctx, width, height);
    this.drawScrollBars(ctx, width, height);
  }

  private renderImages(ctx: CanvasRenderingContext2D, viewWidth: number, viewHeight: number) {
    if (!this.worksheet || !this.worksheet.images) return;
    for (const img of this.worksheet.images) {
      if (!this.imageCache.has(img.id)) {
        if (!this.imageLoading.has(img.id)) {
          this.imageLoading.add(img.id);
          createImageBitmap(img.blob)
            .then(bitmap => {
              this.imageCache.set(img.id, bitmap);
              this.imageLoading.delete(img.id);
              this.render();
            })
            .catch(e => {
              this.imageLoading.delete(img.id);
            });
        }
        continue;
      }
      const bitmap = this.imageCache.get(img.id)!;
      let x = 0,
        y = 0,
        w = 0,
        h = 0;

      if (img.position.type === 'twoCellAnchor' && img.position.from && img.position.to) {
        const fromPos = this.getPixelPos(
          img.position.from.col,
          img.position.from.row,
          img.position.from.colOff,
          img.position.from.rowOff
        );
        const toPos = this.getPixelPos(
          img.position.to.col,
          img.position.to.row,
          img.position.to.colOff,
          img.position.to.rowOff
        );
        x = fromPos.x;
        y = fromPos.y;
        w = toPos.x - fromPos.x;
        h = toPos.y - fromPos.y;
      } else {
        if (img.position.type === 'oneCellAnchor' && img.position.from) {
          const fromPos = this.getPixelPos(
            img.position.from.col,
            img.position.from.row,
            img.position.from.colOff,
            img.position.from.rowOff
          );
          x = fromPos.x;
          y = fromPos.y;
        } else {
          x = img.position.x || 0;
          y = img.position.y || 0;
        }
        w = img.position.width;
        h = img.position.height;
      }
      const screenX = x - this.scrollX;
      const screenY = y - this.scrollY;
      ImageRenderer.render(ctx, img, bitmap, screenX, screenY, w, h);
    }
  }

  private getPixelPos(colIdx: number, rowIdx: number, colOff: number, rowOff: number): { x: number; y: number } {
    let x = 0;
    for (let c = 0; c < colIdx; c++) x += this.getColWidth(c + 1);
    x += colOff;
    let y = 0;
    for (let r = 0; r < rowIdx; r++) y += this.getRowHeight(r + 1);
    y += rowOff;
    return { x, y };
  }

  private drawScrollBars(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.scrollbar.draw(
      ctx,
      { width: this.options.width, height: this.options.height },
      { totalWidth: this.totalWidth, totalHeight: this.totalHeight },
      { scrollX: this.scrollX, scrollY: this.scrollY }
    );
  }

  destroy() {
    this.canvas.removeEventListener('wheel', this._handleWheel);
    this.canvas.removeEventListener('mousedown', this._handleMouseDown);

    if (this.canvasWrapper) {
      this.canvasWrapper.removeEventListener('mouseenter', this._handleMouseEnter);
      this.canvasWrapper.removeEventListener('mouseleave', this._handleMouseLeave);
      this.canvasWrapper.removeEventListener('mousemove', this._handleMouseEnter);
    }

    window.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('mouseup', this._handleMouseUp);

    this.container.innerHTML = '';
  }
}
