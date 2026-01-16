import { XmlUtils } from '../../xml';
import { OfficeEffect } from '../types';
import { ColorParser } from './ColorParser';

export class EffectParser {
  static parseEffects(effectLst: Element): OfficeEffect[] {
    const effects: OfficeEffect[] = [];

    // Outer Shadow
    const outerShdw = XmlUtils.query(effectLst, 'a\\:outerShdw');
    if (outerShdw) {
      effects.push({
        type: 'outerShadow',
        blur: parseInt(outerShdw.getAttribute('blurRad') || '0', 10) / 12700,
        dist: parseInt(outerShdw.getAttribute('dist') || '0', 10) / 12700,
        dir: parseInt(outerShdw.getAttribute('dir') || '0', 10) / 60000,
        color: ColorParser.parseColor(outerShdw)
      });
    }

    // Glow
    const glow = XmlUtils.query(effectLst, 'a\\:glow');
    if (glow) {
      effects.push({
        type: 'glow',
        radius: parseInt(glow.getAttribute('rad') || '0', 10) / 12700,
        color: ColorParser.parseColor(glow)
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
        color: ColorParser.parseColor(innerShdw)
      });
    }

    // Reflection
    const reflection = XmlUtils.query(effectLst, 'a\\:reflection');
    if (reflection) {
      effects.push({
        type: 'reflection',
        blur: parseInt(reflection.getAttribute('blurRad') || '0', 10) / 12700,
        startOpacity: parseInt(reflection.getAttribute('stA') || '100000', 10) / 100000,
        endOpacity: parseInt(reflection.getAttribute('endA') || '0', 10) / 100000,
        dist: parseInt(reflection.getAttribute('dist') || '0', 10) / 12700,
        dir: parseInt(reflection.getAttribute('dir') || '0', 10) / 60000,
        fadeDir: parseInt(reflection.getAttribute('fadeDir') || '5400000', 10) / 60000,
        sy: parseInt(reflection.getAttribute('sy') || '100000', 10) / 100000,
        kx: parseInt(reflection.getAttribute('kx') || '0', 10) / 60000,
        ky: parseInt(reflection.getAttribute('ky') || '0', 10) / 60000
      });
    }

    // Soft Edge
    const softEdge = XmlUtils.query(effectLst, 'a\\:softEdge');
    if (softEdge) {
      effects.push({
        type: 'softEdge',
        radius: parseInt(softEdge.getAttribute('rad') || '0', 10) / 12700
      });
    }

    return effects;
  }
}
