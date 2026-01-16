import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';

export const Rectangles: Record<string, ShapeGenerator> = {
  [ST_ShapeType.rect]: (w, h) => GeoUtils.rect(0, 0, w, h),

  [ST_ShapeType.roundRect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    return GeoUtils.roundRectPath(w, h, r);
  }
};
