/**
 * XLSX 渲染器常量定义
 *
 * 集中管理 XLSX 渲染相关的配置常量
 * 通用常量从 @ai-space/shared 导入
 */

// 从 shared 包导入通用常量
import {
  EMU_TO_PX as SHARED_EMU_TO_PX,
  PT_TO_PX as SHARED_PT_TO_PX,
  DEFAULT_FONT_SIZE_PT as SHARED_DEFAULT_FONT_SIZE_PT,
  DEFAULT_COLORS as SHARED_DEFAULT_COLORS,
  OFFICE_THEME_COLORS as SHARED_OFFICE_THEME_COLORS,
  CHAR_WIDTH_TO_PX as SHARED_CHAR_WIDTH_TO_PX,
  ROW_HEIGHT_MULTIPLIER as SHARED_ROW_HEIGHT_MULTIPLIER,
  DEFAULT_COL_WIDTH as SHARED_DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT as SHARED_DEFAULT_ROW_HEIGHT,
  DEFAULT_STROKE_WIDTH_EMU as SHARED_DEFAULT_STROKE_WIDTH_EMU
} from '@ai-space/shared';

// ============================================
// 重导出共享常量（保持向后兼容）
// ============================================

/** EMU (English Metric Units) 到像素的转换因子 */
export const EMU_TO_PX = SHARED_EMU_TO_PX;

/** PT (点) 到像素的转换因子 */
export const PT_TO_PX = SHARED_PT_TO_PX;

/** 字符宽度到像素的转换因子（Excel 列宽） */
export const CHAR_WIDTH_TO_PX = SHARED_CHAR_WIDTH_TO_PX;

/** PT 到像素的乘数（用于行高） */
export const ROW_HEIGHT_MULTIPLIER = SHARED_ROW_HEIGHT_MULTIPLIER;

/** 默认列宽（像素） */
export const DEFAULT_COL_WIDTH = SHARED_DEFAULT_COL_WIDTH;

/** 默认行高（像素） */
export const DEFAULT_ROW_HEIGHT = SHARED_DEFAULT_ROW_HEIGHT;

/** 默认字体大小（PT） */
export const DEFAULT_FONT_SIZE_PT = SHARED_DEFAULT_FONT_SIZE_PT;

/** 默认边框线宽（EMU） */
export const DEFAULT_STROKE_WIDTH_EMU = SHARED_DEFAULT_STROKE_WIDTH_EMU;

/** 默认颜色值 */
export const DEFAULT_COLORS = SHARED_DEFAULT_COLORS;

/** Office 2007-2010 风格默认颜色 */
export const OFFICE_THEME_COLORS = SHARED_OFFICE_THEME_COLORS;

// ============================================
// XLSX 专用图表配置
// ============================================

/** 图表内边距 */
export const CHART_PADDING = {
  bar: { top: 40, right: 20, bottom: 50, left: 50 },
  pie: { top: 40, right: 20, bottom: 30, left: 20 },
  line: { top: 40, right: 20, bottom: 50, left: 50 }
};

/** Y 轴刻度数量 */
export const Y_AXIS_TICK_COUNT = 5;

/**
 * 柱状图组间距比例
 * Office 默认约为 150% 柱宽，此处使用 0.35 (约 54% 间隙)
 */
export const BAR_GROUP_GAP_RATIO = 0.35;

/**
 * 柱状图组内间距比例
 * Office 默认组内无间距或极小间距
 */
export const BAR_INNER_GAP_RATIO = 0.08;

/** Y 值上限余量比例 */
export const Y_MAX_MARGIN_RATIO = 1.1;

// ============================================
// XLSX 专用形状样式
// ============================================

/** 默认圆角矩形圆角比例 (1/100000) */
export const DEFAULT_ROUND_RECT_RATIO = 16667;

/** 箭头标记基础尺寸（像素） */
export const MARKER_BASE_SIZE = 6;

/** 箭头标记尺寸缩放因子 */
export const MARKER_SCALE = {
  sm: 0.7,
  med: 1.0,
  lg: 1.4
};

/** 箭头标记 viewBox 尺寸 */
export const MARKER_VIEW_BOX = {
  lx: 10, // X 方向长度
  wy: 5 // Y 方向宽度
};

// ============================================
// XLSX 专用滤镜效果
// ============================================

/** 滤镜区域扩展百分比 */
export const FILTER_REGION = {
  width: '250%',
  height: '250%',
  x: '-50%',
  y: '-50%'
};

/** 默认阴影透明度 */
export const DEFAULT_SHADOW_OPACITY = 0.5;

/** 默认发光模糊半径 */
export const DEFAULT_GLOW_BLUR = 5;

// ============================================
// XLSX 专用图案填充
// ============================================

/** 图案填充单元尺寸 */
export const PATTERN_CELL_SIZE = 10;

/** 图案填充线宽 */
export const PATTERN_STROKE_WIDTH = 2;

// ============================================
// XLSX 专用文本渲染
// ============================================

/** 文本截断后缀 */
export const TEXT_TRUNCATE_SUFFIX = '...';

/** 图例项宽度（像素） */
export const LEGEND_ITEM_WIDTH = 80;

/** 图例色块尺寸（像素） */
export const LEGEND_COLOR_SIZE = 10;

// ============================================
// XLSX 专用自定义路径
// ============================================

/** 自定义几何路径的默认 viewBox 尺寸 */
export const DEFAULT_CUSTOM_PATH_VIEWBOX = 21600;
