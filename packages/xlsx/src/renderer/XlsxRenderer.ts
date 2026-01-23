import {
  XlsxWorkbook,
  XlsxSheet,
  OfficeImage,
  OfficeShape,
  OfficeConnector,
  OfficeGroupShape,
  OfficeChart
} from '../types';
import { CellStyleUtils } from './CellStyleUtils';
import { NumberFormatUtils } from '../utils/NumberFormatUtils';
import { ShapeRenderer as SharedShapeRenderer } from '@ai-space/shared'; // Renamed to avoid conflict
import { ChartRenderer } from './ChartRenderer';
import { LayoutCalculator } from './LayoutCalculator';
import { SheetLayoutManager } from './SheetLayoutManager';
import { XlsxStyleInjector } from './XlsxStyleInjector';
// 虽然没有被显式使用，但这是预设路径生成逻辑的导入，保留以防未来需要直接调用
import { FontManager } from '@ai-space/shared';

// 导入拆分的子模块
import { StyleResolver } from './StyleResolver';
import { ChartRenderer as LocalChartRenderer } from './ChartRenderer'; // Renamed to avoid conflict
import { ShapeRenderer } from './ShapeRenderer';
import { ImageRenderer } from './ImageRenderer';
import { ConnectorRenderer } from './ConnectorRenderer';
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, EMU_TO_PX } from './constants';

/**
 * XLSX 渲染选项接口
 */
export interface XlsxRenderOptions {
  /** 是否自动注入样式（默认 true），设为 false 时需手动引入 CSS */
  injectStyles?: boolean;
}

/**
 * XLSX 渲染器主类
 *
 * 核心逻辑：
 * 负责将解析后的 XlsxWorkbook 数据渲染为 Web 界面。
 * 主要工作流：
 * 1. 样式准备：初始化 StyleResolver，准备颜色和样式上下文。
 * 2. 布局构建：创建 Flex 布局结构，包含内容区和底部标签栏。
 * 3. 单元格渲染：使用 HTML Table 渲染网格数据，精确计算列宽行高。
 * 4. 绘图层叠加：在表格上方创建 SVG 层，渲染浮动的形状、图片和图表。
 * 5. 交互处理：处理标签切换、滚动等交互逻辑。
 */
export class XlsxRenderer {
  /** 渲染容器 DOM 元素 */
  private container: HTMLElement;
  /** 当前选中的工作表索引 */
  private currentSheetIndex: number = 0;
  /** 当前工作簿数据对象 */
  private workbook: XlsxWorkbook | null = null;

  // 子渲染器实例
  private styleResolver: StyleResolver;
  private chartRenderer: ChartRenderer;
  private shapeRenderer: ShapeRenderer;
  private imageRenderer: ImageRenderer;
  private connectorRenderer: ConnectorRenderer;

  // 状态变量，用于滚动和布局计算
  /** 内容容器，用于处理滚动定位 */
  private contentContainer: HTMLElement | null = null;
  /** 缓存的行高信息（索引 -> 像素高度） */
  private rowHeights: number[] = [];
  /** 缓存的列宽信息（索引 -> 像素宽度） */
  private colWidths: number[] = [];

  /** 渲染选项 */
  private options: XlsxRenderOptions;

  /**
   * 构造函数
   * @param container 用于挂载渲染结果的 DOM 容器
   * @param options 渲染选项
   */
  constructor(container: HTMLElement, options?: XlsxRenderOptions) {
    this.container = container;
    this.options = options || {};

    // 初始化各个子渲染器
    // StyleResolver 用于解析颜色、填充、滤镜等样式
    this.styleResolver = new StyleResolver();
    // ChartRenderer 负责图表渲染
    this.chartRenderer = new ChartRenderer(this.styleResolver);
    // ShapeRenderer 负责形状（如矩形、星形等）渲染
    this.shapeRenderer = new ShapeRenderer(this.styleResolver);
    // ImageRenderer 负责图片渲染
    this.imageRenderer = new ImageRenderer(this.styleResolver);
    // ConnectorRenderer 负责连接线渲染
    this.connectorRenderer = new ConnectorRenderer(this.styleResolver);
  }

  /**
   * 渲染工作簿入口方法
   *
   * 核心逻辑：
   * 1. 保存工作簿引用。
   * 2. 将工作簿上下文注入到样式解析器 (StyleResolver)，以便子渲染器能访问全局样式。
   * 3. 重置当前激活的 Sheet 索引为 0。
   * 4. 调用 `renderLayout` 开始构建界面。
   *
   * @param workbook - 解析后的 XLSX 工作簿数据
   */
  async render(workbook: XlsxWorkbook) {
    this.workbook = workbook;
    // 将工作簿传递给样式解析器，以便它可以访问主题颜色和其他全局资源
    this.styleResolver.setWorkbook(workbook);
    // 默认渲染第一个工作表
    this.currentSheetIndex = 0;
    this.renderLayout();
  }

  /**
   * 滚动到指定单元格
   *
   * 核心逻辑：
   * 根据目标单元格的行列索引，累加计算其之前所有行的高度和所有列的宽度，
   * 得出目标像素坐标 (top, left)，然后调用容器的 scrollTo 方法平滑滚动。
   *
   * @param row - 目标行索引（0-based）
   * @param col - 目标列索引（0-based）
   */
  public scrollTo(row: number, col: number) {
    if (!this.contentContainer) return;

    let top = 0;
    // 累加目标行之前所有行的高度
    for (let r = 0; r < row; r++) top += this.rowHeights[r] || 20;

    let left = 0;
    // 累加目标列之前所有列的宽度
    for (let c = 1; c < col; c++) left += this.colWidths[c] || 64;

    this.contentContainer.scrollTo({ top, left, behavior: 'smooth' });
  }

  /**
   * 渲染整体布局结构
   *
   * 核心逻辑：
   * 1. 样式注入：如果不禁用，自动注入 XLSX 基础 CSS。
   * 2. 容器重置：清空主容器，设置 Flex 列式布局。
   * 3. 内容区：创建可滚动的 `div` 作为 Sheet 内容容器。
   * 4. 标签栏：创建底部 Tabs Bar，绑定点击事件以切换当前的 SheetIndex。
   * 5. 触发渲染：调用 `renderSheet` 渲染当前选中的工作表内容。
   */
  private renderLayout() {
    if (!this.workbook) return;

    // 注入 XLSX 专用样式（可通过选项禁用，改为手动引入 CSS）
    if (this.options.injectStyles !== false) {
      XlsxStyleInjector.injectStyles();
    }

    // 清空容器并设置基础 Flexbox 布局
    this.container.innerHTML = '';
    this.container.className = 'xlsx-container';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#f3f2f1';

    // 1. 创建工作表内容区域
    const contentArea = SheetLayoutManager.createContentContainer();
    this.container.appendChild(contentArea);
    this.contentContainer = contentArea;

    // 2. 创建底部标签栏
    const tabsBar = SheetLayoutManager.createTabBar(this.workbook, this.currentSheetIndex, index => {
      this.currentSheetIndex = index;
      this.renderLayout();
    });
    this.container.appendChild(tabsBar);

    // 渲染当前激活的工作表内容
    this.renderSheet(contentArea);
  }

  /**
   * 渲染单个工作表的内容
   *
   * 核心逻辑：
   * 1. 维度计算：扫描所有单元格和浮动元素（图表、形状），确定表格的最大行列边界。
   * 2. 列宽设置：创建 `<colgroup>`，将 Excel 列宽单位转换为像素宽度。
   * 3. 表格构建：
   *    - 创建 HTML Table。
   *    - 遍历行：设置行高，处理隐藏行。
   *    - 遍历单元格：处理合并单元格 (rowSpan/colSpan)，应用样式 (字体、背景、边框)，格式化数值 (NumberFormat)。
   * 4. 绘图层包装：创建一个相对定位的包装容器 (`div.xlsx-render-area`)。
   * 5. 触发绘图：调用 `renderDrawings` 在表格上方渲染 SVG 层。
   *
   * @param container - 内容区域容器
   */
  private renderSheet(container: HTMLElement) {
    if (!this.workbook) return;
    const sheet = this.workbook.sheets[this.currentSheetIndex];
    if (!sheet) return;

    // 创建表格元素
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.tableLayout = 'fixed'; // 固定布局以支持精确的列宽
    table.style.width = 'max-content'; // 允许表格根据内容扩展宽度

    // --- 计算表格维度 ---

    // 1. 根据单元格数据查找最大列索引
    let maxCol = 0;
    Object.values(sheet.rows).forEach(r => {
      const indices = Object.keys(r.cells).map(Number);
      if (indices.length > 0) {
        maxCol = Math.max(maxCol, Math.max(...indices));
      }
    });

    // 2. 辅助函数：获取锚点（Anchor）覆盖的最大行和列
    const getAnchorMaxCol = (anchor: any): number => {
      if (!anchor) return 0;
      let max = anchor.from?.col || 0;
      if (anchor.to?.col) max = Math.max(max, anchor.to.col + 1);
      return max;
    };
    const getAnchorMaxRow = (anchor: any): number => {
      if (!anchor) return 0;
      let max = anchor.from?.row || 0;
      if (anchor.to?.row) max = Math.max(max, anchor.to.row + 1);
      return max;
    };

    // 3. 扩展最大行/列以包含浮动元素（图表、形状、图片）
    let maxRow = Math.max(...Object.keys(sheet.rows).map(Number), 0);
    sheet.charts?.forEach((chart: any) => {
      maxCol = Math.max(maxCol, getAnchorMaxCol(chart.anchor));
      maxRow = Math.max(maxRow, getAnchorMaxRow(chart.anchor));
    });
    sheet.shapes?.forEach((shape: any) => {
      maxCol = Math.max(maxCol, getAnchorMaxCol(shape.anchor));
      maxRow = Math.max(maxRow, getAnchorMaxRow(shape.anchor));
    });
    sheet.images?.forEach((img: any) => {
      maxCol = Math.max(maxCol, getAnchorMaxCol(img.anchor));
      maxRow = Math.max(maxRow, getAnchorMaxRow(img.anchor));
    });

    // --- 渲染列组（ColGroup）以设置列宽 ---

    const getColDef = (idx: number) => {
      return sheet.cols.find((c: any) => idx >= c.min && idx <= c.max);
    };

    const colgroup = document.createElement('colgroup');
    let totalWidth = 0;

    for (let c = 1; c <= maxCol; c++) {
      const col = document.createElement('col');
      const colDef = getColDef(c);

      // 默认列宽约为 64px
      let width = 64;
      if (colDef) {
        // Excel 列宽单位转换为像素（近似系数 7.5）
        width = colDef.width * 7.5;
      }
      totalWidth += width;
      col.style.width = `${width}px`;
      colgroup.appendChild(col);
    }
    table.appendChild(colgroup);

    // 设置表格总宽度以确保滚动条正确出现
    table.style.width = `${totalWidth}px`;

    // --- 渲染行和单元格 ---

    for (let rIdx = 1; rIdx <= maxRow; rIdx++) {
      const rowInfo = sheet.rows[rIdx];
      const tr = document.createElement('tr');

      // 设置行高
      if (rowInfo?.height) {
        tr.style.height = `${rowInfo.height * 1.33}px`; // Points 转换为 Pixels
      } else {
        tr.style.height = '20px'; // 默认行高
      }

      // 处理隐藏行
      if (rowInfo?.hidden) {
        tr.style.display = 'none';
      }

      const cells = rowInfo?.cells || {};

      // 遍历该行的每一列
      for (let c = 1; c <= maxCol; c++) {
        // 检查该单元格是否被合并单元格覆盖（且不是起始单元格）
        if (LayoutCalculator.isMerged(rIdx, c, sheet.merges)) continue;

        const cell = cells[c];
        const td = document.createElement('td');

        // 处理合并单元格的起始位置
        const merge = LayoutCalculator.getMergeStart(rIdx, c, sheet.merges);
        if (merge) {
          td.colSpan = merge.e.c - merge.s.c + 1;
          td.rowSpan = merge.e.r - merge.s.r + 1;
        }

        if (cell) {
          // --- 处理单元格值和格式 ---
          let rawValue: any = cell.value;
          let isNumber = false;

          if (this.workbook && cell.type === 's') {
            // 共享字符串索引
            const idx = typeof cell.value === 'number' ? cell.value : parseInt(cell.value as string);
            rawValue = this.workbook.sharedStrings[idx] || '';
          } else if (cell.type === 'b') {
            // 布尔值
            rawValue = cell.value ? 'TRUE' : 'FALSE';
          } else if (cell.type === 'n' || (!cell.type && rawValue !== undefined)) {
            // 数值类型
            const num = Number(cell.value);
            if (!isNaN(num)) {
              rawValue = num;
              isNumber = true;
            } else {
              rawValue = '';
            }
          }

          let displayText = String(rawValue !== undefined && rawValue !== null ? rawValue : '');

          // 应用数字格式化
          if (isNumber && this.workbook && cell.styleIndex !== undefined) {
            const xf = this.workbook.styles.cellXfs[cell.styleIndex];
            if (xf) {
              const fmtCode = this.workbook.styles.numFmts[xf.numFmtId];
              if (fmtCode) {
                displayText = NumberFormatUtils.format(rawValue, fmtCode, this.workbook.date1904);
              }
            }
          }
          td.textContent = displayText;

          // --- 应用单元格样式 ---
          if (this.workbook && cell.styleIndex !== undefined) {
            const { css, fontClassName } = CellStyleUtils.getCss(this.workbook, cell.styleIndex);
            Object.assign(td.style, css);
            // 添加字体 CSS 类名
            if (fontClassName) {
              td.classList.add(fontClassName);
            }
          }
        }

        // 如果没有特定边框，应用默认的网格线边框
        const hasBorder =
          td.style.borderTop || td.style.borderRight || td.style.borderBottom || td.style.borderLeft || td.style.border;
        if (!hasBorder) {
          td.style.border = '1px solid #d4d4d4'; // 默认浅灰色网格线
        }

        tr.appendChild(td);

        // 如果是合并单元格，跳过被合并覆盖的列
        if (merge) {
          c += merge.e.c - merge.s.c;
        }
      }

      table.appendChild(tr);
    }

    // 创建内层渲染区域包装器
    // 这个包装器使用 position: relative 作为 table 和 SVG 的共同定位基准
    // 使用 width: fit-content 确保其宽度与表格一致
    const renderArea = document.createElement('div');
    renderArea.className = 'xlsx-render-area';
    renderArea.style.position = 'relative';
    renderArea.style.width = 'fit-content';
    renderArea.style.minWidth = '100%';

    renderArea.appendChild(table);
    container.appendChild(renderArea);

    // 渲染浮动绘图层（图片、形状、连接符、图表）
    // 使用 renderArea 作为容器，确保 SVG 与表格使用相同的坐标系
    this.renderDrawings(sheet, renderArea);
  }

  /**
   * 渲染所有绘图对象（Drawing Objects）
   *
   * 核心逻辑：
   * 1. 建立坐标系：计算累积的列宽和行高数组，用于将 Excel 锚点坐标 (Anchor) 转换为像素坐标。
   * 2. 创建 SVG 层：创建一个全覆盖的绝对定位 SVG 元素，置于表格上方 (z-index: 10)。
   * 3. 元素遍历与渲染：
   *    - 形状 (Shapes)：调用 `shapeRenderer`。
   *    - 图片 (Images)：调用 `imageRenderer`。
   *    - 组合 (Groups)：递归处理组合形状。
   *    - 连接线 (Connectors)：调用 `connectorRenderer`。
   *    - 图表 (Charts)：调用 `chartRenderer`。
   * 4. 坐标转换：使用辅助函数 `getRect` 将 EMU 单位的锚点转换为 SVG 的 x, y, width, height。
   *
   * @param sheet - 当前工作表数据
   * @param container - 承载 SVG 的容器 DOM（通常是 .xlsx-render-area）
   */
  private renderDrawings(sheet: XlsxSheet, container: HTMLElement) {
    // 如果没有任何绘图对象，直接返回
    if (!sheet.images?.length && !sheet.shapes?.length && !sheet.connectors?.length && !sheet.charts?.length) return;

    // 1. 计算布局指标（缓存列宽和行高，用于坐标转换）
    const { colWidths, rowHeights } = LayoutCalculator.calculateLayoutMetrics(sheet);
    this.colWidths = colWidths;
    this.rowHeights = rowHeights;

    // 辅助函数：计算指定列和偏移量的左侧像素位置
    // colWidths 数组索引从 0 开始，对应 Excel 的第 1 列
    const getLeft = (col: number, off: number) => {
      let left = 0;
      for (let c = 0; c < col; c++) left += colWidths[c] || DEFAULT_COL_WIDTH;
      return left + off * EMU_TO_PX;
    };

    // 辅助函数：计算指定行和偏移量的顶部像素位置
    // rowHeights 数组索引从 0 开始，对应 Excel 的第 1 行
    const getTop = (row: number, off: number) => {
      let top = 0;
      for (let r = 0; r < row; r++) top += rowHeights[r] || DEFAULT_ROW_HEIGHT;
      return top + off * EMU_TO_PX;
    };

    // 辅助函数：根据锚点信息计算元素的绝对位置和尺寸（矩形）
    const getRect = (anchor: any) => {
      const x = getLeft(anchor.from.col, anchor.from.colOff);
      const y = getTop(anchor.from.row, anchor.from.rowOff);
      let w = 0,
        h = 0;

      if (anchor.to) {
        // 双锚点（Two Cell Anchor）：由起始和结束单元格决定区域
        const x2 = getLeft(anchor.to.col, anchor.to.colOff);
        const y2 = getTop(anchor.to.row, anchor.to.rowOff);
        w = Math.max(0, x2 - x);
        h = Math.max(0, y2 - y);
      } else if (anchor.ext) {
        // 单锚点（One Cell Anchor）：由起始单元格和固定尺寸决定
        w = anchor.ext.cx * EMU_TO_PX;
        h = anchor.ext.cy * EMU_TO_PX;
      }
      return { x, y, w, h };
    };

    // 创建 SVG 覆盖层
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none'; // SVG 容器本身不响应鼠标事件，让下方表格可点击
    svg.style.overflow = 'visible';
    svg.style.zIndex = '10'; // 确保在表格上方

    // 创建 defs 元素，用于存放复用的定义（如渐变、滤镜、箭头标记）
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 渲染上下文，传递 defs 和 计数器
    const ctx = { defs, counter: 0 };

    // 1. 渲染形状（Shapes）
    sheet.shapes?.forEach((shape: OfficeShape) => {
      const rect = getRect(shape.anchor);
      if (rect.w <= 0 || rect.h <= 0) return;
      // 委托给 ShapeRenderer
      this.shapeRenderer.renderShape(shape, svg, rect, ctx);
    });

    // 2. 渲染图片（Images）
    sheet.images?.forEach((img: OfficeImage) => {
      const rect = getRect(img.anchor);
      if (rect.w <= 0 || rect.h <= 0) return;
      // 委托给 ImageRenderer
      this.imageRenderer.renderImage(img, svg, rect, ctx);
    });

    // 3. 渲染组合形状（Groups）
    sheet.groupShapes?.forEach((group: OfficeGroupShape) => {
      const rect = getRect(group.anchor);
      if (rect.w <= 0 || rect.h <= 0) return;
      this.renderGroup(group, svg, rect, ctx);
    });

    // 4. 渲染连接符（Connectors）
    const connectorCoords = { getLeft, getTop };
    sheet.connectors?.forEach((cxn: OfficeConnector) => {
      // 委托给 ConnectorRenderer
      this.connectorRenderer.renderConnector(cxn, svg, connectorCoords, ctx);
    });

    // 5. 渲染图表（Charts）
    sheet.charts?.forEach((chart: OfficeChart) => {
      const rect = getRect(chart.anchor);
      if (rect.w <= 0 || rect.h <= 0) return;
      // 委托给 ChartRenderer
      this.chartRenderer.renderChart(chart, svg, rect, ctx);
    });

    container.appendChild(svg);
  }

  /**
   * 渲染组合形状
   * 组合形状包含一个组容器和内部的子形状。
   * 需要处理组自身的坐标变换（Transform）。
   */
  private renderGroup(
    group: OfficeGroupShape,
    container: SVGElement,
    rect: { x: number; y: number; w: number; h: number },
    ctx: any
  ) {
    // 组容器 <g>
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 应用组的变换（平移 + 旋转）
    let transform = `translate(${rect.x}, ${rect.y})`;
    if (group.rotation) {
      transform += ` rotate(${group.rotation}, ${rect.w / 2}, ${rect.h / 2})`;
    }
    g.setAttribute('transform', transform);

    // 渲染组内子元素
    // 目前简化处理，主要处理形状
    group.shapes?.forEach(shape => {
      const childRect = this.getRect(shape.anchor);
      // 计算子元素相对于组左上角的相对坐标
      const relX = childRect.x - rect.x;
      const relY = childRect.y - rect.y;

      // 递归绘制子形状
      this.shapeRenderer.renderShape(shape, g, { x: relX, y: relY, w: childRect.w, h: childRect.h }, ctx);
    });

    container.appendChild(g);
  }

  /**
   * 辅助方法：计算元素的绝对矩形区域
   * 复制自 renderDrawings 中的逻辑，用于组合形状内部计算
   */
  private getRect(anchor: any) {
    if (!anchor || anchor.type !== 'absolute') return { x: 0, y: 0, w: 0, h: 0 };

    // colWidths 数组索引从 0 开始，对应 Excel 的第 1 列
    const getLeft = (col: number, off: number) => {
      let left = 0;
      for (let c = 0; c < col; c++) left += this.colWidths[c] || DEFAULT_COL_WIDTH;
      return left + off * EMU_TO_PX;
    };

    // rowHeights 数组索引从 0 开始，对应 Excel 的第 1 行
    const getTop = (row: number, off: number) => {
      let top = 0;
      for (let r = 0; r < row; r++) top += this.rowHeights[r] || DEFAULT_ROW_HEIGHT;
      return top + off * EMU_TO_PX;
    };

    const x1 = getLeft(anchor.from.col, anchor.from.colOff);
    const y1 = getTop(anchor.from.row, anchor.from.rowOff);
    const x2 = getLeft(anchor.to.col, anchor.to.colOff);
    const y2 = getTop(anchor.to.row, anchor.to.rowOff);

    return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
  }
}
