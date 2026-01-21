/**
 * Office Math (OMath) 模块
 *
 * 提供 OOXML 数学公式的解析与渲染功能
 *
 * @example
 * ```typescript
 * import { OMathParser, OMathRenderer } from '@ai-space/shared';
 *
 * // 解析 XML 中的数学公式元素
 * const oMathElement = document.querySelector('m\\:oMath');
 * const node = OMathParser.parse(oMathElement);
 *
 * // 渲染为 HTML
 * if (node) {
 *   const html = OMathRenderer.render(node);
 *   container.appendChild(html);
 * }
 * ```
 */

// 类型导出
export * from './types';

// 字体工具导出
export * from './fonts';

// 解析器导出
export { OMathParser } from './OMathParser';

// 渲染器导出
export { OMathRenderer } from './OMathRenderer';
