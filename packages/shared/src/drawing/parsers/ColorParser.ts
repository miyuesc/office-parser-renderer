/**
 * 颜色解析器
 *
 * 解析 DrawingML 中的各种颜色定义：
 * - srgbClr: RGB 颜色
 * - schemeClr: 主题颜色引用
 * - sysClr: 系统颜色
 * - prstClr: 预设颜色
 */
import { XmlUtils } from '../../core/xml';
import { PresetColorMap } from '../../core/utils/PresetColorMap';

export class ColorParser {
  /**
   * 解析颜色节点
   *
   * 支持的颜色类型：
   * - srgbClr: 直接 RGB 值
   * - schemeClr: 主题方案颜色（包含亮度修饰符）
   * - sysClr: 系统颜色
   * - prstClr: 预设颜色名称
   *
   * @param node - 包含颜色定义的元素节点
   * @returns 颜色字符串（十六进制或 rgba），未找到则返回 undefined
   */
  static parseColor(node: Element): string | undefined {
    // srgbClr - 直接 RGB 颜色
    const srgb = XmlUtils.query(node, 'a\\:srgbClr');
    if (srgb) {
      const val = srgb.getAttribute('val')!;
      return this.applyModifiers('#' + val, srgb);
    }

    // schemeClr - 主题方案颜色（可能包含亮度修饰符）
    const scheme = XmlUtils.query(node, 'a\\:schemeClr');
    if (scheme) {
      const val = scheme.getAttribute('val');
      // 检查亮度修饰符
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

    // sysClr - 系统颜色
    const sys = XmlUtils.query(node, 'a\\:sysClr');
    if (sys) {
      return '#' + (sys.getAttribute('lastClr') || '000000');
    }

    // prstClr - 预设颜色
    const prst = XmlUtils.query(node, 'a\\:prstClr');
    if (prst) {
      const hex = PresetColorMap[prst.getAttribute('val') as keyof typeof PresetColorMap] || '#000000';
      return this.applyModifiers(hex, prst);
    }

    // 检查传入节点本身是否就是颜色节点（如渐变色标中的情况）
    if (node.tagName.endsWith('srgbClr')) return this.applyModifiers('#' + node.getAttribute('val'), node);
    if (node.tagName.endsWith('prstClr')) {
      const hex = PresetColorMap[node.getAttribute('val') as keyof typeof PresetColorMap] || '#000000';
      return this.applyModifiers(hex, node);
    }
    if (node.tagName.endsWith('schemeClr')) return `theme:${node.getAttribute('val')}`;

    return undefined;
  }

  /**
   * 应用颜色修饰符
   *
   * 处理 tint（调亮）、shade（调暗）、alpha（透明度）等修饰符
   *
   * @param hex - 原始十六进制颜色
   * @param node - 包含修饰符的节点
   * @returns 应用修饰符后的颜色值
   */
  static applyModifiers(hex: string, node: Element): string {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // tint - 调亮（与白色混合）
    const tint = XmlUtils.query(node, 'a\\:tint');
    if (tint) {
      const val = parseInt(tint.getAttribute('val') || '0', 10) / 100000;
      r = Math.round(r * val + 255 * (1 - val));
      g = Math.round(g * val + 255 * (1 - val));
      b = Math.round(b * val + 255 * (1 - val));
    }

    // shade - 调暗（与黑色混合）
    const shade = XmlUtils.query(node, 'a\\:shade');
    if (shade) {
      const val = parseInt(shade.getAttribute('val') || '0', 10) / 100000;
      r = Math.round(r * val);
      g = Math.round(g * val);
      b = Math.round(b * val);
    }

    // alpha - 透明度
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
