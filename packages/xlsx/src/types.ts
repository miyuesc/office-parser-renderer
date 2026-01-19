/**
 * XLSX 类型定义
 *
 * 定义 XLSX 文件解析和渲染所需的数据结构
 */

/**
 * Office 形状接口
 * 定义本地类型以确保属性完整性，避免共享模块问题
 */
export interface OfficeShape {
  /** 唯一标识符 */
  id: string;
  /** 形状名称 */
  name?: string;
  /** 形状类型 */
  type?: string;
  /** 填充样式 */
  fill?: any;
  /** 描边样式 */
  stroke?: any;
  /** 几何类型 */
  geometry?: string;
  /** 自定义几何路径 */
  path?: string;
  /** 路径坐标系宽度 */
  pathWidth?: number;
  /** 路径坐标系高度 */
  pathHeight?: number;
  /** 效果列表（阴影、发光等） */
  effects?: any[];
  /** 旋转角度 */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 文本内容 */
  textBody?: any;
  /** 样式引用 */
  style?: any;
  /** 锚点信息 */
  anchor: any;
  /** 调整值 */
  adjustValues?: Record<string, number>;
}

/**
 * Office 图片接口
 */
export interface OfficeImage {
  /** 唯一标识符 */
  id: string;
  /** 嵌入资源 ID */
  embedId: string;
  /** 图片名称 */
  name?: string;
  /** 图片源 URL */
  src: string;
  /** 图片二进制数据 */
  data?: ArrayBuffer;
  /** MIME 类型 */
  mimeType?: string;
  /** 旋转角度 */
  rotation?: number;
  /** 锚点信息 */
  anchor: any;
  /** 描边样式 */
  stroke?: any;
  /** 效果列表 */
  effects?: any[];
  /** 几何类型 */
  geometry?: string;
  /** 调整值 */
  adjustValues?: Record<string, number>;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
}

/**
 * Office 连接符接口
 */
export interface OfficeConnector {
  /** 唯一标识符 */
  id: string;
  /** 连接符名称 */
  name?: string;
  /** 连接符类型 */
  type?: string;
  /** 几何类型 */
  geometry?: string;
  /** 描边样式 */
  stroke?: any;
  /** 锚点信息 */
  anchor: any;
  /** 旋转角度 */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 起始箭头类型 */
  startArrow?: string;
  /** 结束箭头类型 */
  endArrow?: string;
  /** 样式引用 */
  style?: any;
  /** 调整值 */
  adjustValues?: Record<string, number>;
}

/**
 * Office 样式引用接口
 */
export interface OfficeStyle {
  /** 填充样式引用 */
  fillRef?: { idx: number; color?: string };
  /** 线条样式引用 */
  lnRef?: { idx: number; color?: string };
  /** 效果样式引用 */
  effectRef?: { idx: number; color?: string };
  /** 字体样式引用 */
  fontRef?: { idx: string; color?: string };
}

/**
 * Office 组合形状接口
 */
export interface OfficeGroupShape {
  /** 唯一标识符 */
  id: string;
  /** 组合名称 */
  name?: string;
  /** 旋转角度 */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 锚点信息 */
  anchor: any;
  /** 子形状列表 */
  shapes: OfficeShape[];
  /** 子图片列表 */
  images: OfficeImage[];
  /** 子连接符列表 */
  connectors: OfficeConnector[];
  /** 子组合列表 */
  groups: OfficeGroupShape[];
}

/**
 * 图表系列数据
 */
export interface ChartSeries {
  /** 系列索引 */
  index: number;
  /** 系列名称 */
  name?: string;
  /** 分类数据 (X轴标签) */
  categories: string[];
  /** 数值数据 (Y轴值) */
  values: number[];
  /** 填充颜色 */
  fillColor?: string;
}

/**
 * 图表数据
 */
export interface OfficeChart {
  /** 图表 ID */
  id: string;
  /** 图表类型 */
  type: 'barChart' | 'pieChart' | 'pie3DChart' | 'lineChart' | 'areaChart' | 'scatterChart' | 'other';
  /** 图表标题 */
  title?: string;
  /** 数据系列 */
  series: ChartSeries[];
  /** 柱状图方向 (barChart only) */
  barDirection?: 'col' | 'bar';
  /** 柱状图分组方式 */
  grouping?: 'clustered' | 'stacked' | 'percentStacked';
  /** 锚点信息 */
  anchor: any;
}

/**
 * XLSX 工作簿接口
 */
export interface XlsxWorkbook {
  /** 工作表列表 */
  sheets: XlsxSheet[];
  /** 样式信息 */
  styles: XlsxStyles;
  /** 共享字符串表 */
  sharedStrings: string[];
  /** 主题信息 */
  theme?: XlsxTheme;
  /** 是否使用 1904 日期系统 */
  date1904?: boolean;
}

/**
 * XLSX 工作表接口
 */
export interface XlsxSheet {
  /** 工作表名称 */
  name: string;
  /** 关系 ID (r:id) */
  id: string;
  /** 可见状态 */
  state?: 'visible' | 'hidden' | 'veryHidden';
  /** 行数据（稀疏数组） */
  rows: Record<number, XlsxRow>;
  /** 合并单元格列表 */
  merges: XlsxMergeCell[];
  /** 列宽信息（范围） */
  cols: XlsxColumn[];
  /** 页边距 */
  pageMargins?: XlsxPageMargins;
  /** 页面设置 */
  pageSetup?: XlsxPageSetup;
  /** 页眉页脚 */
  headerFooter?: XlsxHeaderFooter;
  /** 绘图关系 ID (r:id) */
  drawingId?: string;
  /** 图片列表 */
  images?: OfficeImage[];
  /** 形状列表 */
  shapes?: OfficeShape[];
  /** 连接符列表 */
  connectors?: OfficeConnector[];
  /** 组合形状列表 */
  groupShapes?: OfficeGroupShape[];
  /** 图表列表 */
  charts?: OfficeChart[];
}

/**
 * XLSX 锚点接口
 */
export interface XlsxAnchor {
  /** 列索引 */
  col: number;
  /** 列偏移量 (EMU) */
  colOff: number;
  /** 行索引 */
  row: number;
  /** 行偏移量 (EMU) */
  rowOff: number;
}

/**
 * XLSX 行接口
 */
export interface XlsxRow {
  /** 行索引（1-based） */
  index: number;
  /** 行高 */
  height?: number;
  /** 是否自定义高度 */
  customHeight: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 单元格数据 */
  cells: Record<number, XlsxCell>;
}

/**
 * XLSX 列接口
 */
export interface XlsxColumn {
  /** 起始列索引 */
  min: number;
  /** 结束列索引 */
  max: number;
  /** 列宽 */
  width: number;
  /** 是否自定义宽度 */
  customWidth: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * XLSX 单元格接口
 */
export interface XlsxCell {
  /**
   * 单元格类型
   * - s: 共享字符串
   * - n: 数字
   * - b: 布尔值
   * - e: 错误
   * - str: 字符串
   * - inlineStr: 内联字符串
   * - d: 日期
   */
  type: 's' | 'n' | 'b' | 'e' | 'str' | 'inlineStr' | 'd';
  /** 单元格值 */
  value: string | number | boolean | Date;
  /** 公式 */
  formula?: string;
  /** 样式索引 */
  styleIndex?: number;
}

/**
 * XLSX 合并单元格接口
 */
export interface XlsxMergeCell {
  /** 起始位置 */
  s: { r: number; c: number };
  /** 结束位置 */
  e: { r: number; c: number };
}

/**
 * XLSX 样式集接口
 */
export interface XlsxStyles {
  /** 字体列表 */
  fonts: XlsxFont[];
  /** 填充列表 */
  fills: XlsxFill[];
  /** 边框列表 */
  borders: XlsxBorder[];
  /** 单元格格式列表 */
  cellXfs: XlsxCellXf[];
  /** 数字格式映射（ID -> 格式代码） */
  numFmts: Record<number, string>;
}

/**
 * XLSX 字体接口
 */
export interface XlsxFont {
  /** 字号 */
  sz: number;
  /** 字体名称 */
  name: string;
  /** 字体家族 */
  family?: number;
  /** 字符集 */
  charset?: number;
  /** 粗体 */
  b?: boolean;
  /** 斜体 */
  i?: boolean;
  /** 下划线（布尔值或下划线类型） */
  u?: boolean | string;
  /** 删除线 */
  strike?: boolean;
  /** 颜色 */
  color?: XlsxColor;
}

/**
 * XLSX 填充接口
 */
export interface XlsxFill {
  /** 图案类型 */
  patternType?: string;
  /** 前景色 */
  fgColor?: XlsxColor;
  /** 背景色 */
  bgColor?: XlsxColor;
}

/**
 * XLSX 边框接口
 */
export interface XlsxBorder {
  /** 左边框 */
  left?: XlsxBorderSide;
  /** 右边框 */
  right?: XlsxBorderSide;
  /** 上边框 */
  top?: XlsxBorderSide;
  /** 下边框 */
  bottom?: XlsxBorderSide;
  /** 对角线边框 */
  diagonal?: XlsxBorderSide;
}

/**
 * XLSX 边框边接口
 */
export interface XlsxBorderSide {
  /** 边框样式 */
  style: string;
  /** 边框颜色 */
  color?: XlsxColor;
}

/**
 * XLSX 单元格格式接口
 */
export interface XlsxCellXf {
  /** 字体索引 */
  fontId: number;
  /** 填充索引 */
  fillId: number;
  /** 边框索引 */
  borderId: number;
  /** 数字格式索引 */
  numFmtId: number;
  /** 父格式索引 */
  xfId?: number;
  /** 是否应用对齐 */
  applyAlignment?: boolean;
  /** 对齐设置 */
  alignment?: {
    /** 水平对齐 */
    horizontal?: 'general' | 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed';
    /** 垂直对齐 */
    vertical?: 'top' | 'center' | 'bottom' | 'justify' | 'distributed';
    /** 自动换行 */
    wrapText?: boolean;
    /** 缩进 */
    indent?: number;
    /** 文本旋转角度 */
    textRotation?: number;
  };
}

/**
 * XLSX 颜色接口
 */
export interface XlsxColor {
  /** 自动颜色 */
  auto?: boolean;
  /** RGB 颜色（ARGB 十六进制） */
  rgb?: string;
  /** 主题颜色索引 */
  theme?: number;
  /** 色调调整 */
  tint?: number;
  /** 索引颜色 */
  indexed?: number;
}

/**
 * XLSX 主题接口
 */
export interface XlsxTheme {
  /** 颜色方案（名称 -> RGB 值） */
  colorScheme: Record<string, string>;
}

/**
 * XLSX 页边距接口
 */
export interface XlsxPageMargins {
  /** 左边距 */
  left: number;
  /** 右边距 */
  right: number;
  /** 上边距 */
  top: number;
  /** 下边距 */
  bottom: number;
  /** 页眉边距 */
  header: number;
  /** 页脚边距 */
  footer: number;
}

/**
 * XLSX 页面设置接口
 */
export interface XlsxPageSetup {
  /** 纸张大小 */
  paperSize?: number;
  /** 纸张方向 */
  orientation?: 'default' | 'portrait' | 'landscape';
  /** 缩放比例 */
  scale?: number;
  /** 适合宽度页数 */
  fitToWidth?: number;
  /** 适合高度页数 */
  fitToHeight?: number;
}

/**
 * XLSX 页眉页脚接口
 */
export interface XlsxHeaderFooter {
  /** 奇数页页眉 */
  oddHeader?: string;
  /** 奇数页页脚 */
  oddFooter?: string;
  /** 偶数页页眉 */
  evenHeader?: string;
  /** 偶数页页脚 */
  evenFooter?: string;
  /** 首页页眉 */
  firstHeader?: string;
  /** 首页页脚 */
  firstFooter?: string;
  /** 与边距对齐 */
  alignWithMargins?: boolean;
  /** 首页不同 */
  differentFirst?: boolean;
  /** 奇偶页不同 */
  differentOddEven?: boolean;
}
