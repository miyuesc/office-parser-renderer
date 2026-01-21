/**
 * 文本样式工具类
 *
 * 提供文本装饰、高亮颜色、文本效果等样式的处理功能
 */

// ============================================
// 类型定义
// ============================================

/** 文本效果属性 */
export interface TextEffectProps {
  /** 阴影效果 */
  shadow?: boolean;
  /** 浮雕效果 */
  emboss?: boolean;
  /** 印记效果 */
  imprint?: boolean;
  /** 轮廓效果 */
  outline?: boolean;
}

// ============================================
// 下划线类型映射
// ============================================

/** 下划线类型到 CSS text-decoration 的映射 */
const UNDERLINE_STYLE_MAP: Record<string, string> = {
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

// ============================================
// 高亮颜色映射
// ============================================

/** 高亮名称到 CSS 颜色的映射 */
const HIGHLIGHT_COLOR_MAP: Record<string, string> = {
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
  black: '#000000',
  white: '#FFFFFF'
};

// ============================================
// TextStyles 类
// ============================================

/**
 * 文本样式工具类
 */
export class TextStyles {
  /**
   * 获取下划线的 CSS text-decoration 值
   *
   * @param underlineType - OOXML 下划线类型
   * @returns CSS text-decoration 值
   */
  static getTextDecoration(underlineType: string): string {
    if (!underlineType || underlineType === 'none') {
      return 'none';
    }
    return UNDERLINE_STYLE_MAP[underlineType] || 'underline';
  }

  /**
   * 获取高亮颜色的 CSS 值
   *
   * @param highlight - 高亮类型名称
   * @returns CSS 颜色值，未找到时返回 null
   */
  static getHighlightColor(highlight: string): string | null {
    if (!highlight || highlight === 'none') {
      return null;
    }
    return HIGHLIGHT_COLOR_MAP[highlight] || null;
  }

  /**
   * 获取文本效果的 CSS text-shadow 值
   *
   * @param props - 文本效果属性
   * @returns CSS text-shadow 值，无效果时返回 null
   */
  static getTextEffects(props: TextEffectProps): string | null {
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
   * 构建完整的文本装饰样式
   *
   * 合并下划线和删除线样式
   *
   * @param underline - 下划线类型
   * @param strike - 是否有删除线
   * @param dstrike - 是否有双删除线
   * @returns CSS text-decoration 值
   */
  static buildTextDecoration(underline?: string, strike?: boolean, dstrike?: boolean): string {
    const decorations: string[] = [];

    // 处理下划线
    if (underline && underline !== 'none') {
      decorations.push(this.getTextDecoration(underline));
    }

    // 处理删除线
    if (strike || dstrike) {
      decorations.push('line-through');
    }

    return decorations.length > 0 ? decorations.join(' ') : 'none';
  }

  /**
   * 获取文本垂直对齐的 CSS 值
   *
   * @param vertAlign - OOXML 垂直对齐类型
   * @returns CSS vertical-align 值
   */
  static getVerticalAlign(vertAlign: string): string | null {
    switch (vertAlign) {
      case 'superscript':
        return 'super';
      case 'subscript':
        return 'sub';
      case 'baseline':
        return 'baseline';
      default:
        return null;
    }
  }

  /**
   * 获取文本变体的 CSS 值
   *
   * @param smallCaps - 是否小型大写
   * @returns CSS font-variant 值
   */
  static getFontVariant(smallCaps: boolean): string | null {
    return smallCaps ? 'small-caps' : null;
  }

  /**
   * 获取文本转换的 CSS 值
   *
   * @param caps - 是否全大写
   * @returns CSS text-transform 值
   */
  static getTextTransform(caps: boolean): string | null {
    return caps ? 'uppercase' : null;
  }
}
