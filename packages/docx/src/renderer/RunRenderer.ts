/**
 * 文本运行渲染器
 *
 * 渲染 Run 元素为 DOM
 * 应用所有文本格式样式
 */

import { Logger } from '../utils/Logger';
import { UnitConverter } from '../utils/UnitConverter';
import type { Run, RunProperties, UnderlineStyle, DocxStyles, DocxTheme } from '../types';

const log = Logger.createTagged('RunRenderer');

/**
 * 渲染上下文接口
 */
export interface RunRenderContext {
  /** 样式定义 */
  styles?: DocxStyles;
  /** 主题信息 */
  theme?: DocxTheme;
  /** 默认字号（点） */
  defaultFontSize?: number;
  /** 默认字体 */
  defaultFont?: string;
}

/**
 * 文本运行渲染器类
 */
export class RunRenderer {
  /**
   * 渲染文本运行
   *
   * @param run - Run 对象
   * @param context - 渲染上下文
   * @returns HTMLElement
   */
  static render(run: Run, context?: RunRenderContext): HTMLElement {
    const span = document.createElement('span');
    span.className = 'docx-run';

    // 应用样式
    this.applyStyles(span, run.props, context);

    // 设置文本内容
    // 注意：正确处理空格
    if (run.text) {
      // 保留所有空格
      span.style.whiteSpace = 'pre-wrap';
      span.textContent = run.text;
    }

    return span;
  }

  /**
   * 渲染多个文本运行
   *
   * @param runs - Run 数组
   * @param context - 渲染上下文
   * @returns DocumentFragment
   */
  static renderMultiple(runs: Run[], context?: RunRenderContext): DocumentFragment {
    const fragment = document.createDocumentFragment();

    for (const run of runs) {
      const element = this.render(run, context);
      fragment.appendChild(element);
    }

    return fragment;
  }

  /**
   * 应用样式到元素
   *
   * @param element - 目标元素
   * @param props - 运行属性
   * @param context - 渲染上下文
   */
  static applyStyles(element: HTMLElement, props: RunProperties, context?: RunRenderContext): void {
    const style = element.style;

    // 字体
    const fontFamily = this.getFontFamily(props, context);
    if (fontFamily) {
      style.fontFamily = fontFamily;
    }

    // 字号
    const fontSize = this.getFontSize(props, context);
    if (fontSize) {
      style.fontSize = `${fontSize}pt`;
    }

    // 粗体
    if (props.bold) {
      style.fontWeight = 'bold';
    }

    // 斜体
    if (props.italic) {
      style.fontStyle = 'italic';
    }

    // 下划线
    if (props.underline) {
      style.textDecoration = this.getTextDecoration(props);
      const underlineColor = props.underline.color;
      if (underlineColor && underlineColor !== 'auto') {
        style.textDecorationColor = `#${underlineColor}`;
      }
    }

    // 删除线
    if (props.strike || props.dstrike) {
      const existing = style.textDecoration || '';
      style.textDecoration = existing ? `${existing} line-through` : 'line-through';
      if (props.dstrike) {
        style.textDecorationStyle = 'double';
      }
    }

    // 颜色
    if (props.color && props.color !== 'auto') {
      style.color = `#${props.color}`;
    }

    // 高亮
    if (props.highlight) {
      const bgColor = this.getHighlightColor(props.highlight);
      if (bgColor) {
        style.backgroundColor = bgColor;
      }
    }

    // 底纹
    if (props.shading?.fill && props.shading.fill !== 'auto') {
      style.backgroundColor = `#${props.shading.fill}`;
    }

    // 上标/下标
    if (props.vertAlign === 'superscript') {
      style.verticalAlign = 'super';
      style.fontSize = '0.75em';
    } else if (props.vertAlign === 'subscript') {
      style.verticalAlign = 'sub';
      style.fontSize = '0.75em';
    }

    // 字符间距
    if (props.spacing) {
      const spacingPx = UnitConverter.twipsToPixels(props.spacing);
      style.letterSpacing = `${spacingPx}px`;
    }

    // 位置偏移
    if (props.position) {
      const positionPx = UnitConverter.halfPointsToPoints(props.position);
      style.position = 'relative';
      style.top = `${-positionPx}pt`;
    }

    // 隐藏文本
    if (props.vanish) {
      style.display = 'none';
    }

    // 小型大写
    if (props.smallCaps) {
      style.fontVariant = 'small-caps';
    }

    // 全大写
    if (props.caps) {
      style.textTransform = 'uppercase';
    }

    // 缩放
    if (props.w && props.w !== 100) {
      style.transform = `scaleX(${props.w / 100})`;
      style.display = 'inline-block';
    }

    // 浮雕/印记/轮廓/阴影效果
    if (props.emboss || props.imprint || props.outline || props.shadow) {
      const textShadow = this.getTextEffects(props);
      if (textShadow) {
        style.textShadow = textShadow;
      }
    }
  }

  /**
   * 获取字体族
   *
   * @param props - 运行属性
   * @param context - 渲染上下文
   * @returns 字体族字符串
   */
  private static getFontFamily(props: RunProperties, context?: RunRenderContext): string | null {
    const fonts = props.fonts;
    if (!fonts) {
      return context?.defaultFont || null;
    }

    // 优先使用东亚字体（中文环境）
    const parts: string[] = [];

    if (fonts.eastAsia) {
      parts.push(`"${fonts.eastAsia}"`);
    }

    if (fonts.ascii) {
      parts.push(`"${fonts.ascii}"`);
    }

    if (fonts.hAnsi && fonts.hAnsi !== fonts.ascii) {
      parts.push(`"${fonts.hAnsi}"`);
    }

    if (fonts.cs && fonts.cs !== fonts.ascii) {
      parts.push(`"${fonts.cs}"`);
    }

    // 添加默认字体
    if (context?.defaultFont) {
      parts.push(`"${context.defaultFont}"`);
    }

    // 添加通用字体族
    parts.push('sans-serif');

    return parts.join(', ');
  }

  /**
   * 获取字号
   *
   * @param props - 运行属性
   * @param context - 渲染上下文
   * @returns 字号（点）
   */
  private static getFontSize(props: RunProperties, context?: RunRenderContext): number | null {
    if (props.size) {
      // size 是半点单位
      return UnitConverter.halfPointsToPoints(props.size);
    }
    return context?.defaultFontSize || null;
  }

  /**
   * 获取文本装饰
   *
   * @param props - 运行属性
   * @returns CSS text-decoration 值
   */
  private static getTextDecoration(props: RunProperties): string {
    if (!props.underline) return 'none';

    const underlineType = props.underline.val;

    // 映射下划线类型到 CSS
    const styleMap: Record<string, string> = {
      single: 'underline',
      words: 'underline', // CSS 不支持仅单词下划线
      double: 'underline',
      thick: 'underline',
      dotted: 'underline dotted',
      dottedHeavy: 'underline dotted',
      dash: 'underline dashed',
      dashedHeavy: 'underline dashed',
      dashLong: 'underline dashed',
      dashLongHeavy: 'underline dashed',
      dotDash: 'underline dashed',
      dashDotHeavy: 'underline dashed',
      dotDotDash: 'underline dashed',
      dashDotDotHeavy: 'underline dashed',
      wave: 'underline wavy',
      wavyHeavy: 'underline wavy',
      wavyDouble: 'underline wavy'
    };

    return styleMap[underlineType] || 'underline';
  }

  /**
   * 获取高亮颜色
   *
   * @param highlight - 高亮类型
   * @returns CSS 颜色值
   */
  private static getHighlightColor(highlight: string): string | null {
    const colorMap: Record<string, string> = {
      yellow: '#FFFF00',
      green: '#00FF00',
      cyan: '#00FFFF',
      magenta: '#FF00FF',
      blue: '#0000FF',
      red: '#FF0000',
      darkBlue: '#000080',
      darkCyan: '#008080',
      darkGreen: '#008000',
      darkMagenta: '#800080',
      darkRed: '#800000',
      darkYellow: '#808000',
      darkGray: '#808080',
      lightGray: '#C0C0C0',
      black: '#000000'
    };

    return colorMap[highlight] || null;
  }

  /**
   * 获取文本效果
   *
   * @param props - 运行属性
   * @returns CSS text-shadow 值
   */
  private static getTextEffects(props: RunProperties): string | null {
    const shadows: string[] = [];

    if (props.shadow) {
      shadows.push('1px 1px 2px rgba(0,0,0,0.3)');
    }

    if (props.emboss) {
      shadows.push('-1px -1px 0 #fff, 1px 1px 0 #000');
    }

    if (props.imprint) {
      shadows.push('1px 1px 0 #fff, -1px -1px 0 #000');
    }

    if (props.outline) {
      shadows.push('0 0 1px currentColor');
    }

    return shadows.length > 0 ? shadows.join(', ') : null;
  }

  /**
   * 创建制表符元素
   *
   * @param tabWidth - 制表符宽度（像素）
   * @returns HTMLElement
   */
  static renderTab(tabWidth: number = 48): HTMLElement {
    const span = document.createElement('span');
    span.className = 'docx-tab';
    span.style.display = 'inline-block';
    span.style.width = `${tabWidth}px`;
    span.textContent = '\t';
    return span;
  }

  /**
   * 创建换行符元素
   *
   * @param breakType - 换行类型
   * @returns HTMLElement
   */
  static renderBreak(breakType?: string): HTMLElement {
    if (breakType === 'page') {
      const div = document.createElement('div');
      div.className = 'docx-page-break';
      div.style.pageBreakAfter = 'always';
      return div;
    }

    if (breakType === 'column') {
      const div = document.createElement('div');
      div.className = 'docx-column-break';
      div.style.breakAfter = 'column';
      return div;
    }

    // 普通换行
    const br = document.createElement('br');
    br.className = 'docx-break';
    return br;
  }
}
