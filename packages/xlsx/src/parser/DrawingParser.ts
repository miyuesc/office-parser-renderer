import { XmlUtils, DrawingMLParser } from '@ai-space/shared';
import { OfficeImage, OfficeShape, OfficeConnector, OfficeGroupShape } from '../types';

/**
 * 图表引用信息
 */
export interface ChartReference {
  id: string;
  name?: string;
  chartId: string; // r:id 指向 chart XML
  anchor: any;
}

export class DrawingParser {
  static parse(drawingXml: string): {
    images: OfficeImage[];
    shapes: OfficeShape[];
    connectors: OfficeConnector[];
    groupShapes: OfficeGroupShape[];
    chartRefs: ChartReference[];
  } {
    console.group('DrawingParser.parse');
    console.log('XML Length:', drawingXml.length);
    // console.log('XML Content:', drawingXml);

    const doc = XmlUtils.parse(drawingXml);
    const images: OfficeImage[] = [];
    const shapes: OfficeShape[] = [];
    const connectors: OfficeConnector[] = [];
    const groupShapes: OfficeGroupShape[] = [];
    const chartRefs: ChartReference[] = [];

    // Recursive processor for elements
    const processElement = (
      node: Element,
      anchor: any,
      target: {
        images: OfficeImage[];
        shapes: OfficeShape[];
        connectors: OfficeConnector[];
        groupShapes: OfficeGroupShape[];
      }
    ): void => {
      // 1. Group Shape (xdr:grpSp)
      const grpSp = XmlUtils.query(node, 'xdr\\:grpSp') || (node.tagName === 'xdr:grpSp' ? node : null);
      if (grpSp) {
        console.log('Found GroupShape', grpSp);
        const cNvPr = XmlUtils.query(grpSp, 'xdr\\:cNvPr');

        const group: OfficeGroupShape = {
          id: cNvPr?.getAttribute('id') || '0',
          name: cNvPr?.getAttribute('name') || undefined,
          anchor: anchor,
          shapes: [],
          images: [],
          connectors: [],
          groups: []
        };

        // Iterate immediate children
        const children = Array.from(grpSp.children) as Element[];
        children.forEach(child => {
          // Pass the group's arrays as targets
          processElement(child, anchor, {
            images: group.images,
            shapes: group.shapes,
            connectors: group.connectors,
            groupShapes: group.groups
          });
        });

        target.groupShapes.push(group);
        return;
      }

      // 2. Image (xdr:pic)
      const pic = XmlUtils.query(node, 'xdr\\:pic') || (node.tagName === 'xdr:pic' ? node : null);
      if (pic) {
        console.log('Found Image', pic);
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
            console.log(`Image [${name}] Props:`, style);
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
                console.log(`Image [${name}] inferred roundRect from adjustValues`);
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
            adjustValues: (spPr && DrawingMLParser.parseShapeProperties(spPr).adjustValues) || undefined
          });
        }
        return;
      }

      // 3. Shape (xdr:sp)
      const sp = XmlUtils.query(node, 'xdr\\:sp') || (node.tagName === 'xdr:sp' ? node : null);
      if (sp) {
        console.log('Found Shape', sp);
        const cNvPr = XmlUtils.query(sp, 'xdr\\:cNvPr');
        const id = cNvPr?.getAttribute('id') || '0';
        const name = cNvPr?.getAttribute('name');

        const spPr = XmlUtils.query(sp, 'xdr\\:spPr');
        const styleNode = XmlUtils.query(sp, 'xdr\\:style');

        if (spPr) {
          const props = DrawingMLParser.parseShapeProperties(spPr);
          console.log(`Shape [${name}] Props:`, props);
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
            anchor: anchor
          });
        }
        return;
      }

      // 4. Connector (xdr:cxnSp)
      const cxnSp = XmlUtils.query(node, 'xdr\\:cxnSp') || (node.tagName === 'xdr:cxnSp' ? node : null);
      if (cxnSp) {
        console.log('Found Connector', cxnSp);
        const cNvPr = XmlUtils.query(cxnSp, 'xdr\\:cNvPr');
        const id = cNvPr?.getAttribute('id') || '0';
        const name = cNvPr?.getAttribute('name');

        const spPr = XmlUtils.query(cxnSp, 'xdr\\:spPr');
        if (spPr) {
          const props = DrawingMLParser.parseShapeProperties(spPr);
          console.log(`Connector [${name}] Props:`, props);
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
            adjustValues: props.adjustValues
          });
        }
        return;
      }

      // 5. Graphic Frame (xdr:graphicFrame) - 用于图表
      const graphicFrame =
        XmlUtils.query(node, 'xdr\\:graphicFrame') || (node.tagName === 'xdr:graphicFrame' ? node : null);
      if (graphicFrame) {
        console.log('Found GraphicFrame (Chart)', graphicFrame);
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
              anchor
            });
            console.log(`Found Chart Reference: ${name} -> ${chartId}`);
          }
        }
        return;
      }
    };

    // Main Anchor Processor
    const processAnchor = (anchor: Element) => {
      const from = this.parseAnchor(XmlUtils.query(anchor, 'xdr\\:from'));
      const to = this.parseAnchor(XmlUtils.query(anchor, 'xdr\\:to'));
      const ext = this.parseExt(XmlUtils.query(anchor, 'xdr\\:ext'));

      if (!from) return;

      const anchorObj = { type: 'absolute', from, to, ext };

      // Pass the anchor container itself as the root node for query
      // And pass the main result arrays as targets
      processElement(anchor, anchorObj, { images, shapes, connectors, groupShapes });
    };

    // Two Cell Anchor
    const twoCellAnchors = XmlUtils.queryAll(doc, 'xdr\\:twoCellAnchor');
    console.log('twoCellAnchors:', twoCellAnchors.length);
    twoCellAnchors.forEach((anchor: Element) => processAnchor(anchor));

    // One Cell Anchor
    const oneCellAnchors = XmlUtils.queryAll(doc, 'xdr\\:oneCellAnchor');
    console.log('oneCellAnchors:', oneCellAnchors.length);
    oneCellAnchors.forEach((anchor: Element) => processAnchor(anchor));

    console.log('Parsed Results:', { images, shapes, connectors, groupShapes, chartRefs });
    console.groupEnd();

    return { images, shapes, connectors, groupShapes, chartRefs };
  }

  private static parseAnchor(
    node: Element | null
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
      rowOff
    };
  }

  private static parseExt(node: Element | null) {
    if (!node) return null;
    return {
      cx: parseInt(node.getAttribute('cx') || '0', 10),
      cy: parseInt(node.getAttribute('cy') || '0', 10)
    };
  }
}
