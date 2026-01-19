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
// 虽然没有被显式使用，但这是预设路径生成逻辑的导入，保留以防未来需要直接调用
import { generatePresetPath } from '@ai-space/shared';

// 导入拆分的子模块
import { StyleResolver, RenderContext } from './StyleResolver';
import { ChartRenderer, RenderRect } from './ChartRenderer';
import { ShapeRenderer } from './ShapeRenderer';
import { ImageRenderer } from './ImageRenderer';
import { ConnectorRenderer } from './ConnectorRenderer';
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, EMU_TO_PX, DEFAULT_CUSTOM_PATH_VIEWBOX } from './constants';

/**
 * XLSX 渲染器主类
 * 负责协调整个工作簿的渲染过程，包括工作表布局和绘图元素（形状、图表、图片等）。
 * 它将具体的渲染任务委托给专用的子渲染器模块。
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

  /**
   * 构造函数
   * @param container 用于挂载渲染结果的 DOM 容器
   */
  constructor(container: HTMLElement) {
    this.container = container;

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
   * @param workbook 解析后的 XLSX 工作簿数据
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
   * @param row 目标行索引（0-based）
   * @param col 目标列索引（0-based）
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
   * 包括：
   * 1. 顶部/中部的工作表内容区域（支持滚动）
   * 2. 底部的标签栏（Tabs Bar）
   */
  private renderLayout() {
    if (!this.workbook) return;

    // 清空容器并设置基础 Flexbox 布局
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden'; // 防止外层容器溢出
    this.container.style.backgroundColor = '#f3f2f1'; // Excel 风格的灰色背景

    // 1. 工作表内容区域
    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.minHeight = '0'; // 关键样式：允许 Flex 子项收缩
    contentArea.style.overflow = 'auto'; // 内部滚动
    contentArea.style.position = 'relative';
    contentArea.style.backgroundColor = '#ffffff';
    this.container.appendChild(contentArea);
    this.contentContainer = contentArea;

    // 2. 底部标签栏
    const tabsBar = document.createElement('div');
    tabsBar.style.height = '32px';
    tabsBar.style.backgroundColor = '#f3f2f1';
    tabsBar.style.display = 'flex';
    tabsBar.style.alignItems = 'flex-end';
    tabsBar.style.paddingLeft = '10px';
    tabsBar.style.borderTop = '1px solid #c8c8c8';
    this.container.appendChild(tabsBar);

    // 渲染所有工作表的标签
    this.workbook.sheets.forEach((sheet, index) => {
      // 跳过隐藏的工作表
      if (sheet.state === 'hidden' || sheet.state === 'veryHidden') return;

      const tab = document.createElement('div');
      tab.textContent = sheet.name;
      tab.style.padding = '5px 15px';
      tab.style.marginRight = '2px';
      tab.style.cursor = 'pointer';
      tab.style.fontSize = '12px';
      tab.style.userSelect = 'none';

      // 高亮当前选中的工作表
      if (index === this.currentSheetIndex) {
        tab.style.backgroundColor = '#ffffff';
        tab.style.borderBottom = '1px solid #ffffff'; // 遮挡底部边框以模拟连通效果
        tab.style.color = '#107c41'; // Excel 绿色
        tab.style.fontWeight = 'bold';
      } else {
        tab.style.backgroundColor = 'transparent';
        tab.style.color = '#444';
      }

      // 点击切换工作表
      tab.onclick = () => {
        this.currentSheetIndex = index;
        this.renderLayout(); // 重新渲染整个布局
      };

      tabsBar.appendChild(tab);
    });

    // 渲染当前激活的工作表内容
    this.renderSheet(contentArea);
  }

  /**
   * 渲染单个工作表的内容
   * @param container 内容区域容器
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
        if (this.isMerged(rIdx, c, sheet.merges)) continue;

        const cell = cells[c];
        const td = document.createElement('td');

        // 处理合并单元格的起始位置
        const merge = this.getMergeStart(rIdx, c, sheet.merges);
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
            const css = CellStyleUtils.getCss(this.workbook, cell.styleIndex);
            Object.assign(td.style, css);
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

    container.appendChild(table);

    // 渲染浮动绘图层（图片、形状、连接符、图表）
    this.renderDrawings(sheet, container);
  }

  /**
   * 渲染所有绘图对象（Drawing Objects）
   * 建立一个 SVG 覆盖层，将所有浮动元素渲染到该层上。
   * @param sheet 当前工作表数据
   * @param container 容器 DOM
   */
  private renderDrawings(sheet: XlsxSheet, container: HTMLElement) {
    // 如果没有任何绘图对象，直接返回
    if (!sheet.images?.length && !sheet.shapes?.length && !sheet.connectors?.length && !sheet.charts?.length) return;

    // 1. 计算布局指标（缓存列宽和行高，用于坐标转换）
    const { colWidths, rowHeights } = this.calculateLayoutMetrics(sheet);
    this.colWidths = colWidths;
    this.rowHeights = rowHeights;

    // 辅助函数：计算指定列和偏移量的左侧像素位置
    const getLeft = (col: number, off: number) => {
      let left = 0;
      for (let c = 0; c < col; c++) left += colWidths[c + 1] || DEFAULT_COL_WIDTH;
      return left + off * EMU_TO_PX;
    };

    // 辅助函数：计算指定行和偏移量的顶部像素位置
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

    const getLeft = (col: number, off: number) => {
      let left = 0;
      for (let c = 0; c < col; c++) left += this.colWidths[c + 1] || DEFAULT_COL_WIDTH;
      return left + off * EMU_TO_PX;
    };

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

  /**
   * 计算布局指标（列宽和行高度量）
   * 遍历所有绘图对象以确定需要渲染的最大行和列范围。
   * 同时填充 colWidths 和 rowHeights 数组。
   */
  private calculateLayoutMetrics(sheet: XlsxSheet) {
    const colWidths: number[] = [];
    const rowHeights: number[] = [];
    let maxR = 0;
    let maxC = 0;

    // 检查所有浮动元素，扩展渲染范围
    const check = (list: any[] | undefined) => {
      if (!list) return;
      list.forEach(i => {
        if (i.anchor) {
          if (i.anchor.to) {
            maxR = Math.max(maxR, i.anchor.to.row);
            maxC = Math.max(maxC, i.anchor.to.col);
          } else {
            maxR = Math.max(maxR, i.anchor.from.row + 5); // 预估大小
            maxC = Math.max(maxC, i.anchor.from.col + 5);
          }
        }
      });
    };
    check(sheet.images);
    check(sheet.shapes);
    check(sheet.connectors);

    // 填充列宽信息
    if (sheet.cols) {
      sheet.cols.forEach(c => {
        // Excel 列宽转换像素近似值
        const w = c.width * 7.5;
        // 覆盖该定义范围内的所有列
        for (let k = c.min; k <= c.max; k++) colWidths[k] = w;
      });
    }

    // 填充行高信息
    if (sheet.rows) {
      Object.values(sheet.rows).forEach(r => {
        if (r.height)
          rowHeights[r.index] = r.height * 1.33; // Pt to Px
        else rowHeights[r.index] = 20;
      });
    }

    return { colWidths, rowHeights };
  }

  /**
   * 判断单元格是否处于被合并状态（非左上角的主单元格）
   * 如果返回 true，则该单元格在渲染时应该被跳过。
   */
  private isMerged(r: number, c: number, merges: any[]): boolean {
    // Return true if (r, c) is INSIDE a merge block but NOT the top-left cell
    for (const m of merges) {
      // 检查范围: s.r <= r <= e.r && s.c <= c <= e.c
      if (r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c) {
        // 如果是起始单元格，不算被合并覆盖（它需要渲染）
        if (r === m.s.r && c === m.s.c) return false;
        return true;
      }
    }
    return false;
  }

  /**
   * 获取合并单元格的起始定义
   * 如果当前单元格是一个合并块的左上角，返回该合并定义。
   */
  private getMergeStart(r: number, c: number, merges: any[]): any | null {
    for (const m of merges) {
      if (r === m.s.r && c === m.s.c) return m;
    }
    return null;
  }
}
