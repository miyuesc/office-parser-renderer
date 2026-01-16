import { XmlUtils } from '../../xml';
import { PresetColorMap } from '../../utils/PresetColorMap';

export class ColorParser {
  static parseColor(node: Element): string | undefined {
    // srgbClr
    const srgb = XmlUtils.query(node, 'a\\:srgbClr');
    if (srgb) {
      let val = srgb.getAttribute('val')!;
      return this.applyModifiers('#' + val, srgb);
    }

    // schemeClr - with possible luminance modifications
    const scheme = XmlUtils.query(node, 'a\\:schemeClr');
    if (scheme) {
      const val = scheme.getAttribute('val');
      // Check for luminance modifications
      const lumMod = XmlUtils.query(scheme, 'a\\:lumMod');
      const lumOff = XmlUtils.query(scheme, 'a\\:lumOff');
      const tint = XmlUtils.query(scheme, 'a\\:tint');
      const shade = XmlUtils.query(scheme, 'a\\:shade');
      const alpha = XmlUtils.query(scheme, 'a\\:alpha');

      let colorStr = `theme:${val}`;
      if (lumMod || lumOff || tint || shade || alpha) {
        const modVal = lumMod ? lumMod.getAttribute('val') : null;
        const offVal = lumOff ? lumOff.getAttribute('val') : null;
        const tintVal = tint ? tint.getAttribute('val') : null;
        const shadeVal = shade ? shade.getAttribute('val') : null;
        const alphaVal = alpha ? alpha.getAttribute('val') : null;

        if (modVal) colorStr += `:lumMod=${modVal}`;
        if (offVal) colorStr += `:lumOff=${offVal}`;
        if (tintVal) colorStr += `:tint=${tintVal}`;
        if (shadeVal) colorStr += `:shade=${shadeVal}`;
        if (alphaVal) colorStr += `:alpha=${alphaVal}`;
      }
      return colorStr;
    }

    // sysClr
    const sys = XmlUtils.query(node, 'a\\:sysClr');
    if (sys) {
      return '#' + (sys.getAttribute('lastClr') || '000000');
    }

    // prstClr
    const prst = XmlUtils.query(node, 'a\\:prstClr');
    if (prst) {
      const hex = PresetColorMap[prst.getAttribute('val') as keyof typeof PresetColorMap] || '#000000';
      return this.applyModifiers(hex, prst);
    }

    // Check for color node directly if passed node IS the color node (like in gradient stops)
    if (node.tagName.endsWith('srgbClr')) return this.applyModifiers('#' + node.getAttribute('val'), node);
    if (node.tagName.endsWith('prstClr')) {
      const hex = PresetColorMap[node.getAttribute('val') as keyof typeof PresetColorMap] || '#000000';
      return this.applyModifiers(hex, node);
    }
    if (node.tagName.endsWith('schemeClr')) return `theme:${node.getAttribute('val')}`;

    return undefined;
  }

  static applyModifiers(hex: string, node: Element): string {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    const tint = XmlUtils.query(node, 'a\\:tint');
    if (tint) {
      const val = parseInt(tint.getAttribute('val') || '0', 10) / 100000;
      // Tint: Mix with White
      r = Math.round(r * val + 255 * (1 - val));
      g = Math.round(g * val + 255 * (1 - val));
      b = Math.round(b * val + 255 * (1 - val));
    }

    const shade = XmlUtils.query(node, 'a\\:shade');
    if (shade) {
      const val = parseInt(shade.getAttribute('val') || '0', 10) / 100000;
      // Shade: Mix with Black
      r = Math.round(r * val);
      g = Math.round(g * val);
      b = Math.round(b * val);
    }

    const alpha = XmlUtils.query(node, 'a\\:alpha');
    if (alpha) {
      const a = parseInt(alpha.getAttribute('val') || '100000', 10) / 100000;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    const toHex = (n: number) => {
      const s = Math.max(0, Math.min(255, n)).toString(16);
      return s.length === 1 ? '0' + s : s;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
