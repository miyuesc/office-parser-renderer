
import { XmlUtils } from '../xml';
import { OfficeShape, OfficeFill, OfficeStroke, OfficeTextBody, OfficeParagraph, OfficeRun, OfficeEffect, OfficeStyle } from './types';


export class DrawingMLParser {
    /**
     * Parses the Shape Properties (spPr) element.
     * Namespaces: usually 'a' (http://schemas.openxmlformats.org/drawingml/2006/main)
     */
    static parseShapeProperties(node: Element): { fill?: OfficeFill, stroke?: OfficeStroke, geometry?: string, path?: string, rotation?: number, flipH?: boolean, flipV?: boolean, effects?: OfficeEffect[] } {
        const result: any = {};

        const xfrm = XmlUtils.query(node, 'a\\:xfrm');
        if (xfrm) {
            const rot = parseInt(xfrm.getAttribute('rot') || '0', 10);
            if (rot) result.rotation = rot / 60000;
            if (xfrm.getAttribute('flipH') === '1') result.flipH = true;
            if (xfrm.getAttribute('flipV') === '1') result.flipV = true;
        }

        const prstGeom = XmlUtils.query(node, 'a\\:prstGeom');
        if (prstGeom) {
            result.geometry = prstGeom.getAttribute('prst');
        } else {
             const custGeom = XmlUtils.query(node, 'a\\:custGeom');
             if (custGeom) {
                 result.geometry = 'custom';
                 result.path = this.parseCustomGeometry(custGeom);
             }
        }

        result.fill = this.parseFill(node);

        const ln = XmlUtils.query(node, 'a\\:ln');
        if (ln) {
            const w = parseInt(ln.getAttribute('w') || '0', 10);
            
            let color;
            const lnFill = this.parseFill(ln);
            if (lnFill && lnFill.type === 'solid') color = lnFill.color;

            result.stroke = {
                 width: w,
                 color,
                 gradient: (lnFill && lnFill.type === 'gradient') ? lnFill.gradient : undefined,
                 dashStyle: XmlUtils.query(ln, 'a\\:prstDash')?.getAttribute('val') || 'solid',
                 join: XmlUtils.query(ln, 'a\\:round') ? 'round' : (XmlUtils.query(ln, 'a\\:bevel') ? 'bevel' : 'miter'),
                 cap: XmlUtils.query(ln, 'a\\:rnd') ? 'rnd' : (XmlUtils.query(ln, 'a\\:sq') ? 'sq' : 'flat'),
            };
            
            const headEnd = XmlUtils.query(ln, 'a\\:headEnd');
            if (headEnd) result.stroke.headEnd = { type: headEnd.getAttribute('type') || 'none' };
            const tailEnd = XmlUtils.query(ln, 'a\\:tailEnd');
            if (tailEnd) result.stroke.tailEnd = { type: tailEnd.getAttribute('type') || 'none' };
        }

        // 5. Effects
        const effectLst = XmlUtils.query(node, 'a\\:effectLst');
        if (effectLst) {
            result.effects = this.parseEffects(effectLst);
        }

        return result;
    }

    static parseStyle(node: Element): OfficeStyle | undefined {
        if (!node) return undefined;
        const style: OfficeStyle = {};
        
        const lnRef = XmlUtils.query(node, 'a\\:lnRef');
        if (lnRef) {
            style.lnRef = { 
                idx: parseInt(lnRef.getAttribute('idx') || '0', 10),
                color: this.parseColor(lnRef)
            };
        }
        
        const fillRef = XmlUtils.query(node, 'a\\:fillRef');
        if (fillRef) {
            style.fillRef = { 
                idx: parseInt(fillRef.getAttribute('idx') || '0', 10),
                color: this.parseColor(fillRef)
            };
        }
        
        const effectRef = XmlUtils.query(node, 'a\\:effectRef');
        if (effectRef) {
            style.effectRef = { 
                idx: parseInt(effectRef.getAttribute('idx') || '0', 10),
                color: this.parseColor(effectRef)
            };
        }
        
        const fontRef = XmlUtils.query(node, 'a\\:fontRef');
        if (fontRef) {
            style.fontRef = { 
                idx: fontRef.getAttribute('idx') || 'minor',
                color: this.parseColor(fontRef)
            };
        }
        
        return style;
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
                     if (rPr.getAttribute('u') === 'sng') run.underline = 'sng';
                     if (rPr.getAttribute('strike') !== 'noStrike' && rPr.getAttribute('strike')) run.strike = 'sngStrike';
                     
                     const sz = parseInt(rPr.getAttribute('sz') || '0', 10);
                     if (sz > 0) run.size = sz / 100; // 100ths of pt
                     
                     const fill = this.parseFill(rPr);
                     if (fill) {
                         run.fill = fill;
                         if (fill.type === 'solid') run.color = fill.color;
                     }

                     const effectLst = XmlUtils.query(rPr, 'a\\:effectLst');
                     if (effectLst) {
                         run.effects = this.parseEffects(effectLst);
                     }
                     
                     const baseline = parseInt(rPr.getAttribute('baseline') || '0', 10);
                     if (baseline !== 0) run.baseline = baseline / 1000; // %
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

    private static parseFill(node: Element): OfficeFill | undefined {
        // Solid Fill
        const solidFill = XmlUtils.query(node, 'a\\:solidFill');
        if (solidFill) {
            return {
                type: 'solid',
                color: this.parseColor(solidFill)
            };
        }

        // Gradient Fill
        const gradFill = XmlUtils.query(node, 'a\\:gradFill');
        if (gradFill) {
            const stops: Array<{position: number, color: string}> = [];
            const gsLst = XmlUtils.queryAll(gradFill, 'a\\:gsLst a\\:gs');
            gsLst.forEach(gs => {
                const pos = parseInt(gs.getAttribute('pos') || '0', 10) / 100000;
                const color = this.parseColor(gs);
                if (color) stops.push({ position: pos, color });
            });

            const lin = XmlUtils.query(gradFill, 'a\\:lin');
            const path = XmlUtils.query(gradFill, 'a\\:path');
            
            let type: 'linear' | 'path' = 'linear';
            let angle = 0;
            if (lin) {
                 const ang = parseInt(lin.getAttribute('ang') || '0', 10);
                 angle = ang / 60000;
            } else if (path) {
                type = 'path';
                // path type attribute?
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

        // Pattern Fill
        const pattFill = XmlUtils.query(node, 'a\\:pattFill');
        if (pattFill) {
             const fgClr = XmlUtils.query(pattFill, 'a\\:fgClr');
             const bgClr = XmlUtils.query(pattFill, 'a\\:bgClr');
             return {
                 type: 'pattern',
                 pattern: {
                     patternType: pattFill.getAttribute('prst') || 'pct5',
                     fgColor: fgClr ? this.parseColor(fgClr) || '#000000' : '#000000',
                     bgColor: bgClr ? this.parseColor(bgClr) || '#ffffff' : '#ffffff'
                 }
             };
        }

        // No Fill
        if (XmlUtils.query(node, 'a\\:noFill')) {
             return { type: 'none' };
        }
        
        return undefined;
    }

    private static parseEffects(effectLst: Element): OfficeEffect[] {
        const effects: OfficeEffect[] = [];

        // Outer Shadow
        const outerShdw = XmlUtils.query(effectLst, 'a\\:outerShdw');
        if (outerShdw) {
            effects.push({
                type: 'outerShadow',
                blur: parseInt(outerShdw.getAttribute('blurRad') || '0', 10) / 12700,
                dist: parseInt(outerShdw.getAttribute('dist') || '0', 10) / 12700,
                dir: parseInt(outerShdw.getAttribute('dir') || '0', 10) / 60000,
                color: this.parseColor(outerShdw)
            });
        }
        
        // Glow
        const glow = XmlUtils.query(effectLst, 'a\\:glow');
        if (glow) {
            effects.push({
                type: 'glow',
                radius: parseInt(glow.getAttribute('rad') || '0', 10) / 12700,
                color: this.parseColor(glow)
            });
        }
        
        // Inner Shadow (basic support)
        const innerShdw = XmlUtils.query(effectLst, 'a\\:innerShdw');
        if (innerShdw) {
            effects.push({
                type: 'innerShadow',
                blur: parseInt(innerShdw.getAttribute('blurRad') || '0', 10) / 12700,
                dist: parseInt(innerShdw.getAttribute('dist') || '0', 10) / 12700,
                dir: parseInt(innerShdw.getAttribute('dir') || '0', 10) / 60000,
                color: this.parseColor(innerShdw)
            });
        }

        return effects;
    }

    private static parseCustomGeometry(custGeom: Element): string {
        // Simplified path parser for custGeom -> pathLst -> path
        const pathLst = XmlUtils.query(custGeom, 'a\\:pathLst');
        if (!pathLst) return '';

        let d = '';
        const paths = XmlUtils.queryAll(pathLst, 'a\\:path');
        paths.forEach(p => {
             const w = parseInt(p.getAttribute('w') || '0', 10);
             const h = parseInt(p.getAttribute('h') || '0', 10);
             // We can store w/h to normalize later if needed.
             // For now, we accumulate raw path commands.
             
             Array.from(p.children).forEach(cmd => {
                 const tagName = cmd.tagName.split(':').pop(); // remove prefix
                 switch (tagName) {
                     case 'moveTo': {
                         const pt = XmlUtils.query(cmd, 'a\\:pt');
                         if (pt) d += `M ${pt.getAttribute('x')} ${pt.getAttribute('y')} `;
                         break;
                     }
                     case 'lnTo': {
                         const pt = XmlUtils.query(cmd, 'a\\:pt');
                         if (pt) d += `L ${pt.getAttribute('x')} ${pt.getAttribute('y')} `;
                         break;
                     }
                     case 'cubicBezTo': {
                         const pts = XmlUtils.queryAll(cmd, 'a\\:pt');
                         if (pts.length === 3) {
                             d += `C ${pts[0].getAttribute('x')} ${pts[0].getAttribute('y')} ${pts[1].getAttribute('x')} ${pts[1].getAttribute('y')} ${pts[2].getAttribute('x')} ${pts[2].getAttribute('y')} `;
                         }
                         break;
                     }
                     case 'arcTo': {
                         // Arc is complex (wR, hR, stAng, swAng). SVG uses rx ry rot large sweep x y.
                         // Do simplified mapping or skip. ArcTo in OOXML is rotation based.
                         // Implementation requires math. Skipping valid arc for now, treating as line to end?
                         // It's better to implement linear approx if possible, or just ignore.
                         break;
                     }
                     case 'close': {
                         d += 'Z ';
                         break;
                     }
                 }
             });
        });
        return d.trim();
    }

    private static parseColor(node: Element): string | undefined {
        // srgbClr
        const srgb = XmlUtils.query(node, 'a\\:srgbClr');
        if (srgb) {
            let val = srgb.getAttribute('val')!;
            // Handle alpha if present (alpha is usually child)
            return '#' + val;
        }
        
        // schemeClr
        const scheme = XmlUtils.query(node, 'a\\:schemeClr');
        if (scheme) {
             const val = scheme.getAttribute('val');
             return `theme:${val}`;
        }
        
        // sysClr
        const sys = XmlUtils.query(node, 'a\\:sysClr');
        if (sys) {
            return '#' + (sys.getAttribute('lastClr') || '000000');
        }
        
        // Check for color node directly if passed node IS the color node (like in gradient stops)
        if (node.tagName.endsWith('srgbClr')) return '#' + node.getAttribute('val');
        if (node.tagName.endsWith('schemeClr')) return `theme:${node.getAttribute('val')}`;

        return undefined;
    }
}

