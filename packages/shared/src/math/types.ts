/**
 * Office Math (OMath) 公式类型定义
 *
 * 定义 OOXML 数学公式解析与渲染所需的数据结构
 * 基于 ECMA-376 Part 4 Office Math (OMath) 规范
 */

// ============================================================================
// 节点类型枚举
// ============================================================================

/**
 * 数学公式节点类型
 * 对应 OOXML 中的 m: 命名空间元素
 */
export type OMathNodeType =
  // 容器类型
  | 'oMath' // m:oMath - 公式容器
  | 'oMathPara' // m:oMathPara - 公式段落
  // 基础元素
  | 'run' // m:r - 数学运行（包含文本）
  | 'text' // m:t - 数学文本
  // 分数相关
  | 'fraction' // m:f - 分数
  // 上下标相关
  | 'superscript' // m:sSup - 上标
  | 'subscript' // m:sSub - 下标
  | 'subSup' // m:sSubSup - 同时有上下标
  | 'preSub' // m:sPre - 前置上下标
  // 定界符
  | 'delimiter' // m:d - 定界符（括号）
  // N 元运算符
  | 'nary' // m:nary - N 元运算符（∑, ∫, ∏ 等）
  // 矩阵
  | 'matrix' // m:m - 矩阵
  | 'matrixRow' // m:mr - 矩阵行
  // 根式
  | 'radical' // m:rad - 根式
  // 其他结构
  | 'accent' // m:acc - 重音符号
  | 'bar' // m:bar - 上划线/下划线
  | 'box' // m:box - 盒子
  | 'borderBox' // m:borderBox - 边框盒子
  | 'func' // m:func - 函数
  | 'groupChar' // m:groupChr - 分组字符
  | 'limLow' // m:limLow - 下限
  | 'limUpp' // m:limUpp - 上限
  | 'phantom' // m:phant - 占位符
  | 'eqArr'; // m:eqArr - 方程数组

// ============================================================================
// 公式节点接口
// ============================================================================

/**
 * 公式节点基础接口
 */
export interface OMathNode {
  /** 节点类型 */
  type: OMathNodeType;
  /** 子节点列表 */
  children?: OMathNode[];
  /** 文本内容（仅 text 类型） */
  text?: string;
  /** 节点属性 */
  props?: OMathNodeProps;
}

/**
 * 公式节点属性
 */
export interface OMathNodeProps {
  /** 分数类型: bar(标准) | skw(斜线) | lin(行内) | noBar(无分数线) */
  fractionType?: 'bar' | 'skw' | 'lin' | 'noBar';
  /** 定界符起始字符 */
  beginChar?: string;
  /** 定界符结束字符 */
  endChar?: string;
  /** 分隔符字符 */
  sepChar?: string;
  /** N 元运算符字符 (∑, ∫, ∏ 等) */
  naryChar?: string;
  /** 上下限位置: undOvr(上下) | subSup(右侧) */
  limLoc?: 'undOvr' | 'subSup';
  /** 是否隐藏上标 */
  supHide?: boolean;
  /** 是否隐藏下标 */
  subHide?: boolean;
  /** 是否隐藏根号指数 */
  degHide?: boolean;
  /** 重音符号字符 */
  accentChar?: string;
  /** 位置: top | bot */
  position?: 'top' | 'bot';
  /** 垂直对齐 */
  vertJc?: 'top' | 'center' | 'bot';
  /** 分组字符 */
  groupChar?: string;
  /** 对齐方式 */
  jc?: 'left' | 'center' | 'right' | 'centerGroup';
  /** 矩阵列数 */
  columnCount?: number;
  /** 矩阵行数 */
  rowCount?: number;
  /** 是否增长（括号随内容变大） */
  grow?: boolean;
  /** 运行属性 */
  runProps?: OMathRunProps;
}

/**
 * 数学运行属性
 */
export interface OMathRunProps {
  /** 是否斜体 */
  italic?: boolean;
  /** 是否加粗 */
  bold?: boolean;
  /** 字体 */
  font?: string;
  /** 字号 (pt) */
  fontSize?: number;
  /** 颜色 */
  color?: string;
  /** 脚本样式: roman | script | fraktur | double-struck | sans-serif | monospace */
  script?: 'roman' | 'script' | 'fraktur' | 'double-struck' | 'sans-serif' | 'monospace';
  /** 样式: p(普通) | b(粗体) | i(斜体) | bi(粗斜体) */
  style?: 'p' | 'b' | 'i' | 'bi';
}

// ============================================================================
// 分数节点
// ============================================================================

/**
 * 分数节点
 * 对应 m:f 元素
 */
export interface OMathFractionNode extends OMathNode {
  type: 'fraction';
  /** 分子 */
  numerator: OMathNode;
  /** 分母 */
  denominator: OMathNode;
}

// ============================================================================
// 上下标节点
// ============================================================================

/**
 * 上标节点
 * 对应 m:sSup 元素
 */
export interface OMathSuperscriptNode extends OMathNode {
  type: 'superscript';
  /** 基础元素 */
  base: OMathNode;
  /** 上标 */
  superscript: OMathNode;
}

/**
 * 下标节点
 * 对应 m:sSub 元素
 */
export interface OMathSubscriptNode extends OMathNode {
  type: 'subscript';
  /** 基础元素 */
  base: OMathNode;
  /** 下标 */
  subscript: OMathNode;
}

/**
 * 上下标节点
 * 对应 m:sSubSup 元素
 */
export interface OMathSubSupNode extends OMathNode {
  type: 'subSup';
  /** 基础元素 */
  base: OMathNode;
  /** 下标 */
  subscript: OMathNode;
  /** 上标 */
  superscript: OMathNode;
}

/**
 * 前置上下标节点
 * 对应 m:sPre 元素
 */
export interface OMathPreSubNode extends OMathNode {
  type: 'preSub';
  /** 基础元素 */
  base: OMathNode;
  /** 下标 */
  subscript: OMathNode;
  /** 上标 */
  superscript: OMathNode;
}

// ============================================================================
// 定界符节点
// ============================================================================

/**
 * 定界符节点
 * 对应 m:d 元素
 */
export interface OMathDelimiterNode extends OMathNode {
  type: 'delimiter';
  /** 内容元素列表 */
  elements: OMathNode[];
}

// ============================================================================
// N 元运算符节点
// ============================================================================

/**
 * N 元运算符节点
 * 对应 m:nary 元素（∑, ∫, ∏ 等）
 */
export interface OMathNaryNode extends OMathNode {
  type: 'nary';
  /** 下标（下限） */
  subscript?: OMathNode;
  /** 上标（上限） */
  superscript?: OMathNode;
  /** 主体元素 */
  element: OMathNode;
}

// ============================================================================
// 矩阵节点
// ============================================================================

/**
 * 矩阵节点
 * 对应 m:m 元素
 */
export interface OMathMatrixNode extends OMathNode {
  type: 'matrix';
  /** 矩阵行列表 */
  rows: OMathMatrixRowNode[];
}

/**
 * 矩阵行节点
 * 对应 m:mr 元素
 */
export interface OMathMatrixRowNode extends OMathNode {
  type: 'matrixRow';
  /** 行中的单元格 */
  cells: OMathNode[];
}

// ============================================================================
// 根式节点
// ============================================================================

/**
 * 根式节点
 * 对应 m:rad 元素
 */
export interface OMathRadicalNode extends OMathNode {
  type: 'radical';
  /** 被开方数 */
  radicand: OMathNode;
  /** 根指数（如立方根的 3） */
  degree?: OMathNode;
}

// ============================================================================
// 其他结构节点
// ============================================================================

/**
 * 重音符号节点
 * 对应 m:acc 元素
 */
export interface OMathAccentNode extends OMathNode {
  type: 'accent';
  /** 基础元素 */
  base: OMathNode;
}

/**
 * 上划线/下划线节点
 * 对应 m:bar 元素
 */
export interface OMathBarNode extends OMathNode {
  type: 'bar';
  /** 基础元素 */
  base: OMathNode;
}

/**
 * 函数节点
 * 对应 m:func 元素
 */
export interface OMathFuncNode extends OMathNode {
  type: 'func';
  /** 函数名称 */
  functionName: OMathNode;
  /** 函数参数 */
  argument: OMathNode;
}

/**
 * 分组字符节点
 * 对应 m:groupChr 元素
 */
export interface OMathGroupCharNode extends OMathNode {
  type: 'groupChar';
  /** 基础元素 */
  base: OMathNode;
}

/**
 * 下限节点
 * 对应 m:limLow 元素
 */
export interface OMathLimLowNode extends OMathNode {
  type: 'limLow';
  /** 基础元素 */
  base: OMathNode;
  /** 下限 */
  limit: OMathNode;
}

/**
 * 上限节点
 * 对应 m:limUpp 元素
 */
export interface OMathLimUppNode extends OMathNode {
  type: 'limUpp';
  /** 基础元素 */
  base: OMathNode;
  /** 上限 */
  limit: OMathNode;
}

// ============================================================================
// 类型守卫
// ============================================================================

/**
 * 检查是否为分数节点
 */
export function isFractionNode(node: OMathNode): node is OMathFractionNode {
  return node.type === 'fraction';
}

/**
 * 检查是否为上标节点
 */
export function isSuperscriptNode(node: OMathNode): node is OMathSuperscriptNode {
  return node.type === 'superscript';
}

/**
 * 检查是否为下标节点
 */
export function isSubscriptNode(node: OMathNode): node is OMathSubscriptNode {
  return node.type === 'subscript';
}

/**
 * 检查是否为定界符节点
 */
export function isDelimiterNode(node: OMathNode): node is OMathDelimiterNode {
  return node.type === 'delimiter';
}

/**
 * 检查是否为 N 元运算符节点
 */
export function isNaryNode(node: OMathNode): node is OMathNaryNode {
  return node.type === 'nary';
}

/**
 * 检查是否为矩阵节点
 */
export function isMatrixNode(node: OMathNode): node is OMathMatrixNode {
  return node.type === 'matrix';
}

/**
 * 检查是否为根式节点
 */
export function isRadicalNode(node: OMathNode): node is OMathRadicalNode {
  return node.type === 'radical';
}
