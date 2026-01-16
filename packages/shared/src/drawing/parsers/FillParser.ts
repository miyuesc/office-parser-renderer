import { XmlUtils } from '../../xml';
import { OfficeFill } from '../types';
import { ColorParser } from './ColorParser';

export class FillParser {
  static parseFill(node: Element): OfficeFill | undefined {
    // Pattern Fill (Highest Priority)
    const pattFill = XmlUtils.query(node, 'a\\:pattFill');
    if (pattFill) {
      const fgClr = XmlUtils.query(pattFill, 'a\\:fgClr');
      const bgClr = XmlUtils.query(pattFill, 'a\\:bgClr');
      return {
        type: 'pattern',
        pattern: {
          patternType: pattFill.getAttribute('prst') || 'pct5',
          fgColor: fgClr ? ColorParser.parseColor(fgClr) || '#000000' : '#000000',
          bgColor: bgClr ? ColorParser.parseColor(bgClr) || '#ffffff' : '#ffffff'
        }
      };
    }

    // Gradient Fill
    const gradFill = XmlUtils.query(node, 'a\\:gradFill');
    if (gradFill) {
      const stops: Array<{ position: number; color: string }> = [];
      const gsLst = XmlUtils.queryAll(gradFill, 'a\\:gsLst a\\:gs');
      gsLst.forEach(gs => {
        const pos = parseInt(gs.getAttribute('pos') || '0', 10) / 100000;
        const color = ColorParser.parseColor(gs);
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

    // Solid Fill
    const solidFill = XmlUtils.query(node, 'a\\:solidFill');
    if (solidFill) {
      return {
        type: 'solid',
        color: ColorParser.parseColor(solidFill)
      };
    }

    // No Fill
    if (XmlUtils.query(node, 'a\\:noFill')) {
      return { type: 'none' };
    }

    return undefined;
  }
}
