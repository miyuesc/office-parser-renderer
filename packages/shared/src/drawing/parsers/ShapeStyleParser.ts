/**
 * 形状样式解析器
 *
 * 解析 DrawingML 中的形状样式引用 (a:style)
 */
import { XmlUtils } from '../../xml';
import { OfficeStyle } from '../types';
import { ColorParser } from './ColorParser';

export class ShapeStyleParser {
  /**
   * 解析形状样式引用
   *
   * 样式引用包括：
   * - lnRef: 线条样式引用
   * - fillRef: 填充样式引用
   * - effectRef: 效果样式引用
   * - fontRef: 字体样式引用
   *
   * @param node - style 元素节点
   * @returns 样式引用对象
   */
  static parseStyle(node: Element): OfficeStyle | undefined {
    if (!node) return undefined;
    const style: OfficeStyle = {};

    // 线条样式引用
    const lnRef = XmlUtils.query(node, 'a\\:lnRef');
    if (lnRef) {
      style.lnRef = {
        idx: parseInt(lnRef.getAttribute('idx') || '0', 10),
        color: ColorParser.parseColor(lnRef)
      };
    }

    // 填充样式引用
    const fillRef = XmlUtils.query(node, 'a\\:fillRef');
    if (fillRef) {
      style.fillRef = {
        idx: parseInt(fillRef.getAttribute('idx') || '0', 10),
        color: ColorParser.parseColor(fillRef)
      };
    }

    // 效果样式引用
    const effectRef = XmlUtils.query(node, 'a\\:effectRef');
    if (effectRef) {
      style.effectRef = {
        idx: parseInt(effectRef.getAttribute('idx') || '0', 10),
        color: ColorParser.parseColor(effectRef)
      };
    }

    // 字体样式引用
    const fontRef = XmlUtils.query(node, 'a\\:fontRef');
    if (fontRef) {
      style.fontRef = {
        idx: fontRef.getAttribute('idx') || 'minor',
        color: ColorParser.parseColor(fontRef)
      };
    }

    return style;
  }
}
