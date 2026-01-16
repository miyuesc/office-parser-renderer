import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';

export const SnipShapes: Record<string, ShapeGenerator> = {
  // Round 1 Rect: Top-Right rounded (Standard OOXML)
  [ST_ShapeType.round1Rect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    // Top-Left (0,0) -> Top-Right (rounded) -> Bottom-Right (w,h) -> Bottom-Left (0,h)
    return `M 0 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  // Round 2 Same Side Rect: Top-Left and Top-Right rounded
  [ST_ShapeType.round2SameRect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    // TL (rounded) -> TR (rounded) -> BR -> BL
    return `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  // Round 2 Diagonal Rect: Top-Right and Bottom-Left rounded
  [ST_ShapeType.round2DiagRect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    // TL -> TR (rounded) -> BR -> BL (rounded)
    return `M 0 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} Z`;
  },

  // Snip 1 Rect: Top-Right snipped
  [ST_ShapeType.snip1Rect]: (w, h, adj) => {
    const val = adj?.['val'] ?? 16667;
    const r = Math.min(w, h) * (val / 100000);
    return `M 0 0 L ${w - r} 0 L ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  // Snip 2 Same Side Rect: Top-Left and Top-Right snipped
  [ST_ShapeType.snip2SameRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667;
    const r = Math.min(w, h) * (adj1 / 100000);
    return `M 0 ${r} L ${r} 0 L ${w - r} 0 L ${w} ${r} L ${w} ${h} L 0 ${h} Z`;
  },

  // Snip 2 Diagonal Rect: Top-Right and Bottom-Left snipped
  [ST_ShapeType.snip2DiagRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667; // Top-Right?
    const adj2 = adj?.['adj2'] ?? 16667; // Bottom-Left?
    // Actually adj1/adj2 might be for different corners.
    // Assuming adj1 = TR, adj2 = BL
    const r1 = Math.min(w, h) * (adj1 / 100000);
    const r2 = Math.min(w, h) * (adj2 / 100000);

    // TL -> TR (Snip) -> BR -> BL (Snip)
    return `M 0 0 L ${w - r1} 0 L ${w} ${r1} L ${w} ${h} L ${r2} ${h} L 0 ${h - r2} Z`;
  },

  // Snip Round Rect: Top-Right snipped, Top-Left rounded?
  // Usually "Snip and Round" means one corner snip, one round.
  // Standard: Top-Right Snip, Top-Left Round. Sameside?
  // Let's check name: "snipRoundRect".
  // Often TR Snip, TL Round.
  [ST_ShapeType.snipRoundRect]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 16667; // Round
    const adj2 = adj?.['adj2'] ?? 16667; // Snip
    const r1 = Math.min(w, h) * (adj1 / 100000);
    const r2 = Math.min(w, h) * (adj2 / 100000);

    // TL (Round) -> TR (Snip) -> BR -> BL
    return `M 0 ${r1} A ${r1} ${r1} 0 0 1 ${r1} 0 L ${w - r2} 0 L ${w} ${r2} L ${w} ${h} L 0 ${h} Z`;
  }
};
