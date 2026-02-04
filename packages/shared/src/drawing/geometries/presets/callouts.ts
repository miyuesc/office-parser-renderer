import { shapeArc, arcToPath } from '../primitives';

// Generic callout tail logic typically involves:
// - A body (Rect, RoundRect, Ellipse)
// - A tail (defined by adjustments)

const getWedgeRectCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  const adj1 = adj?.adj1 ?? -20833;
  const adj2 = adj?.adj2 ?? 62500;

  const dxPos = (w * adj1) / cnstVal1;
  const dyPos = (h * adj2) / cnstVal1;
  const xPos = w / 2 + dxPos;
  const yPos = h / 2 + dyPos;

  const dq = (dxPos * h) / w;
  const ady = Math.abs(dyPos);
  const adq = Math.abs(dq);
  const dz = ady - adq;

  const xg1 = dxPos > 0 ? 7 : 2;
  const xg2 = dxPos > 0 ? 10 : 5;
  const x1 = (w * xg1) / 12;
  const x2 = (w * xg2) / 12;

  const yg1 = dyPos > 0 ? 7 : 2;
  const yg2 = dyPos > 0 ? 10 : 5;
  const y1 = (h * yg1) / 12;
  const y2 = (h * yg2) / 12;

  // Logic from pptxjs: determining connection points (t1..t8)
  const t1 = dxPos > 0 ? 0 : xPos;
  const xl = dz > 0 ? 0 : t1;
  const t2 = dyPos > 0 ? x1 : xPos;
  const xt = dz > 0 ? t2 : x1;
  const t3 = dxPos > 0 ? xPos : w;
  const xr = dz > 0 ? w : t3;
  const t4 = dyPos > 0 ? xPos : x1;
  const xb = dz > 0 ? t4 : x1;

  const t5 = dxPos > 0 ? y1 : yPos;
  const yl = dz > 0 ? y1 : t5;
  const t6 = dyPos > 0 ? 0 : yPos;
  const yt = dz > 0 ? t6 : 0;
  const t7 = dxPos > 0 ? yPos : y1;
  const yr = dz > 0 ? y1 : t7;
  const t8 = dyPos > 0 ? yPos : h;
  const yb = dz > 0 ? t8 : h;

  return (
    `M 0 0 L ${x1} 0 L ${xt} ${yt} L ${x2} 0 L ${w} 0 L ${w} ${y1} ` +
    `L ${xr} ${yr} L ${w} ${y2} L ${w} ${h} L ${x2} ${h} L ${xb} ${yb} ` +
    `L ${x1} ${h} L 0 ${h} L 0 ${y2} L ${xl} ${yl} L 0 ${y1} Z`
  );
};

const getWedgeRoundRectCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  const adj1 = adj?.adj1 ?? -20833;
  const adj2 = adj?.adj2 ?? 62500;
  const adj3 = adj?.adj3 ?? 16667;

  const dxPos = (w * adj1) / cnstVal1;
  const dyPos = (h * adj2) / cnstVal1;
  const xPos = w / 2 + dxPos;
  const yPos = h / 2 + dyPos;

  const dq = (dxPos * h) / w;
  const ady = Math.abs(dyPos);
  const adq = Math.abs(dq);
  const dz = ady - adq;

  const xg1 = dxPos > 0 ? 7 : 2;
  const xg2 = dxPos > 0 ? 10 : 5;
  const x1 = (w * xg1) / 12;
  const x2 = (w * xg2) / 12;

  const yg1 = dyPos > 0 ? 7 : 2;
  const yg2 = dyPos > 0 ? 10 : 5;
  const y1 = (h * yg1) / 12;
  const y2 = (h * yg2) / 12;

  const t1 = dxPos > 0 ? 0 : xPos;
  const xl = dz > 0 ? 0 : t1;
  const t2 = dyPos > 0 ? x1 : xPos;
  const xt = dz > 0 ? t2 : x1;
  const t3 = dxPos > 0 ? xPos : w;
  const xr = dz > 0 ? w : t3;
  const t4 = dyPos > 0 ? xPos : x1;
  const xb = dz > 0 ? t4 : x1;

  const t5 = dxPos > 0 ? y1 : yPos;
  const yl = dz > 0 ? y1 : t5;
  const t6 = dyPos > 0 ? 0 : yPos;
  const yt = dz > 0 ? t6 : 0;
  const t7 = dxPos > 0 ? yPos : y1;
  const yr = dz > 0 ? y1 : t7;
  const t8 = dyPos > 0 ? yPos : h;
  const yb = dz > 0 ? t8 : h;

  const ss = Math.min(w, h);
  const u1 = (ss * adj3) / cnstVal1;
  const u2 = w - u1;
  const v2 = h - u1;

  return (
    `M 0 ${u1} ` +
    `${arcToPath(shapeArc(u1, u1, u1, u1, 180, 270, false))} ` +
    `L ${x1} 0 L ${xt} ${yt} L ${x2} 0 L ${u2} 0 ` +
    `${arcToPath(shapeArc(u2, u1, u1, u1, 270, 360, false))} ` +
    `L ${w} ${y1} L ${xr} ${yr} L ${w} ${y2} L ${w} ${v2} ` +
    `${arcToPath(shapeArc(u2, v2, u1, u1, 0, 90, false))} ` +
    `L ${x2} ${h} L ${xb} ${yb} L ${x1} ${h} L ${u1} ${h} ` +
    `${arcToPath(shapeArc(u1, v2, u1, u1, 90, 180, false))} ` +
    `L 0 ${y2} L ${xl} ${yl} L 0 ${y1} Z`
  );
};

const getWedgeEllipseCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  const adj1 = adj?.adj1 ?? -20833;
  const adj2 = adj?.adj2 ?? 62500;

  const dxPos = (w * adj1) / cnstVal1;
  const dyPos = (h * adj2) / cnstVal1;
  const xPos = w / 2 + dxPos;
  const yPos = h / 2 + dyPos;
  const hc = w / 2;
  const vc = h / 2;

  // Wedge logic
  const angVal1 = (11 * Math.PI) / 180;
  const sdx = dxPos * h;
  const sdy = dyPos * w;
  const pang = Math.atan(sdy / sdx);
  const stAng = pang + angVal1;
  const enAng = pang - angVal1;

  const dx1 = hc * Math.cos(stAng);
  const dy1 = vc * Math.sin(stAng);
  const dx2 = hc * Math.cos(enAng);
  const dy2 = vc * Math.sin(enAng);

  let x1, y1, x2, y2;
  if (dxPos >= 0) {
    x1 = hc + dx1;
    y1 = vc + dy1;
    x2 = hc + dx2;
    y2 = vc + dy2;
  } else {
    x1 = hc - dx1;
    y1 = vc - dy1;
    x2 = hc - dx2;
    y2 = vc - dy2;
  }

  // Draw wedge then ellipse
  return `M ${x1} ${y1} L ${xPos} ${yPos} L ${x2} ${y2} ` + `${arcToPath(shapeArc(hc, vc, hc, vc, 0, 360, true))}`;
};

const getCloud = (w: number, h: number) => {
  const x0 = (w * 3900) / 43200;
  const y0 = (h * 14370) / 43200;

  const rX1 = (w * 6753) / 43200;
  const rY1 = (h * 9190) / 43200;
  const rX2 = (w * 5333) / 43200;
  const rY2 = (h * 7267) / 43200;
  const rX3 = (w * 4365) / 43200;
  const rY3 = (h * 5945) / 43200;
  const rX4 = (w * 4857) / 43200;
  const rY4 = (h * 6595) / 43200;
  const rY5 = (h * 7273) / 43200; // Note: used in loop 5
  const rX6 = (w * 6775) / 43200;
  const rY6 = (h * 9220) / 43200;
  const rX7 = (w * 5785) / 43200;
  const rY7 = (h * 7867) / 43200;
  const rX8 = (w * 6752) / 43200;
  const rY8 = (h * 9215) / 43200;
  const rX9 = (w * 7720) / 43200;
  const rY9 = (h * 10543) / 43200;
  const rX10 = (w * 4360) / 43200;
  const rY10 = (h * 5918) / 43200;
  const rX11 = (w * 4345) / 43200;

  const sA1 = -11429249 / 60000,
    wA1 = 7426832 / 60000;
  const sA2 = -8646143 / 60000,
    wA2 = 5396714 / 60000;
  const sA3 = -8748475 / 60000,
    wA3 = 5983381 / 60000;
  const sA4 = -7859164 / 60000,
    wA4 = 7034504 / 60000;
  const sA5 = -4722533 / 60000,
    wA5 = 6541615 / 60000;
  const sA6 = -2776035 / 60000,
    wA6 = 7816140 / 60000;
  const sA7 = 37501 / 60000,
    wA7 = 6842000 / 60000;
  const sA8 = 1347096 / 60000,
    wA8 = 6910353 / 60000;
  const sA9 = 3974558 / 60000,
    wA9 = 4542661 / 60000;
  const sA10 = -16496525 / 60000,
    wA10 = 8804134 / 60000;
  const sA11 = -14809710 / 60000,
    wA11 = 9151131 / 60000;

  let cX, cY, arc;
  let lastX, lastY;
  let d = `M ${x0} ${y0} `;

  // Helper to append arc and update last point
  const add = (rX: number, rY: number, sA: number, wA: number, prevX?: number, prevY?: number) => {
    // Calculate Center
    // cX = StartX - rX * cos(sA)
    // StartX is x0, y0 for first. Or last point.
    const startX = prevX ?? lastX;
    const startY = prevY ?? lastY;
    const cx = startX - rX * Math.cos((sA * Math.PI) / 180);
    const cy = startY - rY * Math.sin((sA * Math.PI) / 180);

    // Draw Arc
    const arcPath = arcToPath(
      shapeArc(cx, cy, rX, rY, (sA * 180) / Math.PI + 180, ((sA + wA) * 180) / Math.PI + 180, false)
    ); // shapeArc takes degrees. pptxjs sA is in radians?
    // Wait, pptxjs code: shapeArc(cX0, cY0, rX1, rY1, sA1, sA1 + wA1, false)
    // sA1 is -190.48... (deg? or rad?).
    // L4102: cX0 = x0 - rX1 * Math.cos(sA1 * Math.PI / 180).
    // So sA1 is DEGREES.
    // My shapeArc expects DEGREES.
    // pptxjs sA1 = -11429249 / 60000 = -190.48 deg.
    // So I pass sA, sA + wA directly.

    const a = shapeArc(cx, cy, rX, rY, sA, sA + wA, false);

    // Extract end point (M ... L ...)
    // shapeArc returns "M startX startY A ...".
    // We just want the Arc part "A ...".
    // Or simpler: use arcToPath but it might add L.
    // pptxjs uses shapeArc(...).replace("M", "L").
    // basic.ts uses arcToPath.
    // I'll use shapeArc logic directly.

    const dPart = arcToPath(a); // This converts "M... A..." to "L... A..." or "A..."?
    // arcToPath implementation (primitives.ts):
    // return path.replace(/^M [^ ]+ [^ ]+ /, "");
    // So it returns just "A ...".
    d += ' ' + dPart;

    // Update lastX, lastY
    // Explicit calc or parse?
    // pptxjs parses "L x y" from replace("M","L").
    // I'll calculate exact end point.
    const endAngle = ((sA + wA) * Math.PI) / 180;
    lastX = cx + rX * Math.cos(endAngle);
    lastY = cy + rY * Math.sin(endAngle);
  };

  // Arc 1
  add(rX1, rY1, sA1, wA1, x0, y0);
  add(rX2, rY2, sA2, wA2);
  add(rX3, rY3, sA3, wA3);
  add(rX4, rY4, sA4, wA4);
  add(rX2, rY5, sA5, wA5); // rX2 reused
  add(rX6, rY6, sA6, wA6);
  add(rX7, rY7, sA7, wA7);
  add(rX8, rY8, sA8, wA8);
  add(rX9, rY9, sA9, wA9);
  add(rX10, rY10, sA10, wA10);
  add(rX11, rY3, sA11, wA11); // rY3 reused

  d += ' Z';
  return d;
};

const getCloudCallout = (w: number, h: number, adj?: any) => {
  const d1 = getCloud(w, h);

  const cnstVal2 = 100000;
  const adj1 = adj?.adj1 ?? -20833;
  const adj2 = adj?.adj2 ?? 62500;

  const ss = Math.min(w, h);
  const wd2 = w / 2,
    hd2 = h / 2;

  const dxPos = (w * adj1) / cnstVal2;
  const dyPos = (h * adj2) / cnstVal2;
  const xPos = wd2 + dxPos;
  const yPos = hd2 + dyPos;

  const ht = hd2 * Math.cos(Math.atan(dyPos / dxPos));
  const wt = wd2 * Math.sin(Math.atan(dyPos / dxPos));
  const g2 = wd2 * Math.cos(Math.atan(wt / ht));
  const g3 = hd2 * Math.sin(Math.atan(wt / ht));

  let g4, g5;
  if (adj1 >= 0) {
    g4 = wd2 + g2;
    g5 = hd2 + g3;
  } else {
    g4 = wd2 - g2;
    g5 = hd2 - g3;
  }

  const g6 = g4 - xPos;
  const g7 = g5 - yPos;
  const g8 = Math.sqrt(g6 * g6 + g7 * g7);
  const g9 = (ss * 6600) / 21600;
  const g10 = g8 - g9;
  const g11 = g10 / 3;
  const g12 = (ss * 1800) / 21600;
  const g13 = g11 + g12;
  const g14 = (g13 * g6) / g8;
  const g15 = (g13 * g7) / g8;
  const g16 = g14 + xPos;
  const g17 = g15 + yPos;
  const g18 = (ss * 4800) / 21600;
  const g19 = g11 * 2;
  const g20 = g18 + g19;
  const g21 = (g20 * g6) / g8;
  const g22 = (g20 * g7) / g8;
  const g23 = g21 + xPos;
  const g24 = g22 + yPos;
  const g25 = (ss * 1200) / 21600;
  const g26 = (ss * 600) / 21600;
  const x23 = xPos + g26;
  const x24 = g16 + g25;
  const x25 = g23 + g12;

  // Bubbles
  const bubble1 = shapeArc(x23 - g26, yPos, g26, g26, 0, 360, false).replace('M', 'M'); // Keep M
  const bubble2 = shapeArc(x24 - g25, g17, g25, g25, 0, 360, false).replace('M', 'M');
  const bubble3 = shapeArc(x25 - g12, g24, g12, g12, 0, 360, false).replace('M', 'M');

  return d1 + ' ' + bubble1 + ' Z ' + bubble2 + ' Z ' + bubble3 + ' Z';
};

const getLineCallout1 = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  const adj1 = adj?.adj1 ?? 18750;
  const adj2 = adj?.adj2 ?? -8333;
  const adj3 = adj?.adj3 ?? 18750;
  const adj4 = adj?.adj4 ?? -16667;

  const yc1 = (h * adj1) / cnstVal1;
  const xc1 = (w * adj2) / cnstVal1;
  const yc2 = (h * adj3) / cnstVal1;
  const xc2 = (w * adj4) / cnstVal1;

  // Box (M 0 0 ...) + Line (M x1 y1 ...)
  return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z ` + `M ${xc1} ${yc1} L ${xc2} ${yc2}`;
};

const getLineCallout2 = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  const adj1 = adj?.adj1 ?? 18750;
  const adj2 = adj?.adj2 ?? -8333;
  const adj3 = adj?.adj3 ?? 18750;
  const adj4 = adj?.adj4 ?? -16667;
  const adj5 = adj?.adj5 ?? 112500;
  const adj6 = adj?.adj6 ?? -46667;

  const yc1 = (h * adj1) / cnstVal1;
  const xc1 = (w * adj2) / cnstVal1;
  const yc2 = (h * adj3) / cnstVal1;
  const xc2 = (w * adj4) / cnstVal1;
  const yc3 = (h * adj5) / cnstVal1;
  const xc3 = (w * adj6) / cnstVal1;

  return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z ` + `M ${xc1} ${yc1} L ${xc2} ${yc2} L ${xc3} ${yc3}`;
};

const getLineCallout3 = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  const adj1 = adj?.adj1 ?? 18750;
  const adj2 = adj?.adj2 ?? -8333;
  const adj3 = adj?.adj3 ?? 18750;
  const adj4 = adj?.adj4 ?? -16667;
  const adj5 = adj?.adj5 ?? 100000;
  const adj6 = adj?.adj6 ?? -16667;
  const adj7 = adj?.adj7 ?? 112963;
  const adj8 = adj?.adj8 ?? -8333;

  const yc1 = (h * adj1) / cnstVal1;
  const xc1 = (w * adj2) / cnstVal1;
  const yc2 = (h * adj3) / cnstVal1;
  const xc2 = (w * adj4) / cnstVal1;
  const yc3 = (h * adj5) / cnstVal1;
  const xc3 = (w * adj6) / cnstVal1;
  const yc4 = (h * adj7) / cnstVal1;
  const xc4 = (w * adj8) / cnstVal1;

  return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z ` + `M ${xc1} ${yc1} L ${xc2} ${yc2} L ${xc3} ${yc3} L ${xc4} ${yc4}`;
};

const getLeftArrowCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 25000;
  const adj2 = adj?.adj2 ?? 25000;
  const adj3 = adj?.adj3 ?? 25000;
  const adj4 = adj?.adj4 ?? 64977;

  const ss = Math.min(w, h);
  const maxAdj2 = (cnstVal1 * h) / ss;
  const a2 = adj2 < 0 ? 0 : adj2 > maxAdj2 ? maxAdj2 : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  const maxAdj3 = (cnstVal2 * w) / ss;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3 ? maxAdj3 : adj3;
  const q2 = (a3 * ss) / w;
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < 0 ? 0 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dy1 = (ss * a2) / cnstVal2;
  const dy2 = (ss * a1) / cnstVal3;
  const vc = h / 2;
  const y1 = vc - dy1;
  const y2 = vc - dy2;
  const y3 = vc + dy2;
  const y4 = vc + dy1;

  const x1 = (ss * a3) / cnstVal2;
  const dx2 = (w * a4) / cnstVal2;
  const r = w;
  const x2 = r - dx2;

  // Path: Tip(0,vc) -> ArrowHeadPoints -> Box
  return (
    `M 0 ${vc} ` +
    `L ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2} ` +
    `L ${x2} 0 L ${r} 0 L ${r} ${h} L ${x2} ${h} ` +
    `L ${x2} ${y3} L ${x1} ${y3} L ${x1} ${y4} Z`
  );
};

const getRightArrowCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 25000;
  const adj2 = adj?.adj2 ?? 25000;
  const adj3 = adj?.adj3 ?? 25000;
  const adj4 = adj?.adj4 ?? 64977;

  const ss = Math.min(w, h);
  const maxAdj2 = (cnstVal1 * h) / ss;
  const a2 = adj2 < 0 ? 0 : adj2 > maxAdj2 ? maxAdj2 : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  const maxAdj3 = (cnstVal2 * w) / ss;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3 ? maxAdj3 : adj3;
  const q2 = (a3 * ss) / w;
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < 0 ? 0 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dy1 = (ss * a2) / cnstVal2;
  const dy2 = (ss * a1) / cnstVal3;
  const vc = h / 2;
  const y1 = vc - dy1;
  const y2 = vc - dy2;
  const y3 = vc + dy2;
  const y4 = vc + dy1;

  const dx3 = (ss * a3) / cnstVal2;
  const r = w;
  const x3 = r - dx3;
  const x2 = (w * a4) / cnstVal2;

  return (
    `M 0 0 L ${x2} 0 L ${x2} ${y2} L ${x3} ${y2} ` +
    `L ${x3} ${y1} L ${r} ${vc} L ${x3} ${y4} ` +
    `L ${x3} ${y3} L ${x2} ${y3} L ${x2} ${h} L 0 ${h} Z`
  );
};

const getUpArrowCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 25000;
  const adj2 = adj?.adj2 ?? 25000;
  const adj3 = adj?.adj3 ?? 25000;
  const adj4 = adj?.adj4 ?? 64977;

  const ss = Math.min(w, h);
  const maxAdj2 = (cnstVal1 * h) / ss; // Uses h? Logic assumes Vertical arrow?
  // Inspecting pptxjs L6342:
  // L6372: maxAdj2 = cnstVal1 * w / ss; (Rotation?)
  // L6376: maxAdj3 = cnstVal2 * h / ss;
  // So logic swaps w/h compared to Left/Right?
  const maxAdj2_ = (cnstVal1 * w) / ss;
  const a2 = adj2 < 0 ? 0 : adj2 > maxAdj2_ ? maxAdj2_ : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  const maxAdj3_ = (cnstVal2 * h) / ss;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3_ ? maxAdj3_ : adj3;
  const q2 = (a3 * ss) / h;
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < 0 ? 0 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dx1 = (ss * a2) / cnstVal2;
  const dx2_ = (ss * a1) / cnstVal3;
  const hc = w / 2;
  const x1 = hc - dx1;
  const x2 = hc - dx2_;
  const x3 = hc + dx2_;
  const x4 = hc + dx1;

  const y1 = (ss * a3) / cnstVal2; // Arrow height/neck
  const dy2 = (h * a4) / cnstVal2; // Box offset
  const b = h;
  const y2 = b - dy2;

  return (
    `M ${hc} 0 L ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} ` +
    `L 0 ${y2} L 0 ${b} L ${w} ${b} L ${w} ${y2} ` +
    `L ${x3} ${y2} L ${x3} ${y1} L ${x4} ${y1} Z`
  );
};

const getDownArrowCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 25000;
  const adj2 = adj?.adj2 ?? 25000;
  const adj3 = adj?.adj3 ?? 25000;
  const adj4 = adj?.adj4 ?? 64977;

  const ss = Math.min(w, h);
  const maxAdj2 = (cnstVal1 * w) / ss;
  const a2 = adj2 < 0 ? 0 : adj2 > maxAdj2 ? maxAdj2 : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  const maxAdj3 = (cnstVal2 * h) / ss;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3 ? maxAdj3 : adj3;
  const q2 = (a3 * ss) / h;
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < 0 ? 0 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dx1 = (ss * a2) / cnstVal2;
  const dx2_ = (ss * a1) / cnstVal3;
  const hc = w / 2;
  const x1 = hc - dx1;
  const x2 = hc - dx2_;
  const x3 = hc + dx2_;
  const x4 = hc + dx1;

  const dy3 = (ss * a3) / cnstVal2;
  const y3 = h - dy3;
  const y2 = (h * a4) / cnstVal2;

  return (
    `M 0 0 L ${w} 0 L ${w} ${y2} L ${x3} ${y2} ` +
    `L ${x3} ${y3} L ${x4} ${y3} L ${hc} ${h} ` +
    `L ${x1} ${y3} L ${x1} ${y2} L ${x2} ${y2} L ${x2} 0` + // Typo in manual trace?
    // M 0 0 L w 0 L w y2 L x3 y2 L x3 y3 L x4 y3 L hc h L x1 y3 L x1 y2 L x2 y2 L 0 y2 Z ?
    // pptxjs L6265: M l t L r t L r y2 ... L x2 y2 L x2 t ? No, L l y2.
    // L6265: "M" + l + "," + t + ... " L" + x2 + "," + y2 + " L" + l + "," + y2 + " z"
    // So box is Top. Arrow is Bottom.
    ` L 0 ${y2} Z`
  );
};

const getLeftRightArrowCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 25000;
  const adj2 = adj?.adj2 ?? 25000;
  const adj3 = adj?.adj3 ?? 25000;
  const adj4 = adj?.adj4 ?? 48123;

  const ss = Math.min(w, h);
  const maxAdj2 = (cnstVal1 * h) / ss;
  const a2 = adj2 < 0 ? 0 : adj2 > maxAdj2 ? maxAdj2 : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  const maxAdj3 = (cnstVal1 * w) / ss;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3 ? maxAdj3 : adj3;
  const q2 = (a3 * ss) / (w / 2); // Assumed w/2 based on logic
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < 0 ? 0 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dy1 = (ss * a2) / cnstVal2;
  const dy2 = (ss * a1) / cnstVal3;
  const vc = h / 2;
  const y1 = vc - dy1;
  const y2 = vc - dy2;
  const y3 = vc + dy2;
  const y4 = vc + dy1;

  const x1 = (ss * a3) / cnstVal2;
  const x4 = w - x1;
  const dx2 = (w * a4) / cnstVal3;
  const hc = w / 2;
  const x2 = hc - dx2;
  const x3 = hc + dx2;

  return (
    `M 0 ${vc} L ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2} ` +
    `L ${x2} 0 L ${x3} 0 L ${x3} ${y2} L ${x4} ${y2} ` +
    `L ${x4} ${y1} L ${w} ${vc} L ${x4} ${y4} L ${x4} ${y3} ` +
    `L ${x3} ${y3} L ${x3} ${h} L ${x2} ${h} L ${x2} ${y3} ` +
    `L ${x1} ${y3} L ${x1} ${y4} Z`
  );
};

const getUpDownArrowCallout = (w: number, h: number, adj?: any) => {
  // Rotated version of getLeftRightArrowCallout (Swap x/y, w/h)
  // Re-map logic manually
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 25000;
  const adj2 = adj?.adj2 ?? 25000;
  const adj3 = adj?.adj3 ?? 25000;
  const adj4 = adj?.adj4 ?? 48123;

  const ss = Math.min(w, h); // Same
  // maxAdj2 logic used 'h' in LeftRight (implies vertical dimension of arrow head).
  // Here vertical dimension is 'w' (rotated).
  const maxAdj2 = (cnstVal1 * w) / ss;
  const a2 = adj2 < 0 ? 0 : adj2 > maxAdj2 ? maxAdj2 : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  // maxAdj3 used 'w'. Here 'h'.
  const maxAdj3 = (cnstVal1 * h) / ss;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3 ? maxAdj3 : adj3;
  const q2 = (a3 * ss) / (h / 2);
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < 0 ? 0 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dx1 = (ss * a2) / cnstVal2; // was dy1
  const dx2_ = (ss * a1) / cnstVal3; // was dy2
  const hc = w / 2; // was vc
  const x1 = hc - dx1;
  const x2 = hc - dx2_;
  const x3 = hc + dx2_;
  const x4 = hc + dx1;

  const y1_ = (ss * a3) / cnstVal2; // was x1
  const y4_ = h - y1_; // was x4
  const dy2_ = (h * a4) / cnstVal3; // was dx2 using w
  const vc = h / 2; // was hc
  const y2_ = vc - dy2_; // was x2
  const y3_ = vc + dy2_; // was x3

  // Path: Top Tip (hc, 0)
  // M hc 0
  // L x1 y1_
  // L x2 y1_
  // L x2 y2_
  // L 0 y2_
  // L 0 y3_
  // L x2 y3_
  // L x2 y4_
  // L x1 y4_
  // L hc h
  // L x4 y4_
  // L x3 y4_
  // L x3 y3_
  // L w y3_
  // L w y2_
  // L x3 y2_
  // L x3 y1_
  // L x4 y1_
  // Z

  return (
    `M ${hc} 0 L ${x1} ${y1_} L ${x2} ${y1_} L ${x2} ${y2_} ` +
    `L 0 ${y2_} L 0 ${y3_} L ${x2} ${y3_} L ${x2} ${y4_} ` +
    `L ${x1} ${y4_} L ${hc} ${h} L ${x4} ${y4_} L ${x3} ${y4_} ` +
    `L ${x3} ${y3_} L ${w} ${y3_} L ${w} ${y2_} L ${x3} ${y2_} ` +
    `L ${x3} ${y1_} L ${x4} ${y1_} Z`
  );
};

const getQuadArrowCallout = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const adj1 = adj?.adj1 ?? 18515;
  const adj2 = adj?.adj2 ?? 18515;
  const adj3 = adj?.adj3 ?? 18515;
  const adj4 = adj?.adj4 ?? 48123;

  const ss = Math.min(w, h);
  const a2 = adj2 < 0 ? 0 : adj2 > cnstVal1 ? cnstVal1 : adj2;
  const maxAdj1 = a2 * 2;
  const a1 = adj1 < 0 ? 0 : adj1 > maxAdj1 ? maxAdj1 : adj1;
  const maxAdj3 = cnstVal1 - a2;
  const a3 = adj3 < 0 ? 0 : adj3 > maxAdj3 ? maxAdj3 : adj3;
  const q2 = a3 * 2;
  const maxAdj4 = cnstVal2 - q2;
  const a4 = adj4 < a1 ? a1 : adj4 > maxAdj4 ? maxAdj4 : adj4;

  const dx2 = (ss * a2) / cnstVal2;
  const dx3 = (ss * a1) / cnstVal3;
  const ah = (ss * a3) / cnstVal2;
  const dx1 = (w * a4) / cnstVal3;
  const dy1 = (h * a4) / cnstVal3;

  const r = w;
  const b = h;
  const l = 0;
  const t = 0;
  const hc = w / 2;
  const vc = h / 2;

  const x8 = r - ah;
  const x2 = hc - dx1;
  const x7 = hc + dx1;
  const x3 = hc - dx2;
  const x6 = hc + dx2;
  const x4 = hc - dx3;
  const x5 = hc + dx3;

  const y8 = b - ah;
  const y2 = vc - dy1;
  const y7 = vc + dy1;
  const y3 = vc - dx2;
  const y6 = vc + dx2;
  const y4 = vc - dx3;
  const y5 = vc + dx3;

  return (
    `M ${l} ${vc} L ${ah} ${y3} L ${ah} ${y4} L ${x2} ${y4} ` +
    `L ${x2} ${y2} L ${x4} ${y2} L ${x4} ${ah} L ${x3} ${ah} ` +
    `L ${hc} ${t} L ${x6} ${ah} L ${x5} ${ah} L ${x5} ${y2} ` +
    `L ${x7} ${y2} L ${x7} ${y4} L ${x8} ${y4} L ${x8} ${y3} ` +
    `L ${r} ${vc} L ${x8} ${y6} L ${x8} ${y5} L ${x7} ${y5} ` +
    `L ${x7} ${y7} L ${x5} ${y7} L ${x5} ${y8} L ${x6} ${y8} ` +
    `L ${hc} ${b} L ${x3} ${y8} L ${x4} ${y8} L ${x4} ${y7} ` +
    `L ${x2} ${y7} L ${x2} ${y5} L ${ah} ${y5} L ${ah} ${y6} Z`
  );
};

export const callouts = {
  // Wedge Callouts
  wedgeRectCallout: getWedgeRectCallout,
  wedgeRoundRectCallout: getWedgeRoundRectCallout,
  wedgeEllipseCallout: getWedgeEllipseCallout,

  // Also mapped generic names
  rectCallout: getWedgeRectCallout,
  roundRectCallout: getWedgeRoundRectCallout,

  // Specific variants (aliases)
  round1RectCallout: getWedgeRoundRectCallout,
  round2SameRectCallout: getWedgeRoundRectCallout,
  round2DiagRectCallout: getWedgeRoundRectCallout,
  snip1RectCallout: getWedgeRectCallout,
  snip2SameRectCallout: getWedgeRectCallout,
  snip2DiagRectCallout: getWedgeRectCallout,
  snipRoundRectCallout: getWedgeRoundRectCallout,

  // Cloud
  cloud: getCloud, // Export for Basic Shapes
  cloudCallout: getCloudCallout, // Callout with tail

  // Line Callouts
  callout1: getLineCallout1,
  callout2: getLineCallout2,
  callout3: getLineCallout3,

  borderCallout1: getLineCallout1,
  borderCallout2: getLineCallout2,
  borderCallout3: getLineCallout3,

  accentCallout1: getLineCallout1,
  accentCallout2: getLineCallout2,
  accentCallout3: getLineCallout3,

  accentBorderCallout1: getLineCallout1,
  accentBorderCallout2: getLineCallout2,
  accentBorderCallout3: getLineCallout3,

  // Arrow Callouts
  leftArrowCallout: getLeftArrowCallout,
  rightArrowCallout: getRightArrowCallout,
  upArrowCallout: getUpArrowCallout,
  downArrowCallout: getDownArrowCallout,
  leftRightArrowCallout: getLeftRightArrowCallout,
  upDownArrowCallout: getUpDownArrowCallout,
  quadArrowCallout: getQuadArrowCallout
};
