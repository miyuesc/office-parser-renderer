/**
 * 填充解析器
 *
 * 解析 DrawingML 中的填充定义：
 * - solidFill: 纯色填充
 * - gradFill: 渐变填充
 * - pattFill: 图案填充
 * - noFill: 无填充
 */
import { XmlUtils } from '../../xml';
import { OfficeFill } from '../types';
import { ColorParser } from './ColorParser';

export class FillParser {
  /**
   * 解析填充样式
   *
   * 按优先级顺序检查：图案填充 > 渐变填充 > 纯色填充 > 无填充
   *
   * @param node - 包含填充定义的元素节点
   * @returns 填充对象，未找到则返回 undefined
   */
  static parseFill(node: Element): OfficeFill | undefined {
    // 图案填充（最高优先级）
    const pattFill = XmlUtils.query(node, 'a\\:pattFill');
    if (pattFill) {
      const fgClr = XmlUtils.query(pattFill, 'a\\:fgClr');
      const bgClr = XmlUtils.query(pattFill, 'a\\:bgClr');
      return {
        type: 'pattern',
        pattern: {
          patternType: pattFill.getAttribute('prst') || 'pct5',
          fgColor: fgClr ? ColorParser.parseColor(fgClr) || '#000000' : '#000000',
          bgColor: bgClr ? ColorParser.parseColor(bgClr) || '#ffffff' : '#ffffff'
        }
      };
    }

    // 渐变填充
    const gradFill = XmlUtils.query(node, 'a\\:gradFill');
    if (gradFill) {
      const stops: Array<{ position: number; color: string }> = [];
      const gsLst = XmlUtils.queryAll(gradFill, 'a\\:gsLst a\\:gs');
      gsLst.forEach(gs => {
        const pos = parseInt(gs.getAttribute('pos') || '0', 10) / 100000;
        const color = ColorParser.parseColor(gs);
        if (color) stops.push({ position: pos, color });
      });

      const lin = XmlUtils.query(gradFill, 'a\\:lin');
      const path = XmlUtils.query(gradFill, 'a\\:path');

      let type: 'linear' | 'path' = 'linear';
      let angle = 0;
      if (lin) {
        // 角度单位：60000 分之一度
        const ang = parseInt(lin.getAttribute('ang') || '0', 10);
        angle = ang / 60000;
      } else if (path) {
        type = 'path';
        // path 类型属性？
      }

      return {
        type: 'gradient',
        gradient: {
          type,
          angle,
          stops
        }
      };
    }

    // 纯色填充
    const solidFill = XmlUtils.query(node, 'a\\:solidFill');
    if (solidFill) {
      return {
        type: 'solid',
        color: ColorParser.parseColor(solidFill)
      };
    }

    // 无填充
    if (XmlUtils.query(node, 'a\\:noFill')) {
      return { type: 'none' };
    }

    return undefined;
  }
}
