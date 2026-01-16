import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';

export const MathShapes: Record<string, ShapeGenerator> = {
  // Not Equal (≠)
  [ST_ShapeType.mathNotEqual]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 23520;
    const lineW = h * (adj1 / 100000);
    const gap = h * 0.12;
    const cy = h / 2;
    const hMargin = w * 0.05;

    // Top Bar
    const y1Top = cy - gap / 2 - lineW;
    const y1Bot = cy - gap / 2;
    let d = `M ${hMargin} ${y1Top} L ${w - hMargin} ${y1Top} L ${w - hMargin} ${y1Bot} L ${hMargin} ${y1Bot} Z`;

    // Bottom Bar
    const y2Top = cy + gap / 2;
    const y2Bot = cy + gap / 2 + lineW;
    d += ` M ${hMargin} ${y2Top} L ${w - hMargin} ${y2Top} L ${w - hMargin} ${y2Bot} L ${hMargin} ${y2Bot} Z`;

    // Diagonal Slash - Single bar
    // Standard ≠ slash often extends beyond the equals sign vertically.
    const slW = lineW * 0.8;
    const sx = w * 0.3,
      ex = w * 0.7;
    const sy = h * 0.85,
      ey = h * 0.15;

    // Normal vector for thickness
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = ((-dy / len) * slW) / 2;
    const ny = ((dx / len) * slW) / 2;

    d += ` M ${sx + nx} ${sy + ny} L ${ex + nx} ${ey + ny} L ${ex - nx} ${ey - ny} L ${sx - nx} ${sy - ny} Z`;

    return d;
  },

  // Plus (+)
  [ST_ShapeType.mathPlus]: (w, h, adj) => {
    // Single polygon 12-points
    const adj1 = adj?.['adj1'] ?? 23520;
    const thick = Math.min(w, h) * (adj1 / 100000);
    const cx = w / 2,
      cy = h / 2;
    const hw = thick / 2;

    // Top -> Right -> Bottom -> Left
    // Top-Left corner of the cross

    // 1. Top-left inner
    // 2. Top-left top
    // 3. Top-right top
    // 4. Top-right inner
    // ...

    return (
      `M ${cx - hw} ${cy - hw} L ${cx - hw} 0 L ${cx + hw} 0 L ${cx + hw} ${cy - hw} ` + // Top arm
      `L ${w} ${cy - hw} L ${w} ${cy + hw} ` + // Right arm
      `L ${cx + hw} ${cy + hw} L ${cx + hw} ${h} L ${cx - hw} ${h} L ${cx - hw} ${cy + hw} ` + // Bottom arm
      `L 0 ${cy + hw} L 0 ${cy - hw} Z`
    ); // Left arm
  },

  // Minus (-)
  [ST_ShapeType.mathMinus]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 23520;
    const thick = Math.min(w, h) * (adj1 / 100000);
    const cy = h / 2;
    return `M 0 ${cy - thick / 2} L ${w} ${cy - thick / 2} L ${w} ${cy + thick / 2} L 0 ${cy + thick / 2} Z`;
  },

  // Multiply (×)
  [ST_ShapeType.mathMultiply]: (w, h, adj) => {
    // Single polygon X shape
    const adj1 = adj?.['adj1'] ?? 18000; // Thinner default usually
    const thick = Math.min(w, h) * (adj1 / 100000);
    const cx = w / 2,
      cy = h / 2;

    // Vector from center to corner
    // Usually X connects corners.
    // Angle 45 deg?

    // Calculate offsets for 45 deg thickness
    // Normal vector is (1, 1) rot 90 -> (-1, 1)
    // Offset dist = thick/2

    const diag = Math.sqrt(w * w + h * h); // Assume square mostly
    const armL = diag / 2; // Length from center

    // Simplified: 45 degree cross
    const r = thick / 2;
    // rotated 45 deg offsets: dx = r / sqrt(2) * 1 - (-1) ...
    // offset X = r * cos(45+90) = r * -0.707
    // offset Y = r * sin(45+90) = r * 0.707
    const ox = r * 0.707; // 45 deg
    const oy = r * 0.707;

    // Actually, just rotate the "+" points by 45 degrees?
    // Points of +:
    // (cx-r, cy-r), (cx-r, 0), (cx+r, 0), (cx+r, cy-r), (w, cy-r), (w, cy+r)...
    // Rotate (x,y) around (cx,cy).
    // NewX = cx + (x-cx)cos - (y-cy)sin
    // NewY = cy + (x-cx)sin + (y-cy)cos

    // Original + points (using thick=thick)
    // Let's manually construct X points.
    // Arm 1 (TL to BR): Width thick.
    // Arm 2 (TR to BL): Width thick.

    // Let's assume square bounds for simplicity or scale.
    // Vertices:
    // TL Arm: p1(inset, 0), p2(0, inset) - No, that's diamond.
    // Corners of X:
    // TL: Top-left corner needs to be flat? usually square cut.

    // 1. TL-Top: (cx - offset, cy - offset - armLen?)
    // Let's use simple logic:
    // Center cx,cy.
    // 4 arms.
    // Arm 1 Angle -135 (TL).
    // Vertices:
    // p1 = cx + (r,-r) rotated -45?

    // Let's just define vertices for a 45-deg rotated +
    const cos45 = 0.7071,
      sin45 = 0.7071;
    // Half Width of arm
    const hw = thick / 2;
    // Arm Length (from center)
    const al = (Math.min(w, h) / 2) * 1.414; // Extend to corners

    // Function to get point: Start at center, move along axis by dist, move perp by hw
    function getP(axisAngle: number, perpOffset: number, dist: number) {
      const bx = cx + Math.cos(axisAngle) * dist;
      const by = cy + Math.sin(axisAngle) * dist;
      return {
        x: bx + Math.cos(axisAngle + Math.PI / 2) * perpOffset,
        y: by + Math.sin(axisAngle + Math.PI / 2) * perpOffset
      };
    }

    const angles = [-Math.PI * 0.75, -Math.PI * 0.25, Math.PI * 0.25, Math.PI * 0.75]; // TL, TR, BR, BL

    let d = '';
    // For each arm, we have 2 outer corners.
    // The "inner" corners are where arms meet.
    // Inner radius = hw / sin(45)? No, geometry:
    // Intersection of lines.
    // Inner corner distance from center = hw * sqrt(2)

    const innerDist = hw * 1.414; // Hypotenuse

    // Points order:
    // 1. TL Arm End-Right
    // 2. TR Arm End-Left
    // 3. TR Arm End-Right
    // 4. BR Arm End-Left
    // ...

    // Actually easier: define the 12 points relative to center.
    // Inner Points: (0, -innerDist), (innerDist, 0), (0, innerDist), (-innerDist, 0) ?
    // No, rotated.
    // Inner points are at (0, -hw*1.414) rotated 45 is wrong.
    // Inner points are (0, -hw*sqrt(2)) rotated by 0, 90, 180, 270?
    // Yes! For a "+" rotated 45 deg, the inner corners of the "+" are at (+/- hw, +/- hw).
    // So for "X" (rotated +), the inner corners are at (0, ry), (rx, 0)...
    // Inner corners of X: (cx, cy-innerDist), (cx+innerDist, cy), (cx, cy+innerDist), (cx-innerDist, cy).

    // Outer corners: Need to clip to bounding box w,h?
    // Or just endpoints.
    // Let's typically assume it fits in the box.
    // Endpoints of X are at corners of (w,h) box.

    // Corner TL: (0,0)
    // Corner TR: (w,0)
    // But with thickness...
    // The tips are flat.

    // Calc intersection of thick line with box edges? Hard.
    // Approximation: Draw ends at circle radius.
    const rOut = Math.min(w, h) / 2;

    // Inner corners:
    const icTop = { x: cx, y: cy - innerDist };
    const icRight = { x: cx + innerDist, y: cy };
    const icBot = { x: cx, y: cy + innerDist };
    const icLeft = { x: cx - innerDist, y: cy };

    // Outer corners (Perpendiculars at radius)
    // TL Arm: Angle -135deg.
    // Perp1: -135 + 90 = -45.
    // Perp2: -135 - 90 = -225 (+135).

    // This is getting complex to be exact.
    // Let's fallback to the user's report "extra border". It means internal strokes.
    // Retaining the UNION approach is best, but SVG paths in one string are implicitly unioned for fill ("nonzero" rule).
    // The "extra border" appears if `stroke` is applied to a self-intersecting path.
    // A standard "X" can be drawn as a polygon of 12 points.

    // Let's use the 12-point polygon.
    const poly = [
      // Top-Left Arm (pointing NW)
      // Points: OuterCCW, OuterCW
      // Start from top inner corner (icTop)

      // Move to Top Inner
      icTop,

      // Top-Right Arm Top side?
      // No, clockwise:
      // Top Inner -> Top-Right Arm (Top Side -> End -> Bot Side) -> Right Inner -> ...

      // TR Arm (NE)
      getP(-Math.PI * 0.25, -hw, rOut), // Top side of arm
      getP(-Math.PI * 0.25, hw, rOut), // Bottom side of arm

      // Right Inner
      icRight,

      // BR Arm (SE)
      getP(Math.PI * 0.25, -hw, rOut),
      getP(Math.PI * 0.25, hw, rOut),

      // Bottom Inner
      icBot,

      // BL Arm (SW)
      getP(Math.PI * 0.75, -hw, rOut),
      getP(Math.PI * 0.75, hw, rOut),

      // Left Inner
      icLeft,

      // TL Arm (NW)
      getP(-Math.PI * 0.75, -hw, rOut),
      getP(-Math.PI * 0.75, hw, rOut)
    ];

    return (
      `M ${poly[0].x} ${poly[0].y} ` +
      poly
        .slice(1)
        .map(p => `L ${p.x} ${p.y}`)
        .join(' ') +
      ' Z'
    );
  },

  // Divide (÷)
  [ST_ShapeType.mathDivide]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 23520;
    const thick = Math.min(w, h) * (adj1 / 100000);
    const cy = h / 2;

    // Bar
    let d = `M ${w * 0.1} ${cy - thick / 2} L ${w * 0.9} ${cy - thick / 2} L ${w * 0.9} ${cy + thick / 2} L ${
      w * 0.1
    } ${cy + thick / 2} Z`;

    // Dots
    const r = thick;
    d += ` ${GeoUtils.ellipse(w / 2, h * 0.25, r, r)}`;
    d += ` ${GeoUtils.ellipse(w / 2, h * 0.75, r, r)}`;

    return d;
  },

  // Equal (=)
  [ST_ShapeType.mathEqual]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 23520;
    const thick = Math.min(w, h) * (adj1 / 100000);
    const gap = thick * 1.5;
    const cy = h / 2;

    // Top
    let d = `M 0 ${cy - gap / 2 - thick} L ${w} ${cy - gap / 2 - thick} L ${w} ${cy - gap / 2} L 0 ${cy - gap / 2} Z`;
    // Bottom
    d += ` M 0 ${cy + gap / 2} L ${w} ${cy + gap / 2} L ${w} ${cy + gap / 2 + thick} L 0 ${cy + gap / 2 + thick} Z`;

    return d;
  }
};
