/**
 * DOCX 分节与页面配置相关类型定义
 */

/**
 * 分节接口
 * 对应 w:sectPr 元素，定义页面布局配置
 */
export interface DocxSection {
  /** 纸张大小 */
  pageSize: PageSize;
  /** 页边距 */
  pageMargins: PageMargins;
  /** 页眉配置 */
  header?: DocxHeaderFooter;
  /** 页脚配置 */
  footer?: DocxHeaderFooter;
  /** 首页页眉（如果首页不同） */
  firstHeader?: DocxHeaderFooter;
  /** 首页页脚（如果首页不同） */
  firstFooter?: DocxHeaderFooter;
  /** 偶数页页眉（如果奇偶页不同） */
  evenHeader?: DocxHeaderFooter;
  /** 偶数页页脚（如果奇偶页不同） */
  evenFooter?: DocxHeaderFooter;
  /** 分节类型 */
  type?: 'continuous' | 'nextPage' | 'evenPage' | 'oddPage' | 'nextColumn';
  /** 分栏配置 */
  columns?: ColumnConfig;
  /** 首页页眉页脚不同 */
  titlePg?: boolean;
  /** 行号配置 */
  lineNumbers?: LineNumberConfig;
  /** 页码起始值 */
  pageNumberStart?: number;
  /** 页面背景色 */
  backgroundColor?: string;
  /** 水印配置 */
  watermark?: WatermarkConfig;
}

/**
 * 纸张大小接口
 */
export interface PageSize {
  /** 宽度 (twips, 1 inch = 1440 twips) */
  width: number;
  /** 高度 (twips) */
  height: number;
  /** 纸张方向 */
  orientation?: 'portrait' | 'landscape';
  /** 预设纸张代码 */
  code?: number;
}

/**
 * 页边距接口
 * 所有值单位为 twips
 */
export interface PageMargins {
  /** 上边距 */
  top: number;
  /** 右边距 */
  right: number;
  /** 下边距 */
  bottom: number;
  /** 左边距 */
  left: number;
  /** 页眉距顶部距离 */
  header: number;
  /** 页脚距底部距离 */
  footer: number;
  /** 装订线 */
  gutter: number;
}

/**
 * 分栏配置接口
 */
export interface ColumnConfig {
  /** 栏数 */
  num: number;
  /** 栏间距 (twips) */
  space: number;
  /** 是否等宽 */
  equalWidth: boolean;
  /** 各栏配置（非等宽时使用） */
  cols?: Array<{ width: number; space: number }>;
  /** 栏间是否有分隔线 */
  sep?: boolean;
}

/**
 * 行号配置接口
 */
export interface LineNumberConfig {
  /** 起始行号 */
  start: number;
  /** 行号间隔 */
  countBy: number;
  /** 距正文距离 (twips) */
  distance: number;
  /** 重启规则 */
  restart: 'continuous' | 'newPage' | 'newSection';
}

/**
 * 水印配置接口
 */
export interface WatermarkConfig {
  /** 水印类型 */
  type: 'text' | 'image';
  /** 文本内容（文本水印） */
  text?: string;
  /** 字体 */
  font?: string;
  /** 字号 (pt) */
  fontSize?: number;
  /** 颜色 */
  color?: string;
  /** 旋转角度（度） */
  rotation?: number;
  /** 透明度 0-1 */
  opacity?: number;
  /** 图片源（图片水印） */
  imageSrc?: string;
}

/**
 * 分节符元素
 */
export interface SectionBreak {
  type: 'sectionBreak';
  /** 分节属性 */
  sectPr: DocxSection;
}

/**
 * 页眉页脚接口
 */
export interface DocxHeaderFooter {
  /** 关系 ID */
  id: string;
  /** 类型 */
  type: 'default' | 'first' | 'even';
  /** 内容元素 */
  content: DocxElement[];
}

// 前向声明以避免循环依赖
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocxElement {}
