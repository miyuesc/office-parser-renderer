/**
 * 矩形形状
 *
 * 基于 OOXML 规范实现
 */
import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';

export const Rectangles: Record<string, ShapeGenerator> = {
  /** 矩形 */
  [ST_ShapeType.rect]: (w, h) => GeoUtils.rect(0, 0, w, h),

  /**
   * 圆角矩形
   * val: 圆角半径比例（默认 16667 = 1/6）
   */
  [ST_ShapeType.roundRect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    return GeoUtils.roundRectPath(w, h, r);
  }
};
