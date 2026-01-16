import { XmlUtils } from '../../xml';
import { OfficeFill, OfficeStroke, OfficeEffect } from '../types';
import { FillParser } from './FillParser';
import { EffectParser } from './EffectParser';
import { CustomGeometryParser } from './CustomGeometryParser';

export class ShapePropertiesParser {
  /**
   * Parses the Shape Properties (spPr) element.
   * Namespaces: usually 'a' (http://schemas.openxmlformats.org/drawingml/2006/main)
   */
  static parseShapeProperties(node: Element): {
    fill?: OfficeFill;
    stroke?: OfficeStroke;
    geometry?: string;
    path?: string;
    pathWidth?: number;
    pathHeight?: number;
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    effects?: OfficeEffect[];
    adjustValues?: Record<string, number>;
  } {
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
      const avLst = XmlUtils.query(prstGeom, 'a\\:avLst');
      if (avLst) {
        const gds = XmlUtils.queryAll(avLst, 'a\\:gd');
        if (gds.length > 0) {
          result.adjustValues = {};
          gds.forEach(gd => {
            const name = gd.getAttribute('name');
            const fmla = gd.getAttribute('fmla');
            // fmla is usually "val 50000"
            if (name && fmla && fmla.startsWith('val ')) {
              result.adjustValues![name] = parseInt(fmla.substring(4), 10);
            }
          });
        }
      }
    } else {
      const custGeom = XmlUtils.query(node, 'a\\:custGeom');
      if (custGeom) {
        result.geometry = 'custom';
        const { path, w, h } = CustomGeometryParser.parseCustomGeometry(custGeom);
        console.log('Parsed Custom Geometry:', { path: path?.substring(0, 100) + '...', w, h });
        result.path = path;
        if (w) result.pathWidth = w;
        if (h) result.pathHeight = h;
      }
    }

    // Fill parsing (solid, gradient, pattern, etc.)
    result.fill = FillParser.parseFill(node);

    // Border (line) parsing
    const ln = XmlUtils.query(node, 'a\\:ln');
    if (ln) {
      const w = parseInt(ln.getAttribute('w') || '0', 10);
      const lnFill = FillParser.parseFill(ln);
      let color;
      if (lnFill && lnFill.type === 'solid') color = lnFill.color;
      result.stroke = {
        width: w,
        color,
        gradient: lnFill && lnFill.type === 'gradient' ? lnFill.gradient : undefined,
        dashStyle: XmlUtils.query(ln, 'a\\:prstDash')?.getAttribute('val') || 'solid',
        join: XmlUtils.query(ln, 'a\\:round') ? 'round' : XmlUtils.query(ln, 'a\\:bevel') ? 'bevel' : 'miter',
        cap: XmlUtils.query(ln, 'a\\:rnd') ? 'rnd' : XmlUtils.query(ln, 'a\\:sq') ? 'sq' : 'flat',
        compound: (ln.getAttribute('cmpd') as any) || undefined
      };
      const headEnd = XmlUtils.query(ln, 'a\\:headEnd');
      if (headEnd) {
        result.stroke.headEnd = {
          type: headEnd.getAttribute('type') || 'none',
          w: headEnd.getAttribute('w') || 'med',
          len: headEnd.getAttribute('len') || 'med'
        };
      }
      const tailEnd = XmlUtils.query(ln, 'a\\:tailEnd');
      if (tailEnd) {
        result.stroke.tailEnd = {
          type: tailEnd.getAttribute('type') || 'none',
          w: tailEnd.getAttribute('w') || 'med',
          len: tailEnd.getAttribute('len') || 'med'
        };
      }
    }

    // Effects (shadows, glow, etc.)
    const effectLst = XmlUtils.query(node, 'a\\:effectLst');
    if (effectLst) {
      result.effects = EffectParser.parseEffects(effectLst);
    }

    return result;
  }
}
