import { Worksheet, XlsxDocument, Styles, WorksheetComment, WorksheetHyperlink } from '../parser/types';
import { getCell as getWorksheetCell, getCellByRef as getWorksheetCellByRef, parseCellRef } from '../model';
import {
  UnitConversion,
  FontMapping,
  ImageRenderer,
  ChartRenderer,
  ShapeRenderer,
  VirtualScrollbar,
  ZoomController,
  DragController,
  CommonRendererOptions,
  defaultCommonRendererOptions
} from '@opr/shared';

import { CellRenderer, FormulaDisplayMode } from './CellRenderer';
import { ConditionalFormattingEvaluator } from './ConditionalFormattingEvaluator';
import { BorderClipRect, BorderRenderer, DrawCmd } from './BorderRenderer';
import './XlsxRenderer.css';

/**
 * 渲染器配置选项
 */
export type XlsxDisplayScale = number | 'width' | 'height';
export type XlsxCellLocateMode = { cell?: number; row?: number };

export interface XlsxRendererOptions extends CommonRendererOptions {
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 默认行高 */
  rowHeight: number;
  /** 默认列宽 */
  colWidth: number;
  /** 是否渲染冻结行，默认为 true */
  renderFrozenRows?: boolean;
  /** 是否渲染冻结列，默认为 true */
  renderFrozenCols?: boolean;
  /** 是否显示行号，默认为 false */
  showRowHeaders?: boolean;
  /** 是否显示列号，默认为 false */
  showColHeaders?: boolean;
  /** 公式显示策略：auto 优先缓存结果，缺失时回退公式；formula 强制显示公式；value 仅显示缓存结果 */
  formulaDisplay?: FormulaDisplayMode;
  /** 显示比例：百分比数字、width 按内容宽度适配、height 按内容高度适配 */
  displayScale?: XlsxDisplayScale;
  /** 初始化定位目标：cell 为列号，row 为行号 */
  locateCellMode?: XlsxCellLocateMode;
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

/**
 * XLSX 渲染器
 * 负责解析后的 Worksheet 渲染、交互处理及视图管理
 */
export class XlsxRenderer {
  private static readonly CULLING_EPSILON = 1;

  /* 容器元素 */
  private container: HTMLElement;
  /* 画布包装容器 */
  private canvasWrapper: HTMLElement;
  /* 底部 Tab 栏 */
  private tabBar: HTMLElement;
  /* 主渲染画布 */
  private canvas: HTMLCanvasElement;
  /* 批注浮层 */
  private commentTooltip: HTMLDivElement;
  /* 2D 渲染上下文 */
  private ctx: CanvasRenderingContext2D;
  /* 当前渲染的 Worksheet */
  private worksheet: Worksheet | null = null;
  /* 所属的文档对象 */
  private worksheetDocument: XlsxDocument | null = null;
  /* 渲染配置 */
  private options!: XlsxRendererOptions;

  /* 合并单元格索引 */
  private mergeIndex: Map<string, MergeInfo> = new Map();
  /* 自动行高缓存 */
  private autoRowHeights: Map<number, number> = new Map();

  public scrollX = 0;
  public scrollY = 0;

  private totalWidth = 0;
  private totalHeight = 0;
  private static readonly MIN_ROW_HEADER_WIDTH = 24;
  private static readonly MIN_COL_HEADER_HEIGHT = 16;
  private static readonly MIN_HEADER_FONT_SIZE = 8;

  // Components
  private scrollbar: VirtualScrollbar;
  private scrollbarHideTimer: number | null = null;
  /** 缩放控制器 */
  private zoomController: ZoomController;

  // State
  private scale = 1.0;
  private conditionalFormattingEvaluator: ConditionalFormattingEvaluator | null = null;

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
  private mouseDownPoint: { x: number; y: number } | null = null;

  /** 拖拽控制器 */
  private dragController: DragController;

  // 高亮动画状态
  private highlightRow: number | null = null;
  private highlightCol: number | null = null;
  private highlightStartTime: number = 0;
  private highlightAnimationId: number | null = null;

  constructor(container: HTMLElement, options: Partial<XlsxRendererOptions> = {}) {
    this.container = container;

    // Setup DOM Structure
    this.container.classList.add('opr-xlsx-renderer');

    // Canvas Wrapper
    this.canvasWrapper = document.createElement('div');
    this.canvasWrapper.className = 'xlsx-canvas-wrapper';
    this.container.appendChild(this.canvasWrapper);

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.dataset.testid = 'xlsx-canvas';
    this.canvas.className = 'xlsx-canvas';
    this.canvasWrapper.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.commentTooltip = document.createElement('div');
    this.commentTooltip.className = 'xlsx-comment-tooltip';
    this.commentTooltip.dataset.testid = 'xlsx-comment-tooltip';
    this.commentTooltip.style.display = 'none';
    this.canvasWrapper.appendChild(this.commentTooltip);

    // Tab Bar
    this.tabBar = document.createElement('div');
    this.tabBar.className = 'xlsx-tab-bar';
    this.container.appendChild(this.tabBar);

    // Zoom Controls
    this.zoomController = new ZoomController({
      onZoomChange: scale => {
        // 缩放时保持居中
        this.setScale(scale, { x: this.options.width / 2, y: this.options.height / 2 });
      }
    });
    this.tabBar.appendChild(this.zoomController.getElement());

    // Drag Controller
    this.dragController = new DragController({
      element: this.canvas,
      onDrag: (dx, dy) => {
        this.scrollX -= dx;
        this.scrollY -= dy;
        this.clampScroll();
        this.render();
      },
      onDragStart: () => {
        this.canvas.style.cursor = 'grabbing';
      },
      onDragEnd: () => {
        this.canvas.style.cursor = 'default';
      }
    });

    this.options = {
      width: options.width || this.canvasWrapper.clientWidth || 800,
      height: options.height || this.canvasWrapper.clientHeight || 600,
      rowHeight: options.rowHeight || 25,
      colWidth: options.colWidth || 100,
      renderFrozenRows: options.renderFrozenRows !== undefined ? options.renderFrozenRows : true,
      renderFrozenCols: options.renderFrozenCols !== undefined ? options.renderFrozenCols : true,
      showRowHeaders: options.showRowHeaders !== undefined ? options.showRowHeaders : false,
      showColHeaders: options.showColHeaders !== undefined ? options.showColHeaders : false,
      formulaDisplay: options.formulaDisplay || 'auto',
      displayScale: options.displayScale,
      locateCellMode: options.locateCellMode,
      ...defaultCommonRendererOptions,
      ...this.pickCommonOptions(options)
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
    this.hideCommentTooltip();
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();

    // Zoom Check
    if (event.ctrlKey || event.metaKey) {
      const delta = -event.deltaY;

      // Optimize zoom step: smaller step usually, even smaller when < 100%
      let step = 0.05; // 5%
      if (this.scale < 1.0) {
        step = 0.02; // 2%
      }

      let newScale = this.scale + (delta > 0 ? step : -step);

      // Clamp 20% - 400%
      newScale = Math.max(0.2, Math.min(4.0, newScale));

      // Fix float precision
      newScale = Math.round(newScale * 100) / 100;

      if (Math.abs(newScale - this.scale) > 0.001) {
        // Zoom towards mouse pointer
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.setScale(newScale, { x: mouseX, y: mouseY });
      }
      return;
    }

    this.calculateContentSize();

    // const maxScrollY = Math.max(0, contentHeight - this.options.height);

    let dx = event.deltaX;
    let dy = event.deltaY;

    // Shift + Wheel -> Horizontal Scroll
    if (event.shiftKey && !event.ctrlKey && !event.metaKey) {
      // If we have vertical wheel delta but no horizontal, swap
      if (dy !== 0 && dx === 0) {
        dx = dy;
        dy = 0;
      }
    }

    this.scrollX += dx;
    this.scrollY += dy;

    // Clamp
    this.clampScroll();

    // If scrolling happens, ensure scrollbar is visible
    this.handleMouseEnter();

    this.render();
  }

  private handleMouseDown(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const { width, height } = this.options;
    this.mouseDownPoint = { x: e.clientX, y: e.clientY };

    // Delegate to Scrollbar
    const handled = this.scrollbar.handleMouseDown(
      e,
      rect,
      { width, height },
      {
        totalWidth: this.totalWidth,
        totalHeight: this.totalHeight
      },
      { scrollX: this.scrollX, scrollY: this.scrollY }
    );

    if (handled) return;

    // Start Canvas Drag
    this.dragController.handleMouseDown(e);
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Delegate to Scrollbar first
    const { scrollX, scrollY, handled } = this.scrollbar.handleMouseMove(
      e,
      rect,
      { width: this.options.width, height: this.options.height },
      { totalWidth: this.totalWidth, totalHeight: this.totalHeight },
      { scrollX: this.scrollX, scrollY: this.scrollY }
    );

    if (handled) {
      if (scrollX !== this.scrollX || scrollY !== this.scrollY) {
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this.render();
      }
      return;
    }

    // Pass Hover state to scrollbar
    this.scrollbar.handleHover(mouseX, mouseY, { width: this.options.width, height: this.options.height });
    const hyperlink = this.getHyperlinkAt(mouseX, mouseY);
    this.updateCommentTooltip(mouseX, mouseY);
    if (!this.dragController.getIsDragging() && hyperlink) {
      this.canvas.style.cursor = 'pointer';
    } else if (!this.dragController.getIsDragging()) {
      this.canvas.style.cursor = 'default';
    } else {
      this.hideCommentTooltip();
    }

    this.dragController.handleMouseMove(e);
  }

  private handleMouseUp(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const downPoint = this.mouseDownPoint;
    this.mouseDownPoint = null;

    this.scrollbar.handleMouseUp(e);
    this.dragController.handleMouseUp(e);

    if (downPoint && Math.abs(e.clientX - downPoint.x) <= 3 && Math.abs(e.clientY - downPoint.y) <= 3) {
      const hyperlink = this.getHyperlinkAt(mouseX, mouseY);
      if (hyperlink) {
        this.openHyperlink(hyperlink);
      }
    }
  }

  /**
   * 限制滚动范围
   */
  private clampScroll() {
    const { contentWidth, contentHeight } = this.calculateContentSize();
    const maxScrollX = Math.max(0, contentWidth - this.options.width);
    const maxScrollY = Math.max(0, contentHeight - this.options.height);

    this.scrollX = Math.max(0, Math.min(this.scrollX, maxScrollX));
    this.scrollY = Math.max(0, Math.min(this.scrollY, maxScrollY));
  }

  /**
   * 计算内容的实际尺寸（包含所有单元格和图表范围）
   */
  private calculateContentSize() {
    if (!this.worksheet) return { contentWidth: 0, contentHeight: 0 };

    let contentWidth = 0;

    const maxCol = this.getMaxRenderableCol();

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

    // Check Drawings/Images for bounds extension
    if (this.worksheet.drawings) {
      for (const drawing of this.worksheet.drawings) {
        if (!this.shouldRenderDrawing(drawing)) {
          continue;
        }
        const { x, y, width: w, height: h } = this.getDrawingContentBounds(drawing);

        if (x + w > contentWidth) contentWidth = x + w + 50; // Add some margin
        if (y + h > contentHeight) contentHeight = y + h + 50;
      }
    }

    this.totalWidth = contentWidth;
    this.totalHeight = contentHeight;

    return { contentWidth, contentHeight };
  }

  /**
   * 切换当前显示的 Sheet
   * @param idOrName Sheet 的索引或者名称
   */
  public switchSheet(idOrName: string | number) {
    if (!this.worksheetDocument) return;
    let target: Worksheet | undefined;
    const sheets = Array.from(this.worksheetDocument.worksheets.values());

    if (typeof idOrName === 'number') {
      if (idOrName >= 0 && idOrName < sheets.length) {
        target = sheets[idOrName];
      }
    } else {
      target = sheets.find(s => s.id === idOrName || s.sheetId === idOrName || s.name === idOrName);
    }

    if (target && target !== this.worksheet) {
      this.setWorksheet(target);
    }
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

    this.applyDisplayScale();
    this.render();
  }

  /**
   * 设置当前要渲染的 Worksheet
   * @param worksheet 要渲染的 Worksheet 对象
   * @param doc 可选的文档对象，用于 Tab 栏生成
   */
  setWorksheet(worksheet: Worksheet, doc?: XlsxDocument) {
    this.worksheet = worksheet;
    if (doc) {
      this.worksheetDocument = doc;
      this.renderTabs();
    } else {
      this.updateTabsActiveState();
    }

    this.rebuildConditionalFormattingEvaluator();

    // 重新计算合并单元格和自动行高
    this.prepareMerges();
    this.calculateAutoRowHeights();

    // 重置滚动位置
    this.scrollX = 0;
    this.scrollY = 0;
    this.calculateContentSize();
    this.applyDisplayScale();
    this.applyInitialCellLocation();

    this.render();
  }

  private renderTabs() {
    // Clear tabs but keep zoom container
    while (this.tabBar.firstChild && this.tabBar.firstChild !== this.zoomController.getElement()) {
      this.tabBar.removeChild(this.tabBar.firstChild);
    }

    this.tabBar.innerHTML = '';

    if (!this.worksheetDocument) {
      this.tabBar.appendChild(this.zoomController.getElement());
      return;
    }

    const sheets = Array.from(this.worksheetDocument.worksheets.values());
    sheets.forEach(sheet => {
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

    this.tabBar.appendChild(this.zoomController.getElement());
  }

  private updateTabsActiveState() {
    // Filter out zoom container
    const tabs = Array.from(this.tabBar.children).filter(c => c !== this.zoomController.getElement());
    let idx = 0;
    if (!this.worksheetDocument) return;

    const sheets = Array.from(this.worksheetDocument.worksheets.values());
    sheets.forEach(sheet => {
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
    const defaultFont = `${Math.round(UnitConversion.ptToPixel(11) * this.scale)}px Arial`;
    this.ctx.font = defaultFont;

    for (const row of this.worksheet.rows.values()) {
      if (row.customHeight) continue;

      let maxH = this.getRowHeight(row.index, true);

      for (const [colIndex, cell] of row.cells) {
        const mergeInfo = this.mergeIndex.get(`${row.index},${colIndex}`);
        if (mergeInfo && !mergeInfo.isMaster) continue;
        const conditionalStyle = this.conditionalFormattingEvaluator?.getStyle(row.index, colIndex);

        let wrapText = false;
        let fontSize = Math.round(UnitConversion.ptToPixel(11) * this.scale);
        let fontFamily = 'Arial';
        let isBold = false;
        let isItalic = false;

        if (cell.styleId !== undefined && styles && styles.cellXfs[cell.styleId]) {
          const xf = styles.cellXfs[cell.styleId];
          if (xf.alignment?.wrapText) wrapText = true;

          if (xf.applyFont && styles.fonts[xf.fontId]) {
            const font = styles.fonts[xf.fontId];
            const sizePt = font.size || 11;
            fontSize = Math.round(UnitConversion.ptToPixel(sizePt) * this.scale);
            const rawName = font.name || 'Arial';
            fontFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;
            if (font.bold) isBold = true;
            if (font.italic) isItalic = true;
          }
        }

        if (conditionalStyle?.font) {
          const conditionalFont = conditionalStyle.font;
          const sizePt = conditionalFont.size || conditionalFont.descriptor?.size;
          if (sizePt) {
            fontSize = Math.round(UnitConversion.ptToPixel(sizePt) * this.scale);
          }
          const rawName = conditionalFont.name || conditionalFont.descriptor?.family;
          if (rawName) {
            fontFamily = FontMapping[rawName]?.safe_css_family || `"${rawName}", Arial, sans-serif`;
          }
          if (conditionalFont.bold !== undefined) isBold = Boolean(conditionalFont.bold);
          if (conditionalFont.italic !== undefined) isItalic = Boolean(conditionalFont.italic);
        }

        if (wrapText) {
          const fontStr = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
          this.ctx.font = fontStr;

          const colW = mergeInfo ? mergeInfo.width : this.getColWidth(colIndex);
          const padding = 2 * this.scale;
          const effectiveW = colW - padding;

          const text = CellRenderer.getCellText(cell, styles, this.options.formulaDisplay);
          const lines = CellRenderer.breakTextIntoLines(this.ctx, text, effectiveW);

          const lineHeight = fontSize * 1.25;
          const neededHeight = lines.length * lineHeight + 2 * this.scale;

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
    let w = this.options.colWidth;
    if (this.worksheet?.cols.has(colIndex)) {
      w = this.worksheet.cols.get(colIndex)!.width * 6.6 + 2;
    }
    return w * this.scale;
  }

  private getRowHeight(rowIndex: number, ignoreAuto = false): number {
    if (!ignoreAuto && this.autoRowHeights.has(rowIndex)) {
      return this.autoRowHeights.get(rowIndex)!;
    }
    let h = this.options.rowHeight;
    if (this.worksheet?.rows.has(rowIndex)) {
      const rh = this.worksheet.rows.get(rowIndex)!.height;
      if (rh !== undefined) h = UnitConversion.ptToPixel(rh);
    }
    return h * this.scale;
  }

  private pickCommonOptions(options: Partial<CommonRendererOptions>): CommonRendererOptions {
    return {
      ...(options.showCharts !== undefined ? { showCharts: options.showCharts } : {}),
      ...(options.showInsertedElements !== undefined ? { showInsertedElements: options.showInsertedElements } : {}),
      ...(options.showImages !== undefined ? { showImages: options.showImages } : {}),
      ...(options.showAudio !== undefined ? { showAudio: options.showAudio } : {}),
      ...(options.showVideo !== undefined ? { showVideo: options.showVideo } : {}),
      ...(options.showComments !== undefined ? { showComments: options.showComments } : {})
    };
  }

  private applyDisplayScale() {
    const displayScale = this.options.displayScale;
    if (displayScale === undefined) {
      return;
    }

    let nextScale: number;
    if (typeof displayScale === 'number') {
      nextScale = displayScale / 100;
    } else {
      const { contentWidth, contentHeight } = this.calculateContentSize();
      const baseWidth = contentWidth / this.scale;
      const baseHeight = contentHeight / this.scale;
      nextScale = displayScale === 'width' ? this.options.width / Math.max(1, baseWidth) : this.options.height / Math.max(1, baseHeight);
    }

    nextScale = Math.max(0.2, Math.min(4.0, Math.round(nextScale * 100) / 100));
    if (Math.abs(nextScale - this.scale) > 0.001) {
      this.setScale(nextScale, { x: this.options.width / 2, y: this.options.height / 2 });
    }
  }

  public setScale(scale: number, origin?: { x: number; y: number }) {
    const oldScale = this.scale;
    this.scale = scale;

    // 同步 UI 状态（不触发回调）
    this.zoomController.setScale(scale, false);

    this.prepareMerges();
    this.calculateAutoRowHeights();
    this.calculateContentSize();

    // Adjust Scroll to keep origin fixed
    if (origin) {
      // Logic:
      // P_content_pixels_new = P_content_pixels_old * (newScale / oldScale)
      // newScrollX = P_content_pixels_new - origin.x

      const contentPixelX = this.scrollX + origin.x;
      const contentPixelY = this.scrollY + origin.y;

      const newContentPixelX = contentPixelX * (scale / oldScale);
      const newContentPixelY = contentPixelY * (scale / oldScale);

      this.scrollX = newContentPixelX - origin.x;
      this.scrollY = newContentPixelY - origin.y;
    }

    // Clamp Scroll
    this.clampScroll();

    this.render();
  }

  public setFormulaDisplay(mode: FormulaDisplayMode) {
    if (this.options.formulaDisplay === mode) {
      return;
    }

    this.options.formulaDisplay = mode;
    this.calculateAutoRowHeights();
    this.calculateContentSize();
    this.render();
  }

  public getRenderOptions(): XlsxRendererOptions {
    return { ...this.options };
  }

  public setRenderOptions(options: Partial<XlsxRendererOptions>) {
    this.options = {
      ...this.options,
      ...this.pickCommonOptions(options),
      ...options,
      width: options.width ?? this.options.width,
      height: options.height ?? this.options.height,
      rowHeight: options.rowHeight ?? this.options.rowHeight,
      colWidth: options.colWidth ?? this.options.colWidth
    };

    this.prepareMerges();
    this.calculateAutoRowHeights();
    this.calculateContentSize();
    this.applyDisplayScale();
    if (options.locateCellMode) {
      this.applyInitialCellLocation();
    }
    this.hideCommentTooltip();
    this.render();
  }

  public setShowCharts(show: boolean) {
    this.setRenderOptions({ showCharts: show });
  }

  public toggleShowCharts(show?: boolean) {
    const next = show ?? !this.options.showCharts;
    this.setShowCharts(next);
    return next;
  }

  public setShowInsertedElements(show: boolean) {
    this.setRenderOptions({ showInsertedElements: show });
  }

  public toggleShowInsertedElements(show?: boolean) {
    const next = show ?? !this.options.showInsertedElements;
    this.setShowInsertedElements(next);
    return next;
  }

  public setShowImages(show: boolean) {
    this.setRenderOptions({ showImages: show });
  }

  public toggleShowImages(show?: boolean) {
    const next = show ?? !this.options.showImages;
    this.setShowImages(next);
    return next;
  }

  public setShowAudio(show: boolean) {
    this.setRenderOptions({ showAudio: show });
  }

  public toggleShowAudio(show?: boolean) {
    const next = show ?? !this.options.showAudio;
    this.setShowAudio(next);
    return next;
  }

  public setShowVideo(show: boolean) {
    this.setRenderOptions({ showVideo: show });
  }

  public toggleShowVideo(show?: boolean) {
    const next = show ?? !this.options.showVideo;
    this.setShowVideo(next);
    return next;
  }

  public setShowComments(show: boolean) {
    this.setRenderOptions({ showComments: show });
  }

  public toggleShowComments(show?: boolean) {
    const next = show ?? !this.options.showComments;
    this.setShowComments(next);
    return next;
  }

  public setRenderFrozenRows(show: boolean) {
    this.setRenderOptions({ renderFrozenRows: show });
  }

  public toggleFrozenRows(show?: boolean) {
    const next = show ?? !this.options.renderFrozenRows;
    this.setRenderFrozenRows(next);
    return next;
  }

  public setRenderFrozenCols(show: boolean) {
    this.setRenderOptions({ renderFrozenCols: show });
  }

  public toggleFrozenCols(show?: boolean) {
    const next = show ?? !this.options.renderFrozenCols;
    this.setRenderFrozenCols(next);
    return next;
  }

  public setDisplayScale(displayScale: XlsxDisplayScale) {
    this.options.displayScale = displayScale;
    this.applyDisplayScale();
    this.render();
  }

  public getScale() {
    return this.scale;
  }

  public setCellLocateMode(target: XlsxCellLocateMode) {
    this.options.locateCellMode = target;
    this.applyInitialCellLocation();
    this.render();
  }

  public locateCell(target: XlsxCellLocateMode) {
    this.scrollToCellLocation(target);
  }

  /**
   * 解析合并单元格信息，建立索引以便快速查询
   */
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

  /**
   * 核心渲染循环
   * 负责清除画布并逐层绘制：
   * 1. 基础单元格（滚动区域）
   * 2. 边框
   * 3. 图表和形状
   * 4. 冻结区域（行/列/角）及其边框
   * 5. 冻结分割线
   * 6. 行列标号
   * 7. 交互高亮
   * 8. 滚动条
   */
  render() {
    if (!this.worksheet) return;

    // 确保渲染前尺寸数据是最新的
    this.calculateContentSize();

    const { width, height } = this.options;
    const ctx = this.ctx;
    const { styles } = this.worksheetDocument || {};

    const frozen = this.worksheet.frozen;
    const frozenCols = this.options.renderFrozenCols && frozen?.state === 'frozen' && frozen.xSplit ? frozen.xSplit : 0;
    const frozenRows = this.options.renderFrozenRows && frozen?.state === 'frozen' && frozen.ySplit ? frozen.ySplit : 0;

    // 行/列标号区域尺寸
    const rowHeaderWidth = this.getRowHeaderWidth();
    const colHeaderHeight = this.getColHeaderHeight();

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Font
    const defaultFont = `${Math.round(UnitConversion.ptToPixel(11) * this.scale)}px Arial`;
    ctx.font = defaultFont;
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;

    // Fixed Dimensions (冻结区域的像素尺寸)
    let fixedWidth = rowHeaderWidth;
    let fixedHeight = colHeaderHeight;
    for (let c = 1; c <= frozenCols; c++) fixedWidth += this.getColWidth(c);
    for (let r = 1; r <= frozenRows; r++) fixedHeight += this.getRowHeight(r);

    const rows = Array.from(this.worksheet.rows.values()).sort((a, b) => a.index - b.index);
    const borderCmds = new Map<string, DrawCmd>();
    const scrollableClip = {
      x: fixedWidth,
      y: fixedHeight,
      width: width - fixedWidth,
      height: height - fixedHeight
    };

    // ========== 第一层：渲染非冻结区域（可滚动区域） ==========
    // 添加 Clip 防止滚动内容溢出到冻结区域
    ctx.save();
    ctx.beginPath();
    ctx.rect(fixedWidth, fixedHeight, width - fixedWidth, height - fixedHeight);
    ctx.clip();

    this.renderCellsInRegion(ctx, rows, styles, defaultFont, borderCmds, {
      rowHeaderWidth,
      colHeaderHeight,
      fixedWidth,
      fixedHeight,
      frozenRows,
      frozenCols,
      regionType: 'scrollable'
    });
    ctx.restore();

    // 渲染边框
    this.renderBorderCommands(ctx, borderCmds, frozenRows, frozenCols, fixedWidth, fixedHeight, scrollableClip);

    this.renderDrawingsInRegion(ctx, width, height, {
      rowHeaderWidth,
      colHeaderHeight,
      fixedWidth,
      fixedHeight,
      regionType: 'scrollable'
    });

    // ========== 第二层：重绘冻结区域（确保置顶） ==========
    const frozenRowsBorderCmds = new Map<string, DrawCmd>();
    const frozenColsBorderCmds = new Map<string, DrawCmd>();
    const frozenCornerBorderCmds = new Map<string, DrawCmd>();

    // 冻结行区域（顶部，仅水平滚动）
    if (frozenRows > 0) {
      // 先清除冻结行区域
      const fx = fixedWidth;
      const fy = colHeaderHeight;
      const fw = width - fixedWidth;
      const fh = fixedHeight - colHeaderHeight;

      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx, fy, fw, fh);

      this.renderCellsInRegion(ctx, rows, styles, defaultFont, frozenRowsBorderCmds, {
        rowHeaderWidth,
        colHeaderHeight,
        fixedWidth,
        fixedHeight,
        frozenRows,
        frozenCols,
        regionType: 'frozenRows'
      });
      ctx.restore();
    }

    // 冻结列区域（左侧，仅垂直滚动）
    if (frozenCols > 0) {
      // 先清除冻结列区域
      const fx = rowHeaderWidth;
      const fy = fixedHeight;
      const fw = fixedWidth - rowHeaderWidth;
      const fh = height - fixedHeight;

      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx, fy, fw, fh);

      this.renderCellsInRegion(ctx, rows, styles, defaultFont, frozenColsBorderCmds, {
        rowHeaderWidth,
        colHeaderHeight,
        fixedWidth,
        fixedHeight,
        frozenRows,
        frozenCols,
        regionType: 'frozenCols'
      });
      ctx.restore();
    }

    // 冻结交叉区域（左上角，完全固定）
    if (frozenRows > 0 && frozenCols > 0) {
      // 先清除交叉区域
      const fx = rowHeaderWidth;
      const fy = colHeaderHeight;
      const fw = fixedWidth - rowHeaderWidth;
      const fh = fixedHeight - colHeaderHeight;

      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx, fy, fw, fh);

      this.renderCellsInRegion(ctx, rows, styles, defaultFont, frozenCornerBorderCmds, {
        rowHeaderWidth,
        colHeaderHeight,
        fixedWidth,
        fixedHeight,
        frozenRows,
        frozenCols,
        regionType: 'frozenCorner'
      });
      ctx.restore();
    }

    // 渲染冻结区域的边框
    this.renderBorderCommands(ctx, frozenRowsBorderCmds, frozenRows, frozenCols, fixedWidth, fixedHeight, {
      x: fixedWidth,
      y: colHeaderHeight,
      width: width - fixedWidth,
      height: fixedHeight - colHeaderHeight
    });
    this.renderBorderCommands(ctx, frozenColsBorderCmds, frozenRows, frozenCols, fixedWidth, fixedHeight, {
      x: rowHeaderWidth,
      y: fixedHeight,
      width: fixedWidth - rowHeaderWidth,
      height: height - fixedHeight
    });
    this.renderBorderCommands(ctx, frozenCornerBorderCmds, frozenRows, frozenCols, fixedWidth, fixedHeight, {
      x: rowHeaderWidth,
      y: colHeaderHeight,
      width: fixedWidth - rowHeaderWidth,
      height: fixedHeight - colHeaderHeight
    });

    this.renderDrawingsInRegion(ctx, width, height, {
      rowHeaderWidth,
      colHeaderHeight,
      fixedWidth,
      fixedHeight,
      regionType: 'frozenRows'
    });
    this.renderDrawingsInRegion(ctx, width, height, {
      rowHeaderWidth,
      colHeaderHeight,
      fixedWidth,
      fixedHeight,
      regionType: 'frozenCols'
    });
    this.renderDrawingsInRegion(ctx, width, height, {
      rowHeaderWidth,
      colHeaderHeight,
      fixedWidth,
      fixedHeight,
      regionType: 'frozenCorner'
    });

    // ========== 第四层：冻结提示线（使用柔和的样式） ==========
    if (frozenCols > 0 || frozenRows > 0) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.setLineDash([]);
      ctx.beginPath();
      if (frozenCols > 0) {
        ctx.moveTo(fixedWidth + 0.5, 0);
        ctx.lineTo(fixedWidth + 0.5, height);
      }
      if (frozenRows > 0) {
        ctx.moveTo(0, fixedHeight + 0.5);
        ctx.lineTo(width, fixedHeight + 0.5);
      }
      ctx.stroke();
    }

    // ========== 第五层：渲染行/列标号（最顶层） ==========
    this.renderHeaders(ctx, rows, rowHeaderWidth, colHeaderHeight, fixedWidth, fixedHeight, frozenRows, frozenCols);

    // ========== 第六层：高亮动画 ==========
    this.renderHighlight(ctx, rowHeaderWidth, colHeaderHeight, frozenRows, frozenCols);

    this.drawScrollBars(ctx);
  }

  /**
   * 渲染高亮动画效果
   */
  private renderHighlight(
    ctx: CanvasRenderingContext2D,
    rowHeaderWidth: number,
    colHeaderHeight: number,
    frozenRows: number,
    frozenCols: number
  ) {
    if (this.highlightRow === null && this.highlightCol === null) return;

    const { width, height } = this.options;
    const elapsed = performance.now() - this.highlightStartTime;
    const duration = 2000;

    // 使用 easeOutQuad 缓动函数计算透明度（逐渐淡出）
    const progress = Math.min(elapsed / duration, 1);
    const easeOutProgress = 1 - Math.pow(1 - progress, 2);

    // 透明度：从 0.8 渐变到 0，同时添加脉冲效果
    const pulseFrequency = 3; // 3次脉冲
    const pulsePhase = Math.sin((elapsed / duration) * Math.PI * pulseFrequency);
    const baseAlpha = 0.9 * (1 - easeOutProgress);
    const alpha = baseAlpha * (0.5 + 0.5 * Math.abs(pulsePhase));

    if (alpha <= 0.01) return;

    ctx.save();
    ctx.strokeStyle = `rgba(0, 128, 255, ${alpha})`; // 使用醒目的蓝色
    ctx.lineWidth = 4;
    ctx.setLineDash([]);

    // 高亮单元格（同时指定行和列）
    if (this.highlightRow !== null && this.highlightCol !== null) {
      const cellBounds = this.getCellScreenBounds(
        this.highlightRow,
        this.highlightCol,
        rowHeaderWidth,
        colHeaderHeight,
        frozenRows,
        frozenCols
      );

      if (cellBounds) {
        ctx.strokeRect(cellBounds.x + 1.5, cellBounds.y + 1.5, cellBounds.width - 3, cellBounds.height - 3);

        // 添加发光效果
        ctx.shadowColor = 'rgba(0, 128, 255, 0.5)';
        ctx.shadowBlur = 8 * (1 - easeOutProgress);
        ctx.strokeRect(cellBounds.x + 1.5, cellBounds.y + 1.5, cellBounds.width - 3, cellBounds.height - 3);
        ctx.shadowBlur = 0;
      }
    }
    // 高亮整行
    else if (this.highlightRow !== null) {
      let rowY = colHeaderHeight;
      for (let r = 1; r < this.highlightRow; r++) {
        rowY += this.getRowHeight(r);
      }
      const rowH = this.getRowHeight(this.highlightRow);

      let screenY = rowY;
      if (this.highlightRow > frozenRows) {
        screenY = rowY - this.scrollY;
      }

      if (screenY + rowH > colHeaderHeight && screenY < height) {
        ctx.strokeRect(rowHeaderWidth + 1.5, screenY + 1.5, width - rowHeaderWidth - 3, rowH - 3);

        // 添加发光效果
        ctx.shadowColor = 'rgba(0, 128, 255, 0.5)';
        ctx.shadowBlur = 8 * (1 - easeOutProgress);
        ctx.strokeRect(rowHeaderWidth + 1.5, screenY + 1.5, width - rowHeaderWidth - 3, rowH - 3);
        ctx.shadowBlur = 0;
      }
    }
    // 高亮整列
    else if (this.highlightCol !== null) {
      let colX = rowHeaderWidth;
      for (let c = 1; c < this.highlightCol; c++) {
        colX += this.getColWidth(c);
      }
      const colW = this.getColWidth(this.highlightCol);

      let screenX = colX;
      if (this.highlightCol > frozenCols) {
        screenX = colX - this.scrollX;
      }

      if (screenX + colW > rowHeaderWidth && screenX < width) {
        ctx.strokeRect(screenX + 1.5, colHeaderHeight + 1.5, colW - 3, height - colHeaderHeight - 3);

        // 添加发光效果
        ctx.shadowColor = 'rgba(0, 128, 255, 0.5)';
        ctx.shadowBlur = 8 * (1 - easeOutProgress);
        ctx.strokeRect(screenX + 1.5, colHeaderHeight + 1.5, colW - 3, height - colHeaderHeight - 3);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  /**
   * 获取单元格的屏幕坐标
   */
  private getCellScreenBounds(
    row: number,
    col: number,
    rowHeaderWidth: number,
    colHeaderHeight: number,
    frozenRows: number,
    frozenCols: number
  ): { x: number; y: number; width: number; height: number } | null {
    // 计算绝对位置
    let x = rowHeaderWidth;
    for (let c = 1; c < col; c++) {
      x += this.getColWidth(c);
    }
    let y = colHeaderHeight;
    for (let r = 1; r < row; r++) {
      y += this.getRowHeight(r);
    }

    const cellWidth = this.getColWidth(col);
    const cellHeight = this.getRowHeight(row);

    // 应用滚动偏移
    let screenX = x;
    let screenY = y;

    if (col > frozenCols) {
      screenX = x - this.scrollX;
    }
    if (row > frozenRows) {
      screenY = y - this.scrollY;
    }

    return {
      x: screenX,
      y: screenY,
      width: cellWidth,
      height: cellHeight
    };
  }

  /**
   * 在指定区域渲染单元格
   */
  private renderCellsInRegion(
    ctx: CanvasRenderingContext2D,
    rows: { index: number; height?: number; customHeight?: boolean; cells: Map<number, any> }[],
    styles: Styles | undefined,
    defaultFont: string,
    borderCmds: Map<string, DrawCmd>,
    options: {
      rowHeaderWidth: number;
      colHeaderHeight: number;
      fixedWidth: number;
      fixedHeight: number;
      frozenRows: number;
      frozenCols: number;
      regionType: 'scrollable' | 'frozenRows' | 'frozenCols' | 'frozenCorner';
    }
  ) {
    const { rowHeaderWidth, colHeaderHeight, fixedWidth, fixedHeight, frozenRows, frozenCols, regionType } = options;
    const { width, height } = this.options;
    const renderedMerges = new Set<string>();

    let currentY = colHeaderHeight;
    let previousRowIndex = 0;

    for (const row of rows) {
      const r = row.index;
      const rowH = this.getRowHeight(r);
      const rowsGap = r - previousRowIndex - 1;

      if (rowsGap > 0) {
        currentY += rowsGap * this.options.rowHeight * this.scale;
      }

      const rawY = currentY;
      currentY += rowH;
      previousRowIndex = r;

      // 根据区域类型判断是否渲染该行
      const isRowInFrozenZone = r <= frozenRows;

      if (regionType === 'scrollable' && isRowInFrozenZone) continue;
      if (regionType === 'frozenRows' && !isRowInFrozenZone) continue;
      if (regionType === 'frozenCols' && isRowInFrozenZone) continue;
      if (regionType === 'frozenCorner' && !isRowInFrozenZone) continue;

      let screenY = rawY;
      if (r > frozenRows) {
        screenY = rawY - this.scrollY;
        if (this.isBeforeViewportEdge(screenY, rowH, fixedHeight)) continue;
      }

      if (this.isAfterViewportEdge(screenY, height)) continue;

      let rawX = rowHeaderWidth;
      const maxCol = this.getMaxRenderableCol();
      for (let c = 1; c <= maxCol; c++) {
        const colW = this.getColWidth(c);

        // 根据区域类型判断是否渲染该列
        const isColInFrozenZone = c <= frozenCols;

        if (regionType === 'scrollable' && isColInFrozenZone) {
          rawX += colW;
          continue;
        }
        if (regionType === 'frozenRows' && isColInFrozenZone) {
          rawX += colW;
          continue;
        }
        if (regionType === 'frozenCols' && !isColInFrozenZone) {
          rawX += colW;
          continue;
        }
        if (regionType === 'frozenCorner' && !isColInFrozenZone) {
          rawX += colW;
          continue;
        }

        let screenX = rawX;
        if (c > frozenCols) {
          screenX = rawX - this.scrollX;
          if (this.isBeforeViewportEdge(screenX, colW, fixedWidth)) {
            rawX += colW;
            continue;
          }
        }

        if (this.isAfterViewportEdge(screenX, width)) {
          rawX += colW;
          continue;
        }

        // 处理合并单元格
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
        let targetRow: typeof row | undefined = row;

        if (mergeInfo) {
          const masterKey = `${mergeInfo.masterRow},${mergeInfo.masterCol}`;
          if (renderedMerges.has(masterKey)) {
            shouldRender = false;
          } else {
            renderedMerges.add(masterKey);

            renderW = mergeInfo.width;
            renderH = mergeInfo.height;
            rowSpan = mergeInfo.rowSpan;
            colSpan = mergeInfo.colSpan;

            // 提前计算是否跨越冻结边界
            const mergeSpansFrozenCol =
              mergeInfo.masterCol <= frozenCols && mergeInfo.masterCol + colSpan - 1 > frozenCols;
            const mergeSpansFrozenRow =
              mergeInfo.masterRow <= frozenRows && mergeInfo.masterRow + rowSpan - 1 > frozenRows;

            if (!mergeInfo.isMaster) {
              const masterPos = this.getPixelPos(mergeInfo.masterCol - 1, mergeInfo.masterRow - 1, 0, 0);
              targetScreenX = masterPos.x + rowHeaderWidth;
              targetScreenY = masterPos.y + colHeaderHeight;

              // 应用滚动偏移
              // 修正：如果渲染区域在水平方向是滚动的（scrollable 或 frozenRows），且单元格跨越了水平冻结线（导致其一部分位于滚动区），
              // 或者 Master 本身就在滚动区，那么需要应用 scrollX。
              const isHorizontallyScrollable = regionType === 'scrollable' || regionType === 'frozenRows';
              if (mergeInfo.masterCol > frozenCols || (isHorizontallyScrollable && mergeSpansFrozenCol)) {
                targetScreenX -= this.scrollX;
              }

              // 同理处理垂直滚动
              const isVerticallyScrollable = regionType === 'scrollable' || regionType === 'frozenCols';
              if (mergeInfo.masterRow > frozenRows || (isVerticallyScrollable && mergeSpansFrozenRow)) {
                targetScreenY -= this.scrollY;
              }

              targetR = mergeInfo.masterRow;
              targetC = mergeInfo.masterCol;
              targetRow = this.worksheet?.rows.get(targetR);
            }

            // 处理跨冻结边界的合并单元格裁剪
            if (mergeSpansFrozenCol || mergeSpansFrozenRow) {
              // 需要裁剪渲染
              ctx.save();

              let clipX = targetScreenX;
              let clipY = targetScreenY;
              let clipW = renderW;
              let clipH = renderH;

              if (regionType === 'frozenCorner') {
                // 交叉区域：只显示冻结区域内的部分
                clipW = Math.min(renderW, fixedWidth - targetScreenX);
                clipH = Math.min(renderH, fixedHeight - targetScreenY);
              } else if (regionType === 'frozenRows') {
                // 冻结行：水平方向需要裁剪 (右侧延伸到滚动区，需要截断)
                clipX = Math.max(targetScreenX, fixedWidth);
                clipW = Math.min(targetScreenX + renderW, width) - clipX;
                clipH = Math.min(renderH, fixedHeight - targetScreenY);
              } else if (regionType === 'frozenCols') {
                // 冻结列：垂直方向需要裁剪 (下方延伸到滚动区，需要截断)
                clipY = Math.max(targetScreenY, fixedHeight);
                clipH = Math.min(targetScreenY + renderH, height) - clipY;
                clipW = Math.min(renderW, fixedWidth - targetScreenX);
              } else if (regionType === 'scrollable') {
                // 滚动区域：截断冻结部分，只显示位于滚动区域内的部分
                // 即使 master 在冻结区，因为已应用 scrollX，targetScreenX 是相对于视口的
                // 这里要确保左侧/上侧被冻结区域覆盖的部分被裁掉

                // X轴截断：起点必须在 fixedWidth 之后
                clipX = Math.max(targetScreenX, fixedWidth);
                clipW = Math.min(targetScreenX + renderW, width) - clipX;

                // Y轴截断：起点必须在 fixedHeight 之后
                clipY = Math.max(targetScreenY, fixedHeight);
                clipH = Math.min(targetScreenY + renderH, height) - clipY;
              }

              if (clipW > 0 && clipH > 0) {
                ctx.beginPath();
                ctx.rect(clipX, clipY, clipW, clipH);
                ctx.clip();

                this.renderSingleCell(
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

              ctx.restore();
              shouldRender = false;
            }
          }
        }

        if (shouldRender) {
          // 绘制网格线
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

          this.renderSingleCell(
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

          if (styles && this.worksheet) {
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

        rawX += colW;
      }
    }
  }

  /**
   * 渲染单个单元格
   */
  private renderSingleCell(
    ctx: CanvasRenderingContext2D,
    row: { index: number; cells: Map<number, any> } | undefined,
    colIndex: number,
    x: number,
    y: number,
    w: number,
    h: number,
    styles: Styles | undefined,
    defaultFont: string
  ) {
    if (!row) return;
    const conditionalStyle = row ? this.conditionalFormattingEvaluator?.getStyle(row.index, colIndex) : undefined;

    CellRenderer.render(
      ctx,
      row as any,
      colIndex,
      x,
      y,
      w,
      h,
      styles,
      defaultFont,
      this.scale,
      this.options.formulaDisplay,
      conditionalStyle
    );

    const cell = row.cells.get(colIndex);
    if (cell?.comment) {
      this.drawCommentIndicator(ctx, x, y, w, h);
    }
  }

  private drawCommentIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    if (!this.options.showComments) {
      return;
    }

    const size = Math.max(5, Math.min(9 * this.scale, w / 3, h / 3));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + w - size, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + size);
    ctx.closePath();
    ctx.fillStyle = '#d13438';
    ctx.fill();
    ctx.restore();
  }

  private getDrawingContentBounds(drawing: NonNullable<Worksheet['drawings']>[number]) {
    if (drawing.position.type === 'twoCellAnchor' && drawing.position.from && drawing.position.to) {
      const fromPos = this.getPixelPos(
        drawing.position.from.col,
        drawing.position.from.row,
        drawing.position.from.colOff,
        drawing.position.from.rowOff
      );
      const toPos = this.getPixelPos(
        drawing.position.to.col,
        drawing.position.to.row,
        drawing.position.to.colOff,
        drawing.position.to.rowOff
      );

      return {
        x: fromPos.x,
        y: fromPos.y,
        width: toPos.x - fromPos.x,
        height: toPos.y - fromPos.y
      };
    }

    if (drawing.position.type === 'oneCellAnchor' && drawing.position.from) {
      const fromPos = this.getPixelPos(
        drawing.position.from.col,
        drawing.position.from.row,
        drawing.position.from.colOff,
        drawing.position.from.rowOff
      );

      return {
        x: fromPos.x,
        y: fromPos.y,
        width: drawing.position.width * this.scale,
        height: drawing.position.height * this.scale
      };
    }

    return {
      x: (drawing.position.x || 0) * this.scale,
      y: (drawing.position.y || 0) * this.scale,
      width: drawing.position.width * this.scale,
      height: drawing.position.height * this.scale
    };
  }

  private getDrawingScreenBounds(
    drawing: NonNullable<Worksheet['drawings']>[number],
    options: {
      rowHeaderWidth: number;
      colHeaderHeight: number;
      fixedWidth: number;
      fixedHeight: number;
      regionType: 'scrollable' | 'frozenRows' | 'frozenCols' | 'frozenCorner';
    }
  ) {
    const { rowHeaderWidth, colHeaderHeight, fixedWidth, fixedHeight, regionType } = options;
    const { width, height } = this.options;
    const bounds = this.getDrawingContentBounds(drawing);
    const scrollableX = regionType === 'scrollable' || regionType === 'frozenRows';
    const scrollableY = regionType === 'scrollable' || regionType === 'frozenCols';
    const screenX = rowHeaderWidth + bounds.x - (scrollableX ? this.scrollX : 0);
    const screenY = colHeaderHeight + bounds.y - (scrollableY ? this.scrollY : 0);

    const paneRect =
      regionType === 'scrollable'
        ? { x: fixedWidth, y: fixedHeight, width: width - fixedWidth, height: height - fixedHeight }
        : regionType === 'frozenRows'
          ? { x: fixedWidth, y: colHeaderHeight, width: width - fixedWidth, height: fixedHeight - colHeaderHeight }
          : regionType === 'frozenCols'
            ? { x: rowHeaderWidth, y: fixedHeight, width: fixedWidth - rowHeaderWidth, height: height - fixedHeight }
            : {
                x: rowHeaderWidth,
                y: colHeaderHeight,
                width: fixedWidth - rowHeaderWidth,
                height: fixedHeight - colHeaderHeight
              };

    return {
      x: screenX,
      y: screenY,
      width: bounds.width,
      height: bounds.height,
      paneRect
    };
  }

  private renderDrawingsInRegion(
    ctx: CanvasRenderingContext2D,
    viewWidth: number,
    viewHeight: number,
    options: {
      rowHeaderWidth: number;
      colHeaderHeight: number;
      fixedWidth: number;
      fixedHeight: number;
      regionType: 'scrollable' | 'frozenRows' | 'frozenCols' | 'frozenCorner';
    }
  ) {
    if (!this.worksheet || !this.worksheet.drawings) return;
    const shapeRuntime = {
      resolveImageBitmap: (image: any) => this.getOrQueueImageBitmap(image),
      scheduleRender: () => this.render(),
      renderChart: (chartCtx: CanvasRenderingContext2D, chart: any, rect: { x: number; y: number; width: number; height: number }) => {
        const chartRenderer = new ChartRenderer(chart.chartData, { scale: this.scale });
        chartRenderer.render(chartCtx, rect);
      }
    };

    for (const drawing of this.worksheet.drawings) {
      if (!this.shouldRenderDrawing(drawing)) {
        continue;
      }

      const { x: screenX, y: screenY, width: w, height: h, paneRect } = this.getDrawingScreenBounds(drawing, options);

      // Check if visible (simple culling)
      if (
        paneRect.width <= 0 ||
        paneRect.height <= 0 ||
        this.isBeforeViewportEdge(screenX, w, paneRect.x) ||
        this.isAfterViewportEdge(screenX, paneRect.x + paneRect.width) ||
        this.isBeforeViewportEdge(screenY, h, paneRect.y) ||
        this.isAfterViewportEdge(screenY, paneRect.y + paneRect.height)
      ) {
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(paneRect.x, paneRect.y, paneRect.width, paneRect.height);
      ctx.clip();

      if ('blob' in drawing) {
        const bitmap = this.getOrQueueImageBitmap(drawing);
        if (!bitmap) {
          ctx.restore();
          continue;
        }
        ImageRenderer.render(ctx, drawing, bitmap, screenX, screenY, w, h);
      } else if (drawing.type === 'chart') {
        shapeRuntime.renderChart(ctx, drawing, { x: screenX, y: screenY, width: w, height: h });
      } else {
        ShapeRenderer.render(ctx, drawing, screenX, screenY, w, h, shapeRuntime);
      }

      ctx.restore();
    }
  }

  private shouldRenderDrawing(drawing: NonNullable<Worksheet['drawings']>[number]) {
    if (!this.options.showInsertedElements) {
      return false;
    }

    if ('blob' in drawing) {
      return this.options.showImages !== false;
    }

    if (drawing.type === 'chart') {
      return this.options.showCharts !== false;
    }

    return true;
  }

  private getOrQueueImageBitmap(image: { id: string; blob: Blob }): ImageBitmap | undefined {
    if (this.imageCache.has(image.id)) {
      return this.imageCache.get(image.id);
    }

    if (!this.imageLoading.has(image.id)) {
      this.imageLoading.add(image.id);
      createImageBitmap(image.blob)
        .then(bitmap => {
          this.imageCache.set(image.id, bitmap);
          this.imageLoading.delete(image.id);
          this.render();
        })
        .catch(() => {
          this.imageLoading.delete(image.id);
        });
    }

    return undefined;
  }

  private getPixelPos(colIdx: number, rowIdx: number, colOff: number, rowOff: number): { x: number; y: number } {
    let x = 0;
    for (let c = 0; c < colIdx; c++) x += this.getColWidth(c + 1);
    x += colOff * this.scale;
    let y = 0;
    for (let r = 0; r < rowIdx; r++) y += this.getRowHeight(r + 1);
    y += rowOff * this.scale;
    return { x, y };
  }

  private getMaxRenderableCol(): number {
    if (!this.worksheet) {
      return 26;
    }

    let maxCol = this.worksheet.dimension?.endCol || 0;

    for (const row of this.worksheet.rows.values()) {
      for (const col of row.cells.keys()) {
        maxCol = Math.max(maxCol, col);
      }
    }

    for (const hyperlink of this.worksheet.hyperlinks || []) {
      const range = WorksheetParserRange.parse(hyperlink.ref);
      maxCol = Math.max(maxCol, range.endCol);
    }

    return Math.max(26, maxCol + 2);
  }

  private getColumnLabel(colIndex: number): string {
    let value = colIndex;
    let label = '';

    while (value > 0) {
      const remainder = (value - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      value = Math.floor((value - 1) / 26);
    }

    return label || 'A';
  }

  private getRowHeaderWidth(): number {
    if (!this.options.showRowHeaders) return 0;
    return Math.max(XlsxRenderer.MIN_ROW_HEADER_WIDTH, 40 * this.scale);
  }

  private getColHeaderHeight(): number {
    if (!this.options.showColHeaders) return 0;
    return Math.max(XlsxRenderer.MIN_COL_HEADER_HEIGHT, 24 * this.scale);
  }

  private getHeaderFontSize(): number {
    return Math.max(XlsxRenderer.MIN_HEADER_FONT_SIZE, Math.round(11 * this.scale));
  }

  private isBeforeViewportEdge(position: number, size: number, edge: number) {
    return position + size < edge - XlsxRenderer.CULLING_EPSILON;
  }

  private isAfterViewportEdge(position: number, edge: number) {
    return position > edge + XlsxRenderer.CULLING_EPSILON;
  }

  private drawScrollBars(ctx: CanvasRenderingContext2D) {
    this.scrollbar.draw(
      ctx,
      { width: this.options.width, height: this.options.height },
      { totalWidth: this.totalWidth, totalHeight: this.totalHeight },
      { scrollX: this.scrollX, scrollY: this.scrollY }
    );
  }

  private renderBorderCommands(
    ctx: CanvasRenderingContext2D,
    commands: Map<string, DrawCmd>,
    frozenRows: number,
    frozenCols: number,
    fixedWidth: number,
    fixedHeight: number,
    clipRect: BorderClipRect
  ) {
    if (clipRect.width <= 0 || clipRect.height <= 0) {
      return;
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    for (const cmd of commands.values()) {
      BorderRenderer.renderCmd(ctx, cmd, frozenRows, frozenCols, fixedWidth, fixedHeight, clipRect);
    }
  }

  /**
   * 渲染行/列标号
   */
  private renderHeaders(
    ctx: CanvasRenderingContext2D,
    rows: { index: number }[],
    rowHeaderWidth: number,
    colHeaderHeight: number,
    fixedWidth: number,
    fixedHeight: number,
    frozenRows: number,
    frozenCols: number
  ) {
    const { width, height } = this.options;

    // 0. 左上角交叉区域 (始终置顶且不透明)
    if (this.options.showColHeaders && this.options.showRowHeaders) {
      ctx.clearRect(0, 0, rowHeaderWidth, colHeaderHeight);
      ctx.fillStyle = '#f4f5f6'; // 略深一点的颜色区分交叉点
      ctx.fillRect(0, 0, rowHeaderWidth, colHeaderHeight);

      // 交叉区域边框
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      // 右边框
      ctx.moveTo(rowHeaderWidth - 0.5, 0);
      ctx.lineTo(rowHeaderWidth - 0.5, colHeaderHeight);
      // 下边框
      ctx.moveTo(0, colHeaderHeight - 0.5);
      ctx.lineTo(rowHeaderWidth, colHeaderHeight - 0.5);
      ctx.stroke();
    }

    // 列标号 (A, B, C...)
    if (this.options.showColHeaders && colHeaderHeight > 0) {
      // 清除背景 (确保覆盖下方内容)
      ctx.clearRect(rowHeaderWidth, 0, width - rowHeaderWidth, colHeaderHeight);

      // 背景色
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(rowHeaderWidth, 0, width - rowHeaderWidth, colHeaderHeight);

      // 边框
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rowHeaderWidth, colHeaderHeight - 0.5);
      ctx.lineTo(width, colHeaderHeight - 0.5);
      ctx.stroke();

      // 列标号文字
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${this.getHeaderFontSize()}px Arial`;

      let rawX = rowHeaderWidth;
      const maxCol = this.getMaxRenderableCol();
      for (let c = 1; c <= maxCol; c++) {
        const colW = this.getColWidth(c);
        const isFrozenCol = c <= frozenCols;
        const paneLeft = isFrozenCol ? rowHeaderWidth : fixedWidth;
        const paneRight = isFrozenCol && frozenCols > 0 ? fixedWidth : width;
        let screenX = rawX;

        if (c > frozenCols) {
          screenX = rawX - this.scrollX;
          if (this.isBeforeViewportEdge(screenX, colW, paneLeft)) {
            rawX += colW;
            continue;
          }
        }

        if (!this.isAfterViewportEdge(screenX, paneRight)) {
          const labelX = screenX + colW / 2;
          const label = this.getColumnLabel(c);
          if (labelX >= paneLeft && labelX <= paneRight) {
            ctx.fillText(label, labelX, colHeaderHeight / 2);
          }

          // 列分隔线
          const separatorX = Math.floor(screenX + colW) + 0.5;
          if (separatorX >= paneLeft && separatorX <= paneRight) {
            ctx.strokeStyle = '#e0e0e0';
            ctx.beginPath();
            ctx.moveTo(separatorX, 0);
            ctx.lineTo(separatorX, colHeaderHeight);
            ctx.stroke();
          }
        }
        rawX += colW;
      }
    }

    // 行标号 (1, 2, 3...)
    if (this.options.showRowHeaders && rowHeaderWidth > 0) {
      // 清除背景
      ctx.clearRect(0, colHeaderHeight, rowHeaderWidth, height - colHeaderHeight);

      // 背景色
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, colHeaderHeight, rowHeaderWidth, height - colHeaderHeight);

      // 边框
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rowHeaderWidth - 0.5, colHeaderHeight);
      ctx.lineTo(rowHeaderWidth - 0.5, height);
      ctx.stroke();

      // 行标号文字
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${this.getHeaderFontSize()}px Arial`;

      let currentY = colHeaderHeight;
      let prevRowIdx = 0;

      for (const row of rows) {
        const r = row.index;
        const rowH = this.getRowHeight(r);
        const isFrozenRow = r <= frozenRows;
        const paneTop = isFrozenRow ? colHeaderHeight : fixedHeight;
        const paneBottom = isFrozenRow && frozenRows > 0 ? fixedHeight : height;

        // 处理行间隙
        const gap = r - prevRowIdx - 1;
        if (gap > 0) {
          currentY += gap * this.options.rowHeight * this.scale;
        }

        const rawY = currentY;
        currentY += rowH;
        prevRowIdx = r;

        let screenY = rawY;
        if (r > frozenRows) {
          screenY = rawY - this.scrollY;
          if (this.isBeforeViewportEdge(screenY, rowH, paneTop)) continue;
        }

        if (this.isAfterViewportEdge(screenY, paneBottom)) {
          if (isFrozenRow) {
            continue;
          }
          break;
        }

        const labelY = screenY + rowH / 2;
        if (labelY >= paneTop && labelY <= paneBottom) {
          ctx.fillText(String(r), rowHeaderWidth / 2, labelY);
        }

        // 行分隔线
        const separatorY = Math.floor(screenY + rowH) + 0.5;
        if (separatorY >= paneTop && separatorY <= paneBottom) {
          ctx.strokeStyle = '#e0e0e0';
          ctx.beginPath();
          ctx.moveTo(0, separatorY);
          ctx.lineTo(rowHeaderWidth, separatorY);
          ctx.stroke();
        }
      }
    }

    // 左上角交叉区域
    if (this.options.showRowHeaders && this.options.showColHeaders && rowHeaderWidth > 0 && colHeaderHeight > 0) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, rowHeaderWidth, colHeaderHeight);

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, rowHeaderWidth - 1, colHeaderHeight - 1);
    }
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
    this.container.classList.remove('opr-xlsx-renderer');
  }

  public scrollTo(params: { row?: number; col?: number }) {
    if (!this.worksheet) return;

    if (params.col !== undefined && params.col > 0) {
      let x = 0;
      for (let c = 1; c < params.col; c++) {
        x += this.getColWidth(c);
      }
      this.scrollX = x;
    }

    if (params.row !== undefined && params.row > 0) {
      let y = 0;
      for (let r = 1; r < params.row; r++) {
        y += this.getRowHeight(r);
      }
      this.scrollY = y;
    }

    // Clamp
    const { contentWidth, contentHeight } = this.calculateContentSize();
    const maxScrollX = Math.max(0, contentWidth - this.options.width);
    const maxScrollY = Math.max(0, contentHeight - this.options.height);

    this.scrollX = Math.max(0, Math.min(this.scrollX, maxScrollX));
    this.scrollY = Math.max(0, Math.min(this.scrollY, maxScrollY));

    // 启动高亮动画
    this.startHighlightAnimation(params.row, params.col);
  }

  public scrollToRow(row: number) {
    this.scrollTo({ row });
  }

  public scrollToCol(col: number) {
    this.scrollTo({ col });
  }

  public scrollToCell(rowOrRef: number | string, col?: number) {
    if (typeof rowOrRef === 'string') {
      const address = parseCellRef(rowOrRef);
      if (address) {
        this.scrollTo({ row: address.row, col: address.col });
      }
      return;
    }

    if (col !== undefined) {
      this.scrollTo({ row: rowOrRef, col });
    }
  }

  public scrollToCellRef(ref: string) {
    this.scrollToCell(ref);
  }

  private applyInitialCellLocation() {
    if (this.options.locateCellMode) {
      this.scrollToCellLocation(this.options.locateCellMode);
    }
  }

  private scrollToCellLocation(target: XlsxCellLocateMode) {
    this.scrollTo({
      row: target.row,
      col: target.cell
    });
  }

  /**
   * 启动高亮动画
   */
  private startHighlightAnimation(row?: number, col?: number) {
    // 取消之前的动画
    if (this.highlightAnimationId !== null) {
      cancelAnimationFrame(this.highlightAnimationId);
      this.highlightAnimationId = null;
    }

    this.highlightRow = row ?? null;
    this.highlightCol = col ?? null;
    this.highlightStartTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - this.highlightStartTime;
      const duration = 2000; // 2秒

      if (elapsed < duration) {
        this.render();
        this.highlightAnimationId = requestAnimationFrame(animate);
      } else {
        // 动画结束，清除高亮状态
        this.highlightRow = null;
        this.highlightCol = null;
        this.highlightAnimationId = null;
        this.render();
      }
    };

    animate();
  }

  private rebuildConditionalFormattingEvaluator() {
    this.conditionalFormattingEvaluator =
      this.worksheet && this.worksheetDocument?.styles
        ? new ConditionalFormattingEvaluator(this.worksheet, this.worksheetDocument.styles)
        : this.worksheet
          ? new ConditionalFormattingEvaluator(this.worksheet)
          : null;
  }

  public zoomTo(scale: number) {
    // Clamp to valid range
    const newScale = Math.max(0.2, Math.min(4.0, scale));
    // Zoom center: viewport center
    this.setScale(newScale, { x: this.options.width / 2, y: this.options.height / 2 });
  }

  public getCell(row: number, col: number) {
    return this.worksheet ? getWorksheetCell(this.worksheet, row, col) : undefined;
  }

  public getCellByRef(ref: string) {
    return this.worksheet ? getWorksheetCellByRef(this.worksheet, ref) : undefined;
  }

  /**
   * 获取指定行列单元格的信息，包括位置、尺寸和合并状态
   * 自动处理合并单元格
   */
  public getCellInfo(row: number, col: number) {
    if (!this.worksheet) return null;

    // 检查是否在合并单元格内
    const mergeInfo = this.mergeIndex.get(`${row},${col}`);
    let targetRow = row;
    let targetCol = col;
    let isMerged = false;
    let masterCell = null;

    if (mergeInfo) {
      isMerged = true;
      targetRow = mergeInfo.masterRow;
      targetCol = mergeInfo.masterCol;
    }

    const cellRow = this.worksheet.rows.get(targetRow);
    const cell = cellRow?.cells.get(targetCol);
    if (mergeInfo && !cell) {
      // 如果是合并单元格的从属单元格，可能没有 cell 对象，尝试获取主单元格
      const masterRowObj = this.worksheet.rows.get(mergeInfo.masterRow);
      masterCell = masterRowObj?.cells.get(mergeInfo.masterCol);
    }

    // 计算绝对位置 (Content Coordinates)
    // 性能优化：直接使用 getPixelPos，不需要每次都从头遍历
    // 但是 getPixelPos 需要 row/col 是 1-based index
    // 这里传入的是 1-based row/col

    // 计算起始位置
    let x = 0;
    let y = 0;

    // 快速计算 x
    // 优化：这部分计算在大量调用时可能较慢，但对于单次点击查询可以接受
    // 更好的方式是维护 row/col 的前缀和索引，但这需要额外内存
    for (let c = 1; c < targetCol; c++) x += this.getColWidth(c);
    for (let r = 1; r < targetRow; r++) y += this.getRowHeight(r);

    // 计算尺寸
    let width = 0;
    let height = 0;

    if (mergeInfo) {
      width = mergeInfo.width;
      height = mergeInfo.height;
    } else {
      width = this.getColWidth(targetCol);
      height = this.getRowHeight(targetRow);
    }

    // 计算屏幕位置
    const frozen = this.worksheet.frozen;
    const frozenCols = this.options.renderFrozenCols && frozen?.state === 'frozen' && frozen.xSplit ? frozen.xSplit : 0;
    const frozenRows = this.options.renderFrozenRows && frozen?.state === 'frozen' && frozen.ySplit ? frozen.ySplit : 0;

    let screenX = x;
    let screenY = y;

    // 应用滚动偏移 (如果不在冻结区域)
    if (targetCol > frozenCols) {
      screenX -= this.scrollX;
    }
    if (targetRow > frozenRows) {
      screenY -= this.scrollY;
    }

    // 如果行列标号可见，需要加上偏移
    if (this.options.showRowHeaders) {
      screenX += this.getRowHeaderWidth();
    }
    if (this.options.showColHeaders) {
      screenY += this.getColHeaderHeight();
    }

    return {
      cell: cell || masterCell,
      row: targetRow,
      col: targetCol,
      isMerged,
      mergeInfo,
      bounds: { x, y, width, height },
      screenBounds: { x: screenX, y: screenY, width, height }
    };
  }

  private getHyperlinkAt(x: number, y: number): WorksheetHyperlink | undefined {
    if (!this.worksheet?.hyperlinks) {
      return undefined;
    }

    for (const hyperlink of this.worksheet.hyperlinks) {
      const range = WorksheetParserRange.parse(hyperlink.ref);
      for (let row = range.startRow; row <= range.endRow; row++) {
        for (let col = range.startCol; col <= range.endCol; col++) {
          const info = this.getCellInfo(row, col);
          const bounds = info?.screenBounds;
          if (bounds && x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
            return hyperlink;
          }
        }
      }
    }

    return undefined;
  }

  private getCommentAt(x: number, y: number): WorksheetComment | undefined {
    if (!this.options.showComments || !this.worksheet?.comments) {
      return undefined;
    }

    for (const comment of this.worksheet.comments) {
      const address = parseCellRef(comment.ref);
      if (!address) {
        continue;
      }

      const bounds = this.getCellInfo(address.row, address.col)?.screenBounds;
      if (bounds && x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
        return comment;
      }
    }

    return undefined;
  }

  private updateCommentTooltip(x: number, y: number) {
    if (this.dragController.getIsDragging()) {
      this.hideCommentTooltip();
      return;
    }

    const comment = this.getCommentAt(x, y);
    if (!comment) {
      this.hideCommentTooltip();
      return;
    }

    const address = parseCellRef(comment.ref);
    if (!address) {
      this.hideCommentTooltip();
      return;
    }

    const bounds = this.getCellInfo(address.row, address.col)?.screenBounds;
    if (!bounds) {
      this.hideCommentTooltip();
      return;
    }

    this.commentTooltip.textContent = comment.author ? `${comment.author}:\n${comment.text}` : comment.text;
    this.commentTooltip.style.display = 'block';

    const wrapperWidth = this.canvasWrapper.clientWidth || this.options.width;
    const wrapperHeight = this.canvasWrapper.clientHeight || this.options.height;
    const tooltipWidth = this.commentTooltip.offsetWidth || 220;
    const tooltipHeight = this.commentTooltip.offsetHeight || 64;

    const left = Math.min(Math.max(bounds.x + bounds.width + 8, 0), Math.max(wrapperWidth - tooltipWidth - 8, 0));
    const top = Math.min(Math.max(bounds.y + 8, 0), Math.max(wrapperHeight - tooltipHeight - 8, 0));

    this.commentTooltip.style.left = `${left}px`;
    this.commentTooltip.style.top = `${top}px`;
  }

  private hideCommentTooltip() {
    this.commentTooltip.style.display = 'none';
  }

  private openHyperlink(hyperlink: WorksheetHyperlink) {
    const target = hyperlink.target || hyperlink.location;
    if (!target) {
      return;
    }

    const internalRef = this.extractInternalCellRef(target);
    if (internalRef) {
      this.scrollToCell(internalRef);
      return;
    }

    window.open(target, '_blank', 'noopener,noreferrer');
  }

  private extractInternalCellRef(target: string): string | undefined {
    const cleaned = target.replace(/^#/, '');
    const lastBang = cleaned.lastIndexOf('!');
    const ref = lastBang >= 0 ? cleaned.slice(lastBang + 1) : cleaned;
    return /^[A-Z]+[0-9]+$/i.test(ref) ? ref.toUpperCase() : undefined;
  }
}

class WorksheetParserRange {
  static parse(ref: string) {
    const parts = ref.split(':');
    const start = this.parseCellRef(parts[0]);
    const end = this.parseCellRef(parts[1] || parts[0]);

    return {
      startRow: Math.min(start.row, end.row),
      endRow: Math.max(start.row, end.row),
      startCol: Math.min(start.col, end.col),
      endCol: Math.max(start.col, end.col)
    };
  }

  private static parseCellRef(ref: string) {
    const match = ref.match(/^([A-Z]+)([0-9]+)$/i);
    if (!match) {
      return { row: 1, col: 1 };
    }

    return {
      row: parseInt(match[2], 10),
      col: this.columnToIndex(match[1].toUpperCase())
    };
  }

  private static columnToIndex(col: string) {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 64);
    }
    return index;
  }
}
