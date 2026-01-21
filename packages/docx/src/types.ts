/**
 * DOCX 类型定义
 *
 * 定义 DOCX 文件解析和渲染所需的数据结构
 * 基于 OOXML (ECMA-376) 标准
 */

import { OfficeStroke, OfficeFill } from '@ai-space/shared';

// ============================================================================
// 文档级别类型
// ============================================================================

/**
 * DOCX 文档接口
 * 表示完整解析后的 DOCX 文档结构
 */
export interface DocxDocument {
  /** 文档主体内容 */
  body: DocxElement[];
  /** 分节列表（每个分节包含页面配置） */
  sections: DocxSection[];
  /** 样式定义 */
  styles: DocxStyles;
  /** 列表编号定义 */
  numbering: NumberingDefinition;
  /** 关系映射 (rId -> target) */
  relationships: Record<string, string>;
  /** 图片资源 (路径 -> Blob URL) */
  images: Record<string, string>;
  /** 字体表 */
  fonts?: DocxFontTable;
  /** 文档设置 */
  settings?: DocxSettings;
  /** 主题信息 */
  theme?: DocxTheme;
  /** 文档背景色 */
  background?: string;
}

/**
 * DOCX 元素联合类型
 * 文档主体可包含的元素类型
 */
export type DocxElement = Paragraph | Table | Drawing | SectionBreak;

// ============================================================================
// 分节与页面配置
// ============================================================================

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

// ============================================================================
// 页眉页脚
// ============================================================================

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

// ============================================================================
// 段落
// ============================================================================

/**
 * 段落接口
 * 对应 w:p 元素
 */
export interface Paragraph {
  type: 'paragraph';
  /** 段落属性 */
  props: ParagraphProperties;
  /** 子元素（文本运行、绘图等） */
  children: ParagraphChild[];
}

/**
 * 段落子元素联合类型
 */
export type ParagraphChild =
  | Run
  | Drawing
  | Tab
  | LineBreak
  | FieldCode
  | BookmarkStart
  | BookmarkEnd
  | Hyperlink
  | OMathElement
  | InsertedText
  | DeletedText;

/**
 * 新增文本 (修订)
 * 对应 w:ins 元素
 */
export interface InsertedText {
  type: 'insertedText';
  id: string;
  author: string;
  date: string;
  children: ParagraphChild[];
}

/**
 * 删除文本 (修订)
 * 对应 w:del 元素
 */
export interface DeletedText {
  type: 'deletedText';
  id: string;
  author: string;
  date: string;
  children: ParagraphChild[];
}

/**
 * 数学公式元素接口
 * 对应 m:oMath 或 m:oMathPara 元素
 */
export interface OMathElement {
  type: 'omath';
  /** 解析后的公式节点（来自 @ai-space/shared） */
  node: unknown;
}

/**
 * 段落属性接口
 * 对应 w:pPr 元素
 */
export interface ParagraphProperties {
  /** 样式引用 ID */
  styleId?: string;
  /** 对齐方式 */
  alignment?: 'left' | 'center' | 'right' | 'both' | 'distribute';
  /** 缩进配置 */
  indentation?: ParagraphIndentation;
  /** 间距配置 */
  spacing?: ParagraphSpacing;
  /** 列表编号引用 */
  numbering?: NumberingReference;
  /** 制表位列表 */
  tabs?: TabStop[];
  /** 段落边框 */
  borders?: ParagraphBorders;
  /** 底纹配置 */
  shading?: Shading;
  /** 段落与下一段保持连续（不分页） */
  keepNext?: boolean;
  /** 段落内各行保持连续（不分页） */
  keepLines?: boolean;
  /** 段落前分页 */
  pageBreakBefore?: boolean;
  /** 寡妇/孤儿控制 */
  widowControl?: boolean;
  /** 大纲级别 (0-9) */
  outlineLevel?: number;
  /** 是否抑制自动连字符 */
  suppressAutoHyphens?: boolean;
  /** 从右到左 */
  bidi?: boolean;
  /** 默认运行属性 */
  rPr?: RunProperties;
  /** 框架属性 */
  framePr?: FrameProperties;
}

/**
 * 段落缩进接口
 * 所有值单位为 twips
 */
export interface ParagraphIndentation {
  /** 左缩进 */
  left?: number;
  /** 右缩进 */
  right?: number;
  /** 首行缩进（正值）或悬挂缩进（负值） */
  firstLine?: number;
  /** 悬挂缩进 */
  hanging?: number;
  /** 左缩进（字符单位） */
  leftChars?: number;
  /** 右缩进（字符单位） */
  rightChars?: number;
  /** 首行缩进（字符单位） */
  firstLineChars?: number;
  /** 悬挂缩进（字符单位） */
  hangingChars?: number;
}

/**
 * 段落间距接口
 */
export interface ParagraphSpacing {
  /** 段前间距 (twips) */
  before?: number;
  /** 段后间距 (twips) */
  after?: number;
  /** 行距值 */
  line?: number;
  /** 行距规则 */
  lineRule?: 'auto' | 'exact' | 'atLeast';
  /** 段前间距（行单位） */
  beforeLines?: number;
  /** 段后间距（行单位） */
  afterLines?: number;
  /** 自动调整段前段后间距（用于相同样式段落） */
  beforeAutospacing?: boolean;
  afterAutospacing?: boolean;
}

/**
 * 列表编号引用接口
 */
export interface NumberingReference {
  /** 编号定义 ID */
  id: number;
  /** 级别索引 (0-based) */
  level: number;
}

/**
 * 制表位接口
 */
export interface TabStop {
  /** 位置 (twips) */
  pos: number;
  /** 类型 */
  val: 'left' | 'center' | 'right' | 'decimal' | 'bar' | 'clear';
  /** 前导符 */
  leader?: 'none' | 'dot' | 'hyphen' | 'underscore' | 'heavy' | 'middleDot';
}

/**
 * 段落边框接口
 */
export interface ParagraphBorders {
  top?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  right?: BorderStyle;
  between?: BorderStyle;
  bar?: BorderStyle;
}

/**
 * 边框样式接口
 */
export interface BorderStyle {
  /** 边框类型 */
  val: string;
  /** 颜色 (十六进制) */
  color?: string;
  /** 宽度 (1/8 点) */
  sz?: number;
  /** 与文本距离 (点) */
  space?: number;
  /** 是否阴影 */
  shadow?: boolean;
  /** 主题颜色 */
  themeColor?: string;
}

/**
 * 底纹接口
 */
export interface Shading {
  /** 填充类型 */
  val: string;
  /** 填充颜色 */
  fill?: string;
  /** 图案颜色 */
  color?: string;
  /** 主题填充颜色 */
  themeFill?: string;
  /** 主题颜色 */
  themeColor?: string;
}

/**
 * 框架属性接口
 */
export interface FrameProperties {
  /** 宽度 (twips) */
  width?: number;
  /** 高度 (twips) */
  height?: number;
  /** 水平锚点 */
  hAnchor?: 'text' | 'margin' | 'page';
  /** 垂直锚点 */
  vAnchor?: 'text' | 'margin' | 'page';
  /** X 位置 */
  x?: number;
  /** Y 位置 */
  y?: number;
  /** 文字环绕 */
  wrap?: 'around' | 'auto' | 'none' | 'notBeside' | 'through' | 'tight';
}

// ============================================================================
// 文本运行 (Run)
// ============================================================================

/**
 * 文本运行接口
 * 对应 w:r 元素
 */
export interface Run {
  type: 'run';
  /** 运行属性 */
  props: RunProperties;
  /** 文本内容 */
  text: string;
}

/**
 * 文本运行属性接口
 * 对应 w:rPr 元素
 */
export interface RunProperties {
  /** 样式引用 ID */
  styleId?: string;
  /** 粗体 */
  bold?: boolean;
  /** 斜体 */
  italic?: boolean;
  /** 下划线 */
  underline?: UnderlineStyle;
  /** 单删除线 */
  strike?: boolean;
  /** 双删除线 */
  dstrike?: boolean;
  /** 垂直对齐（上标/下标） */
  vertAlign?: 'baseline' | 'superscript' | 'subscript';
  /** 字号 (半点, 1pt = 2 half-points) */
  size?: number;
  /** 字体配置 */
  fonts?: FontConfig;
  /** 文字颜色 (十六进制) */
  color?: string;
  /** 高亮颜色 */
  highlight?: string;
  /** 底纹 */
  shading?: Shading;
  /** 字符间距 (twips) */
  spacing?: number;
  /** 字距调整 (半点) */
  kern?: number;
  /** 位置偏移 (半点) */
  position?: number;
  /** 隐藏文本 */
  vanish?: boolean;
  /** 小型大写 */
  smallCaps?: boolean;
  /** 全大写 */
  caps?: boolean;
  /** 浮雕效果 */
  emboss?: boolean;
  /** 印记效果 */
  imprint?: boolean;
  /** 轮廓 */
  outline?: boolean;
  /** 阴影 */
  shadow?: boolean;
  /** 语言 */
  lang?: LanguageConfig;
  /** 东亚字体/西文字体切换提示 */
  eastAsianLayout?: EastAsianLayout;
  /** 文字效果 */
  effect?: string;
  /** 文本轮廓 (w14:textOutline) */
  textOutline?: OfficeStroke;
  /** 文本填充 (w14:textFill) */
  textFill?: OfficeFill;
  /** 缩放比例 (百分比) */
  w?: number;
}

/**
 * 下划线样式接口
 */
export interface UnderlineStyle {
  /** 下划线类型 */
  val:
    | 'single'
    | 'words'
    | 'double'
    | 'thick'
    | 'dotted'
    | 'dottedHeavy'
    | 'dash'
    | 'dashedHeavy'
    | 'dashLong'
    | 'dashLongHeavy'
    | 'dotDash'
    | 'dashDotHeavy'
    | 'dotDotDash'
    | 'dashDotDotHeavy'
    | 'wave'
    | 'wavyHeavy'
    | 'wavyDouble'
    | 'none';
  /** 下划线颜色 */
  color?: string;
  /** 主题颜色 */
  themeColor?: string;
}

/**
 * 字体配置接口
 */
export interface FontConfig {
  /** ASCII 字符字体 */
  ascii?: string;
  /** 东亚字符字体 */
  eastAsia?: string;
  /** 高 ANSI 字符字体 */
  hAnsi?: string;
  /** 复杂文种字体 */
  cs?: string;
  /** 主题字体提示 */
  hint?: 'default' | 'eastAsia' | 'cs';
  /** ASCII 主题字体 */
  asciiTheme?: string;
  /** 东亚主题字体 */
  eastAsiaTheme?: string;
  /** 高 ANSI 主题字体 */
  hAnsiTheme?: string;
  /** 复杂文种主题字体 */
  csTheme?: string;
}

/**
 * 语言配置接口
 */
export interface LanguageConfig {
  /** 拉丁语言 */
  val?: string;
  /** 东亚语言 */
  eastAsia?: string;
  /** 双向语言 */
  bidi?: string;
}

/**
 * 东亚布局接口
 */
export interface EastAsianLayout {
  /** 是否组合 */
  combine?: boolean;
  /** 组合括号类型 */
  combineBrackets?: 'none' | 'round' | 'square' | 'angle' | 'curly';
  /** 垂直排列 */
  vert?: boolean;
  /** 垂直压缩比例 */
  vertCompress?: boolean;
}

// ============================================================================
// 特殊内联元素
// ============================================================================

/**
 * 制表符元素
 */
export interface Tab {
  type: 'tab';
}

/**
 * 换行符元素
 */
export interface LineBreak {
  type: 'break';
  /** 换行类型 */
  breakType?: 'textWrapping' | 'page' | 'column';
  /** 清除位置（用于文字环绕） */
  clear?: 'none' | 'left' | 'right' | 'all';
}

/**
 * 域代码元素
 */
export interface FieldCode {
  type: 'field';
  /** 域类型 */
  fieldType: string;
  /** 域指令 */
  instruction: string;
  /** 域结果文本 */
  result?: string;
}

/**
 * 书签开始
 */
export interface BookmarkStart {
  type: 'bookmarkStart';
  id: string;
  name: string;
}

/**
 * 书签结束
 */
export interface BookmarkEnd {
  type: 'bookmarkEnd';
  id: string;
}

/**
 * 超链接元素
 */
export interface Hyperlink {
  type: 'hyperlink';
  /** 关系 ID（用于外部链接） */
  rId?: string;
  /** 书签锚点（用于内部链接） */
  anchor?: string;
  /** 子元素 */
  children: Run[];
  /** 目标 URL（解析后填充） */
  url?: string;
}

// ============================================================================
// 绘图元素
// ============================================================================

/**
 * 绘图元素接口
 * 对应 w:drawing 元素
 */
export interface Drawing {
  type: 'drawing';
  /** 绘图类型 */
  drawingType: 'inline' | 'anchor';
  /** 图片信息 */
  image?: DrawingImage;
  /** 形状信息 */
  shape?: DrawingShape;
  /** 图表信息 */
  chart?: DrawingChart;
  /** 描述文本 */
  description?: string;
  /** 标题 */
  title?: string;
  /** 锚定位置（仅用于 anchor 类型） */
  position?: AnchorPosition;
}

/**
 * 锚定位置接口
 */
export interface AnchorPosition {
  allowOverlap?: boolean;
  behindDoc?: boolean;
  relativeHeight?: number;
  horizontal?: PositionConfig;
  vertical?: PositionConfig;
  wrap?: WrapConfig;
}

/**
 * 位置配置接口
 */
export interface PositionConfig {
  relativeTo: 'margin' | 'page' | 'column' | 'character' | 'paragraph' | 'line';
  align?: 'left' | 'center' | 'right' | 'inside' | 'outside' | 'top' | 'bottom';
  posOffset?: number;
}

/**
 * 环绕配置接口
 */
export interface WrapConfig {
  type: 'none' | 'square' | 'tight' | 'through' | 'topAndBottom';
  distT?: number;
  distB?: number;
  distL?: number;
  distR?: number;
}

/**
 * 绘图图片接口
 */
export interface DrawingImage {
  /** 嵌入资源 ID */
  embedId: string;
  /** 图片源 URL（解析后填充） */
  src?: string;
  /** 宽度 (EMU) */
  cx: number;
  /** 高度 (EMU) */
  cy: number;
  /** 旋转角度（度） */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 裁剪信息 */
  crop?: ImageCrop;
  /** 效果列表 */
  effects?: DrawingEffect[];
}

/**
 * 图片裁剪接口
 */
export interface ImageCrop {
  /** 左侧裁剪百分比 */
  left: number;
  /** 上侧裁剪百分比 */
  top: number;
  /** 右侧裁剪百分比 */
  right: number;
  /** 下侧裁剪百分比 */
  bottom: number;
}

/**
 * 绘图形状接口
 */
export interface DrawingShape {
  /** 形状 ID */
  id: string;
  /** 形状名称 */
  name?: string;
  /** 预设几何类型 */
  geometry?: string;
  /** 自定义路径 */
  path?: string;
  /** 路径宽度 */
  pathWidth?: number;
  /** 路径高度 */
  pathHeight?: number;
  /** 宽度 (EMU) */
  cx: number;
  /** 高度 (EMU) */
  cy: number;
  /** 填充样式 */
  fill?: ShapeFill;
  /** 描边样式 */
  stroke?: ShapeStroke;
  /** 文本内容 */
  textBody?: ShapeTextBody;
  /** 旋转角度 */
  rotation?: number;
  /** 水平翻转 */
  flipH?: boolean;
  /** 垂直翻转 */
  flipV?: boolean;
  /** 调整值 */
  adjustValues?: Record<string, number>;
  /** 效果列表 */
  effects?: DrawingEffect[];
}

/**
 * 绘图图表接口
 */
export interface DrawingChart {
  /** 图表关系 ID */
  rId: string;
  /** 宽度 (EMU) */
  cx: number;
  /** 高度 (EMU) */
  cy: number;
  /** 图表类型 */
  type?: 'barChart' | 'pieChart' | 'pie3DChart' | 'lineChart' | 'areaChart' | 'scatterChart' | 'comboChart' | 'other';
  /** 图表标题 */
  title?: string;
  /** 数据系列 */
  series?: Array<{
    index: number;
    name?: string;
    categories: string[];
    values: number[];
    fillColor?: string;
    /** 系列图表类型（用于混合图表） */
    chartType?: 'bar' | 'line' | 'area' | 'scatter';
  }>;
  /** 柱状图方向 */
  barDirection?: 'col' | 'bar';
  /** 分组方式 */
  grouping?: 'clustered' | 'stacked' | 'percentStacked';
}

/**
 * 形状填充接口
 */
export interface ShapeFill {
  type: 'solid' | 'gradient' | 'pattern' | 'picture' | 'none';
  color?: string;
  gradient?: GradientFill;
  pattern?: PatternFill;
  picture?: PictureFill;
  opacity?: number;
}

/**
 * 渐变填充接口
 */
export interface GradientFill {
  type: 'linear' | 'path';
  angle?: number;
  path?: string;
  stops: Array<{ position: number; color: string }>;
}

/**
 * 图案填充接口
 */
export interface PatternFill {
  patternType: string;
  fgColor: string;
  bgColor: string;
}

/**
 * 图片填充接口
 */
export interface PictureFill {
  embedId: string;
  src?: string;
  stretch?: boolean;
  tile?: boolean;
}

/**
 * 形状描边接口
 */
export interface ShapeStroke {
  width?: number;
  color?: string;
  dashStyle?: string;
  join?: 'round' | 'bevel' | 'miter';
  cap?: 'round' | 'square' | 'flat';
  gradient?: GradientFill;
}

/**
 * 形状文本体接口
 */
export interface ShapeTextBody {
  text: string;
  paragraphs: ShapeTextParagraph[];
  /** 复杂文档内容（支持完整 Word 元素） */
  content?: DocxElement[];
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  padding?: { left: number; top: number; right: number; bottom: number };
  wrap?: 'square' | 'none';
}

/**
 * 形状文本段落接口
 */
export interface ShapeTextParagraph {
  text: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  runs: ShapeTextRun[];
}

/**
 * 形状文本运行接口
 */
export interface ShapeTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: string;
  size?: number;
  color?: string;
  font?: string;
}

/**
 * 绘图效果接口
 */
export interface DrawingEffect {
  type: 'outerShadow' | 'innerShadow' | 'glow' | 'reflection' | 'softEdge';
  blur?: number;
  dist?: number;
  dir?: number;
  color?: string;
  alpha?: number;
}

// ============================================================================
// 表格
// ============================================================================

/**
 * 表格接口
 * 对应 w:tbl 元素
 */
export interface Table {
  type: 'table';
  /** 表格属性 */
  props: TableProperties;
  /** 列宽网格 (twips) */
  grid: number[];
  /** 行列表 */
  rows: TableRow[];
}

/**
 * 表格属性接口
 */
export interface TableProperties {
  /** 表格样式 ID */
  styleId?: string;
  /** 表格宽度 */
  width?: TableWidth;
  /** 表格对齐 */
  alignment?: 'left' | 'center' | 'right';
  /** 表格缩进 (twips) */
  indent?: number;
  /** 表格边框 */
  borders?: TableBorders;
  /** 默认单元格边距 */
  cellMargins?: TableCellMargins;
  /** 单元格间距 (twips) */
  cellSpacing?: number;
  /** 表格底纹 */
  shading?: Shading;
  /** 表格布局算法 */
  layout?: 'fixed' | 'autofit';
  /** 表格外观配置（用于条件格式） */
  look?: TableLook;
}

/**
 * 表格宽度接口
 */
export interface TableWidth {
  /** 宽度值 */
  value: number;
  /** 宽度类型 */
  type: 'dxa' | 'pct' | 'auto' | 'nil';
}

/**
 * 表格边框接口
 */
export interface TableBorders {
  top?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  right?: BorderStyle;
  insideH?: BorderStyle;
  insideV?: BorderStyle;
  /** 左上到右下对角线 */
  tl2br?: BorderStyle;
  /** 右上到左下对角线 */
  tr2bl?: BorderStyle;
}

/**
 * 表格单元格边距接口 (twips)
 */
export interface TableCellMargins {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * 表格外观配置接口
 */
export interface TableLook {
  firstRow?: boolean;
  lastRow?: boolean;
  firstColumn?: boolean;
  lastColumn?: boolean;
  noHBand?: boolean;
  noVBand?: boolean;
}

/**
 * 表格行接口
 */
export interface TableRow {
  type: 'row';
  /** 行属性 */
  props: TableRowProperties;
  /** 单元格列表 */
  cells: TableCell[];
}

/**
 * 表格行属性接口
 */
export interface TableRowProperties {
  /** 行高 (twips) */
  height?: number;
  /** 行高规则 */
  heightRule?: 'auto' | 'exact' | 'atLeast';
  /** 是否表头行（跨页重复） */
  isHeader?: boolean;
  /** 是否允许跨页拆分 */
  cantSplit?: boolean;
}

/**
 * 表格单元格接口
 */
export interface TableCell {
  type: 'cell';
  /** 单元格属性 */
  props: TableCellProperties;
  /** 单元格内容 */
  children: DocxElement[];
}

/**
 * 表格单元格属性接口
 */
export interface TableCellProperties {
  /** 单元格宽度 (twips) */
  width?: number;
  /** 宽度类型 */
  widthType?: 'dxa' | 'pct' | 'auto' | 'nil';
  /** 水平合并 */
  gridSpan?: number;
  /** 垂直合并 */
  vMerge?: 'restart' | 'continue';
  /** 单元格边框 */
  borders?: TableBorders;
  /** 单元格边距 */
  margins?: TableCellMargins;
  /** 单元格底纹 */
  shading?: Shading;
  /** 垂直对齐 */
  vAlign?: 'top' | 'center' | 'bottom';
  /** 文字方向 */
  textDirection?: 'lrTb' | 'tbRl' | 'btLr' | 'lrTbV' | 'tbRlV' | 'tbLrV';
  /** 自动换行禁止 */
  noWrap?: boolean;
  /** 适应文本 */
  tcFitText?: boolean;
}

// ============================================================================
// 样式系统
// ============================================================================

/**
 * 样式定义集合接口
 */
export interface DocxStyles {
  /** 文档默认值 */
  docDefaults?: DocumentDefaults;
  /** 样式映射 (styleId -> Style) */
  styles: Record<string, DocxStyle>;
  /** 潜在样式 */
  latentStyles?: LatentStyles;
}

/**
 * 文档默认值接口
 */
export interface DocumentDefaults {
  /** 默认运行属性 */
  rPrDefault?: RunProperties;
  /** 默认段落属性 */
  pPrDefault?: ParagraphProperties;
}

/**
 * 样式接口
 */
export interface DocxStyle {
  /** 样式 ID */
  styleId: string;
  /** 样式名称 */
  name?: string;
  /** 样式类型 */
  type: 'paragraph' | 'character' | 'table' | 'numbering';
  /** 基于的样式 ID */
  basedOn?: string;
  /** 下一段落的样式 ID */
  next?: string;
  /** 链接的样式 ID */
  link?: string;
  /** 是否默认样式 */
  isDefault?: boolean;
  /** UI 优先级 */
  uiPriority?: number;
  /** 是否半隐藏 */
  semiHidden?: boolean;
  /** 是否隐藏 */
  unhideWhenUsed?: boolean;
  /** 是否在样式库显示 */
  qFormat?: boolean;
  /** 段落属性 */
  pPr?: ParagraphProperties;
  /** 运行属性 */
  rPr?: RunProperties;
  /** 表格属性 */
  tblPr?: TableProperties;
  /** 表格行属性 */
  trPr?: TableRowProperties;
  /** 表格单元格属性 */
  tcPr?: TableCellProperties;
}

/**
 * 潜在样式配置
 */
export interface LatentStyles {
  defLockedState?: boolean;
  defUIPriority?: number;
  defSemiHidden?: boolean;
  defUnhideWhenUsed?: boolean;
  defQFormat?: boolean;
  count?: number;
}

// ============================================================================
// 列表编号系统
// ============================================================================

/**
 * 编号定义集合接口
 */
export interface NumberingDefinition {
  /** 抽象编号映射 */
  abstractNums: Record<string, AbstractNumbering>;
  /** 编号实例映射 */
  nums: Record<string, NumberingInstance>;
}

/**
 * 抽象编号接口
 */
export interface AbstractNumbering {
  /** 抽象编号 ID */
  id: string;
  /** 多级列表名称 */
  name?: string;
  /** 级别定义 */
  levels: Record<string, NumberingLevel>;
}

/**
 * 编号级别接口
 */
export interface NumberingLevel {
  /** 起始值 */
  start: number;
  /** 编号格式 */
  format: string;
  /** 编号文本模板 */
  text: string;
  /** 对齐方式 */
  alignment: 'left' | 'center' | 'right';
  /** 缩进 (twips) */
  indent: number;
  /** 悬挂缩进 (twips) */
  hanging?: number;
  /** 编号后跟内容 */
  suffix?: 'tab' | 'space' | 'nothing';
  /** 段落属性 */
  pPr?: ParagraphProperties;
  /** 运行属性 */
  rPr?: RunProperties;
  /** 是否为法律格式 */
  isLgl?: boolean;
}

/**
 * 编号实例接口
 */
export interface NumberingInstance {
  /** 实例 ID */
  id: string;
  /** 引用的抽象编号 ID */
  abstractNumId: string;
  /** 级别覆盖 */
  levelOverrides?: Record<string, NumberingLevelOverride>;
}

/**
 * 编号级别覆盖接口
 */
export interface NumberingLevelOverride {
  /** 起始值覆盖 */
  startOverride?: number;
  /** 级别定义覆盖 */
  level?: NumberingLevel;
}

// ============================================================================
// 其他辅助类型
// ============================================================================

/**
 * 字体表接口
 */
export interface DocxFontTable {
  fonts: Record<string, FontDefinition>;
}

/**
 * 字体定义接口
 */
export interface FontDefinition {
  name: string;
  family?: 'decorative' | 'modern' | 'roman' | 'script' | 'swiss' | 'auto';
  charset?: number;
  pitch?: 'default' | 'fixed' | 'variable';
  altName?: string;
  panose1?: string;
  embedRegular?: FontEmbed;
  embedBold?: FontEmbed;
  embedItalic?: FontEmbed;
  embedBoldItalic?: FontEmbed;
}

/**
 * 字体嵌入接口
 */
export interface FontEmbed {
  fontKey?: string;
  subsetted?: boolean;
  rId: string;
}

/**
 * 文档设置接口
 */
export interface DocxSettings {
  /** 默认制表位宽度 (twips) */
  defaultTabStop?: number;
  /** 是否自动连字符 */
  autoHyphenation?: boolean;
  /** 连续连字符限制 */
  consecutiveHyphenLimit?: number;
  /** 连字符区宽度 (twips) */
  hyphenationZone?: number;
  /** 是否显示边界 */
  displayBorders?: boolean;
  /** 奇偶页页眉页脚不同 */
  evenAndOddHeaders?: boolean;
  /** 字符间距控制 */
  characterSpacingControl?: 'doNotCompress' | 'compressPunctuation' | 'compressPunctuationAndJapaneseKana';
  /** 兼容性设置 */
  compat?: CompatibilitySettings;
}

/**
 * 兼容性设置接口
 */
export interface CompatibilitySettings {
  /** 兼容模式版本 */
  compatSetting?: Array<{
    name: string;
    uri: string;
    val: string;
  }>;
}

/**
 * 主题接口
 */
export interface DocxTheme {
  /** 主题名称 */
  name?: string;
  /** 颜色方案 */
  colorScheme: Record<string, string>;
  /** 主要字体 */
  majorFont?: ThemeFontScheme;
  /** 次要字体 */
  minorFont?: ThemeFontScheme;
}

/**
 * 主题字体方案接口
 */
export interface ThemeFontScheme {
  latin?: string;
  ea?: string;
  cs?: string;
  font?: Array<{ script: string; typeface: string }>;
}

// ============================================================================
// 渲染选项
// ============================================================================

/**
 * 渲染选项接口
 */
export interface DocxRenderOptions {
  /** 纸张大小：预设值或自定义尺寸 (pt) */
  pageSize?: 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal' | { width: number; height: number };
  /** 是否使用文档内置的页面设置 */
  useDocumentSettings?: boolean;
  /** 自定义页边距 (pt) */
  margins?: { top?: number; right?: number; bottom?: number; left?: number };
  /** 缩放比例 (0.5 - 2.0) */
  scale?: number;
  /** 是否显示页眉页脚 */
  showHeaderFooter?: boolean;
  /** 是否显示页码 */
  showPageNumber?: boolean;
  /** 是否启用分页 */
  enablePagination?: boolean;
  /** 调试模式（显示边界框等） */
  debug?: boolean;
  /** 页面背景色覆盖 */
  backgroundColor?: string;
  /** 水印配置覆盖 */
  watermark?: WatermarkConfig;
  /** 是否使用文档解析的背景色（默认 true，设为 false 则只使用 API 设置的值） */
  useDocumentBackground?: boolean;
  /** 是否使用文档解析的水印（默认 true，设为 false 则只使用 API 设置的值） */
  useDocumentWatermark?: boolean;
  /** 每页渲染回调 */
  onPageRender?: (pageIndex: number, pageElement: HTMLElement) => void;
}

/**
 * 渲染结果接口
 */
export interface DocxRenderResult {
  /** 总页数 */
  totalPages: number;
  /** 实际使用的页面配置 */
  pageConfig: ResolvedPageConfig;
  /** 页面元素列表 */
  pages: HTMLElement[];
}

/**
 * 解析后的页面配置
 */
export interface ResolvedPageConfig {
  /** 纸张宽度 (pt) */
  width: number;
  /** 纸张高度 (pt) */
  height: number;
  /** 页边距 (pt) */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    header: number;
    footer: number;
  };
  /** 内容区域宽度 (pt) */
  contentWidth: number;
  /** 内容区域高度 (pt) */
  contentHeight: number;
}

/**
 * 页面信息接口
 * 用于存储每页的渲染信息
 */
export interface PageInfo {
  /** 页面索引 (0-based) */
  index: number;
  /** 页码 (1-based) */
  pageNumber: number;
  /** 分节索引 */
  sectionIndex: number;
  /** 元素起始索引 */
  startElementIndex: number;
  /** 元素结束索引 */
  endElementIndex: number;
  /** 页面配置 */
  pageConfig: ResolvedPageConfig;
  /** 所属分节 */
  section: DocxSection;
}
