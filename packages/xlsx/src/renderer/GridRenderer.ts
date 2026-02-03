import { Worksheet, Cell, XlsxDocument, Styles, BorderPr, Border } from '../parser/types';
import {
  NumberFormatter,
  BorderConflictResolver,
  IBorder,
  BorderStyle,
  UnitConversion,
  FontMapping,
  ColorUtils,
  OfficeImage
} from '@opr/shared';

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

interface DrawCmd {
  x: number;
  y: number;
  len: number;
  isVertical: boolean; // true = vertical (Left/Right), false = horizontal (Top/Bottom)
  border: IBorder;
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

  // Scrollbar Interaction State
  private isDraggingV = false;
  private isDraggingH = false;
  private dragStart = { x: 0, y: 0 };
  private dragStartScroll = { x: 0, y: 0 };
  private readonly SCROLLBAR_SIZE = 10;
  private readonly SCROLLBAR_PADDING = 2;
  private readonly SCROLLBAR_MIN_THUMB = 20;

  // Image Cache
  private imageCache: Map<string, ImageBitmap> = new Map();
  private imageLoading: Set<string> = new Set();

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = this.options;

    // Check Vertical Scrollbar
    if (x > width - this.SCROLLBAR_SIZE && this.totalHeight > height) {
      this.isDraggingV = true;
      this.dragStart = { x, y };
      this.dragStartScroll = { x: this.scrollX, y: this.scrollY };
      return;
    }

    // Check Horizontal Scrollbar
    if (y > height - this.SCROLLBAR_SIZE && this.totalWidth > width) {
      this.isDraggingH = true;
      this.dragStart = { x, y };
      this.dragStartScroll = { x: this.scrollX, y: this.scrollY };
      return;
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isDraggingV && !this.isDraggingH) return;

    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = this.options;

    if (this.isDraggingV) {
      const deltaY = y - this.dragStart.y;
      const trackHeight = height - this.SCROLLBAR_SIZE; // Leave space for corner
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / this.totalHeight) * trackHeight);
      const scrollableHeight = trackHeight - thumbHeight;
      const scrollableContent = this.totalHeight - height;

      if (scrollableHeight > 0) {
        const ratio = scrollableContent / scrollableHeight;
        this.scrollY = Math.max(0, Math.min(scrollableContent, this.dragStartScroll.y + deltaY * ratio));
      }
    }

    if (this.isDraggingH) {
      const deltaX = x - this.dragStart.x;
      const trackWidth = width - this.SCROLLBAR_SIZE;
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / this.totalWidth) * trackWidth);
      const scrollableWidth = trackWidth - thumbWidth;
      const scrollableContent = this.totalWidth - width;

      if (scrollableWidth > 0) {
        const ratio = scrollableContent / scrollableWidth;
        this.scrollX = Math.max(0, Math.min(scrollableContent, this.dragStartScroll.x + deltaX * ratio));
      }
    }

    this.render();
  }

  // Fix ratio variable scope issue in handleMouseMove (redeclaration)
  // Re-implement specialized ratios for H scroll

  private handleMouseUp() {
    this.isDraggingV = false;
    this.isDraggingH = false;
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

          const text = this.getCellText(cell, styles);
          const lines = this.breakTextIntoLines(this.ctx, text, effectiveW);

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

          if (mergeInfo) {
            if (!mergeInfo.isMaster) shouldRender = false;
            else {
              renderW = mergeInfo.width;
              renderH = mergeInfo.height;
              rowSpan = mergeInfo.rowSpan;
              colSpan = mergeInfo.colSpan;
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
            ctx.moveTo(Math.floor(screenX + renderW) + 0.5, Math.floor(screenY));
            ctx.lineTo(Math.floor(screenX + renderW) + 0.5, Math.floor(screenY + renderH));
            // Horizontal line at bottom
            ctx.moveTo(Math.floor(screenX), Math.floor(screenY + renderH) + 0.5);
            ctx.lineTo(Math.floor(screenX + renderW), Math.floor(screenY + renderH) + 0.5);
            ctx.stroke();
            ctx.restore();

            this.renderCellBgAndText(
              ctx,
              row,
              c,
              screenX,
              screenY,
              renderW,
              renderH,
              styles,
              defaultFont,
              frozenRows,
              frozenCols,
              fixedWidth,
              fixedHeight
            );

            this.calculateBordersForCell(
              r,
              c,
              rowSpan,
              colSpan,
              screenX,
              screenY,
              renderW,
              renderH,
              styles,
              borderCmds
            );
          }
        }
        rawX += colW;
      }
    }

    // Pass 2: Draw Borders
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    for (const cmd of borderCmds.values()) {
      this.renderBorderCmd(ctx, cmd, frozenRows, frozenCols, fixedWidth, fixedHeight);
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

      // Skip if out of view
      // Simple culling
      /* if (screenX + w < 0 || screenY + h < 0 || screenX > viewWidth || screenY > viewHeight) continue; */ // Rotation makes simple culling risky

      // Draw
      ctx.save();

      const cx = screenX + w / 2;
      const cy = screenY + h / 2;

      ctx.translate(cx, cy);

      if (img.position.rotation) {
        // Excel rotation is in degrees. Canvas uses radians.
        ctx.rotate((img.position.rotation * Math.PI) / 180);
      }

      if (img.position.flipH) ctx.scale(-1, 1);
      if (img.position.flipV) ctx.scale(1, -1);

      ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);

      ctx.restore();
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
    const trackColor = 'rgba(0, 0, 0, 0.05)';
    const thumbColor = 'rgba(0, 0, 0, 0.3)';
    const thumbHoverColor = 'rgba(0, 0, 0, 0.5)';

    // Vertical Scrollbar
    if (this.totalHeight > height) {
      const trackHeight = height - this.SCROLLBAR_SIZE;
      const thumbHeight = Math.max(this.SCROLLBAR_MIN_THUMB, (height / this.totalHeight) * trackHeight);
      const scrollRatio = this.scrollY / (this.totalHeight - height);
      const thumbY = scrollRatio * (trackHeight - thumbHeight);

      // Track
      ctx.fillStyle = trackColor;
      ctx.fillRect(width - this.SCROLLBAR_SIZE, 0, this.SCROLLBAR_SIZE, trackHeight);

      // Thumb
      ctx.fillStyle = this.isDraggingV ? thumbHoverColor : thumbColor;
      // Rounded Rect for nice look? Simple rect for now
      ctx.fillRect(
        width - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbY + this.SCROLLBAR_PADDING,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2,
        thumbHeight - this.SCROLLBAR_PADDING * 2
      );
    }

    // Horizontal Scrollbar
    if (this.totalWidth > width) {
      const trackWidth = width - this.SCROLLBAR_SIZE;
      const thumbWidth = Math.max(this.SCROLLBAR_MIN_THUMB, (width / this.totalWidth) * trackWidth);
      const scrollRatio = this.scrollX / (this.totalWidth - width);
      const thumbX = scrollRatio * (trackWidth - thumbWidth);

      // Track
      ctx.fillStyle = trackColor;
      ctx.fillRect(0, height - this.SCROLLBAR_SIZE, trackWidth, this.SCROLLBAR_SIZE);

      // Thumb
      ctx.fillStyle = this.isDraggingH ? thumbHoverColor : thumbColor;
      ctx.fillRect(
        thumbX + this.SCROLLBAR_PADDING,
        height - this.SCROLLBAR_SIZE + this.SCROLLBAR_PADDING,
        thumbWidth - this.SCROLLBAR_PADDING * 2,
        this.SCROLLBAR_SIZE - this.SCROLLBAR_PADDING * 2
      );
    }

    // Corner
    if (this.totalHeight > height && this.totalWidth > width) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width - this.SCROLLBAR_SIZE, height - this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE, this.SCROLLBAR_SIZE);
    }
  }

  private renderCellBgAndText(
    ctx: CanvasRenderingContext2D,
    row: any,
    c: number,
    x: number,
    y: number,
    w: number,
    h: number,
    styles: Styles | undefined,
    defaultFont: string,
    frozenRows: number,
    frozenCols: number,
    fixedWidth: number,
    fixedHeight: number
  ) {
    const cell = row.cells.get(c);
    let cellStyleStr = defaultFont;
    let fgColor = '#000000';
    let bgColor = 'transparent';
    let align = 'left';
    let vAlign = 'center';
    let wrapText = false;
    let fontSize = 12;
    let isUnderline = false;
    let isStrike = false;

    if (cell && cell.styleId !== undefined && styles && styles.cellXfs[cell.styleId]) {
      const xf = styles.cellXfs[cell.styleId];
      if (xf.applyFont && styles.fonts[xf.fontId]) {
        const font = styles.fonts[xf.fontId];
        const sizePt = font.size || 11;
        fontSize = UnitConversion.ptToPixel(sizePt);
        if (font.underline) isUnderline = true;
        if (font.strike) isStrike = true;

        // Resolve Font Family
        const rawName = font.name || 'Arial';
        const safeFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

        const bold = font.bold ? 'bold ' : '';
        const italic = font.italic ? 'italic ' : '';
        cellStyleStr = `${italic}${bold}${fontSize}px ${safeFamily}`;
        if (font.color) fgColor = ColorUtils.formatColor(font.color) || '#000000';
      }
      if (xf.applyFill && styles.fills[xf.fillId]) {
        const fill = styles.fills[xf.fillId];
        if (fill.type === 'pattern' && fill.fgColor) {
          // For pattern fills, fgColor is the background color of the cell
          bgColor = ColorUtils.formatColor(fill.fgColor) || 'transparent';
        }
      }
      if (xf.alignment) {
        if (xf.alignment.horizontal) align = xf.alignment.horizontal;
        if (xf.alignment.vertical) vAlign = xf.alignment.vertical;
        wrapText = !!xf.alignment.wrapText;
      }
    }

    // CLIPPING
    const rIndex = row.index;
    const isFrozenRow = rIndex <= frozenRows;
    const isFrozenCol = c <= frozenCols;

    ctx.save();
    ctx.beginPath();
    if (!isFrozenRow && !isFrozenCol) ctx.rect(fixedWidth, fixedHeight, 99999, 99999);
    else if (!isFrozenRow) ctx.rect(0, fixedHeight, fixedWidth, 99999);
    else if (!isFrozenCol) ctx.rect(fixedWidth, 0, 99999, fixedHeight);
    else ctx.rect(0, 0, fixedWidth, fixedHeight);
    ctx.clip();

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
    }

    if (cell) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      const padding = 2;
      const effectiveW = w - padding * 2;

      if (cell.richText && cell.richText.length > 0) {
        let totalWidth = 0;
        for (const run of cell.richText) {
          const f = run.font;
          let fStr = cellStyleStr;
          if (f) {
            const sizePt = f.size || 11;
            const sizePx = UnitConversion.ptToPixel(sizePt);

            const rawName = f.name || 'Arial';
            const safeFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

            const bold = f.bold ? 'bold ' : '';
            const italic = f.italic ? 'italic ' : '';
            fStr = `${italic}${bold}${sizePx}px ${safeFamily}`;
          }
          ctx.font = fStr;
          totalWidth += ctx.measureText(run.text).width;
        }

        let curX = x + padding;
        if (align === 'center') curX = x + w / 2 - totalWidth / 2;
        else if (align === 'right') curX = x + w - totalWidth - padding;

        let curY = y + h / 2;
        if (vAlign === 'top') curY = y + padding + fontSize / 2;
        else if (vAlign === 'bottom') curY = y + h - padding - fontSize / 2;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        for (const run of cell.richText) {
          const f = run.font;
          let fStr = cellStyleStr;
          let fColor = fgColor;
          if (f) {
            const sizePt = f.size || 11;
            const sizePx = UnitConversion.ptToPixel(sizePt);

            const rawName = f.name || 'Arial';
            const safeFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;

            const bold = f.bold ? 'bold ' : '';
            const italic = f.italic ? 'italic ' : '';
            fStr = `${italic}${bold}${sizePx}px ${safeFamily}`;
            if (f.color) fColor = ColorUtils.formatColor(f.color) || '#000000';
          }
          ctx.font = fStr;
          ctx.fillStyle = fColor;
          ctx.fillText(run.text, curX, curY);

          // Decorations
          const textMetric = ctx.measureText(run.text);
          const textW = textMetric.width;

          if (f.underline) {
            ctx.beginPath();
            ctx.moveTo(curX, curY + fontSize / 2 + 1);
            ctx.lineTo(curX + textW, curY + fontSize / 2 + 1);
            ctx.strokeStyle = fColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          if (f.strike) {
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(curX + textW, curY);
            ctx.strokeStyle = fColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          curX += textW;
        }
      } else {
        const text = this.getCellText(cell, styles);
        ctx.font = cellStyleStr;
        ctx.fillStyle = fgColor;

        let textX = x + padding;
        if (align === 'center') textX = x + w / 2;
        else if (align === 'right') textX = x + w - padding;

        ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

        const lines = wrapText ? this.breakTextIntoLines(ctx, text, effectiveW) : [text];
        const lineHeight = fontSize * 1.3;
        const totalTextHeight = lines.length * lineHeight;

        let startY = y + (h - totalTextHeight) / 2 + lineHeight / 2;
        if (vAlign === 'top') startY = y + padding + lineHeight / 2;
        else if (vAlign === 'bottom') startY = y + h - padding - totalTextHeight + lineHeight / 2;

        for (let i = 0; i < lines.length; i++) {
          const lineY = Math.round(startY + i * lineHeight);
          const lineX = Math.round(textX);
          ctx.fillText(lines[i], lineX, lineY);

          // Decorations
          if (isUnderline || isStrike) {
            const textW = ctx.measureText(lines[i]).width;
            // Alignment adjustment for line start X
            let startLX = lineX;
            if (align === 'center') startLX = lineX - textW / 2;
            else if (align === 'right') startLX = lineX - textW;

            if (isUnderline) {
              ctx.beginPath();
              ctx.moveTo(startLX, lineY + fontSize / 2 + 1);
              ctx.lineTo(startLX + textW, lineY + fontSize / 2 + 1);
              ctx.strokeStyle = fgColor;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            if (isStrike) {
              ctx.beginPath();
              ctx.moveTo(startLX, lineY);
              ctx.lineTo(startLX + textW, lineY);
              ctx.strokeStyle = fgColor;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }
    }
    ctx.restore();
  }

  private breakTextIntoLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const para of paragraphs) {
      if (ctx.measureText(para).width <= maxWidth) {
        lines.push(para);
        continue;
      }

      let currentLine = '';
      for (let i = 0; i < para.length; i++) {
        const char = para[i];
        const testLine = currentLine + char;
        if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.length > 0) lines.push(currentLine);
    }
    return lines;
  }

  private calculateBordersForCell(
    r: number,
    c: number,
    rowSpan: number,
    colSpan: number,
    x: number,
    y: number,
    w: number,
    h: number,
    styles: Styles | undefined,
    cmds: Map<string, DrawCmd>
  ) {
    if (!styles) return;

    const getStyleBorder = (rr: number, cc: number): Border | undefined => {
      const row = this.worksheet?.rows.get(rr);
      if (!row) return undefined;
      const cell = row.cells.get(cc);
      if (!cell || cell.styleId === undefined) return undefined;
      const xf = styles.cellXfs[cell.styleId];
      if (!xf) return undefined;
      return styles.borders[xf.borderId];
    };

    const myBorder = getStyleBorder(r, c);

    const toShared = (pr?: BorderPr): IBorder | undefined => {
      if (!pr || !pr.style || pr.style === 'none') return undefined;
      let style: BorderStyle = 'solid';
      let width = 1;
      switch (pr.style) {
        case 'medium':
          width = 2;
          break;
        case 'thick':
          width = 3;
          break;
        case 'double':
          width = 3;
          style = 'double';
          break;
        case 'dashed':
          style = 'dashed';
          break;
        case 'dotted':
          style = 'dotted';
          break;
        default:
          width = 1;
          style = 'solid';
      }
      return { style, width, color: pr.color || '#000000' };
    };

    const resolve = (b1?: BorderPr, b2?: BorderPr) => {
      return BorderConflictResolver.resolve(toShared(b1), toShared(b2));
    };

    // 1. Right Edge
    const rightKey = `V-${r}-${c + colSpan}`;
    if (!cmds.has(rightKey)) {
      const neighbor = getStyleBorder(r, c + colSpan);
      const winner = resolve(myBorder?.right, neighbor?.left);
      if (winner) {
        cmds.set(rightKey, {
          x: x + w,
          y: y,
          len: h,
          isVertical: true,
          border: winner
        });
      }
    }

    // 2. Bottom Edge
    // Fix: use rowSpan correctly to determine bottom row index
    const bottomKey = `H-${r + rowSpan}-${c}`;
    if (!cmds.has(bottomKey)) {
      // Neighbor is row + rowSpan
      const neighbor = getStyleBorder(r + rowSpan, c);
      const winner = resolve(myBorder?.bottom, neighbor?.top);
      if (winner) {
        cmds.set(bottomKey, {
          x: x,
          y: y + h,
          len: w,
          isVertical: false,
          border: winner
        });
      }
    }

    // 3. Left Edge
    const leftKey = `V-${r}-${c}`;
    if (!cmds.has(leftKey)) {
      const neighbor = getStyleBorder(r, c - 1);
      const winner = resolve(myBorder?.left, neighbor?.right);
      if (winner) {
        cmds.set(leftKey, { x, y, len: h, isVertical: true, border: winner });
      }
    }

    // 4. Top Edge
    const topKey = `H-${r}-${c}`;
    if (!cmds.has(topKey)) {
      const neighbor = getStyleBorder(r - 1, c);
      const winner = resolve(myBorder?.top, neighbor?.bottom);
      if (winner) {
        cmds.set(topKey, { x, y, len: w, isVertical: false, border: winner });
      }
    }
  }

  private renderBorderCmd(
    ctx: CanvasRenderingContext2D,
    cmd: DrawCmd,
    frozenRows: number,
    frozenCols: number,
    fixedWidth: number,
    fixedHeight: number
  ) {
    const cx = cmd.isVertical ? cmd.x : cmd.x + cmd.len / 2;
    const cy = cmd.isVertical ? cmd.y + cmd.len / 2 : cmd.y;

    ctx.save();
    ctx.beginPath();
    if (cx <= fixedWidth && cy <= fixedHeight) {
      ctx.rect(0, 0, fixedWidth + 1, fixedHeight + 1);
    } else if (cx <= fixedWidth) {
      ctx.rect(0, fixedHeight, fixedWidth + 1, 99999);
    } else if (cy <= fixedHeight) {
      ctx.rect(fixedWidth, 0, 99999, fixedHeight + 1);
    } else {
      ctx.rect(fixedWidth, fixedHeight, 99999, 99999);
    }
    ctx.clip();

    ctx.lineWidth = cmd.border.width;
    ctx.strokeStyle = cmd.border.color;

    if (cmd.border.style === 'dashed') ctx.setLineDash([5, 5]);
    else if (cmd.border.style === 'dotted') ctx.setLineDash([2, 2]);
    else ctx.setLineDash([]);

    ctx.beginPath();
    // Offset by 0.5 to align with pixel grid for 1px width
    const offset = cmd.border.width % 2 !== 0 ? 0.5 : 0;

    if (cmd.isVertical) {
      ctx.moveTo(Math.floor(cmd.x) + offset, Math.floor(cmd.y));
      ctx.lineTo(Math.floor(cmd.x) + offset, Math.floor(cmd.y + cmd.len));
    } else {
      ctx.moveTo(Math.floor(cmd.x), Math.floor(cmd.y) + offset);
      ctx.lineTo(Math.floor(cmd.x + cmd.len), Math.floor(cmd.y) + offset);
    }
    ctx.stroke();
    ctx.restore();
  }

  private getCellText(cell: Cell, styles?: Styles): string {
    if (cell.value === undefined || cell.value === null) return '';

    if (cell.type === 'number' && typeof cell.value === 'number' && styles && cell.styleId !== undefined) {
      const xf = styles.cellXfs[cell.styleId];
      if (xf && (xf.applyNumberFormat || xf.numFmtId !== undefined)) {
        const numFmtId = xf.numFmtId || 0;
        let formatCode = 'General';
        if (styles.numFmts && styles.numFmts.has(numFmtId)) {
          formatCode = styles.numFmts.get(numFmtId)!;
        } else {
          switch (numFmtId) {
            case 0:
              formatCode = 'General';
              break;
            case 1:
              formatCode = '0';
              break;
            case 2:
              formatCode = '0.00';
              break;
            case 9:
              formatCode = '0%';
              break;
            case 10:
              formatCode = '0.00%';
              break;
            case 14:
              formatCode = 'm/d/yy';
              break;
          }
        }

        if (formatCode !== 'General') {
          const isDateFormat = (fmt: string) => /y|m|d|h|s|am\/pm/i.test(fmt);
          if (isDateFormat(formatCode) || (numFmtId >= 14 && numFmtId <= 22)) {
            const dateValue = new Date(Math.round((cell.value - 25569) * 86400 * 1000));
            return NumberFormatter.format(dateValue, formatCode);
          }
          return NumberFormatter.format(cell.value, formatCode);
        }
      }
    }

    return String(cell.value);
  }

  destroy() {
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.remove();
  }
}
