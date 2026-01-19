import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';

export const MathShapes: Record<string, ShapeGenerator> = {
  /**
   * 不等号 (≠)
   * OOXML 规范: 两条横线 + 一条斜线穿过
   * adj1: 横线粗细比例 (默认 23520 / 100000)
   * adj2: 斜线角度 (通常为角度值的60000倍，如6600000 = 110度)
   * adj3: 横线间距比例 (默认 11760 / 100000)
   */
  [ST_ShapeType.mathNotEqual]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 23520;
    const adj3 = adj?.['adj3'] ?? 11760;

    // 线条粗细（以形状较小边为基准）
    const lineW = Math.min(w, h) * (adj1 / 100000);
    // 两条横线之间的间距
    const gap = Math.min(w, h) * (adj3 / 100000);

    const cy = h / 2;
    // 左右边距
    const margin = w * 0.1;

    // 计算横线位置
    const bar1Top = cy - gap / 2 - lineW;
    const bar1Bot = cy - gap / 2;
    const bar2Top = cy + gap / 2;
    const bar2Bot = cy + gap / 2 + lineW;

    // 斜线参数 - 从左下到右上穿过两条横线
    // OOXML 规范：斜线宽度与横线宽度一致
    const slashW = lineW;
    const slashMargin = w * 0.2; // 斜线距离边缘的距离
    const slashStartX = slashMargin;
    const slashEndX = w - slashMargin;
    // 修正斜线方向：从下方到上方（Y 坐标从大到小）
    const slashStartY = bar2Bot + lineW * 0.3;
    const slashEndY = bar1Top - lineW * 0.3;

    // 计算斜线的四个角点（矩形的四个角沿斜线方向）
    const dx = slashEndX - slashStartX;
    const dy = slashEndY - slashStartY;
    const len = Math.sqrt(dx * dx + dy * dy);
    // 法向量：垂直于斜线方向，用于计算矩形宽度
    const nx = ((-dy / len) * slashW) / 2;
    const ny = ((dx / len) * slashW) / 2;

    // 使用三个独立的闭合子路径
    return (
      // 上横线
      `M ${margin} ${bar1Top} L ${w - margin} ${bar1Top} L ${w - margin} ${bar1Bot} L ${margin} ${bar1Bot} Z ` +
      // 下横线
      `M ${margin} ${bar2Top} L ${w - margin} ${bar2Top} L ${w - margin} ${bar2Bot} L ${margin} ${bar2Bot} Z ` +
      // 斜线 - 确保坐标正确闭合
      `M ${slashStartX + nx} ${slashStartY + ny} ` +
      `L ${slashStartX - nx} ${slashStartY - ny} ` +
      `L ${slashEndX - nx} ${slashEndY - ny} ` +
      `L ${slashEndX + nx} ${slashEndY + ny} Z`
    );
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

  /**
   * 除号 (÷)
   * OOXML 规范: 一条横线 + 上下两个圆点
   * adj1: 线条粗细比例
   */
  [ST_ShapeType.mathDivide]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 23520;
    const thick = Math.min(w, h) * (adj1 / 100000);
    const cy = h / 2;
    // 左右边距
    const hMargin = w * 0.15;

    // 圆点半径
    const dotR = thick * 0.6;
    // 圆点与中线的间距（确保不与横线重叠）
    const dotGap = thick * 0.8;
    // 上圆点中心 Y
    const dotTopY = cy - dotGap - dotR;
    // 下圆点中心 Y
    const dotBotY = cy + dotGap + dotR;
    const dotCx = w / 2;

    // 使用单独的完整椭圆路径（两个半弧）
    // 上圆点
    let d =
      `M ${dotCx - dotR} ${dotTopY} ` +
      `A ${dotR} ${dotR} 0 1 0 ${dotCx + dotR} ${dotTopY} ` +
      `A ${dotR} ${dotR} 0 1 0 ${dotCx - dotR} ${dotTopY} Z`;

    // 横线
    d +=
      ` M ${hMargin} ${cy - thick / 2} ` +
      `L ${w - hMargin} ${cy - thick / 2} ` +
      `L ${w - hMargin} ${cy + thick / 2} ` +
      `L ${hMargin} ${cy + thick / 2} Z`;

    // 下圆点
    d +=
      ` M ${dotCx - dotR} ${dotBotY} ` +
      `A ${dotR} ${dotR} 0 1 0 ${dotCx + dotR} ${dotBotY} ` +
      `A ${dotR} ${dotR} 0 1 0 ${dotCx - dotR} ${dotBotY} Z`;

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
