/**
 * 效果解析器
 *
 * 解析 DrawingML 中的视觉效果定义：
 * - outerShdw: 外阴影
 * - innerShdw: 内阴影
 * - glow: 发光
 * - reflection: 反射
 * - softEdge: 柔化边缘
 */
import { XmlUtils } from '../../xml';
import { OfficeEffect } from '../types';
import { ColorParser } from './ColorParser';

export class EffectParser {
  /**
   * 解析效果列表
   *
   * @param effectLst - effectLst 元素节点
   * @returns 效果对象数组
   */
  static parseEffects(effectLst: Element): OfficeEffect[] {
    const effects: OfficeEffect[] = [];

    // 外阴影
    const outerShdw = XmlUtils.query(effectLst, 'a\\:outerShdw');
    if (outerShdw) {
      effects.push({
        type: 'outerShadow',
        blur: parseInt(outerShdw.getAttribute('blurRad') || '0', 10) / 12700, // EMU 转 pt
        dist: parseInt(outerShdw.getAttribute('dist') || '0', 10) / 12700, // EMU 转 pt
        dir: parseInt(outerShdw.getAttribute('dir') || '0', 10) / 60000, // 60000 分之一度转度
        color: ColorParser.parseColor(outerShdw)
      });
    }

    // 发光
    const glow = XmlUtils.query(effectLst, 'a\\:glow');
    if (glow) {
      effects.push({
        type: 'glow',
        radius: parseInt(glow.getAttribute('rad') || '0', 10) / 12700, // EMU 转 pt
        color: ColorParser.parseColor(glow)
      });
    }

    // 内阴影（基础支持）
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

    // 反射
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

    // 柔化边缘
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
