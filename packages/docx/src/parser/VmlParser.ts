/**
 * VML 解析器
 *
 * 解析 urn:schemas-microsoft-com:vml 命名空间的元素
 * 将 VML 形状转换为 Drawing 对象
 */

import { XmlUtils } from '@ai-space/shared';
import { UnitConverter } from '../utils/UnitConverter';
import { Logger } from '../utils/Logger';
import type { Drawing, DrawingShape, DrawingImage, PositionConfig, DrawingTextBody } from '../types';

const log = Logger.createTagged('VmlParser');

/**
 * VML 解析器类
 */
export class VmlParser {
  /**
   * 解析 VML 元素
   *
   * @param node - v:shape, v:rect, etc.
   * @returns Drawing 对象或 null
   */
  static parse(node: Element): Drawing | null {
    log.debug(`Parsing VML node: ${node.tagName}`);

    const tagName = node.tagName.toLowerCase();
    const localName = tagName.split(':').pop() || tagName;

    // 根据标签名分发处理
    switch (localName) {
      case 'shape':
      case 'rect':
      case 'oval':
      case 'roundrect':
        return this.parseShape(node, localName);
      case 'imagedata':
        // imagedata 通常嵌套在 shape 中，这里作为顶层处理的情况较少，但为了稳健性可以保留
        return null;
      default:
        log.warn(`Unsupported VML element: ${localName}`);
        return null;
    }
  }

  /**
   * 解析 VML 形状
   *
   * @param node - VML 元素
   * @param type - 形状类型
   * @returns Drawing 对象
   */
  private static parseShape(node: Element, type: string): Drawing | null {
    const id = node.getAttribute('id') || '';
    const style = node.getAttribute('style') || '';
    const styles = this.parseStyle(style);

    // 计算尺寸 (EMU)
    // 如果样式中有 width/height，优先使用
    // 否则尝试 coordsize
    let cx = 0;
    let cy = 0;

    if (styles.width) cx = UnitConverter.pointsToEmu(parseFloat(styles.width));
    if (styles.height) cy = UnitConverter.pointsToEmu(parseFloat(styles.height));

    // 如果没有样式尺寸，尝试使用 coordsize (通常 coordsize 定义坐标空间，而不是物理尺寸，物理尺寸通常在 style 中)
    // 但为了 fallback
    if (cx === 0 || cy === 0) {
      const coordsize = node.getAttribute('coordsize');
      if (coordsize) {
        const parts = coordsize.split(',');
        if (parts.length === 2) {
          // coordsize 是逻辑单位，需要结合 coordorigin 和 style 才能准确映射
          // 这里暂时作为备选，如果有 style.width/height 最好
        }
      }
    }

    // 解析填充
    // VML fill color usually in 'fillcolor' attribute or v:fill child
    let fillColor = node.getAttribute('fillcolor');
    const fillNode = XmlUtils.query(node, 'v\\:fill, fill');
    if (fillNode) {
      const color = fillNode.getAttribute('color');
      if (color) fillColor = color;
    }

    // 解析描边
    let strokeColor = node.getAttribute('strokecolor');
    let strokeWeight = node.getAttribute('strokeweight'); // e.g. "0.75pt"
    const strokeNode = XmlUtils.query(node, 'v\\:stroke, stroke');
    if (strokeNode) {
      const color = strokeNode.getAttribute('color');
      if (color) strokeColor = color;
      const weight = strokeNode.getAttribute('weight');
      if (weight) strokeWeight = weight;
    }

    // 构建 DrawingShape
    // 将 VML 类型映射到我们支持的 geometry
    let geometry = 'rect';
    if (type === 'oval') geometry = 'ellipse';
    if (type === 'roundrect') geometry = 'roundRect';
    // for 'shape', logic is more complex (path parsing), fallback to rect for now if no path

    const shape: DrawingShape = {
      id,
      cx,
      cy,
      geometry,
      fill: fillColor ? { type: 'solid', color: this.normalizeColor(fillColor) } : undefined,
      stroke: strokeColor
        ? {
            color: this.normalizeColor(strokeColor),
            width: strokeWeight ? UnitConverter.pointsToEmu(parseFloat(strokeWeight)) : undefined
          }
        : undefined
    };

    // 检查是否有文本框 v:textbox
    const textbox = XmlUtils.query(node, 'v\\:textbox, textbox');
    if (textbox) {
      // v:textbox 通常包含 w:txbxContent
      const txbxContent = XmlUtils.query(textbox, 'w\\:txbxContent, txbxContent');
      if (txbxContent) {
        // 这里我们暂且只提取纯文本，后续需要ParagraphParser递归支持
        // 但 DrawingShape.textBody 目前结构比较简单
        const textContent = txbxContent.textContent || '';
        shape.textBody = {
          text: textContent,
          paragraphs: [] // Ideally parse paragraphs
        };
      }
    }

    // 检查是否有图片 v:imagedata
    const imagedata = XmlUtils.query(node, 'v\\:imagedata, imagedata');
    if (imagedata) {
      const rId = imagedata.getAttribute('r:id') || imagedata.getAttribute('o:relid');
      if (rId) {
        // 如果是图片，返回 DrawingImage
        return {
          type: 'drawing',
          drawingType: 'anchor', // VML usually is absolute/anchor
          image: {
            embedId: rId,
            cx,
            cy
          }
        };
      }
    }

    return {
      type: 'drawing',
      drawingType: 'anchor', // VML default to anchor usually
      shape
    };
  }

  /**
   * 解析 CSS 样式字符串
   * @param styleStr
   */
  private static parseStyle(styleStr: string): Record<string, string> {
    const styles: Record<string, string> = {};
    styleStr.split(';').forEach(part => {
      const [key, value] = part.split(':');
      if (key && value) {
        styles[key.trim()] = value.trim();
      }
    });
    return styles;
  }

  /**
   * 规范化颜色值
   * VML colors can be names (red, blue) or hex (#f00) or decimal
   */
  private static normalizeColor(color: string): string {
    if (color.startsWith('#')) return color.substring(1);
    // TODO: Handle color names map if needed
    return color;
  }
}
