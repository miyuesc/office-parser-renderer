import {
  XlsxWorkbook,
  XlsxSheet,
  OfficeImage,
  OfficeShape,
  OfficeConnector,
  OfficeGroupShape,
  OfficeChart,
} from '../types';
import { CellStyleUtils } from './CellStyleUtils';
import { NumberFormatUtils } from '../utils/NumberFormatUtils';
import { ShapeRenderer } from '@ai-space/shared'; // Renamed to avoid conflict
import { ChartRenderer } from './ChartRenderer';
import { LayoutCalculator } from './LayoutCalculator';
import { SheetLayoutManager } from './SheetLayoutManager';
import { XlsxStyleInjector } from './XlsxStyleInjector';
// 虽然没有被显式使用，但这是预设路径生成逻辑的导入，保留以防未来需要直接调用
// import { FontManager } from '@ai-space/shared';

// 导入拆分的子模块
import { StyleResolver } from './StyleResolver';
import { VirtualScroller } from './VirtualScroller';
// import { ChartRenderer as LocalChartRenderer } from './ChartRenderer'; // Renamed to avoid conflict

import { ConnectorRenderer } from './ConnectorRenderer';
import { ImageRenderer, RenderContext } from '@ai-space/shared';
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, EMU_TO_PX } from './constants';
import { Logger } from '../utils/Logger';

const log = Logger.createTagged('XlsxRenderer');

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
  private virtualScroller: VirtualScroller | null = null;
  private currentSheet: XlsxSheet | null = null; // 保存当前 Sheet 引用
  private svgLayer: SVGSVGElement | null = null; // SVG 根元素
  private svgContentGroup: SVGGElement | null = null; // SVG 内容容器 (清空重绘用)

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
    log.group('XlsxRenderer.render');
    log.time('Total Render Time');
    this.workbook = workbook;
    // 将工作簿传递给样式解析器，以便它可以访问主题颜色和其他全局资源
    this.styleResolver.setWorkbook(workbook);
    // 默认渲染第一个工作表
    this.currentSheetIndex = 0;
    this.renderLayout();
    log.timeEnd('Total Render Time');
    log.groupEnd();
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
    log.debug('Rendering layout', { sheetIndex: this.currentSheetIndex });
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
    const tabsBar = SheetLayoutManager.createTabBar(
      this.workbook,
      this.currentSheetIndex,
      (index) => {
        this.currentSheetIndex = index;
        this.renderLayout();
      },
    );
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
   * 3. 虚拟滚动：初始化 VirtualScroller，设置 renderArea 总高度，仅渲染视口可见行。
   * 4. 绘图层包装：创建一个相对定位的包装容器 (`div.xlsx-render-area`)。
   * 5. 触发绘图：调用 `renderDrawings` 在表格上方渲染 SVG 层。
   *
   * @param container - 内容区域容器
   */
  private renderSheet(container: HTMLElement) {
    if (!this.workbook) return;
    const sheet = this.workbook.sheets[this.currentSheetIndex];
    if (!sheet) return;

    // 清理旧的 Scroller
    if (this.virtualScroller) {
      this.virtualScroller.unbindEvents();
      this.virtualScroller = null;
    }

    // 创建表格元素
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.tableLayout = 'fixed'; // 固定布局以支持精确的列宽
    table.style.width = 'max-content'; // 允许表格根据内容扩展宽度
    table.style.position = 'absolute'; // 绝对定位，配合虚拟滚动
    table.style.top = '0';
    table.style.left = '0';
    table.style.zIndex = '5'; // 表格在底层，但在背景之上

    // --- 计算表格维度 ---

    // 使用 LayoutCalculator 预计算布局指标 (行高、列宽)
    const { colWidths, rowHeights, maxCol, maxRow } =
      LayoutCalculator.calculateLayoutMetrics(sheet);
    this.colWidths = colWidths;
    this.rowHeights = rowHeights;

    log.debug('Sheet Metrics', { maxRow, maxCol });

    // --- 渲染列组（ColGroup）以设置列宽 ---

    const colgroup = document.createElement('colgroup');
    let totalWidth = 0;

    for (let c = 1; c <= maxCol; c++) {
      const col = document.createElement('col');
      // colWidths 索引 0 对应 Column 1
      const width = colWidths[c - 1] || DEFAULT_COL_WIDTH;
      totalWidth += width;
      col.style.width = `${width}px`;
      colgroup.appendChild(col);
    }
    table.appendChild(colgroup);

    // 创建 tbody
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // 设置表格总宽度以确保滚动条正确出现
    table.style.width = `${totalWidth}px`;

    // 计算总高度
    let totalHeight = 0;
    for (const h of rowHeights) {
      totalHeight += h || DEFAULT_ROW_HEIGHT;
    }
    // 确保至少有一屏高度
    totalHeight = Math.max(totalHeight, container.clientHeight || 500);

    // 创建内层渲染区域包装器
    // 这个包装器使用 position: relative 作为 table 和 SVG 的共同定位基准
    // 设置总高度以撑开滚动条
    const renderArea = document.createElement('div');
    renderArea.className = 'xlsx-render-area';
    renderArea.style.position = 'relative';
    renderArea.style.width = 'fit-content';
    renderArea.style.minWidth = '100%';
    renderArea.style.height = `${totalHeight}px`;

    renderArea.appendChild(table);
    container.appendChild(renderArea);

    // 渲染绘图层 (SVG) - 初始化空层
    // 绘图内容将由虚拟滚动回调动态填充
    this.initDrawingsLayer(sheet, renderArea);

    // --- 虚拟滚动初始化 ---

    const renderRows = (start: number, end: number, offsetTop: number) => {
      // 清空 tbody
      tbody.innerHTML = '';

      // 移动表格到当前视口起点
      table.style.transform = `translateY(${offsetTop}px)`;

      // 渲染可见行
      // VirtualScroller 传递的是 0-based 索引，Excel 行是 1-based
      for (let i = start; i < end; i++) {
        const rIdx = i + 1; // 1-based
        if (rIdx > maxRow) break;

        const rowInfo = sheet.rows[rIdx];
        const tr = document.createElement('tr');

        // 设置行高
        const h = rowHeights[i] || DEFAULT_ROW_HEIGHT;
        tr.style.height = `${h}px`;

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

          // 处理合并单元格
          const merge = LayoutCalculator.getMergeStart(rIdx, c, sheet.merges);
          if (merge) {
            td.colSpan = merge.e.c - merge.s.c + 1;
            td.rowSpan = merge.e.r - merge.s.r + 1;
          }

          if (cell) {
            // --- 处理单元格值和格式 ---
            let rawValue: string | number | boolean | null = cell.value;
            let isNumber = false;

            if (this.workbook && cell.type === 's') {
              // 共享字符串索引
              const idx =
                typeof cell.value === 'number' ? cell.value : parseInt(cell.value as string);
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
              if (fontClassName) {
                td.classList.add(fontClassName);
              }
            }
          }

          // 默认边框
          const hasBorder =
            td.style.borderTop ||
            td.style.borderRight ||
            td.style.borderBottom ||
            td.style.borderLeft ||
            td.style.border;
          if (!hasBorder) {
            td.style.border = '1px solid #d4d4d4'; // 默认浅灰色网格线
          }

          tr.appendChild(td);

          // 如果是合并单元格，跳过被合并覆盖的列
          if (merge) {
            c += merge.e.c - merge.s.c;
          }
        }

        tbody.appendChild(tr);
      }

      // 更新可见的绘图对象
      // 传递 1-based 的行索引范围
      this.updateVisibleDrawings(start + 1, end + 1);
    };

    // 初始化 VirtualScroller
    // maxRow is 1-based index of last row, so totalRows = maxRow
    this.virtualScroller = new VirtualScroller(
      container,
      maxRow,
      (idx) => rowHeights[idx] || DEFAULT_ROW_HEIGHT,
      renderRows,
    );
    this.virtualScroller.init();
  }

  /**
   * 初始化绘图层（SVG）
   * 创建 SVG 容器和 defs，准备接收绘图内容
   */
  private initDrawingsLayer(sheet: XlsxSheet, container: HTMLElement) {
    this.currentSheet = sheet;

    // 创建 SVG 覆盖层
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none'; // 让下方表格可点击
    svg.style.overflow = 'visible';
    svg.style.zIndex = '10';

    // 创建 defs 元素
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 创建内容分组
    const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(contentGroup);

    container.appendChild(svg);

    this.svgLayer = svg;
    this.svgContentGroup = contentGroup;
  }

  /**
   * 更新可见区域的绘图对象
   * 根据当前视口的行范围，筛选并渲染绘图对象
   *
   * @param startRow 开始行索引 (1-based)
   * @param endRow 结束行索引 (1-based)
   */
  private updateVisibleDrawings(startRow: number, endRow: number) {
    if (!this.currentSheet || !this.svgContentGroup || !this.svgLayer) return;

    // 清空当前内容
    this.svgContentGroup.innerHTML = '';

    const sheet = this.currentSheet;

    // 如果没有任何绘图对象，直接返回
    if (
      !sheet.images?.length &&
      !sheet.shapes?.length &&
      !sheet.connectors?.length &&
      !sheet.charts?.length
    )
      return;

    // 使用 LayoutCalculator 计算的指标
    // 确保与 getRect 使用相同的数据源
    const colWidths = this.colWidths;
    const rowHeights = this.rowHeights;

    // 辅助函数：计算指定列和偏移量的左侧像素位置
    const getLeft = (col: number, off: number) => {
      let left = 0;
      for (let c = 0; c < col; c++) left += colWidths[c] || DEFAULT_COL_WIDTH;
      return left + off * EMU_TO_PX;
    };

    // 辅助函数：计算指定行和偏移量的顶部像素位置
    const getTop = (row: number, off: number) => {
      let top = 0;
      for (let r = 0; r < row; r++) top += rowHeights[r] || DEFAULT_ROW_HEIGHT;
      return top + off * EMU_TO_PX;
    };

    // 辅助函数：仅计算 Rect，不进行碰撞检测（因为数据不同）
    // 注意：这里的 getRect 与类中的 private getRect 略有不同，需要使用闭包中的 getLeft/getTop 以保持一致
    const getRect = (anchor: {
      from: { col: number; colOff: number; row: number; rowOff: number };
      to?: { col: number; colOff: number; row: number; rowOff: number };
      ext?: { cx: number; cy: number };
    }) => {
      const x = getLeft(anchor.from.col, anchor.from.colOff);
      const y = getTop(anchor.from.row, anchor.from.rowOff);
      let w = 0,
        h = 0;

      if (anchor.to) {
        const x2 = getLeft(anchor.to!.col, anchor.to!.colOff);
        const y2 = getTop(anchor.to!.row, anchor.to!.rowOff);
        w = Math.max(0, x2 - x);
        h = Math.max(0, y2 - y);
      } else if (anchor.ext) {
        w = anchor.ext.cx * EMU_TO_PX;
        h = anchor.ext.cy * EMU_TO_PX;
      }
      return { x, y, w, h };
    };

    // 渲染上下文
    // defs 位于 SVG 根节点下，所有 contentGroup 的子元素共享
    const defs = this.svgLayer.querySelector('defs')!;
    const ctx: RenderContext = { defs, defsIdCounter: 0 };

    // 检查对象是否在当前视口范围内
    const isVisible = (anchor: { from: { row: number }; to?: { row: number } }) => {
      // 简单碰撞检测：对象的垂直范围与视口垂直范围相交
      const objStart = anchor.from.row;
      const objEnd = anchor.to?.row || objStart + 10; // 对于单锚点，假设占据一定高度
      return objStart <= endRow && objEnd >= startRow;
    };

    // 1. 渲染形状（Shapes）
    sheet.shapes?.forEach((shape: OfficeShape) => {
      if (isVisible(shape.anchor)) {
        const rect = getRect(shape.anchor);
        if (rect.w > 0 && rect.h > 0) {
          this.shapeRenderer.renderShape(shape, this.svgContentGroup!, rect, ctx);
        }
      }
    });

    // 2. 渲染图片（Images）
    sheet.images?.forEach((img: OfficeImage) => {
      if (isVisible(img.anchor)) {
        const rect = getRect(img.anchor);
        if (rect.w > 0 && rect.h > 0) {
          this.imageRenderer.renderToSVG(img, this.svgContentGroup!, rect, ctx);
        }
      }
    });

    // 3. 渲染组合形状（Groups）
    sheet.groupShapes?.forEach((group: OfficeGroupShape) => {
      if (isVisible(group.anchor)) {
        const rect = getRect(group.anchor);
        if (rect.w > 0 && rect.h > 0) {
          this.renderGroup(group, this.svgContentGroup!, rect, ctx);
        }
      }
    });

    // 4. 渲染连接符（Connectors）
    const connectorCoords = { getLeft, getTop };
    sheet.connectors?.forEach((cxn: OfficeConnector) => {
      // 连接符可能跨越很远，暂时总是渲染，或者进行更复杂的检测
      // 简单处理：如果起点或终点在范围内则渲染
      if (!cxn.anchor || !cxn.anchor.from) return;

      const startR = cxn.anchor.from.row;
      // to 可能是 undefined (对于非 twoCell anchor)，此时使用 startR
      const endR = cxn.anchor.to?.row ?? startR;

      // 只要有一端在视口范围内，或者跨越了视口，就渲染
      const minR = Math.min(startR, endR);
      const maxR = Math.max(startR, endR);

      if (maxR >= startRow && minR <= endRow) {
        this.connectorRenderer.renderConnector(cxn, this.svgContentGroup!, connectorCoords, ctx);
      }
    });

    // 5. 渲染图表（Charts）
    sheet.charts?.forEach((chart: OfficeChart) => {
      if (chart.anchor && chart.anchor.from && isVisible(chart.anchor)) {
        const rect = getRect(chart.anchor);
        if (rect.w > 0 && rect.h > 0) {
          this.chartRenderer.renderChart(chart, this.svgContentGroup!, rect, ctx);
        }
      }
    });
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
    ctx: RenderContext,
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
    group.shapes?.forEach((shape) => {
      const childRect = this.getRect(shape.anchor);
      // 计算子元素相对于组左上角的相对坐标
      const relX = childRect.x - rect.x;
      const relY = childRect.y - rect.y;

      // 递归绘制子形状
      this.shapeRenderer.renderShape(
        shape,
        g,
        { x: relX, y: relY, w: childRect.w, h: childRect.h },
        ctx,
      );
    });

    container.appendChild(g);
  }

  /**
   * 辅助方法：计算元素的绝对矩形区域
   * 复制自 renderDrawings 中的逻辑，用于组合形状内部计算
   */
  private getRect(anchor: {
    type?: string;
    from: { col: number; colOff: number; row: number; rowOff: number };
    to?: { col: number; colOff: number; row: number; rowOff: number };
    ext?: { cx: number; cy: number };
  }) {
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

    if (anchor.to) {
      const x2 = getLeft(anchor.to.col, anchor.to.colOff);
      const y2 = getTop(anchor.to.row, anchor.to.rowOff);
      return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
    } else if (anchor.ext) {
      const w = anchor.ext.cx * EMU_TO_PX;
      const h = anchor.ext.cy * EMU_TO_PX;
      return { x: x1, y: y1, w, h };
    }

    return { x: x1, y: y1, w: 0, h: 0 };
  }
}
