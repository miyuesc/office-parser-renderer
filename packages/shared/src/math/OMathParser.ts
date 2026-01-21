/**
 * Office Math (OMath) 解析器
 *
 * 解析 OOXML 中的数学公式元素 (m:oMath, m:oMathPara 等)
 * 转换为内部 OMathNode 结构
 */

import { XmlUtils } from '../xml';
import type {
  OMathNode,
  OMathNodeProps,
  OMathRunProps,
  OMathFractionNode,
  OMathSuperscriptNode,
  OMathSubscriptNode,
  OMathSubSupNode,
  OMathPreSubNode,
  OMathDelimiterNode,
  OMathNaryNode,
  OMathMatrixNode,
  OMathMatrixRowNode,
  OMathRadicalNode,
  OMathAccentNode,
  OMathBarNode,
  OMathFuncNode,
  OMathGroupCharNode,
  OMathLimLowNode,
  OMathLimUppNode
} from './types';

// ============================================================================
// 命名空间常量
// ============================================================================

/** Office Math 命名空间 */
const MATH_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math';

// ============================================================================
// 主解析器类
// ============================================================================

/**
 * Office Math 解析器
 * 将 XML 元素转换为 OMathNode 树结构
 */
export class OMathParser {
  /**
   * 解析 m:oMath 或 m:oMathPara 元素
   *
   * @param node - XML 元素
   * @returns OMathNode 或 null
   */
  static parse(node: Element): OMathNode | null {
    if (!node) return null;

    const localName = node.localName || node.nodeName.replace(/^m:/, '');

    switch (localName) {
      case 'oMathPara':
        return this.parseOMathPara(node);
      case 'oMath':
        return this.parseOMath(node);
      default:
        // 可能是直接传入的内部元素
        return this.parseElement(node);
    }
  }

  /**
   * 解析 m:oMathPara - 公式段落
   */
  private static parseOMathPara(node: Element): OMathNode {
    const children: OMathNode[] = [];
    const props: OMathNodeProps = {};

    // 解析段落属性
    const paraPr = XmlUtils.getChild(node, 'm\\:oMathParaPr');
    if (paraPr) {
      const jc = XmlUtils.getChild(paraPr, 'm\\:jc');
      if (jc) {
        const val = XmlUtils.getAttribute(jc, 'm\\:val') || XmlUtils.getAttribute(jc, 'val');
        if (val) {
          props.jc = val as OMathNodeProps['jc'];
        }
      }
    }

    // 解析所有 oMath 子元素
    const oMathElements = XmlUtils.getChildren(node, 'm\\:oMath');
    for (const oMath of oMathElements) {
      const child = this.parseOMath(oMath);
      if (child) {
        children.push(child);
      }
    }

    return {
      type: 'oMathPara',
      children,
      props: Object.keys(props).length > 0 ? props : undefined
    };
  }

  /**
   * 解析 m:oMath - 公式容器
   */
  private static parseOMath(node: Element): OMathNode {
    const children = this.parseChildren(node);
    return {
      type: 'oMath',
      children
    };
  }

  /**
   * 解析子元素列表
   */
  private static parseChildren(parent: Element): OMathNode[] {
    const children: OMathNode[] = [];

    for (let i = 0; i < parent.childNodes.length; i++) {
      const child = parent.childNodes[i];
      if (child.nodeType !== 1) continue; // 只处理元素节点

      const element = child as Element;
      const parsed = this.parseElement(element);
      if (parsed) {
        children.push(parsed);
      }
    }

    return children;
  }

  /**
   * 解析单个元素
   */
  private static parseElement(node: Element): OMathNode | null {
    const localName = node.localName || node.nodeName.replace(/^m:/, '');

    switch (localName) {
      // 基础元素
      case 'r':
        return this.parseRun(node);

      // 分数
      case 'f':
        return this.parseFraction(node);

      // 上下标
      case 'sSup':
        return this.parseSuperscript(node);
      case 'sSub':
        return this.parseSubscript(node);
      case 'sSubSup':
        return this.parseSubSup(node);
      case 'sPre':
        return this.parsePreSub(node);

      // 定界符
      case 'd':
        return this.parseDelimiter(node);

      // N 元运算符
      case 'nary':
        return this.parseNary(node);

      // 矩阵
      case 'm':
        return this.parseMatrix(node);

      // 根式
      case 'rad':
        return this.parseRadical(node);

      // 重音
      case 'acc':
        return this.parseAccent(node);

      // 上划线/下划线
      case 'bar':
        return this.parseBar(node);

      // 盒子
      case 'box':
        return this.parseBox(node);

      // 边框盒子
      case 'borderBox':
        return this.parseBorderBox(node);

      // 函数
      case 'func':
        return this.parseFunc(node);

      // 分组字符
      case 'groupChr':
        return this.parseGroupChar(node);

      // 下限
      case 'limLow':
        return this.parseLimLow(node);

      // 上限
      case 'limUpp':
        return this.parseLimUpp(node);

      // 占位符
      case 'phant':
        return this.parsePhantom(node);

      // 方程数组
      case 'eqArr':
        return this.parseEqArr(node);

      default:
        // 未知元素，尝试递归解析子元素
        return null;
    }
  }

  // ============================================================================
  // 基础元素解析
  // ============================================================================

  /**
   * 解析 m:r - 数学运行
   */
  private static parseRun(node: Element): OMathNode {
    const props: OMathNodeProps = {};

    // 解析运行属性 m:rPr
    const rPr = XmlUtils.getChild(node, 'm\\:rPr');
    if (rPr) {
      props.runProps = this.parseRunProps(rPr);
    }

    // 获取文本内容
    const textElement = XmlUtils.getChild(node, 'm\\:t');
    const text = textElement ? textElement.textContent || '' : '';

    return {
      type: 'run',
      text,
      props: Object.keys(props).length > 0 ? props : undefined
    };
  }

  /**
   * 解析运行属性 m:rPr
   */
  private static parseRunProps(node: Element): OMathRunProps {
    const props: OMathRunProps = {};

    // 脚本样式 m:scr
    const scr = XmlUtils.getChild(node, 'm\\:scr');
    if (scr) {
      const val = XmlUtils.getAttribute(scr, 'm\\:val') || XmlUtils.getAttribute(scr, 'val');
      if (val) {
        props.script = val as OMathRunProps['script'];
      }
    }

    // 样式 m:sty
    const sty = XmlUtils.getChild(node, 'm\\:sty');
    if (sty) {
      const val = XmlUtils.getAttribute(sty, 'm\\:val') || XmlUtils.getAttribute(sty, 'val');
      if (val) {
        props.style = val as OMathRunProps['style'];
        // 根据样式设置粗体斜体
        if (val === 'b' || val === 'bi') props.bold = true;
        if (val === 'i' || val === 'bi') props.italic = true;
        if (val === 'p') {
          props.bold = false;
          props.italic = false;
        }
      }
    }

    return props;
  }

  // ============================================================================
  // 分数解析
  // ============================================================================

  /**
   * 解析 m:f - 分数
   */
  private static parseFraction(node: Element): OMathFractionNode {
    const props: OMathNodeProps = {};

    // 解析分数属性 m:fPr
    const fPr = XmlUtils.getChild(node, 'm\\:fPr');
    if (fPr) {
      const typeEl = XmlUtils.getChild(fPr, 'm\\:type');
      if (typeEl) {
        const val = XmlUtils.getAttribute(typeEl, 'm\\:val') || XmlUtils.getAttribute(typeEl, 'val');
        if (val) {
          props.fractionType = val as OMathNodeProps['fractionType'];
        }
      }
    }

    // 解析分子 m:num
    const numEl = XmlUtils.getChild(node, 'm\\:num');
    const numerator: OMathNode = numEl
      ? { type: 'oMath', children: this.parseChildren(numEl) }
      : { type: 'text', text: '' };

    // 解析分母 m:den
    const denEl = XmlUtils.getChild(node, 'm\\:den');
    const denominator: OMathNode = denEl
      ? { type: 'oMath', children: this.parseChildren(denEl) }
      : { type: 'text', text: '' };

    return {
      type: 'fraction',
      numerator,
      denominator,
      props: Object.keys(props).length > 0 ? props : undefined
    };
  }

  // ============================================================================
  // 上下标解析
  // ============================================================================

  /**
   * 解析 m:sSup - 上标
   */
  private static parseSuperscript(node: Element): OMathSuperscriptNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    // 上标 m:sup
    const supEl = XmlUtils.getChild(node, 'm\\:sup');
    const superscript: OMathNode = supEl
      ? { type: 'oMath', children: this.parseChildren(supEl) }
      : { type: 'text', text: '' };

    return {
      type: 'superscript',
      base,
      superscript
    };
  }

  /**
   * 解析 m:sSub - 下标
   */
  private static parseSubscript(node: Element): OMathSubscriptNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    // 下标 m:sub
    const subEl = XmlUtils.getChild(node, 'm\\:sub');
    const subscript: OMathNode = subEl
      ? { type: 'oMath', children: this.parseChildren(subEl) }
      : { type: 'text', text: '' };

    return {
      type: 'subscript',
      base,
      subscript
    };
  }

  /**
   * 解析 m:sSubSup - 上下标
   */
  private static parseSubSup(node: Element): OMathSubSupNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    // 下标 m:sub
    const subEl = XmlUtils.getChild(node, 'm\\:sub');
    const subscript: OMathNode = subEl
      ? { type: 'oMath', children: this.parseChildren(subEl) }
      : { type: 'text', text: '' };

    // 上标 m:sup
    const supEl = XmlUtils.getChild(node, 'm\\:sup');
    const superscript: OMathNode = supEl
      ? { type: 'oMath', children: this.parseChildren(supEl) }
      : { type: 'text', text: '' };

    return {
      type: 'subSup',
      base,
      subscript,
      superscript
    };
  }

  /**
   * 解析 m:sPre - 前置上下标
   */
  private static parsePreSub(node: Element): OMathPreSubNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    // 下标 m:sub
    const subEl = XmlUtils.getChild(node, 'm\\:sub');
    const subscript: OMathNode = subEl
      ? { type: 'oMath', children: this.parseChildren(subEl) }
      : { type: 'text', text: '' };

    // 上标 m:sup
    const supEl = XmlUtils.getChild(node, 'm\\:sup');
    const superscript: OMathNode = supEl
      ? { type: 'oMath', children: this.parseChildren(supEl) }
      : { type: 'text', text: '' };

    return {
      type: 'preSub',
      base,
      subscript,
      superscript
    };
  }

  // ============================================================================
  // 定界符解析
  // ============================================================================

  /**
   * 解析 m:d - 定界符
   */
  private static parseDelimiter(node: Element): OMathDelimiterNode {
    const props: OMathNodeProps = {};

    // 解析定界符属性 m:dPr
    const dPr = XmlUtils.getChild(node, 'm\\:dPr');
    if (dPr) {
      // 起始字符 m:begChr
      const begChr = XmlUtils.getChild(dPr, 'm\\:begChr');
      if (begChr) {
        const val = XmlUtils.getAttribute(begChr, 'm\\:val') || XmlUtils.getAttribute(begChr, 'val');
        props.beginChar = val || '(';
      }

      // 结束字符 m:endChr
      const endChr = XmlUtils.getChild(dPr, 'm\\:endChr');
      if (endChr) {
        const val = XmlUtils.getAttribute(endChr, 'm\\:val') || XmlUtils.getAttribute(endChr, 'val');
        props.endChar = val || ')';
      }

      // 分隔符 m:sepChr
      const sepChr = XmlUtils.getChild(dPr, 'm\\:sepChr');
      if (sepChr) {
        const val = XmlUtils.getAttribute(sepChr, 'm\\:val') || XmlUtils.getAttribute(sepChr, 'val');
        props.sepChar = val || '|';
      }

      // 是否增长 m:grow
      const grow = XmlUtils.getChild(dPr, 'm\\:grow');
      if (grow) {
        const val = XmlUtils.getAttribute(grow, 'm\\:val') || XmlUtils.getAttribute(grow, 'val');
        props.grow = val !== 'off' && val !== '0';
      }
    }

    // 默认括号
    if (!props.beginChar) props.beginChar = '(';
    if (!props.endChar) props.endChar = ')';

    // 解析内容元素 m:e
    const elements: OMathNode[] = [];
    const eElements = XmlUtils.getChildren(node, 'm\\:e');
    for (const eEl of eElements) {
      elements.push({
        type: 'oMath',
        children: this.parseChildren(eEl)
      });
    }

    return {
      type: 'delimiter',
      elements,
      props
    };
  }

  // ============================================================================
  // N 元运算符解析
  // ============================================================================

  /**
   * 解析 m:nary - N 元运算符
   */
  private static parseNary(node: Element): OMathNaryNode {
    const props: OMathNodeProps = {};

    // 解析 N 元属性 m:naryPr
    const naryPr = XmlUtils.getChild(node, 'm\\:naryPr');
    if (naryPr) {
      // 运算符字符 m:chr
      const chr = XmlUtils.getChild(naryPr, 'm\\:chr');
      if (chr) {
        const val = XmlUtils.getAttribute(chr, 'm\\:val') || XmlUtils.getAttribute(chr, 'val');
        props.naryChar = val || '∫';
      }

      // 上下限位置 m:limLoc
      const limLoc = XmlUtils.getChild(naryPr, 'm\\:limLoc');
      if (limLoc) {
        const val = XmlUtils.getAttribute(limLoc, 'm\\:val') || XmlUtils.getAttribute(limLoc, 'val');
        props.limLoc = val as OMathNodeProps['limLoc'];
      }

      // 隐藏上标 m:supHide
      const supHide = XmlUtils.getChild(naryPr, 'm\\:supHide');
      if (supHide) {
        const val = XmlUtils.getAttribute(supHide, 'm\\:val') || XmlUtils.getAttribute(supHide, 'val');
        props.supHide = val !== 'off' && val !== '0';
      }

      // 隐藏下标 m:subHide
      const subHide = XmlUtils.getChild(naryPr, 'm\\:subHide');
      if (subHide) {
        const val = XmlUtils.getAttribute(subHide, 'm\\:val') || XmlUtils.getAttribute(subHide, 'val');
        props.subHide = val !== 'off' && val !== '0';
      }

      // 是否增长 m:grow
      const grow = XmlUtils.getChild(naryPr, 'm\\:grow');
      if (grow) {
        const val = XmlUtils.getAttribute(grow, 'm\\:val') || XmlUtils.getAttribute(grow, 'val');
        props.grow = val !== 'off' && val !== '0';
      }
    }

    // 默认为积分符号
    if (!props.naryChar) props.naryChar = '∫';

    // 下标 m:sub
    const subEl = XmlUtils.getChild(node, 'm\\:sub');
    const subscript: OMathNode | undefined =
      subEl && !props.subHide ? { type: 'oMath', children: this.parseChildren(subEl) } : undefined;

    // 上标 m:sup
    const supEl = XmlUtils.getChild(node, 'm\\:sup');
    const superscript: OMathNode | undefined =
      supEl && !props.supHide ? { type: 'oMath', children: this.parseChildren(supEl) } : undefined;

    // 主体 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const element: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    return {
      type: 'nary',
      subscript,
      superscript,
      element,
      props
    };
  }

  // ============================================================================
  // 矩阵解析
  // ============================================================================

  /**
   * 解析 m:m - 矩阵
   */
  private static parseMatrix(node: Element): OMathMatrixNode {
    const props: OMathNodeProps = {};

    // 解析矩阵属性 m:mPr
    const mPr = XmlUtils.getChild(node, 'm\\:mPr');
    if (mPr) {
      // 可以解析列数等属性
      const mcs = XmlUtils.getChild(mPr, 'm\\:mcs');
      if (mcs) {
        const mc = XmlUtils.getChild(mcs, 'm\\:mc');
        if (mc) {
          const mcPr = XmlUtils.getChild(mc, 'm\\:mcPr');
          if (mcPr) {
            const count = XmlUtils.getChild(mcPr, 'm\\:count');
            if (count) {
              const val = XmlUtils.getAttribute(count, 'm\\:val') || XmlUtils.getAttribute(count, 'val');
              if (val) {
                props.columnCount = parseInt(val, 10);
              }
            }
          }
        }
      }
    }

    // 解析矩阵行 m:mr
    const rows: OMathMatrixRowNode[] = [];
    const mrElements = XmlUtils.getChildren(node, 'm\\:mr');
    for (const mrEl of mrElements) {
      rows.push(this.parseMatrixRow(mrEl));
    }

    // 计算行列数
    props.rowCount = rows.length;
    if (rows.length > 0 && !props.columnCount) {
      props.columnCount = rows[0].cells.length;
    }

    return {
      type: 'matrix',
      rows,
      props
    };
  }

  /**
   * 解析 m:mr - 矩阵行
   */
  private static parseMatrixRow(node: Element): OMathMatrixRowNode {
    const cells: OMathNode[] = [];

    // 解析单元格 m:e
    const eElements = XmlUtils.getChildren(node, 'm\\:e');
    for (const eEl of eElements) {
      cells.push({
        type: 'oMath',
        children: this.parseChildren(eEl)
      });
    }

    return {
      type: 'matrixRow',
      cells
    };
  }

  // ============================================================================
  // 根式解析
  // ============================================================================

  /**
   * 解析 m:rad - 根式
   */
  private static parseRadical(node: Element): OMathRadicalNode {
    const props: OMathNodeProps = {};

    // 解析根式属性 m:radPr
    const radPr = XmlUtils.getChild(node, 'm\\:radPr');
    if (radPr) {
      // 隐藏根指数 m:degHide
      const degHide = XmlUtils.getChild(radPr, 'm\\:degHide');
      if (degHide) {
        const val = XmlUtils.getAttribute(degHide, 'm\\:val') || XmlUtils.getAttribute(degHide, 'val');
        props.degHide = val !== 'off' && val !== '0';
      }
    }

    // 根指数 m:deg
    const degEl = XmlUtils.getChild(node, 'm\\:deg');
    const degree: OMathNode | undefined =
      degEl && !props.degHide ? { type: 'oMath', children: this.parseChildren(degEl) } : undefined;

    // 被开方数 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const radicand: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    return {
      type: 'radical',
      radicand,
      degree,
      props: Object.keys(props).length > 0 ? props : undefined
    };
  }

  // ============================================================================
  // 其他结构解析
  // ============================================================================

  /**
   * 解析 m:acc - 重音
   */
  private static parseAccent(node: Element): OMathAccentNode {
    const props: OMathNodeProps = {};

    // 解析重音属性 m:accPr
    const accPr = XmlUtils.getChild(node, 'm\\:accPr');
    if (accPr) {
      const chr = XmlUtils.getChild(accPr, 'm\\:chr');
      if (chr) {
        const val = XmlUtils.getAttribute(chr, 'm\\:val') || XmlUtils.getAttribute(chr, 'val');
        props.accentChar = val || '\u0302'; // 默认帽子
      }
    }

    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    return {
      type: 'accent',
      base,
      props
    };
  }

  /**
   * 解析 m:bar - 上划线/下划线
   */
  private static parseBar(node: Element): OMathBarNode {
    const props: OMathNodeProps = {};

    // 解析属性 m:barPr
    const barPr = XmlUtils.getChild(node, 'm\\:barPr');
    if (barPr) {
      const pos = XmlUtils.getChild(barPr, 'm\\:pos');
      if (pos) {
        const val = XmlUtils.getAttribute(pos, 'm\\:val') || XmlUtils.getAttribute(pos, 'val');
        props.position = val as OMathNodeProps['position'];
      }
    }

    // 默认顶部
    if (!props.position) props.position = 'top';

    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    return {
      type: 'bar',
      base,
      props
    };
  }

  /**
   * 解析 m:box - 盒子
   */
  private static parseBox(node: Element): OMathNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const children = eEl ? this.parseChildren(eEl) : [];

    return {
      type: 'box',
      children
    };
  }

  /**
   * 解析 m:borderBox - 边框盒子
   */
  private static parseBorderBox(node: Element): OMathNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const children = eEl ? this.parseChildren(eEl) : [];

    return {
      type: 'borderBox',
      children
    };
  }

  /**
   * 解析 m:func - 函数
   */
  private static parseFunc(node: Element): OMathFuncNode {
    // 函数名 m:fName
    const fNameEl = XmlUtils.getChild(node, 'm\\:fName');
    const functionName: OMathNode = fNameEl
      ? { type: 'oMath', children: this.parseChildren(fNameEl) }
      : { type: 'text', text: '' };

    // 参数 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const argument: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    return {
      type: 'func',
      functionName,
      argument
    };
  }

  /**
   * 解析 m:groupChr - 分组字符
   */
  private static parseGroupChar(node: Element): OMathGroupCharNode {
    const props: OMathNodeProps = {};

    // 解析属性 m:groupChrPr
    const groupChrPr = XmlUtils.getChild(node, 'm\\:groupChrPr');
    if (groupChrPr) {
      const chr = XmlUtils.getChild(groupChrPr, 'm\\:chr');
      if (chr) {
        const val = XmlUtils.getAttribute(chr, 'm\\:val') || XmlUtils.getAttribute(chr, 'val');
        props.groupChar = val || '⏟'; // 默认下花括号
      }

      const pos = XmlUtils.getChild(groupChrPr, 'm\\:pos');
      if (pos) {
        const val = XmlUtils.getAttribute(pos, 'm\\:val') || XmlUtils.getAttribute(pos, 'val');
        props.position = val as OMathNodeProps['position'];
      }

      const vertJc = XmlUtils.getChild(groupChrPr, 'm\\:vertJc');
      if (vertJc) {
        const val = XmlUtils.getAttribute(vertJc, 'm\\:val') || XmlUtils.getAttribute(vertJc, 'val');
        props.vertJc = val as OMathNodeProps['vertJc'];
      }
    }

    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    return {
      type: 'groupChar',
      base,
      props
    };
  }

  /**
   * 解析 m:limLow - 下限
   */
  private static parseLimLow(node: Element): OMathLimLowNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    // 下限 m:lim
    const limEl = XmlUtils.getChild(node, 'm\\:lim');
    const limit: OMathNode = limEl
      ? { type: 'oMath', children: this.parseChildren(limEl) }
      : { type: 'text', text: '' };

    return {
      type: 'limLow',
      base,
      limit
    };
  }

  /**
   * 解析 m:limUpp - 上限
   */
  private static parseLimUpp(node: Element): OMathLimUppNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const base: OMathNode = eEl ? { type: 'oMath', children: this.parseChildren(eEl) } : { type: 'text', text: '' };

    // 上限 m:lim
    const limEl = XmlUtils.getChild(node, 'm\\:lim');
    const limit: OMathNode = limEl
      ? { type: 'oMath', children: this.parseChildren(limEl) }
      : { type: 'text', text: '' };

    return {
      type: 'limUpp',
      base,
      limit
    };
  }

  /**
   * 解析 m:phant - 占位符
   */
  private static parsePhantom(node: Element): OMathNode {
    // 基础元素 m:e
    const eEl = XmlUtils.getChild(node, 'm\\:e');
    const children = eEl ? this.parseChildren(eEl) : [];

    return {
      type: 'phantom',
      children
    };
  }

  /**
   * 解析 m:eqArr - 方程数组
   */
  private static parseEqArr(node: Element): OMathNode {
    const children: OMathNode[] = [];

    // 解析每个方程 m:e
    const eElements = XmlUtils.getChildren(node, 'm\\:e');
    for (const eEl of eElements) {
      children.push({
        type: 'oMath',
        children: this.parseChildren(eEl)
      });
    }

    return {
      type: 'eqArr',
      children
    };
  }
}
