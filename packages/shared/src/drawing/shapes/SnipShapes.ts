/**
 * 切角和圆角矩形形状
 *
 * 基于 OOXML 规范实现
 */
import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';

export const SnipShapes: Record<string, ShapeGenerator> = {
  /**
   * 单圆角矩形：右上角圆角（标准 OOXML）
   */
  [ST_ShapeType.round1Rect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    // 左上 (0,0) -> 右上 (圆角) -> 右下 (w,h) -> 左下 (0,h)
    return `M 0 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  /**
   * 同侧双圆角矩形：左上和右上圆角
   * OOXML 规范：adj1 控制上侧两个圆角，adj2 控制下侧两个圆角
   */
  [ST_ShapeType.round2SameRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667; // 上侧圆角
    const adj2 = adj?.['adj2'] ?? 0; // 下侧圆角（默认无）
    const r1 = Math.min(w, h) * (adj1 / 100000);
    const r2 = Math.min(w, h) * (adj2 / 100000);
    // 左上 (圆角) -> 右上 (圆角) -> 右下 (如果 r2>0 则圆角) -> 左下 (如果 r2>0 则圆角)
    if (r2 > 0) {
      return `M 0 ${r1} A ${r1} ${r1} 0 0 1 ${r1} 0 L ${w - r1} 0 A ${r1} ${r1} 0 0 1 ${w} ${r1} L ${w} ${h - r2} A ${r2} ${r2} 0 0 1 ${w - r2} ${h} L ${r2} ${h} A ${r2} ${r2} 0 0 1 0 ${h - r2} Z`;
    }
    return `M 0 ${r1} A ${r1} ${r1} 0 0 1 ${r1} 0 L ${w - r1} 0 A ${r1} ${r1} 0 0 1 ${w} ${r1} L ${w} ${h} L 0 ${h} Z`;
  },

  /**
   * 对角双圆角矩形：右上和左下圆角
   */
  [ST_ShapeType.round2DiagRect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    // 左上 -> 右上 (圆角) -> 右下 -> 左下 (圆角)
    return `M 0 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} Z`;
  },

  /**
   * 单切角矩形：右上切角
   */
  [ST_ShapeType.snip1Rect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    return `M 0 0 L ${w - r} 0 L ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  /**
   * 同侧双切角矩形：左上和右上切角
   */
  [ST_ShapeType.snip2SameRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667;
    const r = Math.min(w, h) * (adj1 / 100000);
    return `M 0 ${r} L ${r} 0 L ${w - r} 0 L ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  /**
   * 对角双切角矩形：右上和左下切角
   * adj1: 右上切角大小
   * adj2: 左下切角大小
   */
  [ST_ShapeType.snip2DiagRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667;
    const adj2 = adj?.['adj2'] ?? 16667;
    const r1 = Math.min(w, h) * (adj1 / 100000);
    const r2 = Math.min(w, h) * (adj2 / 100000);

    // 左上 -> 右上 (切角) -> 右下 -> 左下 (切角)
    return `M 0 0 L ${w - r1} 0 L ${w} ${r1} L ${w} ${h} L ${r2} ${h} L 0 ${h - r2} Z`;
  },

  /**
   * 圆角切角矩形：左上圆角，右上切角
   * adj1: 圆角大小
   * adj2: 切角大小
   */
  [ST_ShapeType.snipRoundRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667; // 圆角
    const adj2 = adj?.['adj2'] ?? 16667; // 切角
    const r1 = Math.min(w, h) * (adj1 / 100000);
    const r2 = Math.min(w, h) * (adj2 / 100000);

    // 左上 (圆角) -> 右上 (切角) -> 右下 -> 左下
    return `M 0 ${r1} A ${r1} ${r1} 0 0 1 ${r1} 0 L ${w - r2} 0 L ${w} ${r2} L ${w} ${h} L 0 ${h} Z`;
  }
};
