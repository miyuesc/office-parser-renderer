/**
 * 段落解析器
 *
 * 解析 w:p 元素
 * 处理段落属性和子元素
 */

import { XmlUtils } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import { RunParser } from './RunParser';
import { DrawingParser } from './DrawingParser';
import { VmlParser } from './VmlParser';
import type {
  Paragraph,
  ParagraphProperties,
  ParagraphChild,
  ParagraphIndentation,
  ParagraphSpacing,
  ParagraphBorders,
  BorderStyle,
  Shading,
  TabStop,
  NumberingReference,
  FrameProperties,
  Run,
  Tab,
  LineBreak,
  Hyperlink,
  BookmarkStart,
  BookmarkEnd
} from '../types';

const log = Logger.createTagged('ParagraphParser');

/**
 * 解析上下文接口
 */
export interface ParagraphParserContext {
  /** 样式定义 */
  styles?: Record<string, unknown>;
  /** 编号定义 */
  numbering?: unknown;
  /** 关系映射 */
  relationships?: Record<string, string>;
}

/**
 * 段落解析器类
 */
export class ParagraphParser {
  /**
   * 解析段落
   *
   * @param node - w:p 元素
   * @param context - 解析上下文
   * @returns Paragraph 对象
   */
  static parse(node: Element, context?: ParagraphParserContext): Paragraph {
    // 解析段落属性
    const pPrNode = XmlUtils.query(node, 'w\\:pPr, pPr');
    const props = pPrNode ? this.parseProperties(pPrNode) : {};

    // 解析子元素
    const children = this.parseChildren(node, context);

    return {
      type: 'paragraph',
      props,
      children
    };
  }

  /**
   * 解析段落子元素
   *
   * @param node - w:p 元素
   * @param context - 解析上下文
   * @returns 子元素数组
   */
  private static parseChildren(node: Element, context?: ParagraphParserContext): ParagraphChild[] {
    const children: ParagraphChild[] = [];

    for (const child of Array.from(node.children)) {
      const tagName = child.tagName.toLowerCase();
      const localName = tagName.split(':').pop() || tagName;

      switch (localName) {
        case 'r':
          // 文本运行
          const run = RunParser.parse(child);
          // 如果运行中有实际内容，添加到子元素
          if (run.text || this.hasSpecialContent(child)) {
            children.push(run);
          }
          // 检查是否包含绘图元素
          const drawingNode = XmlUtils.query(child, 'w\\:drawing, drawing');
          if (drawingNode) {
            // 解析并添加绘图元素
            const drawing = DrawingParser.parse(drawingNode);
            if (drawing) {
              children.push(drawing);
            }
          }

          // 检查 VML pict 元素
          const pictNode = XmlUtils.query(child, 'w\\:pict, pict');
          if (pictNode) {
            // VML 形状通常嵌套在 pict 中
            // 可能包含多个 v:shape
            const vShapes = XmlUtils.queryAll(
              pictNode,
              'v\\:shape, shape, v\\:rect, rect, v\\:oval, oval, v\\:roundrect, roundrect'
            );
            vShapes.forEach(vShape => {
              const drawing = VmlParser.parse(vShape);
              if (drawing) {
                children.push(drawing);
              }
            });
          }
          break;

        case 'hyperlink':
          // 超链接
          const hyperlink = this.parseHyperlink(child, context);
          if (hyperlink) {
            children.push(hyperlink);
          }
          break;

        case 'bookmarkstart':
          // 书签开始
          const bmStart = this.parseBookmarkStart(child);
          if (bmStart) {
            children.push(bmStart);
          }
          break;

        case 'bookmarkend':
          // 书签结束
          const bmEnd = this.parseBookmarkEnd(child);
          if (bmEnd) {
            children.push(bmEnd);
          }
          break;

        case 'ppr':
          // 段落属性，已在上面处理
          break;

        case 'sdt':
          // 结构化文档标签（内容控件）
          // 递归解析其中的内容
          const sdtContent = XmlUtils.query(child, 'w\\:sdtContent, sdtContent');
          if (sdtContent) {
            const sdtChildren = this.parseChildren(sdtContent, context);
            children.push(...sdtChildren);
          }
          break;

        case 'fldSimple':
          // 简单域
          const fldRun = XmlUtils.query(child, 'w\\:r, r');
          if (fldRun) {
            const run = RunParser.parse(fldRun);
            children.push(run);
          }
          break;

        case 'smarttag':
          // 智能标签
          const smartTagChildren = this.parseChildren(child, context);
          children.push(...smartTagChildren);
          break;

        default:
          // 其他未知元素
          log.debug(`未处理的段落子元素: ${localName}`);
          break;
      }
    }

    return children;
  }

  /**
   * 检查运行是否包含特殊内容（如制表符、换行符）
   *
   * @param node - w:r 元素
   * @returns 是否包含特殊内容
   */
  private static hasSpecialContent(node: Element): boolean {
    const specialTags = ['tab', 'br', 'cr', 'sym', 'drawing', 'pict'];
    for (const child of Array.from(node.children)) {
      const localName = child.tagName.split(':').pop()?.toLowerCase();
      if (localName && specialTags.includes(localName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 解析段落属性
   *
   * @param node - w:pPr 元素
   * @returns ParagraphProperties 对象
   */
  static parseProperties(node: Element): ParagraphProperties {
    const props: ParagraphProperties = {};

    // 样式引用
    const pStyle = XmlUtils.query(node, 'w\\:pStyle, pStyle');
    if (pStyle) {
      props.styleId = pStyle.getAttribute('w:val') || undefined;
    }

    // 对齐方式
    const jcNode = XmlUtils.query(node, 'w\\:jc, jc');
    if (jcNode) {
      const val = jcNode.getAttribute('w:val');
      if (val) {
        props.alignment = this.mapAlignment(val);
      }
    }

    // 缩进
    const indNode = XmlUtils.query(node, 'w\\:ind, ind');
    if (indNode) {
      props.indentation = this.parseIndentation(indNode);
    }

    // 间距
    const spacingNode = XmlUtils.query(node, 'w\\:spacing, spacing');
    if (spacingNode) {
      props.spacing = this.parseSpacing(spacingNode);
    }

    // 编号
    const numPrNode = XmlUtils.query(node, 'w\\:numPr, numPr');
    if (numPrNode) {
      props.numbering = this.parseNumbering(numPrNode);
    }

    // 制表位
    const tabsNode = XmlUtils.query(node, 'w\\:tabs, tabs');
    if (tabsNode) {
      props.tabs = this.parseTabs(tabsNode);
    }

    // 边框
    const pBdrNode = XmlUtils.query(node, 'w\\:pBdr, pBdr');
    if (pBdrNode) {
      props.borders = this.parseBorders(pBdrNode);
    }

    // 底纹
    const shdNode = XmlUtils.query(node, 'w\\:shd, shd');
    if (shdNode) {
      props.shading = this.parseShading(shdNode);
    }

    // 与下段保持连续
    const keepNextNode = XmlUtils.query(node, 'w\\:keepNext, keepNext');
    if (keepNextNode) {
      const val = keepNextNode.getAttribute('w:val');
      props.keepNext = val !== '0' && val !== 'false';
    }

    // 段落内不分页
    const keepLinesNode = XmlUtils.query(node, 'w\\:keepLines, keepLines');
    if (keepLinesNode) {
      const val = keepLinesNode.getAttribute('w:val');
      props.keepLines = val !== '0' && val !== 'false';
    }

    // 段前分页
    const pageBreakBeforeNode = XmlUtils.query(node, 'w\\:pageBreakBefore, pageBreakBefore');
    if (pageBreakBeforeNode) {
      const val = pageBreakBeforeNode.getAttribute('w:val');
      props.pageBreakBefore = val !== '0' && val !== 'false';
    }

    // 寡妇/孤儿控制
    const widowControlNode = XmlUtils.query(node, 'w\\:widowControl, widowControl');
    if (widowControlNode) {
      const val = widowControlNode.getAttribute('w:val');
      props.widowControl = val !== '0' && val !== 'false';
    }

    // 大纲级别
    const outlineLvlNode = XmlUtils.query(node, 'w\\:outlineLvl, outlineLvl');
    if (outlineLvlNode) {
      const val = outlineLvlNode.getAttribute('w:val');
      if (val) {
        props.outlineLevel = parseInt(val, 10);
      }
    }

    // 抑制自动连字符
    const suppressAutoHyphensNode = XmlUtils.query(node, 'w\\:suppressAutoHyphens, suppressAutoHyphens');
    if (suppressAutoHyphensNode) {
      const val = suppressAutoHyphensNode.getAttribute('w:val');
      props.suppressAutoHyphens = val !== '0' && val !== 'false';
    }

    // 双向文本
    const bidiNode = XmlUtils.query(node, 'w\\:bidi, bidi');
    if (bidiNode) {
      const val = bidiNode.getAttribute('w:val');
      props.bidi = val !== '0' && val !== 'false';
    }

    // 默认运行属性
    const rPrNode = XmlUtils.query(node, 'w\\:rPr, rPr');
    if (rPrNode) {
      props.rPr = RunParser.parseProperties(rPrNode);
    }

    // 框架属性
    const framePrNode = XmlUtils.query(node, 'w\\:framePr, framePr');
    if (framePrNode) {
      props.framePr = this.parseFrameProperties(framePrNode);
    }

    return props;
  }

  /**
   * 映射对齐方式
   *
   * @param val - 原始值
   * @returns 标准对齐值
   */
  private static mapAlignment(val: string): ParagraphProperties['alignment'] {
    const map: Record<string, ParagraphProperties['alignment']> = {
      left: 'left',
      center: 'center',
      right: 'right',
      both: 'both',
      distribute: 'distribute',
      justify: 'both'
    };
    return map[val] || 'left';
  }

  /**
   * 解析缩进
   *
   * @param node - w:ind 元素
   * @returns ParagraphIndentation 对象
   */
  private static parseIndentation(node: Element): ParagraphIndentation {
    const ind: ParagraphIndentation = {};

    const left = node.getAttribute('w:left') || node.getAttribute('w:start');
    if (left) ind.left = parseInt(left, 10);

    const right = node.getAttribute('w:right') || node.getAttribute('w:end');
    if (right) ind.right = parseInt(right, 10);

    const firstLine = node.getAttribute('w:firstLine');
    if (firstLine) ind.firstLine = parseInt(firstLine, 10);

    const hanging = node.getAttribute('w:hanging');
    if (hanging) ind.hanging = parseInt(hanging, 10);

    const leftChars = node.getAttribute('w:leftChars');
    if (leftChars) ind.leftChars = parseInt(leftChars, 10);

    const rightChars = node.getAttribute('w:rightChars');
    if (rightChars) ind.rightChars = parseInt(rightChars, 10);

    const firstLineChars = node.getAttribute('w:firstLineChars');
    if (firstLineChars) ind.firstLineChars = parseInt(firstLineChars, 10);

    const hangingChars = node.getAttribute('w:hangingChars');
    if (hangingChars) ind.hangingChars = parseInt(hangingChars, 10);

    return ind;
  }

  /**
   * 解析间距
   *
   * @param node - w:spacing 元素
   * @returns ParagraphSpacing 对象
   */
  private static parseSpacing(node: Element): ParagraphSpacing {
    const spacing: ParagraphSpacing = {};

    const before = node.getAttribute('w:before');
    if (before) spacing.before = parseInt(before, 10);

    const after = node.getAttribute('w:after');
    if (after) spacing.after = parseInt(after, 10);

    const line = node.getAttribute('w:line');
    if (line) spacing.line = parseInt(line, 10);

    const lineRule = node.getAttribute('w:lineRule');
    if (lineRule) spacing.lineRule = lineRule as ParagraphSpacing['lineRule'];

    const beforeLines = node.getAttribute('w:beforeLines');
    if (beforeLines) spacing.beforeLines = parseInt(beforeLines, 10);

    const afterLines = node.getAttribute('w:afterLines');
    if (afterLines) spacing.afterLines = parseInt(afterLines, 10);

    const beforeAutospacing = node.getAttribute('w:beforeAutospacing');
    if (beforeAutospacing) spacing.beforeAutospacing = beforeAutospacing !== '0';

    const afterAutospacing = node.getAttribute('w:afterAutospacing');
    if (afterAutospacing) spacing.afterAutospacing = afterAutospacing !== '0';

    return spacing;
  }

  /**
   * 解析编号引用
   *
   * @param node - w:numPr 元素
   * @returns NumberingReference 对象
   */
  private static parseNumbering(node: Element): NumberingReference | undefined {
    const numIdNode = XmlUtils.query(node, 'w\\:numId, numId');
    const ilvlNode = XmlUtils.query(node, 'w\\:ilvl, ilvl');

    const numId = numIdNode?.getAttribute('w:val');
    const ilvl = ilvlNode?.getAttribute('w:val') || '0';

    if (numId && numId !== '0') {
      return {
        id: parseInt(numId, 10),
        level: parseInt(ilvl, 10)
      };
    }

    return undefined;
  }

  /**
   * 解析制表位
   *
   * @param node - w:tabs 元素
   * @returns TabStop 数组
   */
  private static parseTabs(node: Element): TabStop[] {
    const tabs: TabStop[] = [];
    const tabNodes = XmlUtils.queryAll(node, 'w\\:tab, tab');

    tabNodes.forEach((tab: Element) => {
      const pos = tab.getAttribute('w:pos');
      const val = tab.getAttribute('w:val');
      const leader = tab.getAttribute('w:leader');

      if (pos && val) {
        tabs.push({
          pos: parseInt(pos, 10),
          val: val as TabStop['val'],
          leader: leader as TabStop['leader']
        });
      }
    });

    return tabs;
  }

  /**
   * 解析边框
   *
   * @param node - w:pBdr 元素
   * @returns ParagraphBorders 对象
   */
  private static parseBorders(node: Element): ParagraphBorders {
    const borders: ParagraphBorders = {};

    const sides = ['top', 'bottom', 'left', 'right', 'between', 'bar'];
    for (const side of sides) {
      const sideNode = XmlUtils.query(node, `w\\:${side}, ${side}`);
      if (sideNode) {
        borders[side as keyof ParagraphBorders] = this.parseBorderStyle(sideNode);
      }
    }

    return borders;
  }

  /**
   * 解析边框样式
   *
   * @param node - 边框元素
   * @returns BorderStyle 对象
   */
  private static parseBorderStyle(node: Element): BorderStyle {
    return {
      val: node.getAttribute('w:val') || 'single',
      color: node.getAttribute('w:color') || undefined,
      sz: node.getAttribute('w:sz') ? parseInt(node.getAttribute('w:sz')!, 10) : undefined,
      space: node.getAttribute('w:space') ? parseInt(node.getAttribute('w:space')!, 10) : undefined,
      shadow: node.getAttribute('w:shadow') === '1' || node.getAttribute('w:shadow') === 'true',
      themeColor: node.getAttribute('w:themeColor') || undefined
    };
  }

  /**
   * 解析底纹
   *
   * @param node - w:shd 元素
   * @returns Shading 对象
   */
  private static parseShading(node: Element): Shading {
    return {
      val: node.getAttribute('w:val') || 'clear',
      fill: node.getAttribute('w:fill') || undefined,
      color: node.getAttribute('w:color') || undefined,
      themeFill: node.getAttribute('w:themeFill') || undefined,
      themeColor: node.getAttribute('w:themeColor') || undefined
    };
  }

  /**
   * 解析框架属性
   *
   * @param node - w:framePr 元素
   * @returns FrameProperties 对象
   */
  private static parseFrameProperties(node: Element): FrameProperties {
    const framePr: FrameProperties = {};

    const w = node.getAttribute('w:w');
    if (w) framePr.width = parseInt(w, 10);

    const h = node.getAttribute('w:h');
    if (h) framePr.height = parseInt(h, 10);

    const hAnchor = node.getAttribute('w:hAnchor');
    if (hAnchor) framePr.hAnchor = hAnchor as FrameProperties['hAnchor'];

    const vAnchor = node.getAttribute('w:vAnchor');
    if (vAnchor) framePr.vAnchor = vAnchor as FrameProperties['vAnchor'];

    const x = node.getAttribute('w:x');
    if (x) framePr.x = parseInt(x, 10);

    const y = node.getAttribute('w:y');
    if (y) framePr.y = parseInt(y, 10);

    const wrap = node.getAttribute('w:wrap');
    if (wrap) framePr.wrap = wrap as FrameProperties['wrap'];

    return framePr;
  }

  /**
   * 解析超链接
   *
   * @param node - w:hyperlink 元素
   * @param context - 解析上下文
   * @returns Hyperlink 对象
   */
  private static parseHyperlink(node: Element, context?: ParagraphParserContext): Hyperlink | null {
    const rId = node.getAttribute('r:id');
    const anchor = node.getAttribute('w:anchor');

    const children: Run[] = [];
    const runNodes = XmlUtils.queryAll(node, 'w\\:r, r');
    runNodes.forEach((r: Element) => {
      const run = RunParser.parse(r);
      children.push(run);
    });

    if (!rId && !anchor && children.length === 0) {
      return null;
    }

    const hyperlink: Hyperlink = {
      type: 'hyperlink',
      children
    };

    if (rId) {
      hyperlink.rId = rId;
      // 解析目标 URL
      if (context?.relationships) {
        hyperlink.url = context.relationships[rId];
      }
    }

    if (anchor) {
      hyperlink.anchor = anchor;
    }

    return hyperlink;
  }

  /**
   * 解析书签开始
   *
   * @param node - w:bookmarkStart 元素
   * @returns BookmarkStart 对象
   */
  private static parseBookmarkStart(node: Element): BookmarkStart | null {
    const id = node.getAttribute('w:id');
    const name = node.getAttribute('w:name');

    if (!id) return null;

    return {
      type: 'bookmarkStart',
      id,
      name: name || ''
    };
  }

  /**
   * 解析书签结束
   *
   * @param node - w:bookmarkEnd 元素
   * @returns BookmarkEnd 对象
   */
  private static parseBookmarkEnd(node: Element): BookmarkEnd | null {
    const id = node.getAttribute('w:id');

    if (!id) return null;

    return {
      type: 'bookmarkEnd',
      id
    };
  }
}
