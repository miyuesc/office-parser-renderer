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
  private scrollbar = new VirtualScrollbar();

  // Image Cache
  private imageCache: Map<string, ImageBitmap> = new Map();
  private imageLoading: Set<string> = new Set();

  constructor(container: HTMLElement, options: Partial<GridRendererOptions> = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block'; // Prevent inline-block baseline issues
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.options = {
      width: options.width || container.clientWidth || 800,
      height: options.height || container.clientHeight || 600,
      rowHeight: options.rowHeight || 25,
      colWidth: options.colWidth || 100
    };

    this.resize(this.options.width, this.options.height);

    // Bind Events
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
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

    // Handle other clicks (e.g. cell selection) here later
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
      this.scrollX = newScroll.scrollX; // Note: helper returns {scrollX} object match?
      // Check interface: helper returns ScrollState { scrollX, scrollY }
      if (newScroll.scrollX !== undefined) this.scrollX = newScroll.scrollX;
      if (newScroll.scrollY !== undefined) this.scrollY = newScroll.scrollY;
      this.render();
      return; // Stop processing transparency/etc if dragging scrollbar
    }
  }

  // Fix ratio variable scope issue in handleMouseMove (redeclaration)
  // Re-implement specialized ratios for H scroll

  private handleMouseUp() {
    this.scrollbar.handleMouseUp();
  }

  private calculateContentSize() {
    if (!this.worksheet) return { contentWidth: 0, contentHeight: 0 };

    let contentWidth = 0;
    let contentHeight = 0;

    // Estimate Width using columns
    // Use heuristic: look for last non-empty column or use dimension
    // Simple approach: max column index from data or dimension
    let maxCol = 0;
    if (this.worksheet.dimension) {
      maxCol = this.worksheet.dimension.endCol;
    } else {
      // Fallback: iterate (expensive but safer if no dim)
      for (const r of this.worksheet.rows.values()) {
        for (const c of r.cells.keys()) {
          if (c > maxCol) maxCol = c;
        }
      }
    }

    // Add extra buffer columns
    maxCol += 2;

    for (let c = 1; c <= maxCol; c++) {
      contentWidth += this.getColWidth(c);
    }

    // Estimate Height
    // We can't just multiply, must sum heights because of variable row heights
    const rows = Array.from(this.worksheet.rows.values());
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      // We know the Y pos of the last row? Not directly stored.
      // We have to re-calculate total height essentially.
      // But render loop does this. Let's optimize: cache it?
      // For now, re-calc is fine for simple sheets.

      let currentY = 0;
      let prevIdx = 0;

      for (const row of rows.sort((a, b) => a.index - b.index)) {
        const gap = row.index - prevIdx - 1;
        if (gap > 0) currentY += gap * this.options.rowHeight;
        currentY += this.getRowHeight(row.index);
        prevIdx = row.index;
      }
      contentHeight = currentY;
    }

    // Add some padding
    contentHeight += 100;

    this.totalWidth = contentWidth;
    this.totalHeight = contentHeight;

    return { contentWidth, contentHeight };
  }

  resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    this.options.width = width;
    this.options.height = height;
    this.render();
  }

  setWorksheet(worksheet: Worksheet, doc?: XlsxDocument) {
    this.worksheet = worksheet;
    if (doc) this.worksheetDocument = doc;
    this.prepareMerges();
    this.calculateAutoRowHeights();
    this.render();
  }

  private calculateAutoRowHeights() {
    this.autoRowHeights.clear();
    if (!this.worksheet) return;

    const styles = this.worksheetDocument?.styles;
    const defaultFont = '12px Arial';
    this.ctx.font = defaultFont; // Reset to default for measurement

    // Iterate through all cells to find those needing auto-height
    for (const row of this.worksheet.rows.values()) {
      // If customHeight is set (fixed height), skip auto-calculation
      if (row.customHeight) continue;

      let maxH = this.getRowHeight(row.index, true); // Get base height (explicit or default)

      for (const [colIndex, cell] of row.cells) {
        // Skip if part of a merge (unless it's the master, but for now simplify:
        // usually wrapped text is in a single cell or master of merge.
        // Handling auto-height for merged cells is complex, we'll start with single cells)
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

            // Resolve Font Family
            const rawName = font.name || 'Arial';
            fontFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

            if (font.bold) isBold = true;
            if (font.italic) isItalic = true;
          }
        }

        // Only calculate if wrapText is on OR it's a very long text that might need space?
        // Excel only auto-grows if wrapText is true.
        if (wrapText) {
          const fontStr = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
          this.ctx.font = fontStr;

          const colW = mergeInfo ? mergeInfo.width : this.getColWidth(colIndex);
          const padding = 2; // Reduced padding
          const effectiveW = colW - padding;

          const text = CellRenderer.getCellText(cell, styles);
          const lines = CellRenderer.breakTextIntoLines(this.ctx, text, effectiveW);

          // Estimate height: lines * lineHeight + padding
          const lineHeight = fontSize * 1.25; // Tighter line height
          const neededHeight = lines.length * lineHeight + 2; // +2 top/bottom padding

          if (mergeInfo) {
            // If merged, we should ideally check if the total height of rows covered is enough.
            // For simplicity in this fix, we simply don't force expand rows for merged cells
            // YET, or we treat it as if this single row needs to accommodate it?
            // Expanding the FIRST row of a merge is a common strategy if not strictly distributing.
            // Let's try expanding the current row (master row) to fit.

            // Check current total height of the merge range
            let currentTotalH = 0;
            for (let r = mergeInfo.masterRow; r < mergeInfo.masterRow + mergeInfo.rowSpan; r++) {
              currentTotalH += this.getRowHeight(r, true);
            }

            if (neededHeight > currentTotalH) {
              // Determine how much extra space is needed
              const diff = neededHeight - currentTotalH;
              // Add diff to the master row (simplest approach)
              maxH = Math.max(maxH, this.getRowHeight(row.index, true) + diff);
            }
          } else {
            maxH = Math.max(maxH, neededHeight);
          }
        }
      }

      // Store calculated height if it's different from default/explicit
      if (maxH > this.getRowHeight(row.index, true)) {
        this.autoRowHeights.set(row.index, maxH);
      }
    }
  }

  private getColWidth(colIndex: number): number {
    if (this.worksheet?.cols.has(colIndex)) {
      // Adjusted approximation: 1 char ~ 6.6px + 2px padding
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

    // Default Grid Lines (Draw grid lines for the whole visible area first)
    // This is a simple approach. A more accurate one would be per-cell.
    // But rendering lines for all row/col intersections is generally okay for functionality.
    // We'll skip this implicit pass if we want to rely on cells.
    // Actually, user wants "default frame lines". Auto-drawing them is best.
    ctx.beginPath();
    ctx.strokeStyle = '#e6e6e6'; // Light gray for default grid
    ctx.lineWidth = 1;

    // Draw vertical grid lines
    let gx = 0;
    for (let c = 1; c <= 26; c++) {
      // Limiting to basic range or use dimension
      // We should iterate visible columns
      // Re-using the main loop logic is hard because that loop is per-cell.
      // Let's do a quick pass for grid lines or just add them in the main loop?
      // Main loop is better to respect scroll/freeze.
    }
    // Let's do it inside the main loop to handle scroll correctly.

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

    // Render Loop
    let currentY = 0;
    let previousRowIndex = 0;

    for (const row of rows) {
      const r = row.index;
      const rowH = this.getRowHeight(r);

      // Add height for skipped rows (gaps)
      const rowsGap = r - previousRowIndex - 1;
      if (rowsGap > 0) {
        currentY += rowsGap * this.options.rowHeight;
      }

      const rawY = currentY;

      // Prepare for next row
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
          // Render Background & Content
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
                // Determine Master Position (getPixelPos expects 0-based index)
                const masterPos = this.getPixelPos(mergeInfo.masterCol - 1, mergeInfo.masterRow - 1, 0, 0);
                targetScreenX = masterPos.x - (mergeInfo.masterCol > frozenCols ? this.scrollX : 0);
                targetScreenY = masterPos.y - (mergeInfo.masterRow > frozenRows ? this.scrollY : 0);

                // Adjust for frozen panes logic broadly (simplification)
                // If master is in frozen area but we are scrolling, coords might be fixed.
                // But getPixelPos gives absolute raw.
                // Let's rely on standard scroll offset for now, assuming standard flow.

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
            // Draw default grid lines if needed (simplified: just stroke rect light gray before content?)
            // Or better: stroke rect *after* bg fill but *before* text?
            // Actually, custom borders are drawn last. Default grid lines should be drawn first.
            ctx.save();
            ctx.strokeStyle = '#e6e6e6';
            ctx.lineWidth = 1;
            // Draw bottom and right for grid effect
            ctx.beginPath();
            // Draw full rect for grid?
            // Vertical line at right
            ctx.moveTo(Math.floor(targetScreenX + renderW) + 0.5, Math.floor(targetScreenY));
            ctx.lineTo(Math.floor(targetScreenX + renderW) + 0.5, Math.floor(targetScreenY + renderH));
            // Horizontal line at bottom
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

    // Pass 2: Draw Borders
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    for (const cmd of borderCmds.values()) {
      BorderRenderer.renderCmd(ctx, cmd, frozenRows, frozenCols, fixedWidth, fixedHeight);
    }

    // Draw Freeze Separators
    ctx.lineWidth = 2; // Separator thickness
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
      // Check cache
      if (!this.imageCache.has(img.id)) {
        if (!this.imageLoading.has(img.id)) {
          this.imageLoading.add(img.id);
          createImageBitmap(img.blob)
            .then(bitmap => {
              this.imageCache.set(img.id, bitmap);
              this.imageLoading.delete(img.id);
              this.render(); // Re-render when loaded
            })
            .catch(e => {
              console.error('Failed to load image', e);
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

      // Calculate Position
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
        // OneCellAnchor or Absolute
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

      // Apply Scroll
      const screenX = x - this.scrollX;
      const screenY = y - this.scrollY;

      // Draw
      ImageRenderer.render(ctx, img, bitmap, screenX, screenY, w, h);
    }
  }

  private getPixelPos(colIdx: number, rowIdx: number, colOff: number, rowOff: number): { x: number; y: number } {
    let x = 0;
    // Sum columns 0 to colIdx-1 -> indices 1 to colIdx
    for (let c = 0; c < colIdx; c++) {
      // Excel columns are 1-based in our map
      x += this.getColWidth(c + 1);
    }
    x += colOff;

    let y = 0;
    for (let r = 0; r < rowIdx; r++) {
      // Excel rows are 1-based in our map
      y += this.getRowHeight(r + 1);
    }
    y += rowOff;

    return { x, y };
  }

  private drawScrollBars(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.scrollbar.draw(
      ctx,
      { width, height },
      { totalWidth: this.totalWidth, totalHeight: this.totalHeight },
      { scrollX: this.scrollX, scrollY: this.scrollY }
    );
  }

  destroy() {
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.remove();
  }
}
