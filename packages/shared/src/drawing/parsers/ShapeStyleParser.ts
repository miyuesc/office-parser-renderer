import { XmlUtils } from '../../xml';
import { OfficeStyle } from '../types';
import { ColorParser } from './ColorParser';

export class ShapeStyleParser {
  static parseStyle(node: Element): OfficeStyle | undefined {
    if (!node) return undefined;
    const style: OfficeStyle = {};

    const lnRef = XmlUtils.query(node, 'a\\:lnRef');
    if (lnRef) {
      style.lnRef = {
        idx: parseInt(lnRef.getAttribute('idx') || '0', 10),
        color: ColorParser.parseColor(lnRef)
      };
    }

    const fillRef = XmlUtils.query(node, 'a\\:fillRef');
    if (fillRef) {
      style.fillRef = {
        idx: parseInt(fillRef.getAttribute('idx') || '0', 10),
        color: ColorParser.parseColor(fillRef)
      };
    }

    const effectRef = XmlUtils.query(node, 'a\\:effectRef');
    if (effectRef) {
      style.effectRef = {
        idx: parseInt(effectRef.getAttribute('idx') || '0', 10),
        color: ColorParser.parseColor(effectRef)
      };
    }

    const fontRef = XmlUtils.query(node, 'a\\:fontRef');
    if (fontRef) {
      style.fontRef = {
        idx: fontRef.getAttribute('idx') || 'minor',
        color: ColorParser.parseColor(fontRef)
      };
    }

    return style;
  }
}
