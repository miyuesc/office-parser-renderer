/**
 * Office Math (OMath) 渲染器
 *
 * 将解析后的 OMathNode 树渲染为 HTML DOM 元素
 * 使用 CSS 布局实现数学公式的可视化
 */

import type {
  OMathNode,
  OMathFractionNode,
  OMathSuperscriptNode,
  OMathSubscriptNode,
  OMathSubSupNode,
  OMathPreSubNode,
  OMathDelimiterNode,
  OMathNaryNode,
  OMathMatrixNode,
  OMathRadicalNode,
  OMathAccentNode,
  OMathBarNode,
  OMathFuncNode,
  OMathGroupCharNode,
  OMathLimLowNode,
  OMathLimUppNode
} from './types';

import { getMathFontFamily } from './fonts';

// ============================================================================
// CSS 类名常量
// ============================================================================

const CSS_PREFIX = 'omath';

// ============================================================================
// 样式注入
// ============================================================================

let stylesInjected = false;

/**
 * 注入数学公式样式
 */
function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.id = 'omath-styles';
  style.textContent = `
    /* Office Math 公式基础样式 */
    .${CSS_PREFIX} {
      display: inline;
      font-family: ${getMathFontFamily()};
      font-style: italic;
      vertical-align: baseline;
      line-height: 1.2;
      letter-spacing: 0.02em;
      text-indent: 0;
    }
    
    .${CSS_PREFIX}-para {
      display: block;
      text-align: center;
      margin: 0.5em 0;
    }
    
    .${CSS_PREFIX}-para.left { text-align: left; }
    .${CSS_PREFIX}-para.right { text-align: right; }
    .${CSS_PREFIX}-para.centerGroup { text-align: center; }
    
    /* 文本运行 */
    .${CSS_PREFIX}-run {
      display: inline;
    }
    
    .${CSS_PREFIX}-run.roman {
      font-style: normal;
    }
    
    .${CSS_PREFIX}-run.bold {
      font-weight: bold;
    }
    
    /* 分数 - 使用 inline-flex 布局确保分数线宽度与内容匹配 */
    .${CSS_PREFIX}-frac {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      vertical-align: middle;
      text-align: center;
    }
    
    .${CSS_PREFIX}-frac-num,
    .${CSS_PREFIX}-frac-den {
      display: inline-block;
      padding: 0 0.05em;
      white-space: nowrap;
    }
    
    .${CSS_PREFIX}-frac-bar {
      width: 100%;
      height: 0;
      border-bottom: 1px solid currentColor;
      margin: 0.05em 0;
    }
    
    .${CSS_PREFIX}-frac.skw {
      flex-direction: row;
      align-items: center;
    }
    
    .${CSS_PREFIX}-frac.skw .${CSS_PREFIX}-frac-bar {
      width: 1px;
      height: 1em;
      border-bottom: none;
      border-left: 1px solid currentColor;
      transform: rotate(-15deg);
      margin: 0 0.1em;
    }
    
    .${CSS_PREFIX}-frac.lin {
      flex-direction: row;
      align-items: center;
    }
    
    .${CSS_PREFIX}-frac.lin .${CSS_PREFIX}-frac-bar {
      width: 1px;
      height: 1em;
      border-bottom: none;
      border-left: 1px solid currentColor;
      margin: 0 0.15em;
    }
    
    .${CSS_PREFIX}-frac.noBar .${CSS_PREFIX}-frac-bar {
      display: none;
    }
    
    /* 上下标 */
    .${CSS_PREFIX}-script {
      display: inline;
      vertical-align: baseline;
    }
    
    .${CSS_PREFIX}-script-base {
      display: inline;
    }
    
    .${CSS_PREFIX}-script-stack {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      font-size: 0.65em;
      vertical-align: middle;
    }
    
    .${CSS_PREFIX}-sup {
      font-size: 0.65em;
      vertical-align: super;
    }
    
    .${CSS_PREFIX}-sub {
      font-size: 0.65em;
      vertical-align: sub;
    }
    
    /* 前置上下标 */
    .${CSS_PREFIX}-pre-script {
      display: inline-flex;
      align-items: center;
    }
    
    .${CSS_PREFIX}-pre-script-stack {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.7em;
      margin-right: 0.05em;
    }
    
    /* 定界符 */
    .${CSS_PREFIX}-delim {
      display: inline;
      vertical-align: baseline;
    }
    
    .${CSS_PREFIX}-delim-left,
    .${CSS_PREFIX}-delim-right {
      display: inline;
      font-style: normal;
    }
    
    .${CSS_PREFIX}-delim-left.grow,
    .${CSS_PREFIX}-delim-right.grow {
      font-size: inherit;
    }
    
    .${CSS_PREFIX}-delim-content {
      display: inline;
    }
    
    .${CSS_PREFIX}-delim-sep {
      font-style: normal;
    }
    
    /* N 元运算符 */
    .${CSS_PREFIX}-nary {
      display: inline;
      vertical-align: baseline;
    }
    
    .${CSS_PREFIX}-nary-op {
      display: inline-block;
      text-align: center;
      font-style: normal;
      vertical-align: middle;
    }
    
    .${CSS_PREFIX}-nary-op.undOvr {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }
    
    .${CSS_PREFIX}-nary-op.undOvr .${CSS_PREFIX}-nary-sym {
      order: 1;
    }
    
    .${CSS_PREFIX}-nary-op.undOvr .${CSS_PREFIX}-nary-sup {
      order: 0;
      font-size: 0.55em;
    }
    
    .${CSS_PREFIX}-nary-op.undOvr .${CSS_PREFIX}-nary-sub {
      order: 2;
      font-size: 0.55em;
    }
    
    .${CSS_PREFIX}-nary-op.subSup {
      display: inline;
    }
    
    .${CSS_PREFIX}-nary-op.subSup .${CSS_PREFIX}-nary-limits {
      display: inline-flex;
      flex-direction: column;
      font-size: 0.55em;
      vertical-align: middle;
    }
    
    .${CSS_PREFIX}-nary-sym {
      font-size: 1.2em;
      line-height: 1;
    }
    
    .${CSS_PREFIX}-nary-elem {
      display: inline;
    }
    
    /* 矩阵 */
    .${CSS_PREFIX}-matrix {
      display: inline-grid;
      gap: 0.15em 0.3em;
      vertical-align: middle;
      margin: 0 0.1em;
    }
    
    .${CSS_PREFIX}-matrix-cell {
      text-align: center;
    }
    
    /* 根式 */
    .${CSS_PREFIX}-radical {
      display: inline-flex;
      align-items: stretch;
      vertical-align: middle;
    }
    
    .${CSS_PREFIX}-radical-deg {
      font-size: 0.6em;
      align-self: flex-start;
      margin-right: -0.3em;
      margin-top: -0.2em;
    }
    
    .${CSS_PREFIX}-radical-sym {
      font-size: 1.1em;
      font-style: normal;
      line-height: 1;
    }
    
    .${CSS_PREFIX}-radical-content {
      display: inline-flex;
      align-items: center;
      border-top: 1px solid currentColor;
      padding: 0 0.1em;
      margin-top: 0.05em;
    }
    
    /* 重音 */
    .${CSS_PREFIX}-accent {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }
    
    .${CSS_PREFIX}-accent-mark {
      font-size: 0.8em;
      line-height: 0.5;
      margin-bottom: -0.2em;
    }
    
    /* 上划线/下划线 */
    .${CSS_PREFIX}-bar {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }
    
    .${CSS_PREFIX}-bar.top .${CSS_PREFIX}-bar-line {
      order: -1;
      border-bottom: 1px solid currentColor;
      width: 100%;
      margin-bottom: 0.1em;
    }
    
    .${CSS_PREFIX}-bar.bot .${CSS_PREFIX}-bar-line {
      border-top: 1px solid currentColor;
      width: 100%;
      margin-top: 0.1em;
    }
    
    /* 函数 */
    .${CSS_PREFIX}-func {
      display: inline-flex;
      align-items: center;
    }
    
    .${CSS_PREFIX}-func-name {
      font-style: normal;
      margin-right: 0.15em;
    }
    
    /* 分组字符 */
    .${CSS_PREFIX}-group-char {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }
    
    .${CSS_PREFIX}-group-char.bot .${CSS_PREFIX}-group-sym {
      order: 1;
    }
    
    .${CSS_PREFIX}-group-sym {
      font-style: normal;
      line-height: 0.8;
    }
    
    /* 极限 */
    .${CSS_PREFIX}-lim {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }
    
    .${CSS_PREFIX}-lim-base {
      font-style: normal;
    }
    
    .${CSS_PREFIX}-lim-limit {
      font-size: 0.7em;
    }
    
    /* 方程数组 */
    .${CSS_PREFIX}-eqarr {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.3em;
    }
    
    /* 占位符（不可见） */
    .${CSS_PREFIX}-phantom {
      visibility: hidden;
    }
    
    /* 边框盒子 */
    .${CSS_PREFIX}-border-box {
      border: 1px solid currentColor;
      padding: 0.2em;
    }
  `;

  document.head.appendChild(style);
  stylesInjected = true;
}

// ============================================================================
// 主渲染器类
// ============================================================================

/**
 * Office Math 渲染器
 * 将 OMathNode 树转换为 HTML DOM 元素
 */
export class OMathRenderer {
  /**
   * 渲染公式节点为 HTML 元素
   *
   * @param node - OMathNode 节点
   * @returns HTMLElement
   */
  static render(node: OMathNode): HTMLElement {
    // 确保样式已注入
    injectStyles();

    return this.renderNode(node, true);
  }

  /**
   * 渲染单个节点
   * @param node - 要渲染的节点
   * @param isTopLevel - 是否为顶层节点（用于确定是否创建容器）
   */
  private static renderNode(node: OMathNode, isTopLevel: boolean = false): HTMLElement {
    switch (node.type) {
      case 'oMathPara':
        return this.renderOMathPara(node);
      case 'oMath':
        return this.renderOMath(node, isTopLevel);
      case 'run':
        return this.renderRun(node);
      case 'text':
        return this.renderText(node);
      case 'fraction':
        return this.renderFraction(node as OMathFractionNode);
      case 'superscript':
        return this.renderSuperscript(node as OMathSuperscriptNode);
      case 'subscript':
        return this.renderSubscript(node as OMathSubscriptNode);
      case 'subSup':
        return this.renderSubSup(node as OMathSubSupNode);
      case 'preSub':
        return this.renderPreSub(node as OMathPreSubNode);
      case 'delimiter':
        return this.renderDelimiter(node as OMathDelimiterNode);
      case 'nary':
        return this.renderNary(node as OMathNaryNode);
      case 'matrix':
        return this.renderMatrix(node as OMathMatrixNode);
      case 'radical':
        return this.renderRadical(node as OMathRadicalNode);
      case 'accent':
        return this.renderAccent(node as OMathAccentNode);
      case 'bar':
        return this.renderBar(node as OMathBarNode);
      case 'func':
        return this.renderFunc(node as OMathFuncNode);
      case 'groupChar':
        return this.renderGroupChar(node as OMathGroupCharNode);
      case 'limLow':
        return this.renderLimLow(node as OMathLimLowNode);
      case 'limUpp':
        return this.renderLimUpp(node as OMathLimUppNode);
      case 'phantom':
        return this.renderPhantom(node);
      case 'borderBox':
        return this.renderBorderBox(node);
      case 'box':
        return this.renderBox(node);
      case 'eqArr':
        return this.renderEqArr(node);
      default:
        // 未知类型，渲染子节点
        return this.renderChildren(node);
    }
  }

  /**
   * 渲染子节点列表并附加到容器
   * @param children - 子节点数组
   * @param container - 目标容器元素
   */
  private static appendChildren(children: OMathNode[] | undefined, container: HTMLElement): void {
    if (!children) return;
    for (const child of children) {
      container.appendChild(this.renderNode(child, false));
    }
  }

  /**
   * 渲染子节点并返回容器（用于未知类型）
   */
  private static renderChildren(node: OMathNode): HTMLElement {
    const span = document.createElement('span');
    span.className = CSS_PREFIX;
    this.appendChildren(node.children, span);
    return span;
  }

  // ============================================================================
  // 容器渲染
  // ============================================================================

  /**
   * 渲染 oMathPara - 公式段落
   */
  private static renderOMathPara(node: OMathNode): HTMLElement {
    const div = document.createElement('div');
    div.className = `${CSS_PREFIX}-para`;

    // 处理对齐
    if (node.props?.jc) {
      div.classList.add(node.props.jc);
    }

    // oMathPara 的直接 oMath 子元素应视为顶层公式
    if (node.children) {
      for (const child of node.children) {
        // oMath 子元素视为顶层，创建 span.omath 容器
        const isChildTopLevel = child.type === 'oMath';
        div.appendChild(this.renderNode(child, isChildTopLevel));
      }
    }

    return div;
  }

  /**
   * 渲染 oMath - 公式容器
   * @param isTopLevel - 顶层 oMath 创建 span.omath，嵌套 oMath 直接返回子元素
   */
  private static renderOMath(node: OMathNode, isTopLevel: boolean): HTMLElement {
    if (isTopLevel) {
      // 顶层公式：创建 span.omath 容器
      const span = document.createElement('span');
      span.className = CSS_PREFIX;
      this.appendChildren(node.children, span);
      return span;
    } else {
      // 嵌套公式：直接返回子元素，不创建额外容器
      // 使用一个无样式的 span 作为占位符（如果只有一个子元素）
      if (node.children && node.children.length === 1) {
        return this.renderNode(node.children[0], false);
      }
      // 多个子元素时，用透明 span 包裹但不使用 omath 类
      const wrapper = document.createElement('span');
      this.appendChildren(node.children, wrapper);
      return wrapper;
    }
  }

  // ============================================================================
  // 基础元素渲染
  // ============================================================================

  /**
   * 渲染 run - 数学运行
   */
  private static renderRun(node: OMathNode): HTMLElement {
    const span = document.createElement('span');
    span.className = `${CSS_PREFIX}-run`;

    // 应用运行属性样式
    if (node.props?.runProps) {
      const rp = node.props.runProps;
      if (rp.style === 'p' || rp.script === 'roman') {
        span.classList.add('roman');
      }
      if (rp.bold || rp.style === 'b' || rp.style === 'bi') {
        span.classList.add('bold');
      }
      if (rp.color) {
        span.style.color = rp.color;
      }
      if (rp.fontSize) {
        span.style.fontSize = `${rp.fontSize}pt`;
      }
    }

    if (node.text) {
      span.textContent = node.text;
    }

    return span;
  }

  /**
   * 渲染 text - 纯文本
   */
  private static renderText(node: OMathNode): HTMLElement {
    const span = document.createElement('span');
    span.textContent = node.text || '';
    return span;
  }

  // ============================================================================
  // 分数渲染
  // ============================================================================

  /**
   * 渲染分数
   */
  private static renderFraction(node: OMathFractionNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-frac`;

    // 处理分数类型
    const fracType = node.props?.fractionType || 'bar';
    if (fracType !== 'bar') {
      container.classList.add(fracType);
    }

    // 分子
    const num = document.createElement('span');
    num.className = `${CSS_PREFIX}-frac-num`;
    num.appendChild(this.renderNode(node.numerator));

    // 分数线
    const bar = document.createElement('span');
    bar.className = `${CSS_PREFIX}-frac-bar`;

    // 分母
    const den = document.createElement('span');
    den.className = `${CSS_PREFIX}-frac-den`;
    den.appendChild(this.renderNode(node.denominator));

    container.appendChild(num);
    container.appendChild(bar);
    container.appendChild(den);

    return container;
  }

  // ============================================================================
  // 上下标渲染
  // ============================================================================

  /**
   * 渲染上标
   */
  private static renderSuperscript(node: OMathSuperscriptNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-script`;

    // 基础元素
    const base = document.createElement('span');
    base.className = `${CSS_PREFIX}-script-base`;
    base.appendChild(this.renderNode(node.base));

    // 上标
    const sup = document.createElement('span');
    sup.className = `${CSS_PREFIX}-sup`;
    sup.appendChild(this.renderNode(node.superscript));

    container.appendChild(base);
    container.appendChild(sup);

    return container;
  }

  /**
   * 渲染下标
   */
  private static renderSubscript(node: OMathSubscriptNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-script`;

    // 基础元素
    const base = document.createElement('span');
    base.className = `${CSS_PREFIX}-script-base`;
    base.appendChild(this.renderNode(node.base));

    // 下标
    const sub = document.createElement('span');
    sub.className = `${CSS_PREFIX}-sub`;
    sub.appendChild(this.renderNode(node.subscript));

    container.appendChild(base);
    container.appendChild(sub);

    return container;
  }

  /**
   * 渲染上下标
   */
  private static renderSubSup(node: OMathSubSupNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-script`;

    // 基础元素
    const base = document.createElement('span');
    base.className = `${CSS_PREFIX}-script-base`;
    base.appendChild(this.renderNode(node.base));

    // 上下标堆叠
    const stack = document.createElement('span');
    stack.className = `${CSS_PREFIX}-script-stack`;

    const sup = document.createElement('span');
    sup.className = `${CSS_PREFIX}-sup`;
    sup.appendChild(this.renderNode(node.superscript));

    const sub = document.createElement('span');
    sub.className = `${CSS_PREFIX}-sub`;
    sub.appendChild(this.renderNode(node.subscript));

    stack.appendChild(sup);
    stack.appendChild(sub);

    container.appendChild(base);
    container.appendChild(stack);

    return container;
  }

  /**
   * 渲染前置上下标
   */
  private static renderPreSub(node: OMathPreSubNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-pre-script`;

    // 前置上下标堆叠
    const stack = document.createElement('span');
    stack.className = `${CSS_PREFIX}-pre-script-stack`;

    const sup = document.createElement('span');
    sup.className = `${CSS_PREFIX}-sup`;
    sup.appendChild(this.renderNode(node.superscript));

    const sub = document.createElement('span');
    sub.className = `${CSS_PREFIX}-sub`;
    sub.appendChild(this.renderNode(node.subscript));

    stack.appendChild(sup);
    stack.appendChild(sub);

    // 基础元素
    const base = document.createElement('span');
    base.className = `${CSS_PREFIX}-script-base`;
    base.appendChild(this.renderNode(node.base));

    container.appendChild(stack);
    container.appendChild(base);

    return container;
  }

  // ============================================================================
  // 定界符渲染
  // ============================================================================

  /**
   * 渲染定界符
   */
  private static renderDelimiter(node: OMathDelimiterNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-delim`;

    const beginChar = node.props?.beginChar || '(';
    const endChar = node.props?.endChar || ')';
    const sepChar = node.props?.sepChar;
    const grow = node.props?.grow !== false;

    // 左定界符
    const left = document.createElement('span');
    left.className = `${CSS_PREFIX}-delim-left`;
    if (grow) left.classList.add('grow');
    left.textContent = beginChar;

    // 内容
    const content = document.createElement('span');
    content.className = `${CSS_PREFIX}-delim-content`;

    for (let i = 0; i < node.elements.length; i++) {
      if (i > 0 && sepChar) {
        const sep = document.createElement('span');
        sep.className = `${CSS_PREFIX}-delim-sep`;
        sep.textContent = sepChar;
        content.appendChild(sep);
      }
      content.appendChild(this.renderNode(node.elements[i]));
    }

    // 右定界符
    const right = document.createElement('span');
    right.className = `${CSS_PREFIX}-delim-right`;
    if (grow) right.classList.add('grow');
    right.textContent = endChar;

    container.appendChild(left);
    container.appendChild(content);
    container.appendChild(right);

    return container;
  }

  // ============================================================================
  // N 元运算符渲染
  // ============================================================================

  /**
   * 渲染 N 元运算符
   */
  private static renderNary(node: OMathNaryNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-nary`;

    const limLoc = node.props?.limLoc || 'subSup';
    const naryChar = node.props?.naryChar || '∫';

    // 运算符部分
    const op = document.createElement('span');
    op.className = `${CSS_PREFIX}-nary-op ${limLoc}`;

    if (limLoc === 'undOvr') {
      // 上下限在符号上下方
      // 上标
      if (node.superscript) {
        const sup = document.createElement('span');
        sup.className = `${CSS_PREFIX}-nary-sup`;
        sup.appendChild(this.renderNode(node.superscript));
        op.appendChild(sup);
      }

      // 符号
      const sym = document.createElement('span');
      sym.className = `${CSS_PREFIX}-nary-sym`;
      sym.textContent = naryChar;
      op.appendChild(sym);

      // 下标
      if (node.subscript) {
        const sub = document.createElement('span');
        sub.className = `${CSS_PREFIX}-nary-sub`;
        sub.appendChild(this.renderNode(node.subscript));
        op.appendChild(sub);
      }
    } else {
      // 上下限在符号右侧
      // 符号
      const sym = document.createElement('span');
      sym.className = `${CSS_PREFIX}-nary-sym`;
      sym.textContent = naryChar;
      op.appendChild(sym);

      if (node.superscript || node.subscript) {
        const limits = document.createElement('span');
        limits.className = `${CSS_PREFIX}-nary-limits`;

        if (node.superscript) {
          const sup = document.createElement('span');
          sup.appendChild(this.renderNode(node.superscript));
          limits.appendChild(sup);
        }

        if (node.subscript) {
          const sub = document.createElement('span');
          sub.appendChild(this.renderNode(node.subscript));
          limits.appendChild(sub);
        }

        op.appendChild(limits);
      }
    }

    // 主体
    const elem = document.createElement('span');
    elem.className = `${CSS_PREFIX}-nary-elem`;
    elem.appendChild(this.renderNode(node.element));

    container.appendChild(op);
    container.appendChild(elem);

    return container;
  }

  // ============================================================================
  // 矩阵渲染
  // ============================================================================

  /**
   * 渲染矩阵
   */
  private static renderMatrix(node: OMathMatrixNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-matrix`;

    // 设置列数
    const colCount = node.props?.columnCount || (node.rows[0]?.cells.length ?? 1);
    container.style.gridTemplateColumns = `repeat(${colCount}, auto)`;

    // 渲染单元格
    for (const row of node.rows) {
      for (const cell of row.cells) {
        const cellEl = document.createElement('span');
        cellEl.className = `${CSS_PREFIX}-matrix-cell`;
        cellEl.appendChild(this.renderNode(cell));
        container.appendChild(cellEl);
      }
    }

    return container;
  }

  // ============================================================================
  // 根式渲染
  // ============================================================================

  /**
   * 渲染根式
   */
  private static renderRadical(node: OMathRadicalNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-radical`;

    // 根指数
    if (node.degree) {
      const deg = document.createElement('span');
      deg.className = `${CSS_PREFIX}-radical-deg`;
      deg.appendChild(this.renderNode(node.degree));
      container.appendChild(deg);
    }

    // 根号符号
    const sym = document.createElement('span');
    sym.className = `${CSS_PREFIX}-radical-sym`;
    sym.textContent = '√';

    // 被开方数
    const content = document.createElement('span');
    content.className = `${CSS_PREFIX}-radical-content`;
    content.appendChild(this.renderNode(node.radicand));

    container.appendChild(sym);
    container.appendChild(content);

    return container;
  }

  // ============================================================================
  // 其他结构渲染
  // ============================================================================

  /**
   * 渲染重音
   */
  private static renderAccent(node: OMathAccentNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-accent`;

    // 重音符号
    const mark = document.createElement('span');
    mark.className = `${CSS_PREFIX}-accent-mark`;
    mark.textContent = node.props?.accentChar || '\u0302';

    // 基础内容
    const base = document.createElement('span');
    base.appendChild(this.renderNode(node.base));

    container.appendChild(mark);
    container.appendChild(base);

    return container;
  }

  /**
   * 渲染上划线/下划线
   */
  private static renderBar(node: OMathBarNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-bar`;

    const position = node.props?.position || 'top';
    container.classList.add(position);

    // 横线
    const line = document.createElement('span');
    line.className = `${CSS_PREFIX}-bar-line`;

    // 基础内容
    const base = document.createElement('span');
    base.appendChild(this.renderNode(node.base));

    container.appendChild(base);
    container.appendChild(line);

    return container;
  }

  /**
   * 渲染函数
   */
  private static renderFunc(node: OMathFuncNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-func`;

    // 函数名
    const name = document.createElement('span');
    name.className = `${CSS_PREFIX}-func-name`;
    name.appendChild(this.renderNode(node.functionName));

    // 参数
    const arg = document.createElement('span');
    arg.appendChild(this.renderNode(node.argument));

    container.appendChild(name);
    container.appendChild(arg);

    return container;
  }

  /**
   * 渲染分组字符
   */
  private static renderGroupChar(node: OMathGroupCharNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-group-char`;

    const position = node.props?.position || 'bot';
    container.classList.add(position);

    // 分组符号
    const sym = document.createElement('span');
    sym.className = `${CSS_PREFIX}-group-sym`;
    sym.textContent = node.props?.groupChar || '⏟';

    // 基础内容
    const base = document.createElement('span');
    base.appendChild(this.renderNode(node.base));

    container.appendChild(base);
    container.appendChild(sym);

    return container;
  }

  /**
   * 渲染下限
   */
  private static renderLimLow(node: OMathLimLowNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-lim`;

    // 基础内容
    const base = document.createElement('span');
    base.className = `${CSS_PREFIX}-lim-base`;
    base.appendChild(this.renderNode(node.base));

    // 下限
    const limit = document.createElement('span');
    limit.className = `${CSS_PREFIX}-lim-limit`;
    limit.appendChild(this.renderNode(node.limit));

    container.appendChild(base);
    container.appendChild(limit);

    return container;
  }

  /**
   * 渲染上限
   */
  private static renderLimUpp(node: OMathLimUppNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-lim`;

    // 上限
    const limit = document.createElement('span');
    limit.className = `${CSS_PREFIX}-lim-limit`;
    limit.appendChild(this.renderNode(node.limit));

    // 基础内容
    const base = document.createElement('span');
    base.className = `${CSS_PREFIX}-lim-base`;
    base.appendChild(this.renderNode(node.base));

    container.appendChild(limit);
    container.appendChild(base);

    return container;
  }

  /**
   * 渲染占位符
   */
  private static renderPhantom(node: OMathNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-phantom`;

    if (node.children) {
      for (const child of node.children) {
        container.appendChild(this.renderNode(child));
      }
    }

    return container;
  }

  /**
   * 渲染边框盒子
   */
  private static renderBorderBox(node: OMathNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-border-box`;

    if (node.children) {
      for (const child of node.children) {
        container.appendChild(this.renderNode(child));
      }
    }

    return container;
  }

  /**
   * 渲染盒子
   */
  private static renderBox(node: OMathNode): HTMLElement {
    const container = document.createElement('span');
    container.className = CSS_PREFIX;

    if (node.children) {
      for (const child of node.children) {
        container.appendChild(this.renderNode(child));
      }
    }

    return container;
  }

  /**
   * 渲染方程数组
   */
  private static renderEqArr(node: OMathNode): HTMLElement {
    const container = document.createElement('span');
    container.className = `${CSS_PREFIX}-eqarr`;

    if (node.children) {
      for (const child of node.children) {
        const row = document.createElement('span');
        row.appendChild(this.renderNode(child));
        container.appendChild(row);
      }
    }

    return container;
  }
}
