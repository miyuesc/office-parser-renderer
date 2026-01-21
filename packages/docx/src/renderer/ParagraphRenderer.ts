/**
 * 段落渲染器
 *
 * 渲染 Paragraph 元素为 DOM
 * 应用段落样式和渲染子元素
 */

import { Logger } from '../utils/Logger';
import { UnitConverter, AlignmentStyles, BorderStyles, OMathRenderer, OMathNode } from '@ai-space/shared';
import { RunRenderer, RunRenderContext } from './RunRenderer';
import { DrawingRenderer } from './DrawingRenderer';
import { ListCounter } from './ListCounter';
import type {
  Paragraph,
  ParagraphProperties,
  ParagraphChild,
  DocxStyles,
  NumberingDefinition,
  DocxDocument,
  Drawing,
  Drawing,
  OMathElement,
  InsertedText,
  DeletedText
} from '../types';

const log = Logger.createTagged('ParagraphRenderer');

/**
 * 段落渲染上下文接口
 */
export interface ParagraphRenderContext extends RunRenderContext {
  /** 编号定义 */
  numbering?: NumberingDefinition;
  /** 列表计数器 */
  listCounter?: ListCounter;
  /** 文档对象（用于解析图片等） */
  document?: DocxDocument;
  /** 默认制表符宽度（像素） */
  defaultTabWidth?: number;
}

/**
 * 段落渲染器类
 */
export class ParagraphRenderer {
  /**
   * 渲染段落
   *
   * @param paragraph - Paragraph 对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static render(paragraph: Paragraph, context?: ParagraphRenderContext): HTMLElement {
    const div = document.createElement('div');
    div.className = 'docx-paragraph';

    // 应用段落样式
    this.applyStyles(div, paragraph.props, context);

    // 渲染列表编号
    if (paragraph.props.numbering && context?.listCounter) {
      const marker = this.renderListMarker(paragraph.props.numbering, context);
      if (marker) {
        div.insertBefore(marker, div.firstChild);
      }
    }

    // 渲染子元素
    for (const child of paragraph.children) {
      const element = this.renderChild(child, context);
      if (element) {
        div.appendChild(element);
      }
    }

    // 如果段落为空，添加一个 &nbsp; 保持高度
    if (div.childNodes.length === 0 || (div.childNodes.length === 1 && div.textContent === '')) {
      const nbsp = document.createElement('span');
      nbsp.innerHTML = '&nbsp;';
      // 继承段落默认运行属性的字号，保持正确的空行高度
      if (paragraph.props.rPr?.size) {
        const sizePt = UnitConverter.halfPointsToPoints(paragraph.props.rPr.size);
        nbsp.style.fontSize = `${sizePt}pt`;
      }
      div.appendChild(nbsp);
    }

    return div;
  }

  /**
   * 渲染子元素
   *
   * @param child - 子元素
   * @param context - 渲染上下文
   * @returns HTMLElement 或 null
   */
  private static renderChild(child: ParagraphChild, context?: ParagraphRenderContext): HTMLElement | Node | null {
    switch (child.type) {
      case 'run':
        return RunRenderer.render(child, context);

      case 'tab':
        return RunRenderer.renderTab(context?.defaultTabWidth);

      case 'break':
        return RunRenderer.renderBreak(child.breakType);

      case 'hyperlink':
        return this.renderHyperlink(child, context);

      case 'bookmarkStart':
      case 'bookmarkEnd':
        // 书签不渲染可见内容
        return null;

      case 'field':
        return this.renderField(child, context);

      case 'drawing':
        // 渲染段落内的绘图元素（图片、形状等）
        return DrawingRenderer.render(child as Drawing, {
          document: context?.document,
          images: context?.document?.images
        });

      case 'omath':
        // 渲染数学公式
        const omathChild = child as OMathElement;
        if (omathChild.node) {
          return OMathRenderer.render(omathChild.node as OMathNode);
        }
        return null;

      case 'insertedText':
        return this.renderInsertedText(child as InsertedText, context);

      case 'deletedText':
        // User requested tracking attributes even if hidden
        return this.renderDeletedText(child as DeletedText, context);

      default:
        log.debug(`未处理的子元素类型: ${(child as ParagraphChild).type}`);
        return null;
    }
  }

  /**
   * 应用段落样式
   *
   * @param element - 目标元素
   * @param props - 段落属性
   * @param context - 渲染上下文
   */
  static applyStyles(element: HTMLElement, props: ParagraphProperties, context?: ParagraphRenderContext): void {
    const style = element.style;

    // 对齐方式 - 使用 AlignmentStyles
    if (props.alignment) {
      style.textAlign = AlignmentStyles.mapHorizontalAlignment(props.alignment);
    }

    // 缩进
    if (props.indentation) {
      this.applyIndentation(style, props.indentation);
    }

    // 间距
    if (props.spacing) {
      this.applySpacing(style, props.spacing);
    }

    // 边框 - 使用 BorderStyles
    if (props.borders) {
      this.applyBorders(style, props.borders);
    }

    // 底纹
    if (props.shading?.fill && props.shading.fill !== 'auto') {
      style.backgroundColor = `#${props.shading.fill}`;
    }

    // 双向文本
    if (props.bidi) {
      style.direction = 'rtl';
    }

    // 分页控制
    if (props.pageBreakBefore) {
      style.pageBreakBefore = 'always';
    }

    if (props.keepNext) {
      style.pageBreakAfter = 'avoid';
    }

    if (props.keepLines) {
      style.pageBreakInside = 'avoid';
    }

    // 应用默认运行属性到段落
    if (props.rPr) {
      RunRenderer.applyStyles(element, props.rPr, context);
    }
  }

  /**
   * 应用缩进样式
   *
   * @param style - CSSStyleDeclaration
   * @param indentation - 缩进配置
   */
  private static applyIndentation(style: CSSStyleDeclaration, indentation: ParagraphProperties['indentation']): void {
    if (!indentation) return;

    // 左缩进
    if (indentation.left) {
      const leftPx = UnitConverter.twipsToPixels(indentation.left);
      style.marginLeft = `${leftPx}px`;
    }

    // 右缩进
    if (indentation.right) {
      const rightPx = UnitConverter.twipsToPixels(indentation.right);
      style.marginRight = `${rightPx}px`;
    }

    // 首行缩进
    if (indentation.firstLine && indentation.firstLine > 0) {
      const firstLinePx = UnitConverter.twipsToPixels(indentation.firstLine);
      style.textIndent = `${firstLinePx}px`;
    }

    // 悬挂缩进
    if (indentation.hanging && indentation.hanging > 0) {
      const hangingPx = UnitConverter.twipsToPixels(indentation.hanging);
      style.textIndent = `-${hangingPx}px`;
      // 增加左边距以补偿
      const currentMargin = parseFloat(style.marginLeft) || 0;
      style.marginLeft = `${currentMargin + hangingPx}px`;
    }
  }

  /**
   * 应用间距样式
   *
   * @param style - CSSStyleDeclaration
   * @param spacing - 间距配置
   */
  private static applySpacing(style: CSSStyleDeclaration, spacing: ParagraphProperties['spacing']): void {
    if (!spacing) return;

    // 段前间距
    if (spacing.before) {
      const beforePx = UnitConverter.twipsToPixels(spacing.before);
      style.marginTop = `${beforePx}px`;
    }

    // 段后间距
    if (spacing.after) {
      const afterPx = UnitConverter.twipsToPixels(spacing.after);
      style.marginBottom = `${afterPx}px`;
    }

    // 行距
    if (spacing.line) {
      style.lineHeight = UnitConverter.calculateLineHeight(spacing.line, spacing.lineRule);
    }
  }

  /**
   * 应用边框样式 - 使用 BorderStyles
   *
   * @param style - CSSStyleDeclaration
   * @param borders - 边框配置
   */
  private static applyBorders(style: CSSStyleDeclaration, borders: ParagraphProperties['borders']): void {
    if (!borders) return;

    if (borders.top) {
      style.borderTop = BorderStyles.formatBorder(borders.top);
    }

    if (borders.bottom) {
      style.borderBottom = BorderStyles.formatBorder(borders.bottom);
    }

    if (borders.left) {
      style.borderLeft = BorderStyles.formatBorder(borders.left);
    }

    if (borders.right) {
      style.borderRight = BorderStyles.formatBorder(borders.right);
    }
  }

  /**
   * 渲染列表编号标记
   *
   * @param numbering - 编号引用
   * @param context - 渲染上下文
   * @returns HTMLElement 或 null
   */
  private static renderListMarker(
    numbering: { id: number; level: number },
    context: ParagraphRenderContext
  ): HTMLElement | null {
    if (!context.listCounter) return null;

    const markerText = context.listCounter.getNextNumber(String(numbering.id), numbering.level);

    if (!markerText) return null;

    const marker = document.createElement('span');
    marker.className = 'docx-list-marker';
    marker.textContent = markerText + ' ';
    marker.style.marginRight = '8px';
    marker.style.display = 'inline-block';
    marker.style.minWidth = '20px';

    return marker;
  }

  /**
   * 渲染超链接
   *
   * @param hyperlink - 超链接对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  private static renderHyperlink(
    hyperlink: { children: any[]; url?: string; anchor?: string },
    context?: ParagraphRenderContext
  ): HTMLElement {
    const a = document.createElement('a');
    a.className = 'docx-hyperlink';

    // 设置链接目标
    if (hyperlink.url) {
      a.href = hyperlink.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else if (hyperlink.anchor) {
      a.href = `#${hyperlink.anchor}`;
    }

    // 渲染子元素
    for (const run of hyperlink.children) {
      const element = RunRenderer.render(run, context);
      a.appendChild(element);
    }

    // 应用默认超链接样式
    a.style.color = '#0563C1';
    a.style.textDecoration = 'underline';

    return a;
  }

  /**
   * 渲染域代码
   *
   * @param field - 域代码对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  private static renderField(
    field: { fieldType: string; instruction: string; result?: string },
    context?: ParagraphRenderContext
  ): HTMLElement {
    const span = document.createElement('span');
    span.className = 'docx-field';

    // 对于常见域，显示结果或占位符
    const instruction = field.instruction.toUpperCase().trim();

    if (instruction.includes('PAGE')) {
      span.textContent = field.result || '1';
      span.setAttribute('data-field', 'PAGE');
    } else if (instruction.includes('NUMPAGES')) {
      span.textContent = field.result || '1';
      span.setAttribute('data-field', 'NUMPAGES');
    } else if (instruction.includes('DATE')) {
      span.textContent = field.result || new Date().toLocaleDateString();
      span.setAttribute('data-field', 'DATE');
    } else if (instruction.includes('TIME')) {
      span.textContent = field.result || new Date().toLocaleTimeString();
      span.setAttribute('data-field', 'TIME');
    } else {
      // 其他域显示结果或指令
      span.textContent = field.result || `[${field.fieldType}]`;
    }

    return span;
  }
  /**
   * 渲染新增文本 (修订)
   */
  private static renderInsertedText(node: InsertedText, context?: ParagraphRenderContext): HTMLElement {
    const span = document.createElement('span');
    span.className = 'docx-ins';
    span.setAttribute('data-track-changes', 'insert');
    if (node.author) span.setAttribute('data-author', node.author);
    if (node.date) span.setAttribute('data-date', node.date);

    // 默认样式：颜色通常由 CSS 控制，这里也可以简单设置
    // span.style.textDecoration = 'underline'; // User requested no default underline

    for (const child of node.children) {
      const el = this.renderChild(child, context);
      if (el) span.appendChild(el);
    }
    return span;
  }

  /**
   * 渲染删除文本 (修订)
   */
  private static renderDeletedText(node: DeletedText, context?: ParagraphRenderContext): HTMLElement {
    const span = document.createElement('span');
    span.className = 'docx-del';
    // 默认隐藏，但保留 DOM 以供查看
    span.style.display = 'none';
    span.setAttribute('data-track-changes', 'delete');
    if (node.author) span.setAttribute('data-author', node.author);
    if (node.date) span.setAttribute('data-date', node.date);

    for (const child of node.children) {
      const el = this.renderChild(child, context);
      if (el) span.appendChild(el);
    }
    return span;
  }
}
