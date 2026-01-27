/**
 * 绘图解析器
 *
 * 解析 XLSX 文件中的绘图 XML (xl/drawings/drawing*.xml)
 */
import { XmlUtils, DrawingMLParser } from '@ai-space/shared';
import {
  OfficeImage,
  OfficeShape,
  OfficeConnector,
  OfficeGroupShape,
  OfficeAnchor,
} from '../types';
import { Logger } from '../utils/Logger';

const log = Logger.createTagged('DrawingParser');

/**
 * 图表引用信息
 */
export interface ChartReference {
  /** 图表 ID */
  id: string;
  /** 图表名称 */
  name?: string;
  /** 图表关系 ID (r:id)，指向图表 XML */
  chartId: string;
  /** 锚点信息 */
  anchor: OfficeAnchor;
}

/**
 * 绘图解析器类
 */
export class DrawingParser {
  /**
   * 解析绘图 XML
   *
   * @param drawingXml - 绘图 XML 内容
   * @returns 解析后的绘图对象（图片、形状、连接符、组合、图表引用）
   */
  static parse(drawingXml: string): {
    images: OfficeImage[];
    shapes: OfficeShape[];
    connectors: OfficeConnector[];
    groupShapes: OfficeGroupShape[];
    chartRefs: ChartReference[];
  } {
    log.group('DrawingParser.parse');
    log.debug('XML 长度:', drawingXml.length);

    const doc = XmlUtils.parse(drawingXml);
    const images: OfficeImage[] = [];
    const shapes: OfficeShape[] = [];
    const connectors: OfficeConnector[] = [];
    const groupShapes: OfficeGroupShape[] = [];
    const chartRefs: ChartReference[] = [];

    /**
     * 递归处理元素
     * @param node - 当前节点
     * @param anchor - 锚点信息
     * @param target - 目标数组容器
     */
    const processElement = (
      node: Element,
      anchor: OfficeAnchor,
      target: {
        images: OfficeImage[];
        shapes: OfficeShape[];
        connectors: OfficeConnector[];
        groupShapes: OfficeGroupShape[];
      },
    ): void => {
      // 1. 组合形状 (xdr:grpSp)
      const grpSp =
        XmlUtils.query(node, 'xdr\\:grpSp') || (node.tagName === 'xdr:grpSp' ? node : null);
      if (grpSp) {
        log.debug('发现组合形状', grpSp);
        const cNvPr = XmlUtils.query(grpSp, 'xdr\\:cNvPr');

        const group: OfficeGroupShape = {
          id: cNvPr?.getAttribute('id') || '0',
          name: cNvPr?.getAttribute('name') || undefined,
          anchor: anchor,
          shapes: [],
          images: [],
          connectors: [],
          groups: [],
        };

        // 遍历直接子元素
        const children = Array.from(grpSp.children) as Element[];
        children.forEach((child) => {
          // 将组合的数组作为目标传入
          processElement(child, anchor, {
            images: group.images,
            shapes: group.shapes,
            connectors: group.connectors,
            groupShapes: group.groups,
          });
        });

        target.groupShapes.push(group);
        return;
      }

      // 2. 图片 (xdr:pic)
      const pic = XmlUtils.query(node, 'xdr\\:pic') || (node.tagName === 'xdr:pic' ? node : null);
      if (pic) {
        log.debug('发现图片', pic);
        const blip = XmlUtils.query(pic, 'a\\:blip');
        const embedId = blip?.getAttribute('r:embed');
        if (embedId) {
          const cNvPr = XmlUtils.query(pic, 'xdr\\:nvPicPr xdr\\:cNvPr');
          const name = cNvPr?.getAttribute('name');

          const spPr = XmlUtils.query(pic, 'xdr\\:spPr');
          let rotation = 0;
          let stroke;
          let effects;
          let geometry;

          if (spPr) {
            const style = DrawingMLParser.parseShapeProperties(spPr);
            log.debug(`图片 [${name}] 属性:`, style);
            if (style.rotation) rotation = style.rotation;

            const xfrm = XmlUtils.query(spPr, 'a\\:xfrm');
            if (xfrm && xfrm.getAttribute('rot')) {
              rotation = parseInt(xfrm.getAttribute('rot')!, 10) / 60000;
            }

            stroke = style.stroke;
            effects = style.effects;
            geometry = style.geometry;

            // 如果 adjustValues 包含圆角相关值，设置 geometry 为 roundRect
            if (!geometry || geometry === 'rect') {
              const adj = style.adjustValues;
              if (adj && (adj['adj'] || adj['adj1'] || adj['val'])) {
                geometry = 'roundRect';
                log.debug(`图片 [${name}] 从 adjustValues 推断为 roundRect`);
              }
            }
          }

          target.images.push({
            id: cNvPr?.getAttribute('id') || '0',
            embedId,
            name: name || undefined,
            src: '',
            rotation,
            anchor: anchor,
            stroke,
            effects,
            geometry,
            flipH: (spPr && DrawingMLParser.parseShapeProperties(spPr).flipH) || undefined,
            flipV: (spPr && DrawingMLParser.parseShapeProperties(spPr).flipV) || undefined,
            adjustValues:
              (spPr && DrawingMLParser.parseShapeProperties(spPr).adjustValues) || undefined,
          });
        }
        return;
      }

      // 3. 形状 (xdr:sp)
      const sp = XmlUtils.query(node, 'xdr\\:sp') || (node.tagName === 'xdr:sp' ? node : null);
      if (sp) {
        log.debug('发现形状', sp);
        const cNvPr = XmlUtils.query(sp, 'xdr\\:cNvPr');
        const id = cNvPr?.getAttribute('id') || '0';
        const name = cNvPr?.getAttribute('name');

        const spPr = XmlUtils.query(sp, 'xdr\\:spPr');
        const styleNode = XmlUtils.query(sp, 'xdr\\:style');

        if (spPr) {
          const props = DrawingMLParser.parseShapeProperties(spPr);
          log.debug(`形状 [${name}] 属性:`, props);
          const txBodyNode = XmlUtils.query(sp, 'xdr\\:txBody');
          const txBody = txBodyNode ? DrawingMLParser.parseTextBody(txBodyNode) : undefined;
          const style = styleNode ? DrawingMLParser.parseStyle(styleNode) : undefined;

          target.shapes.push({
            id,
            name: name || undefined,
            type: props.geometry || 'rect',
            fill: props.fill,
            stroke: props.stroke,
            geometry: props.geometry,
            path: props.path,
            pathWidth: props.pathWidth,
            pathHeight: props.pathHeight,
            effects: props.effects,
            style,
            rotation: props.rotation || 0,
            flipH: props.flipH,
            flipV: props.flipV,
            adjustValues: props.adjustValues,
            textBody: txBody,
            anchor: anchor,
          });
        }
        return;
      }

      // 4. 连接符 (xdr:cxnSp)
      const cxnSp =
        XmlUtils.query(node, 'xdr\\:cxnSp') || (node.tagName === 'xdr:cxnSp' ? node : null);
      if (cxnSp) {
        log.debug('发现连接符', cxnSp);
        const cNvPr = XmlUtils.query(cxnSp, 'xdr\\:cNvPr');
        const id = cNvPr?.getAttribute('id') || '0';
        const name = cNvPr?.getAttribute('name');

        const spPr = XmlUtils.query(cxnSp, 'xdr\\:spPr');
        if (spPr) {
          const props = DrawingMLParser.parseShapeProperties(spPr);
          log.debug(`连接符 [${name}] 属性:`, props);
          const styleNode = XmlUtils.query(cxnSp, 'xdr\\:style');
          const style = styleNode ? DrawingMLParser.parseStyle(styleNode) : undefined;

          target.connectors.push({
            id,
            name: name || undefined,
            type: props.geometry || 'line',
            geometry: props.geometry,
            stroke: props.stroke,
            style,
            startArrow: props.stroke?.headEnd?.type || 'none',
            endArrow: props.stroke?.tailEnd?.type || 'none',
            anchor: anchor,
            rotation: props.rotation || 0,
            flipH: props.flipH,
            flipV: props.flipV,
            adjustValues: props.adjustValues,
          });
        }
        return;
      }

      // 5. 图形框架 (xdr:graphicFrame) - 用于图表
      const graphicFrame =
        XmlUtils.query(node, 'xdr\\:graphicFrame') ||
        (node.tagName === 'xdr:graphicFrame' ? node : null);
      if (graphicFrame) {
        log.debug('发现图形框架 (图表)', graphicFrame);
        const cNvPr = XmlUtils.query(graphicFrame, 'xdr\\:nvGraphicFramePr xdr\\:cNvPr');
        const id = cNvPr?.getAttribute('id') || '0';
        const name = cNvPr?.getAttribute('name');

        // 查找图表引用
        const chart = XmlUtils.query(graphicFrame, 'a\\:graphic a\\:graphicData c\\:chart');
        if (chart) {
          const chartId = chart.getAttribute('r:id');
          if (chartId) {
            chartRefs.push({
              id,
              name: name || undefined,
              chartId,
              anchor,
            });
            log.debug(`发现图表引用: ${name} -> ${chartId}`);
          }
        }
        return;
      }
    };

    /**
     * 主锚点处理器
     * @param anchor - 锚点元素
     */
    const processAnchor = (anchor: Element) => {
      const isTwoCell = anchor.tagName.includes('twoCellAnchor');
      const isOneCell = anchor.tagName.includes('oneCellAnchor');
      const type: OfficeAnchor['type'] = isTwoCell ? 'twoCell' : isOneCell ? 'oneCell' : 'absolute';

      const from = this.parseAnchor(XmlUtils.query(anchor, 'xdr\\:from'));
      const to = this.parseAnchor(XmlUtils.query(anchor, 'xdr\\:to'));
      const ext = this.parseExt(XmlUtils.query(anchor, 'xdr\\:ext'));

      if (!from) return;

      const anchorObj: OfficeAnchor = {
        type,
        from,
        to: to || undefined,
        ext: ext || undefined,
      };

      // 将锚点容器本身作为根节点传入查询
      // 并将主结果数组作为目标传入
      processElement(anchor, anchorObj, { images, shapes, connectors, groupShapes });
    };

    // 双单元格锚点
    const twoCellAnchors = XmlUtils.queryAll(doc, 'xdr\\:twoCellAnchor');
    log.debug('双单元格锚点数量:', twoCellAnchors.length);
    twoCellAnchors.forEach((anchor: Element) => processAnchor(anchor));

    // 单单元格锚点
    const oneCellAnchors = XmlUtils.queryAll(doc, 'xdr\\:oneCellAnchor');
    log.debug('单单元格锚点数量:', oneCellAnchors.length);
    oneCellAnchors.forEach((anchor: Element) => processAnchor(anchor));

    log.debug('解析结果:', { images, shapes, connectors, groupShapes, chartRefs });
    log.groupEnd();

    return { images, shapes, connectors, groupShapes, chartRefs };
  }

  /**
   * 解析锚点位置
   *
   * @param node - 锚点节点 (xdr:from 或 xdr:to)
   * @returns 锚点位置对象
   */
  private static parseAnchor(
    node: Element | null,
  ): { col: number; colOff: number; row: number; rowOff: number } | null {
    if (!node) return null;

    const col = parseInt(XmlUtils.query(node, 'xdr\\:col')?.textContent || '0', 10);
    const colOff = parseInt(XmlUtils.query(node, 'xdr\\:colOff')?.textContent || '0', 10);
    const row = parseInt(XmlUtils.query(node, 'xdr\\:row')?.textContent || '0', 10);
    const rowOff = parseInt(XmlUtils.query(node, 'xdr\\:rowOff')?.textContent || '0', 10);

    return {
      col,
      colOff,
      row,
      rowOff,
    };
  }

  /**
   * 解析扩展尺寸
   *
   * @param node - ext 节点
   * @returns 尺寸对象
   */
  private static parseExt(node: Element | null) {
    if (!node) return null;
    return {
      cx: parseInt(node.getAttribute('cx') || '0', 10),
      cy: parseInt(node.getAttribute('cy') || '0', 10),
    };
  }
}
