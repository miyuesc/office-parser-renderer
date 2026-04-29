// Connectors often involve "adjustments" to define where the bends are.
// pptx.js implements specific logic for bentConnector3.
// Others (bentConnector2, 4, 5) and CurvedConnectors seem to fall back to straight line according to the provided snippet (L5370),
// BUT we should try to implement standard behavior if possible, or at least better approximations than just straight lines.

// Standard definitions:
// - bentConnector2: 1 bend (L-shape). Only 1 adj?
// - bentConnector3: 2 bends (Z-shape or U-shape). 1 adj used in pptx code.
// - bentConnector4: 3 bends.
// - bentConnector5: 4 bends.

// - curvedConnector2: 1 curve (Quadratic)
// - curvedConnector3: 2 curves (S-shape)
// - ...

const getBentConnector2 = (w: number, h: number, adj?: any) => {
  // L-shape.
  // Usually goes horz then vert or vert then horz?
  // Default to "Elbow connector".
  // M 0 0 L w 0 L w h ? OR M 0 0 L 0 h L w h ?
  // Check adjustment.
  // Assume horizontal first for standard flowchart connector behavior
  // but without knowledge of source/target, we make assumptions.
  // Let's assume M 0 0 -> ... -> w h

  // If a=0.5:
  // M 0 0 L w/2 0 L w/2 h L w h? That's 2 bends (bent3).

  // bentConnector2 is specifically an elbow with ONE bend.
  // e.g. M 0 0 L w 0 L w h (if start horizontal)
  // or M 0 0 L 0 h L w h (if start vertical)

  // Since we don't have directionality, let's default to standard elbow.
  // If w > h, maybe horizontal first?
  return `M 0 0 L ${w} 0 L ${w} ${h}`;
};

const getBentConnector3 = (w: number, h: number, adj?: any) => {
  // As per pptx.js L3696
  const a = (adj?.adj1 ?? 50000) / 100000;
  // "polyline points='0 0," + (a)*w + " 0," + (a)*w + " " + h + "," + w + " " + h + "'"
  // M 0 0 L a*w 0 L a*w h L w h
  return `M 0 0 L ${w * a} 0 L ${w * a} ${h} L ${w} ${h}`;
};

const getBentConnector4 = (w: number, h: number, adj?: any) => {
  // 3 bends.
  // M 0 0 -> x1 0 -> x1 y1 -> x2 y1 -> x2 h -> w h ?
  // Defaulting to simple step-down.
  return `M 0 0 L ${w * 0.5} 0 L ${w * 0.5} ${h * 0.5} L ${w} ${h * 0.5} L ${w} ${h}`;
};

const getBentConnector5 = (w: number, h: number, adj?: any) => {
  // 4 bends.
  return `M 0 0 L ${w * 0.25} 0 L ${w * 0.25} ${h} L ${w * 0.75} ${h} L ${w * 0.75} 0 L ${w} 0`;
};

const getCurvedConnector2 = (w: number, h: number, adj?: any) => {
  // Single curve (Quad bezier).
  // Start 0,0 End w,h. Control point?
  // Standard elbow curve usually uses two control points (Cubic) to look like an arc.
  // Or just a Q curve.
  // M 0 0 Q w 0 w h
  return `M 0 0 Q ${w} 0 ${w} ${h}`;
};

const getCurvedConnector3 = (w: number, h: number, adj?: any) => {
  // S-curve.
  // M 0 0 C w/2 0 w/2 h w h
  return `M 0 0 C ${w * 0.5} 0 ${w * 0.5} ${h} ${w} ${h}`;
};

const getCurvedConnector4 = (w: number, h: number, adj?: any) => {
  return `M 0 0 C ${w * 0.5} 0 ${w * 0.5} ${h * 0.5} ${w * 0.5} ${h * 0.5} S ${w} ${h} ${w} ${h}`;
};

const getCurvedConnector5 = (w: number, h: number, adj?: any) => {
  return `M 0 0 C ${w * 0.25} 0 ${w * 0.25} ${h} ${w * 0.5} ${h} S ${w * 0.75} 0 ${w} 0`;
};

export const connectors = {
  line: (w: number, h: number) => `M 0 0 L ${w} ${h}`,
  straightConnector1: (w: number, h: number) => `M 0 0 L ${w} ${h}`,

  bentConnector2: getBentConnector2,
  bentConnector3: getBentConnector3,
  bentConnector4: getBentConnector4,
  bentConnector5: getBentConnector5,

  curvedConnector2: getCurvedConnector2,
  curvedConnector3: getCurvedConnector3,
  curvedConnector4: getCurvedConnector4,
  curvedConnector5: getCurvedConnector5,

  lineInv: (w: number, h: number) => `M 0 ${h} L ${w} 0`
};
