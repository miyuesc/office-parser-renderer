/**
 * 对齐方式样式工具类
 *
 * 提供 OOXML 对齐方式到 CSS 对齐属性的映射
 */

// ============================================
// 水平对齐映射
// ============================================

/** OOXML 水平对齐到 CSS text-align 的映射 */
const HORIZONTAL_ALIGNMENT_MAP: Record<string, string> = {
  left: 'left',
  start: 'left',
  center: 'center',
  right: 'right',
  end: 'right',
  both: 'justify',
  justify: 'justify',
  distribute: 'justify', // CSS 无精确对应，使用 justify
  thai: 'justify' // 泰语分布对齐
};

// ============================================
// 垂直对齐映射
// ============================================

/** OOXML 垂直对齐到 CSS vertical-align 的映射 */
const VERTICAL_ALIGNMENT_MAP: Record<string, string> = {
  top: 'top',
  center: 'middle',
  bottom: 'bottom',
  baseline: 'baseline',
  auto: 'baseline'
};

// ============================================
// AlignmentStyles 类
// ============================================

/**
 * 对齐方式样式工具类
 */
export class AlignmentStyles {
  /**
   * 映射水平对齐方式到 CSS text-align 值
   *
   * @param alignment - OOXML 水平对齐类型
   * @param defaultValue - 未匹配时的默认值
   * @returns CSS text-align 值
   */
  static mapHorizontalAlignment(alignment: string, defaultValue: string = 'left'): string {
    if (!alignment) {
      return defaultValue;
    }
    return HORIZONTAL_ALIGNMENT_MAP[alignment.toLowerCase()] || defaultValue;
  }

  /**
   * 映射垂直对齐方式到 CSS vertical-align 值
   *
   * @param alignment - OOXML 垂直对齐类型
   * @param defaultValue - 未匹配时的默认值
   * @returns CSS vertical-align 值
   */
  static mapVerticalAlignment(alignment: string, defaultValue: string = 'baseline'): string {
    if (!alignment) {
      return defaultValue;
    }
    return VERTICAL_ALIGNMENT_MAP[alignment.toLowerCase()] || defaultValue;
  }

  /**
   * 获取 Flexbox 水平对齐值
   *
   * @param alignment - OOXML 水平对齐类型
   * @returns CSS justify-content 值
   */
  static getFlexJustifyContent(alignment: string): string {
    switch (alignment?.toLowerCase()) {
      case 'left':
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
      case 'end':
        return 'flex-end';
      case 'both':
      case 'justify':
      case 'distribute':
        return 'space-between';
      default:
        return 'flex-start';
    }
  }

  /**
   * 获取 Flexbox 垂直对齐值
   *
   * @param alignment - OOXML 垂直对齐类型
   * @returns CSS align-items 值
   */
  static getFlexAlignItems(alignment: string): string {
    switch (alignment?.toLowerCase()) {
      case 'top':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
      case 'baseline':
        return 'baseline';
      default:
        return 'flex-start';
    }
  }
}
