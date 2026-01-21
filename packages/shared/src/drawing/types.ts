/**
 * DrawingML 类型定义
 *
 * 定义 Office 文档中绘图元素的数据结构，
 * 包括形状、连接符、图片、文本、填充、描边等
 */

/**
 * Office 锚点接口
 * 定义元素在单元格网格中的位置
 */
export interface OfficeAnchor {
  /** 锚点类型：绝对定位 | 单元格锚点 | 双单元格锚点 */
  type: 'absolute' | 'oneCell' | 'twoCell';
  /** 起始位置 */
  from: {
    col: number; // 列索引
    colOff: number; // 列偏移量 (EMU)
    row: number; // 行索引
    rowOff: number; // 行偏移量 (EMU)
  };
  /** 结束位置 */
  to: {
    col: number; // 列索引
    colOff: number; // 列偏移量 (EMU)
    row: number; // 行索引
    rowOff: number; // 行偏移量 (EMU)
  };
  /** 扩展尺寸（用于 oneCell 锚点） */
  ext?: {
    cx: number; // 宽度 (EMU)
    cy: number; // 高度 (EMU)
  };
}

/**
 * Office 形状接口
 */
export interface OfficeShape {
  /** 唯一标识符 */
  id: string;
  /** 形状名称 */
  name?: string;
  /** 形状类型：'rect', 'ellipse' 等（prstGeom）或 'custom' */
  type: string;
  /** 文本内容 */
  textBody?: OfficeTextBody;
  /** 填充样式 */
  fill?: OfficeFill;
  /** 描边样式 */
  stroke?: OfficeStroke;
  /** 锚点位置 */
  anchor: OfficeAnchor;
  /** 旋转角度（度） */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 预设几何类型 (prstGeom) */
  geometry?: string;
  /** 自定义几何的 SVG Path 'd' 属性 (custGeom) */
  path?: string;
  /** 路径坐标系宽度 */
  pathWidth?: number;
  /** 路径坐标系高度 */
  pathHeight?: number;
  /** 调整值：几何引导名称 -> 数值 */
  adjustValues?: Record<string, number>;
  /** 效果列表 */
  effects?: OfficeEffect[];
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
  type: string;
  /** 起始连接点 */
  startConnection?: { id: string; idx: number };
  /** 结束连接点 */
  endConnection?: { id: string; idx: number };
  /** 描边样式 */
  stroke?: OfficeStroke;
  /** 锚点位置 */
  anchor: OfficeAnchor;
  /** 旋转角度（度） */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 起始箭头类型 */
  startArrow?: string;
  /** 结束箭头类型 */
  endArrow?: string;
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
  /** MIME 类型 */
  mimeType?: string;
  /** 图片二进制数据 */
  data?: Uint8Array;
  /** 锚点位置 */
  anchor: OfficeAnchor;
  /** 旋转角度（度） */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 图片源 URL（Blob URL 或 Data URL） */
  src: string;
}

/**
 * Office 文本体接口
 */
export interface OfficeTextBody {
  /** 纯文本内容 */
  text: string;
  /** 段落列表 */
  paragraphs: OfficeParagraph[];
  /** 垂直溢出处理方式 */
  verticalOverflow?: 'overflow' | 'ellipsis' | 'clip';
  /** 水平溢出处理方式 */
  horizontalOverflow?: 'overflow' | 'ellipsis' | 'clip';
  /** 垂直对齐方式 */
  verticalAlignment?: 'top' | 'middle' | 'bottom' | 'justified' | 'distributed';
  /** 内边距 (pt) */
  padding?: { left: number; top: number; right: number; bottom: number };
  /** 文本换行方式 */
  wrap?: 'square' | 'none';
}

/**
 * Office 段落接口
 */
export interface OfficeParagraph {
  /** 段落纯文本 */
  text: string;
  /** 对齐方式 */
  alignment?: 'left' | 'center' | 'right' | 'justify';
  /** 文本片段列表 */
  runs: OfficeRun[];
}

/**
 * Office 文本片段接口
 */
export interface OfficeRun {
  /** 文本内容 */
  text: string;
  /** 粗体 */
  bold?: boolean;
  /** 斜体 */
  italic?: boolean;
  /** 下划线类型：'sng' | 'dbl' 等 */
  underline?: string;
  /** 删除线类型：'sngStrike' | 'noStrike' */
  strike?: string;
  /** 字号 (pt) */
  size?: number;
  /** 颜色（十六进制） */
  color?: string;
  /** 文本填充（可为渐变） */
  fill?: OfficeFill;
  /** 字体名称 */
  font?: string;
  /** 效果列表 */
  effects?: OfficeEffect[];
  /** 基线偏移（百分比） */
  baseline?: number;
}

/**
 * Office 填充接口
 */
export interface OfficeFill {
  /** 填充类型 */
  type: 'solid' | 'gradient' | 'pattern' | 'none';
  /** 纯色填充的颜色值（十六进制） */
  color?: string;
  /** 渐变填充配置 */
  gradient?: OfficeGradient;
  /** 图案填充配置 */
  pattern?: OfficePattern;
  /** 不透明度 (0-1) */
  opacity?: number;
}

/**
 * Office 渐变接口
 */
export interface OfficeGradient {
  /** 渐变类型：线性 | 路径 */
  type: 'linear' | 'path';
  /** 线性渐变角度（度） */
  angle?: number;
  /** 路径渐变的路径类型 (shape, rect, circle) */
  path?: string;
  /** 渐变色标列表 */
  stops: Array<{
    position: number; // 位置 (0-1)
    color: string; // 颜色
  }>;
}

/**
 * Office 图案填充接口
 */
export interface OfficePattern {
  /** 图案类型 */
  patternType: string;
  /** 前景色 */
  fgColor: string;
  /** 背景色 */
  bgColor: string;
}

/**
 * Office 描边接口
 */
export interface OfficeStroke {
  /** 描边类型 */
  type?: 'solid' | 'gradient' | 'pattern' | 'noFill';
  /** 线宽 (pt) */
  width?: number;
  /** 纯色描边颜色（十六进制） */
  color?: string;
  /** 渐变描边 */
  gradient?: OfficeGradient;
  /** 虚线样式：'solid', 'dash', 'dot' 等 */
  dashStyle?: string;
  /** 起始箭头 */
  headEnd?: { type: string; w?: string; len?: string };
  /** 结束箭头 */
  tailEnd?: { type: string; w?: string; len?: string };
  /** 线条连接方式 */
  join?: 'round' | 'bevel' | 'miter';
  /** 线帽样式 */
  cap?: 'rnd' | 'sq' | 'flat';
  /** 复合线类型 */
  compound?: 'sng' | 'dbl' | 'thickThin' | 'thinThick' | 'tri';
}

/**
 * Office 效果接口
 */
export interface OfficeEffect {
  /** 效果类型 */
  type: 'outerShadow' | 'innerShadow' | 'glow' | 'reflection' | 'softEdge';
  /** 模糊半径 (pt) */
  blur?: number;
  /** 偏移距离 (pt) */
  dist?: number;
  /** 方向（度） */
  dir?: number;
  /** 颜色 */
  color?: string;
  /** 透明度 (0-1) */
  alpha?: number;
  /** 发光半径 (pt) */
  radius?: number;
  /** 起始不透明度 */
  startOpacity?: number;
  /** 结束不透明度 */
  endOpacity?: number;
  /** 渐隐方向 */
  fadeDir?: number;
  /** Y 缩放（百分比） */
  sy?: number;
  /** X 倾斜 */
  kx?: number;
  /** Y 倾斜 */
  ky?: number;
}

/**
 * Office 样式引用接口
 */
export interface OfficeStyle {
  /** 线条样式引用 */
  lnRef?: { idx: number; color?: string };
  /** 填充样式引用 */
  fillRef?: { idx: number; color?: string };
  /** 效果样式引用 */
  effectRef?: { idx: number; color?: string };
  /** 字体样式引用 */
  fontRef?: { idx: string; color?: string };
}
