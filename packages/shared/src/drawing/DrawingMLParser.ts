
import { XmlUtils } from '../xml';
import { OfficeShape, OfficeFill, OfficeStroke, OfficeTextBody, OfficeParagraph, OfficeRun } from './types';

export class DrawingMLParser {
    /**
     * Parses the Shape Properties (spPr) element.
     * Namespaces: usually 'a' (http://schemas.openxmlformats.org/drawingml/2006/main)
     */
    static parseShapeProperties(node: Element): { fill?: OfficeFill, stroke?: OfficeStroke, geometry?: string, rotation?: number, flipH?: boolean, flipV?: boolean } {
        const result: any = {};

        // 1. Geometry (prstGeom)
        const prstGeom = XmlUtils.query(node, 'a\\:prstGeom');
        if (prstGeom) {
            result.geometry = prstGeom.getAttribute('prst') || 'rect';
        }

        // 2. Transform (xfrm)
        const xfrm = XmlUtils.query(node, 'a\\:xfrm');
        if (xfrm) {
            const rot = parseInt(xfrm.getAttribute('rot') || '0', 10);
            if (rot !== 0) result.rotation = rot / 60000;
            if (xfrm.getAttribute('flipH') === '1') result.flipH = true;
            if (xfrm.getAttribute('flipV') === '1') result.flipV = true;
        }

        // 3. Fill
        const solidFill = XmlUtils.query(node, 'a\\:solidFill');
        const pattFill = XmlUtils.query(node, 'a\\:pattFill');
        const gradFill = XmlUtils.query(node, 'a\\:gradFill');
        const noFill = XmlUtils.query(node, 'a\\:noFill');

        if (solidFill) {
            result.fill = {
                type: 'solid',
                color: this.parseColor(solidFill)
            };
        } else if (pattFill) {
             const fgClr = XmlUtils.query(pattFill, 'a\\:fgClr');
             const bgClr = XmlUtils.query(pattFill, 'a\\:bgClr');
             result.fill = {
                 type: 'pattern',
                 patternType: pattFill.getAttribute('prst') || undefined,
                 color: fgClr ? this.parseColor(fgClr) : undefined,
                 bgColor: bgClr ? this.parseColor(bgClr) : undefined
             };
        } else if (gradFill) {
            // Simplification: use the last stop color or first?
            // Or just mark as gradient.
            // Let's try to get the first GS color as fallback
            const gs = XmlUtils.query(gradFill, 'a\\:gsLst a\\:gs');
            result.fill = {
                type: 'gradient',
                color: gs ? this.parseColor(gs) : undefined
            };
        } else if (noFill) {
             result.fill = { type: 'none' };
        }

        // 4. Stroke (ln)
        const ln = XmlUtils.query(node, 'a\\:ln');
        if (ln) {
            const w = parseInt(ln.getAttribute('w') || '0', 10);
            const lnSolidFill = XmlUtils.query(ln, 'a\\:solidFill');
            const lnGradFill = XmlUtils.query(ln, 'a\\:gradFill');
            
            let color = undefined;
            if (lnSolidFill) color = this.parseColor(lnSolidFill);
            else if (lnGradFill) {
                const gs = XmlUtils.query(lnGradFill, 'a\\:gsLst a\\:gs');
                color = gs ? this.parseColor(gs) : undefined;
            }

            result.stroke = {
                 width: w / 12700, // pt
                 color,
            };
            
            const prstDash = XmlUtils.query(ln, 'a\\:prstDash');
            if (prstDash) {
                result.stroke.dashStyle = prstDash.getAttribute('val') || 'solid';
            }
            
            const headEnd = XmlUtils.query(ln, 'a\\:headEnd');
            if (headEnd) result.stroke.headEnd = { type: headEnd.getAttribute('type') || 'none' };
            const tailEnd = XmlUtils.query(ln, 'a\\:tailEnd');
            if (tailEnd) result.stroke.tailEnd = { type: tailEnd.getAttribute('type') || 'none' };
        }

        return result;
    }

    static parseTextBody(node: Element): OfficeTextBody | undefined {
         if (!node) return undefined;
         const paragraphs: OfficeParagraph[] = [];
         
         const pNodes = XmlUtils.queryAll(node, 'a\\:p');
         pNodes.forEach(p => {
             const runs: OfficeRun[] = [];
             const rNodes = XmlUtils.queryAll(p, 'a\\:r');
             rNodes.forEach(r => {
                 const t = XmlUtils.query(r, 'a\\:t')?.textContent || '';
                 const rPr = XmlUtils.query(r, 'a\\:rPr');
                 const run: OfficeRun = { text: t };
                 if (rPr) {
                     if (rPr.getAttribute('b') === '1') run.bold = true;
                     if (rPr.getAttribute('i') === '1') run.italic = true;
                     const sz = parseInt(rPr.getAttribute('sz') || '0', 10);
                     if (sz > 0) run.size = sz / 100; // 100ths of pt
                     
                     // Fill in run (solidFill, pattFill etc)
                     const solidFill = XmlUtils.query(rPr, 'a\\:solidFill');
                     if (solidFill) run.color = this.parseColor(solidFill);
                     
                     // Pattern Fill in Text?
                     const pattFill = XmlUtils.query(rPr, 'a\\:pattFill');
                     if (pattFill) {
                         const fg = XmlUtils.query(pattFill, 'a\\:fgClr');
                         if (fg) run.color = this.parseColor(fg); 
                     }
                 }
                 runs.push(run);
             });
             
             // Paragraph Properties
             const pPr = XmlUtils.query(p, 'a\\:pPr');
             let alignment: any = 'left';
             if (pPr) {
                 const algn = pPr.getAttribute('algn');
                 if (algn) {
                     if (algn === 'ctr') alignment = 'center';
                     else if (algn === 'r') alignment = 'right';
                     else if (algn === 'just') alignment = 'justify';
                 }
             }
             
             paragraphs.push({
                 text: runs.map(r => r.text).join(''),
                 runs,
                 alignment
             });
         });
         
         return {
             text: paragraphs.map(p => p.text).join('\n'),
             paragraphs
         };
    }

    private static parseColor(node: Element): string | undefined {
        // srgbClr
        const srgb = XmlUtils.query(node, 'a\\:srgbClr');
        if (srgb) {
            return '#' + srgb.getAttribute('val');
        }
        
        // schemeClr
        const scheme = XmlUtils.query(node, 'a\\:schemeClr');
        if (scheme) {
             const val = scheme.getAttribute('val');
             // We return the scheme name (e.g., 'accent1') and let the app resolve it via Theme
             // Or better, return "theme:accent1".
             // For now, let's just return the raw hex if we can't resolve, but we CAN'T resolve here.
             // We need to return a marker or handle it upstream.
             // The cleanest way is to return a special string like "theme:accent1" 
             // but our type is string (Hex).
             // Let's modify the return to allow a proprietary format or just return "accent1"
             // and hope the renderer checks for #.
             return `theme:${val}`;
        }
        
        // sysClr
        const sys = XmlUtils.query(node, 'a\\:sysClr');
        if (sys) {
            return '#' + (sys.getAttribute('lastClr') || '000000');
        }

        return undefined;
    }
}
