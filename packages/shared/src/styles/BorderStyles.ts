/**
 * 边框样式工具类
 *
 * 提供 OOXML 边框样式到 CSS 边框属性的映射
 */

import { PT_TO_PX } from './constants';

// ============================================
// 类型定义
// ============================================

/** 边框配置 */
export interface BorderConfig {
  /** 边框类型 */
  val?: string;
  /** 边框颜色（十六进制，不含#） */
  color?: string;
  /** 边框宽度（八分之一点） */
  sz?: number;
  /** 边框样式 */
  style?: string;
}

// ============================================
// 边框样式映射
// ============================================

/** OOXML 边框类型到 CSS border-style 的映射 */
const BORDER_STYLE_MAP: Record<string, string> = {
  // 无边框
  nil: 'none',
  none: 'none',

  // 实线
  single: 'solid',
  thick: 'solid',
  double: 'double',
  triple: 'double',

  // 虚线
  dotted: 'dotted',
  dashed: 'dashed',
  dashSmallGap: 'dashed',
  dotDash: 'dashed',
  dotDotDash: 'dashed',

  // 波浪线
  wave: 'solid', // CSS 无精确对应
  doubleWave: 'double',

  // 3D 效果
  threeDEmboss: 'ridge',
  threeDEngrave: 'groove',
  outset: 'outset',
  inset: 'inset',

  // Excel 特有样式
  hair: 'solid',
  thin: 'solid',
  medium: 'solid',
  mediumDashed: 'dashed',
  mediumDashDot: 'dashed',
  mediumDashDotDot: 'dashed',
  slantDashDot: 'dashed'
};

/** 边框宽度映射 */
const BORDER_WIDTH_MAP: Record<string, string> = {
  hair: '1px',
  thin: '1px',
  medium: '2px',
  thick: '3px',
  double: '3px'
};

// ============================================
// BorderStyles 类
// ============================================

/**
 * 边框样式工具类
 */
export class BorderStyles {
  /**
   * 映射边框类型到 CSS border-style 值
   *
   * @param val - OOXML 边框类型
   * @returns CSS border-style 值
   */
  static mapBorderStyle(val: string): string {
    if (!val) {
      return 'none';
    }
    return BORDER_STYLE_MAP[val.toLowerCase()] || 'solid';
  }

  /**
   * 根据边框类型获取边框宽度
   *
   * @param val - OOXML 边框类型
   * @param sz - 边框宽度（八分之一点）
   * @returns CSS 宽度值
   */
  static getBorderWidth(val: string, sz?: number): string {
    // 如果有明确的宽度值，使用它
    if (sz !== undefined && sz > 0) {
      // 八分之一点转像素
      const px = (sz / 8) * PT_TO_PX;
      return `${Math.max(1, Math.round(px))}px`;
    }

    // 根据边框类型获取预设宽度
    if (val) {
      const width = BORDER_WIDTH_MAP[val.toLowerCase()];
      if (width) {
        return width;
      }
    }

    return '1px';
  }

  /**
   * 格式化完整的边框 CSS 值
   *
   * @param border - 边框配置
   * @returns CSS border 属性值（如 "1px solid #000000"）
   */
  static formatBorder(border: BorderConfig): string {
    if (!border || border.val === 'nil' || border.val === 'none') {
      return 'none';
    }

    const width = this.getBorderWidth(border.val || '', border.sz);
    const style = this.mapBorderStyle(border.val || 'single');
    const color = border.color && border.color !== 'auto' ? `#${border.color}` : '#000000';

    return `${width} ${style} ${color}`;
  }

  /**
   * 从边框配置对象生成 CSS 样式对象
   *
   * @param borders - 边框配置对象（包含 top, right, bottom, left）
   * @returns CSS 样式对象
   */
  static getBorderCssObject(borders: {
    top?: BorderConfig;
    right?: BorderConfig;
    bottom?: BorderConfig;
    left?: BorderConfig;
  }): Record<string, string> {
    const css: Record<string, string> = {};

    if (borders.top && borders.top.val !== 'nil') {
      css.borderTop = this.formatBorder(borders.top);
    }

    if (borders.right && borders.right.val !== 'nil') {
      css.borderRight = this.formatBorder(borders.right);
    }

    if (borders.bottom && borders.bottom.val !== 'nil') {
      css.borderBottom = this.formatBorder(borders.bottom);
    }

    if (borders.left && borders.left.val !== 'nil') {
      css.borderLeft = this.formatBorder(borders.left);
    }

    return css;
  }
}
