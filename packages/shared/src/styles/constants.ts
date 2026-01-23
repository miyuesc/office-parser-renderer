/**
 * 共享样式常量定义
 *
 * 定义 OOXML 文档渲染所需的通用样式常量
 * 包括单位转换、默认尺寸、默认颜色等
 */

// ============================================
// 基础单位常量
// ============================================

/** 标准屏幕 DPI */
export const DEFAULT_DPI = 96;

/** 每英寸的点数 (Point) */
export const POINTS_PER_INCH = 72;

/** 每英寸的 Twips 数 (1 twip = 1/20 point) */
export const TWIPS_PER_INCH = 1440;

/** 每英寸的 EMU 数 (English Metric Unit) */
export const EMU_PER_INCH = 914400;

/** 每英寸的毫米数 */
export const MM_PER_INCH = 25.4;

/** 每英寸的厘米数 */
export const CM_PER_INCH = 2.54;

/** 每英寸的 Pica 数 (1 pica = 12 points) */
export const PICAS_PER_INCH = 6;

/** 每英寸的 DXA 数 (DXA = Twips，别名) */
export const DXA_PER_INCH = 1440;

// ============================================
// EMU 相关常量
// ============================================

/** 每 EMU 的像素数 (96 DPI 下) */
export const EMU_TO_PX = DEFAULT_DPI / EMU_PER_INCH;

/** 每毫米的 EMU 数 */
export const EMU_PER_MM = 36000;

/** 每厘米的 EMU 数 */
export const EMU_PER_CM = 360000;

/** 每点的 EMU 数 */
export const EMU_PER_POINT = 12700;

/** 每 Twip 的 EMU 数 */
export const EMU_PER_TWIP = 635;

// ============================================
// 点 (Point) 相关常量
// ============================================

/** PT（点）到像素的转换因子 (96 / 72 = 1.333...) */
export const PT_TO_PX = DEFAULT_DPI / POINTS_PER_INCH;

/** 每点的 Twips 数 */
export const TWIPS_PER_POINT = 20;

/** 半点 (Half Point) 到点的转换因子 */
export const HALF_POINT_TO_POINT = 0.5;

/** 八分之一点 (Eighth Point) 到点的转换因子 */
export const EIGHTH_POINT_TO_POINT = 0.125;

/** 二十分之一点 (Twentieth Point) 到点的转换因子，即 Twip 到点 */
export const TWENTIETH_POINT_TO_POINT = 0.05;

// ============================================
// Twips/DXA 相关常量
// ============================================

/** Twips 到像素的转换因子 (96 / 1440) */
export const TWIPS_TO_PX = DEFAULT_DPI / TWIPS_PER_INCH;

/** Twips 到毫米的转换因子 */
export const TWIPS_TO_MM = MM_PER_INCH / TWIPS_PER_INCH;

/** 每毫米的 Twips 数 */
export const TWIPS_PER_MM = TWIPS_PER_INCH / MM_PER_INCH;

/** 每厘米的 Twips 数 */
export const TWIPS_PER_CM = TWIPS_PER_INCH / CM_PER_INCH;

// ============================================
// 角度单位常量
// ============================================

/** OOXML 角度单位：1/60000 度 */
export const OOXML_ANGLE_UNIT = 60000;

/** VML 角度单位：1/65536 度（仅用于旋转） */
export const VML_ANGLE_UNIT = 65536;

/** ST_PositiveFixedAngle 最大值 (360度) */
export const MAX_ANGLE_UNITS = 21600000;

// ============================================
// 百分比单位常量
// ============================================

/** OOXML 百分比单位：1/1000 % (100% = 100000) */
export const OOXML_PERCENT_UNIT = 1000;

/** OOXML 百分比基数 (100% = 100000) */
export const OOXML_PERCENT_BASE = 100000;

/** 千分比基数 (100% = 1000) */
export const PERMILLE_BASE = 1000;

// ============================================
// Excel 特定常量
// ============================================

/** 字符宽度到像素的转换因子（Excel 列宽） */
export const CHAR_WIDTH_TO_PX = 7.5;

/** Excel 默认字符宽度（以 Calibri 11pt 为基准） */
export const EXCEL_DEFAULT_CHAR_WIDTH = 8;

/** Excel 列宽内边距（像素） */
export const EXCEL_COL_PADDING_PX = 5;

/** 行高乘数（PT 到 PX） */
export const ROW_HEIGHT_MULTIPLIER = PT_TO_PX;

// ============================================
// 字号相关常量
// ============================================

/** OOXML 字号单位：1/100 点 (用于某些上下文) */
export const FONT_SIZE_UNIT_HUNDREDTH = 100;

/** 行距单位：240 = 单倍行距 */
export const LINE_SPACING_UNIT = 240;

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
