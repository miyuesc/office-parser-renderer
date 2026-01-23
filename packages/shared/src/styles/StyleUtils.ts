/**
 * 样式工具类
 *
 * 提供统一的样式设置方法，减少重复代码
 */

/**
 * 样式工具类
 */
export class StyleUtils {
  /**
   * 设置绝对定位
   *
   * @param el - 目标元素
   * @param top - 顶部偏移（可选）
   * @param left - 左侧偏移（可选）
   */
  static setAbsolutePosition(el: HTMLElement, top?: number | string, left?: number | string): void {
    el.style.position = 'absolute';
    if (top !== undefined) {
      el.style.top = typeof top === 'number' ? `${top}px` : top;
    }
    if (left !== undefined) {
      el.style.left = typeof left === 'number' ? `${left}px` : left;
    }
  }

  /**
   * 设置尺寸
   *
   * @param el - 目标元素
   * @param width - 宽度
   * @param height - 高度
   * @param unit - 单位（默认 px）
   */
  static setSize(el: HTMLElement, width: number | string, height: number | string, unit: string = 'px'): void {
    el.style.width = typeof width === 'number' ? `${width}${unit}` : width;
    el.style.height = typeof height === 'number' ? `${height}${unit}` : height;
  }

  /**
   * 设置 Flex 容器
   *
   * @param el - 目标元素
   * @param direction - 方向（row | column）
   * @param justify - 主轴对齐
   * @param align - 交叉轴对齐
   */
  static setFlex(el: HTMLElement, direction: 'row' | 'column' = 'row', justify?: string, align?: string): void {
    el.style.display = 'flex';
    el.style.flexDirection = direction;
    if (justify) el.style.justifyContent = justify;
    if (align) el.style.alignItems = align;
  }

  /**
   * 批量设置样式
   *
   * @param el - 目标元素
   * @param styles - 样式对象
   */
  static setStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(el.style, styles);
  }

  /**
   * 添加 CSS 类
   *
   * @param el - 目标元素
   * @param classNames - 类名列表
   */
  static addClass(el: HTMLElement, ...classNames: string[]): void {
    el.classList.add(...classNames);
  }

  /**
   * 设置 SVG 覆盖层样式
   *
   * @param svg - SVG 元素
   */
  static setSvgOverlay(svg: SVGSVGElement): void {
    svg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none';
  }

  /**
   * 设置文本容器 Flex 样式
   *
   * @param el - 目标元素
   * @param vAlign - 垂直对齐（top | middle | bottom）
   */
  static setTextContainerFlex(el: HTMLElement, vAlign: 'top' | 'middle' | 'bottom' = 'top'): void {
    el.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden';
    if (vAlign === 'middle') {
      el.style.justifyContent = 'center';
    } else if (vAlign === 'bottom') {
      el.style.justifyContent = 'flex-end';
    }
  }
}
