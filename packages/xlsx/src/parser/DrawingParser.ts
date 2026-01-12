
import { XmlUtils, DrawingMLParser } from '@ai-space/shared';
import { OfficeImage, OfficeShape, OfficeConnector, OfficeGroupShape } from '../types';

export class DrawingParser {
    static parse(drawingXml: string): { images: OfficeImage[], shapes: OfficeShape[], connectors: OfficeConnector[], groupShapes: OfficeGroupShape[] } {
        const doc = XmlUtils.parse(drawingXml);
        const images: OfficeImage[] = [];
        const shapes: OfficeShape[] = [];
        const connectors: OfficeConnector[] = [];
        const groupShapes: OfficeGroupShape[] = [];

        // Recursive processor for elements
        const processElement = (node: Element, anchor: any, target: { 
            images: OfficeImage[], 
            shapes: OfficeShape[], 
            connectors: OfficeConnector[], 
            groupShapes: OfficeGroupShape[] 
        }): void => {
            // 1. Group Shape (xdr:grpSp)
            const grpSp = XmlUtils.query(node, 'xdr\\:grpSp') || (node.tagName === 'xdr:grpSp' ? node : null);
            if (grpSp) { 
                const cNvPr = XmlUtils.query(grpSp, 'xdr\\:cNvPr');
                
                const group: OfficeGroupShape = {
                    id: cNvPr?.getAttribute('id') || '0',
                    name: cNvPr?.getAttribute('name'),
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
                const blip = XmlUtils.query(pic, 'a\\:blip');
                const embedId = blip?.getAttribute('r:embed');
                if (embedId) {
                    const cNvPr = XmlUtils.query(pic, 'xdr\\:nvPicPr xdr\\:cNvPr');
                    const name = cNvPr?.getAttribute('name');
                    
                    const spPr = XmlUtils.query(pic, 'xdr\\:spPr');
                    let rotation = 0;
                    if (spPr) {
                        const style = DrawingMLParser.parseShapeProperties(spPr);
                        if (style.rotation) rotation = style.rotation / 60000;
                        
                        const xfrm = XmlUtils.query(spPr, 'a\\:xfrm');
                        if (xfrm && xfrm.getAttribute('rot')) {
                            rotation = parseInt(xfrm.getAttribute('rot')!, 10) / 60000;
                        }
                    }

                    target.images.push({
                        id: cNvPr?.getAttribute('id') || '0',
                        embedId,
                        name,
                        src: '', 
                        rotation,
                        anchor: anchor 
                    });
                }
                return;
            }

            // 3. Shape (xdr:sp)
            const sp = XmlUtils.query(node, 'xdr\\:sp') || (node.tagName === 'xdr:sp' ? node : null);
            if (sp) {
                const cNvPr = XmlUtils.query(sp, 'xdr\\:cNvPr');
                const id = cNvPr?.getAttribute('id') || '0';
                const name = cNvPr?.getAttribute('name');

                const spPr = XmlUtils.query(sp, 'xdr\\:spPr');
                if (spPr) {
                    const props = DrawingMLParser.parseShapeProperties(spPr);
                    const txBody = DrawingMLParser.parseTextBody(XmlUtils.query(sp, 'xdr\\:txBody'));

                    target.shapes.push({
                        id,
                        name,
                        type: props.geometry || 'rect',
                        fill: props.fill,
                        stroke: props.stroke,
                        geometry: props.geometry, 
                        rotation: props.rotation ? props.rotation / 60000 : 0,
                        flipH: props.flipH,
                        flipV: props.flipV,
                        textBody: txBody,
                        anchor: anchor
                    });
                }
                return;
            }
            
            // 4. Connector (xdr:cxnSp)
            const cxnSp = XmlUtils.query(node, 'xdr\\:cxnSp') || (node.tagName === 'xdr:cxnSp' ? node : null);
            if (cxnSp) {
                 const cNvPr = XmlUtils.query(cxnSp, 'xdr\\:cNvPr');
                 const id = cNvPr?.getAttribute('id') || '0';
                 const name = cNvPr?.getAttribute('name');
                 
                 const spPr = XmlUtils.query(cxnSp, 'xdr\\:spPr');
                 if (spPr) {
                     const props = DrawingMLParser.parseShapeProperties(spPr);
                     
                     const ln = XmlUtils.query(spPr, 'a\\:ln');
                     let startArrow = 'none';
                     let endArrow = 'none';
                     if (ln) {
                        const head = XmlUtils.query(ln, 'a\\:headEnd');
                        const tail = XmlUtils.query(ln, 'a\\:tailEnd');
                        if (head?.getAttribute('type')) endArrow = head.getAttribute('type')!;
                        if (tail?.getAttribute('type')) startArrow = tail.getAttribute('type')!;
                     }

                     target.connectors.push({
                         id,
                         name,
                         type: props.geometry || 'line',
                         geometry: props.geometry,
                         stroke: props.stroke,
                         startArrow,
                         endArrow,
                         anchor: anchor,
                         rotation: props.rotation ? props.rotation / 60000 : 0,
                         flipH: props.flipH,
                         flipV: props.flipV
                     });
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
        twoCellAnchors.forEach((anchor: Element) => processAnchor(anchor));

        // One Cell Anchor
        const oneCellAnchors = XmlUtils.queryAll(doc, 'xdr\\:oneCellAnchor');
        oneCellAnchors.forEach((anchor: Element) => processAnchor(anchor));
        
        return { images, shapes, connectors, groupShapes };
    }

    private static parseAnchor(node: Element | null): { col: number, colOff: number, row: number, rowOff: number } | null {
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
