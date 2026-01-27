/**
 * 形状属性解析器
 *
 * 解析 DrawingML 中的形状属性定义 (a:spPr)
 */
import { XmlUtils } from '../../core/xml';
import { OfficeFill, OfficeStroke, OfficeEffect } from '../types';
import { FillParser } from './FillParser';
import { EffectParser } from './EffectParser';
import { CustomGeometryParser } from './CustomGeometryParser';

export class ShapePropertiesParser {
  /**
   * 解析形状属性 (spPr) 元素
   *
   * 命名空间通常为 'a' (http://schemas.openxmlformats.org/drawingml/2006/main)
   *
   * @param node - spPr 元素节点
   * @returns 解析后的形状属性对象
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
    const result: {
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
    } = {};

    // 变换属性（旋转、翻转）
    const xfrm = XmlUtils.query(node, 'a\\:xfrm');
    if (xfrm) {
      // 旋转角度（单位：60000 分之一度）
      const rot = parseInt(xfrm.getAttribute('rot') || '0', 10);
      if (rot) result.rotation = rot / 60000;
      if (xfrm.getAttribute('flipH') === '1') result.flipH = true;
      if (xfrm.getAttribute('flipV') === '1') result.flipV = true;
    }

    // 预设几何形状
    const prstGeom = XmlUtils.query(node, 'a\\:prstGeom');
    if (prstGeom) {
      result.geometry = prstGeom.getAttribute('prst') || undefined;
      // 调整值列表
      const avLst = XmlUtils.query(prstGeom, 'a\\:avLst');
      if (avLst) {
        const gds = XmlUtils.queryAll(avLst, 'a\\:gd');
        if (gds.length > 0) {
          result.adjustValues = {};
          gds.forEach(gd => {
            const name = gd.getAttribute('name');
            const fmla = gd.getAttribute('fmla');
            // fmla 格式通常为 "val 50000"
            if (name && fmla && fmla.startsWith('val ')) {
              result.adjustValues![name] = parseInt(fmla.substring(4), 10);
            }
          });
        }
      }
    } else {
      // 自定义几何形状
      const custGeom = XmlUtils.query(node, 'a\\:custGeom');
      if (custGeom) {
        result.geometry = 'custom';
        const { path, w, h } = CustomGeometryParser.parseCustomGeometry(custGeom);
        console.log('已解析自定义几何:', { path: path?.substring(0, 100) + '...', w, h });
        result.path = path;
        if (w) result.pathWidth = w;
        if (h) result.pathHeight = h;
      }
    }

    // 填充解析（纯色、渐变、图案等）
    result.fill = FillParser.parseFill(node);

    // 边框（线条）解析
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
        compound: (ln.getAttribute('cmpd') as 'sng' | 'dbl' | 'thickThin' | 'thinThick' | 'tri') || undefined
      };
      // 起始箭头
      const headEnd = XmlUtils.query(ln, 'a\\:headEnd');
      if (headEnd) {
        result.stroke.headEnd = {
          type: headEnd.getAttribute('type') || 'none',
          w: headEnd.getAttribute('w') || 'med',
          len: headEnd.getAttribute('len') || 'med'
        };
      }
      // 结束箭头
      const tailEnd = XmlUtils.query(ln, 'a\\:tailEnd');
      if (tailEnd) {
        result.stroke.tailEnd = {
          type: tailEnd.getAttribute('type') || 'none',
          w: tailEnd.getAttribute('w') || 'med',
          len: tailEnd.getAttribute('len') || 'med'
        };
      }
    }

    // 效果解析（阴影、发光等）
    const effectLst = XmlUtils.query(node, 'a\\:effectLst');
    if (effectLst) {
      result.effects = EffectParser.parseEffects(effectLst);
    }

    return result;
  }
}
