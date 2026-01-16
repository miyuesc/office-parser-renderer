import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';

export const Stars: Record<string, ShapeGenerator> = {
  [ST_ShapeType.star4]: (w, h, adj) => {
    // adj1: 内半径比例 (1/100000)，默认 12500
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(4, w, h, adj1);
  },

  [ST_ShapeType.star5]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(5, w, h, adj1);
  },

  [ST_ShapeType.star6]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(6, w, h, adj1);
  },

  [ST_ShapeType.star7]: (w, h, adj) => {
    // star7: 使用 OOXML 标准默认值，由 GeoUtils.star 内部处理
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(7, w, h, adj1);
  },

  [ST_ShapeType.star8]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(8, w, h, adj1);
  },

  [ST_ShapeType.star10]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(10, w, h, adj1);
  },

  [ST_ShapeType.star12]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(12, w, h, adj1);
  },

  [ST_ShapeType.star16]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(16, w, h, adj1);
  },

  [ST_ShapeType.star24]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(24, w, h, adj1);
  },

  [ST_ShapeType.star32]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? adj?.['val'] ?? undefined;
    return GeoUtils.star(32, w, h, adj1);
  }
};
