/**
 * 共享渲染器类型定义
 *
 * 定义形状、图表、图片渲染所需的通用接口
 */

import type { OfficeFill, OfficeStroke, OfficeEffect, ImageCrop } from './drawing';

/**
 * 渲染区域接口
 * 定义元素在画布中的位置和尺寸
 */
export interface RenderRect {
  /** X 坐标 (像素) */
  x: number;
  /** Y 坐标 (像素) */
  y: number;
  /** 宽度 (像素) */
  w: number;
  /** 高度 (像素) */
  h: number;
}

/**
 * 渲染上下文接口
 * 包含渲染过程中需要的共享资源
 */
export interface RenderContext {
  /** SVG defs 元素，用于存放渐变、滤镜等定义 */
  defs?: SVGDefsElement;
  /** 主题信息 */
  theme?: Record<string, unknown>;
  /** 已生成的定义 ID 计数器 */
  defsIdCounter?: number;
  /** 图片资源映射 (embedId -> dataURL/blobURL) */
  images?: Record<string, string>;
}

/**
 * 颜色定义类型
 * 可以是十六进制字符串或包含主题颜色引用的对象
 */
export type ColorDef =
  | string
  | {
      /** 十六进制颜色值 */
      val?: string;
      /** 主题颜色键 */
      theme?: string;
      /** 色调修改 (百分比) */
      tint?: number;
      /** 阴影修改 (百分比) */
      shade?: number;
      /** 亮度修改 */
      lumMod?: number;
      /** 亮度偏移 */
      lumOff?: number;
      /** 透明度 (0-1) */
      alpha?: number;
    };

/**
 * 样式解析器接口
 * 定义各包需要实现的样式解析方法
 */
export interface StyleResolverInterface {
  /**
   * 解析颜色值
   * @param color - 颜色定义
   * @returns 解析后的 CSS 颜色值
   */
  resolveColor(color: ColorDef): string;

  /**
   * 解析填充样式
   * @param fill - 填充配置
   * @param ctx - 渲染上下文
   * @param rect - 渲染区域
   * @param asCSS - 是否返回 CSS 格式（用于文本渐变）
   * @returns 填充值（颜色字符串或 url(#id)）
   */
  resolveFill(
    fill: OfficeFill | undefined,
    ctx: RenderContext,
    rect: RenderRect | null,
    asCSS?: boolean,
  ): string;

  /**
   * 解析滤镜效果
   * @param effects - 效果列表
   * @param ctx - 渲染上下文
   * @returns 滤镜 ID 或 null
   */
  resolveFilter(effects: OfficeEffect[], ctx: RenderContext): string | null;
}

/**
 * 形状渲染配置接口
 */
export interface ShapeRenderOptions {
  /** 形状 ID */
  id?: string;
  /** 预设几何类型 */
  geometry?: string;
  /** 自定义 SVG 路径 */
  path?: string;
  /** 自定义路径坐标系宽度 */
  pathWidth?: number;
  /** 自定义路径坐标系高度 */
  pathHeight?: number;
  /** 填充样式 */
  fill?: OfficeFill;
  /** 描边样式 */
  stroke?: OfficeStroke;
  /** 旋转角度（度） */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 调整值 */
  adjustValues?: Record<string, number>;
  /** 效果列表 */
  effects?: OfficeEffect[];
  /** 文本内容 */
  textBody?: ShapeTextBody;
  /** 样式引用 */
  style?: ShapeStyleRef;
}

/**
 * 形状文本体接口
 */
export interface ShapeTextBody {
  /** 纯文本内容 */
  text?: string;
  /** 垂直对齐 */
  verticalAlignment?: 'top' | 'middle' | 'bottom' | 'ctr' | 'b' | 'justified' | 'distributed';
  /** 内边距 */
  padding?: { left: number; top: number; right: number; bottom: number };
  /** 段落列表 */
  paragraphs?: ShapeTextParagraph[];
}

/**
 * 形状文本段落接口
 */
export interface ShapeTextParagraph {
  /** 对齐方式 */
  alignment?: string;
  /** 文本片段列表 */
  runs: ShapeTextRun[];
}

/**
 * 形状文本片段接口
 */
export interface ShapeTextRun {
  /** 文本内容 */
  text: string;
  /** 粗体 */
  bold?: boolean;
  /** 字号 (pt) */
  size?: number;
  /** 颜色 */
  color?: string;
  /** 填充（可为渐变） */
  fill?: OfficeFill;
  /** 效果列表 */
  effects?: OfficeEffect[];
}

/**
 * 形状样式引用接口
 */
export interface ShapeStyleRef {
  /** 线条样式引用 */
  lnRef?: { idx: number; color?: string };
  /** 填充样式引用 */
  fillRef?: { idx: number; color?: string };
  /** 效果样式引用 */
  effectRef?: { idx: number; color?: string };
  /** 字体样式引用 */
  fontRef?: { idx: string; color?: string };
}

/**
 * 图表渲染配置接口
 */
export interface ChartRenderOptions {
  /** 图表 ID */
  id?: string;
  /** 图表类型 */
  type:
    | 'barChart'
    | 'pieChart'
    | 'pie3DChart'
    | 'lineChart'
    | 'areaChart'
    | 'scatterChart'
    | 'comboChart'
    | 'other';
  /** 图表标题 */
  title?: string;
  /** 数据系列列表 */
  series: ChartSeriesData[];
  /** 柱状图方向 */
  barDirection?: 'col' | 'bar';
  /** 分组方式 */
  grouping?: 'clustered' | 'stacked' | 'percentStacked';
}

/**
 * 图表系列数据接口
 */
export interface ChartSeriesData {
  /** 系列索引 */
  index: number;
  /** 系列名称 */
  name?: string;
  /** 分类标签 */
  categories: string[];
  /** 数值列表 */
  values: number[];
  /** 填充颜色 */
  fillColor?: string;
  /** 系列图表类型（用于混合图表） */
  chartType?: 'bar' | 'line' | 'area' | 'scatter' | 'pie';
}

/**
 * 图片渲染配置接口
 */
export interface ImageRenderOptions {
  /** 图片源 URL */
  src?: string;
  /** 嵌入资源 ID */
  embedId?: string;
  /** 旋转角度（度） */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 裁剪配置 */
  crop?: ImageCrop;
}

/**
 * 预设路径结果接口
 */
export interface PresetPathResult {
  /** 主路径 SVG 'd' 属性 */
  path: string;
  /** 是否无填充（开放路径） */
  noFill?: boolean;
  /** 辅助描边路径 */
  strokePath?: string;
}
