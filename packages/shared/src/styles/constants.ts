/**
 * 共享样式常量定义
 *
 * 定义 OOXML 文档渲染所需的通用样式常量
 * 包括单位转换、默认尺寸、默认颜色等
 */

// ============================================
// 单位转换常量
// ============================================

/** EMU (English Metric Units) 到像素的转换因子 (1 / 9525) */
export const EMU_TO_PX = 1 / 9525;

/** 每英寸的 EMU 数 */
export const EMU_PER_INCH = 914400;

/** 每英寸的 Twips 数 */
export const TWIPS_PER_INCH = 1440;

/** 每英寸的点数 */
export const POINTS_PER_INCH = 72;

/** 标准屏幕 DPI */
export const DEFAULT_DPI = 96;

/** PT（点）到像素的转换因子 (96 / 72 = 1.333...) */
export const PT_TO_PX = DEFAULT_DPI / POINTS_PER_INCH;

/** Twips 到像素的转换因子 (96 / 1440) */
export const TWIPS_TO_PX = DEFAULT_DPI / TWIPS_PER_INCH;

/** 字符宽度到像素的转换因子（Excel 列宽） */
export const CHAR_WIDTH_TO_PX = 7.5;

/** 行高乘数（PT 到 PX） */
export const ROW_HEIGHT_MULTIPLIER = PT_TO_PX;

// ============================================
// 默认尺寸
// ============================================

/** 默认列宽（像素） */
export const DEFAULT_COL_WIDTH = 64;

/** 默认行高（像素） */
export const DEFAULT_ROW_HEIGHT = 20;

/** 默认字体大小（PT） */
export const DEFAULT_FONT_SIZE_PT = 11;

/** 默认行距 */
export const DEFAULT_LINE_HEIGHT = 1.15;

/** 默认边框线宽（EMU） */
export const DEFAULT_STROKE_WIDTH_EMU = 9525; // 0.75pt

// ============================================
// 颜色常量
// ============================================

/** 默认颜色值 */
export const DEFAULT_COLORS = {
  /** 黑色 */
  black: '#000000',
  /** 白色 */
  white: '#ffffff',
  /** 透明 */
  transparent: 'none',
  /** 图表背景色 */
  chartBackground: '#ffffff',
  /** 图表边框色 */
  chartBorder: '#e0e0e0',
  /** 网格线颜色 */
  gridLine: '#d9d9d9',
  /** 坐标轴颜色 */
  axisLine: '#8c8c8c',
  /** 标签文字颜色 */
  labelText: '#595959',
  /** 标题文字颜色 */
  titleText: '#333333',
  /** 占位符文字颜色 */
  placeholderText: '#666666'
} as const;

/** Office 2007-2010 默认主题颜色 */
export const OFFICE_THEME_COLORS = [
  '#4F81BD', // Blue
  '#C0504D', // Red
  '#9BBB59', // Green
  '#8064A2', // Purple
  '#4BACC6', // Aqua
  '#F79646' // Orange
] as const;

// ============================================
// 预设纸张尺寸 (Twips)
// ============================================

/** 预设纸张尺寸（单位：Twips） */
export const PRESET_PAGE_SIZES = {
  /** A4: 210mm x 297mm */
  A4: { width: 11906, height: 16838 },
  /** A5: 148mm x 210mm */
  A5: { width: 8391, height: 11906 },
  /** A3: 297mm x 420mm */
  A3: { width: 16838, height: 23811 },
  /** Letter: 8.5in x 11in */
  Letter: { width: 12240, height: 15840 },
  /** Legal: 8.5in x 14in */
  Legal: { width: 12240, height: 20160 }
} as const;

/** 默认页边距（Twips） */
export const DEFAULT_MARGINS = {
  /** 上边距 (1 inch) */
  top: 1440,
  /** 右边距 (1 inch) */
  right: 1440,
  /** 下边距 (1 inch) */
  bottom: 1440,
  /** 左边距 (1 inch) */
  left: 1440,
  /** 页眉距离 (0.5 inch) */
  header: 720,
  /** 页脚距离 (0.5 inch) */
  footer: 720,
  /** 装订线 */
  gutter: 0
} as const;
