/**
 * 绘图元素解析器
 *
 * 解析 w:drawing 元素
 * 处理图片、形状、图表等
 */

import { XmlUtils, DrawingMLParser } from '@ai-space/shared';
import { Logger } from '../utils/Logger';
import type {
  Drawing,
  DrawingImage,
  DrawingShape,
  DrawingChart,
  AnchorPosition,
  PositionConfig,
  WrapConfig
} from '../types';

const log = Logger.createTagged('DrawingParser');

/**
 * 绘图解析器类
 */
export class DrawingParser {
  /**
   * 解析绘图元素
   *
   * @param node - w:drawing 元素
   * @returns Drawing 对象或 null
   */
  static parse(node: Element): Drawing | null {
    // 调试：输出节点信息
    log.debug(`解析 drawing 节点: tagName=${node.tagName}, children=${node.children.length}`);

    // 检查是内联绘图还是锚定绘图
    const inline = XmlUtils.query(node, 'wp\\:inline, inline');
    const anchor = XmlUtils.query(node, 'wp\\:anchor, anchor');

    log.debug(`inline=${!!inline}, anchor=${!!anchor}`);

    if (inline) {
      return this.parseInline(inline);
    } else if (anchor) {
      return this.parseAnchor(anchor);
    }

    log.warn('未知的绘图类型');
    return null;
  }

  /**
   * 解析内联绘图
   *
   * @param node - wp:inline 元素
   * @returns Drawing 对象
   */
  private static parseInline(node: Element): Drawing {
    const drawing: Drawing = {
      type: 'drawing',
      drawingType: 'inline'
    };

    // 解析尺寸
    const extent = XmlUtils.query(node, 'wp\\:extent, extent');
    const cx = extent ? parseInt(extent.getAttribute('cx') || '0', 10) : 0;
    const cy = extent ? parseInt(extent.getAttribute('cy') || '0', 10) : 0;

    // 解析描述性属性
    const docPr = XmlUtils.query(node, 'wp\\:docPr, docPr');
    if (docPr) {
      drawing.description = docPr.getAttribute('descr') || undefined;
      drawing.title = docPr.getAttribute('title') || docPr.getAttribute('name') || undefined;
    }

    // 解析图形内容
    const graphic = XmlUtils.query(node, 'a\\:graphic, graphic');
    if (graphic) {
      this.parseGraphic(graphic, drawing, cx, cy);
    }

    return drawing;
  }

  /**
   * 解析锚定绘图
   *
   * @param node - wp:anchor 元素
   * @returns Drawing 对象
   */
  private static parseAnchor(node: Element): Drawing {
    const drawing: Drawing = {
      type: 'drawing',
      drawingType: 'anchor'
    };

    // 解析尺寸
    const extent = XmlUtils.query(node, 'wp\\:extent, extent');
    const cx = extent ? parseInt(extent.getAttribute('cx') || '0', 10) : 0;
    const cy = extent ? parseInt(extent.getAttribute('cy') || '0', 10) : 0;

    // 解析描述性属性
    const docPr = XmlUtils.query(node, 'wp\\:docPr, docPr');
    if (docPr) {
      drawing.description = docPr.getAttribute('descr') || undefined;
      drawing.title = docPr.getAttribute('title') || docPr.getAttribute('name') || undefined;
    }

    // 解析锚定属性
    // TODO: 解析 simplePos, positionH, positionV, wrap 等

    // 解析图形内容
    const graphic = XmlUtils.query(node, 'a\\:graphic, graphic');
    if (graphic) {
      this.parseGraphic(graphic, drawing, cx, cy);
    }

    return drawing;
  }

  /**
   * 解析图形内容
   *
   * @param node - a:graphic 元素
   * @param drawing - Drawing 对象
   * @param cx - 宽度 (EMU)
   * @param cy - 高度 (EMU)
   */
  private static parseGraphic(node: Element, drawing: Drawing, cx: number, cy: number): void {
    const graphicData = XmlUtils.query(node, 'a\\:graphicData, graphicData');
    if (!graphicData) return;

    const uri = graphicData.getAttribute('uri') || '';

    // 根据 URI 判断图形类型
    if (uri.includes('picture')) {
      // 图片
      drawing.image = this.parsePicture(graphicData, cx, cy);
    } else if (uri.includes('chart')) {
      // 图表
      drawing.chart = this.parseChart(graphicData, cx, cy);
    } else if (uri.includes('wordprocessingShape') || uri.includes('drawingml')) {
      // 形状
      drawing.shape = this.parseShape(graphicData, cx, cy);
    } else if (uri.includes('wordprocessingGroup')) {
      // 组合，尝试解析为形状（组合中可能包含多个形状）
      drawing.shape = this.parseGroup(graphicData, cx, cy);
    } else {
      log.debug(`未知的图形类型: ${uri}`);
    }
  }

  /**
   * 解析图片
   *
   * @param node - graphicData 元素
   * @param cx - 宽度 (EMU)
   * @param cy - 高度 (EMU)
   * @returns DrawingImage 对象
   */
  private static parsePicture(node: Element, cx: number, cy: number): DrawingImage | undefined {
    // 查找 blip 元素（图片引用）
    const blip = node.querySelector('a\\:blip, blip');
    if (!blip) return undefined;

    const embedId = blip.getAttribute('r:embed') || blip.getAttribute('r:link') || '';
    if (!embedId) return undefined;

    const image: DrawingImage = {
      embedId,
      cx,
      cy
    };

    // 解析变换属性
    const xfrm = node.querySelector('a\\:xfrm, xfrm');
    if (xfrm) {
      // 旋转
      const rot = xfrm.getAttribute('rot');
      if (rot) {
        image.rotation = parseInt(rot, 10) / 60000; // 度
      }

      // 翻转
      image.flipH = xfrm.getAttribute('flipH') === '1';
      image.flipV = xfrm.getAttribute('flipV') === '1';
    }

    // 解析裁剪
    const srcRect = node.querySelector('a\\:srcRect, srcRect');
    if (srcRect) {
      image.crop = {
        left: parseInt(srcRect.getAttribute('l') || '0', 10) / 100000,
        top: parseInt(srcRect.getAttribute('t') || '0', 10) / 100000,
        right: parseInt(srcRect.getAttribute('r') || '0', 10) / 100000,
        bottom: parseInt(srcRect.getAttribute('b') || '0', 10) / 100000
      };
    }

    return image;
  }

  /**
   * 解析形状
   *
   * @param node - graphicData 元素
   * @param cx - 宽度 (EMU)
   * @param cy - 高度 (EMU)
   * @returns DrawingShape 对象
   */
  private static parseShape(node: Element, cx: number, cy: number): DrawingShape | undefined {
    // 查找形状属性
    const wsp = node.querySelector('wps\\:wsp, wsp');

    if (!wsp) {
      // 如果没有 wsp，尝试创建一个基本矩形形状作为占位符
      return {
        id: '',
        cx,
        cy,
        geometry: 'rect',
        fill: { type: 'solid', color: 'cccccc' }
      };
    }

    // 使用共享的 DrawingML 解析器
    const spPr = wsp.querySelector('wps\\:spPr, spPr');
    const txbx = wsp.querySelector('wps\\:txbx, txbx');

    const shape: DrawingShape = {
      id: '',
      cx,
      cy
    };

    // 解析形状属性
    if (spPr) {
      const props = DrawingMLParser.parseShapeProperties(spPr);
      shape.geometry = props.geometry;
      shape.path = props.path;
      shape.pathWidth = props.pathWidth;
      shape.pathHeight = props.pathHeight;
      shape.rotation = props.rotation;
      shape.flipH = props.flipH;
      shape.flipV = props.flipV;
      shape.adjustValues = props.adjustValues;

      // 转换填充和描边
      if (props.fill) {
        shape.fill = {
          type: props.fill.type || 'none',
          color: props.fill.color,
          opacity: props.fill.opacity
        };
        if (props.fill.gradient) {
          shape.fill.gradient = {
            type: props.fill.gradient.type,
            angle: props.fill.gradient.angle,
            stops: props.fill.gradient.stops || []
          };
        }
      }

      if (props.stroke) {
        shape.stroke = {
          width: props.stroke.width,
          color: props.stroke.color,
          dashStyle: props.stroke.dashStyle
        };
      }
    }

    // 解析文本框
    if (txbx) {
      const txbxContent = txbx.querySelector('w\\:txbxContent, txbxContent');
      if (txbxContent) {
        // 简单提取文本
        const textParts: string[] = [];
        const textNodes = txbxContent.querySelectorAll('w\\:t, t');
        textNodes.forEach((t: Element) => {
          textParts.push(t.textContent || '');
        });
        shape.textBody = {
          text: textParts.join(''),
          paragraphs: []
        };
      }
    }

    return shape;
  }

  /**
   * 解析组合元素
   *
   * @param node - graphicData 元素
   * @param cx - 宽度 (EMU)
   * @param cy - 高度 (EMU)
   * @returns DrawingShape 对象（组合作为整体形状的占位符）
   */
  private static parseGroup(node: Element, cx: number, cy: number): DrawingShape | undefined {
    // 组合元素 (wpg:wgp) 包含多个形状，目前简化处理为单个占位符
    // TODO: 完整实现应解析每个子形状并组合渲染
    const wgp = node.querySelector('wpg\\:wgp, wgp');

    if (wgp) {
      // 尝试提取第一个形状
      const firstWsp = wgp.querySelector('wps\\:wsp, wsp');
      if (firstWsp) {
        // 创建包含第一个形状的结果
        const spPr = firstWsp.querySelector('wps\\:spPr, spPr');
        if (spPr) {
          const props = DrawingMLParser.parseShapeProperties(spPr);
          return {
            id: '',
            cx,
            cy,
            geometry: props.geometry || 'rect',
            fill: props.fill
              ? {
                  type: props.fill.type || 'solid',
                  color: props.fill.color
                }
              : { type: 'solid', color: 'cccccc' }
          };
        }
      }
    }

    // 回退：返回一个基本占位符
    return {
      id: '',
      cx,
      cy,
      geometry: 'rect',
      fill: { type: 'solid', color: 'eeeeee' }
    };
  }

  /**
   * 解析图表
   *
   * @param node - graphicData 元素
   * @param cx - 宽度 (EMU)
   * @param cy - 高度 (EMU)
   * @returns DrawingChart 对象
   */
  private static parseChart(node: Element, cx: number, cy: number): DrawingChart | undefined {
    const chart = node.querySelector('c\\:chart, chart');
    if (!chart) return undefined;

    const rId = chart.getAttribute('r:id') || '';
    if (!rId) return undefined;

    return {
      rId,
      cx,
      cy
    };
  }

  /**
   * 解析锚定位置（用于浮动图形）
   *
   * @param node - wp:anchor 元素
   * @returns AnchorPosition 对象
   */
  static parseAnchorPosition(node: Element): AnchorPosition | undefined {
    const position: AnchorPosition = {
      horizontal: { relativeTo: 'column' },
      vertical: { relativeTo: 'paragraph' }
    };

    // 是否允许重叠
    position.allowOverlap = node.getAttribute('allowOverlap') === '1';

    // 是否在文字后面
    position.behindDoc = node.getAttribute('behindDoc') === '1';

    // Z 轴顺序
    const relativeHeight = node.getAttribute('relativeHeight');
    if (relativeHeight) {
      position.relativeHeight = parseInt(relativeHeight, 10);
    }

    // 水平位置
    const positionH = XmlUtils.query(node, 'wp\\:positionH, positionH');
    if (positionH) {
      position.horizontal = this.parsePositionConfig(positionH);
    }

    // 垂直位置
    const positionV = XmlUtils.query(node, 'wp\\:positionV, positionV');
    if (positionV) {
      position.vertical = this.parsePositionConfig(positionV);
    }

    // 文字环绕
    const wrapNone = XmlUtils.query(node, 'wp\\:wrapNone, wrapNone');
    const wrapSquare = XmlUtils.query(node, 'wp\\:wrapSquare, wrapSquare');
    const wrapTight = XmlUtils.query(node, 'wp\\:wrapTight, wrapTight');
    const wrapThrough = XmlUtils.query(node, 'wp\\:wrapThrough, wrapThrough');
    const wrapTopAndBottom = XmlUtils.query(node, 'wp\\:wrapTopAndBottom, wrapTopAndBottom');

    if (wrapNone) {
      position.wrap = { type: 'none' };
    } else if (wrapSquare) {
      position.wrap = this.parseWrapConfig(wrapSquare, 'square');
    } else if (wrapTight) {
      position.wrap = this.parseWrapConfig(wrapTight, 'tight');
    } else if (wrapThrough) {
      position.wrap = this.parseWrapConfig(wrapThrough, 'through');
    } else if (wrapTopAndBottom) {
      position.wrap = this.parseWrapConfig(wrapTopAndBottom, 'topAndBottom');
    }

    return position;
  }

  /**
   * 解析位置配置
   *
   * @param node - positionH 或 positionV 元素
   * @returns PositionConfig 对象
   */
  private static parsePositionConfig(node: Element): PositionConfig {
    const config: PositionConfig = {
      relativeTo: (node.getAttribute('relativeFrom') || 'column') as PositionConfig['relativeTo']
    };

    // 对齐方式
    const align = XmlUtils.query(node, 'wp\\:align, align');
    if (align) {
      config.align = align.textContent as PositionConfig['align'];
    }

    // 偏移量
    const posOffset = XmlUtils.query(node, 'wp\\:posOffset, posOffset');
    if (posOffset) {
      config.posOffset = parseInt(posOffset.textContent || '0', 10);
    }

    return config;
  }

  /**
   * 解析环绕配置
   *
   * @param node - 环绕元素
   * @param type - 环绕类型
   * @returns WrapConfig 对象
   */
  private static parseWrapConfig(node: Element, type: WrapConfig['type']): WrapConfig {
    return {
      type,
      distT: parseInt(node.getAttribute('distT') || '0', 10),
      distB: parseInt(node.getAttribute('distB') || '0', 10),
      distL: parseInt(node.getAttribute('distL') || '0', 10),
      distR: parseInt(node.getAttribute('distR') || '0', 10)
    };
  }
}
