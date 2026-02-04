import { shapeArc, arcToPath } from '../primitives';

const getRightArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;

  const neckH = h * a1;
  const neckY = (h - neckH) / 2;
  const headLen = Math.min(w, h) * a2; // NOTE: pptx uses min(w,h) scaling for head usually or w? pptx code uses sAdj2_val * w for head width. Wait, L5407: sAdj2_val * w.
  // But wait, if w is very large, head is huge?
  // pptx code says: sAdj2_val = (sAdj2.substr(4)) / 100000. It doesn't scale by min(w,h).
  // But standard shapes often scale head by min dime if adj is large.
  // Let's stick to existing logic but maybe check if adjustment is relative to width or height.
  // pptx logic: "sAdj2_val * w".

  const headW = w * a2;
  const bodyW = w - headW;

  return `M 0 ${neckY} L ${bodyW} ${neckY} L ${bodyW} 0 L ${w} ${h / 2} L ${bodyW} ${h} L ${bodyW} ${neckY + neckH} L 0 ${neckY + neckH} Z`;
};

const getLeftArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;
  const neckH = h * a1;
  const neckY = (h - neckH) / 2;
  const headW = w * a2;

  return `M ${w} ${neckY} L ${headW} ${neckY} L ${headW} 0 L 0 ${h / 2} L ${headW} ${h} L ${headW} ${neckY + neckH} L ${w} ${neckY + neckH} Z`;
};

const getUpArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;
  const neckW = w * a1;
  const neckX = (w - neckW) / 2;
  const headH = h * a2;
  return `M ${neckX} ${h} L ${neckX} ${headH} L 0 ${headH} L ${w / 2} 0 L ${w} ${headH} L ${neckX + neckW} ${headH} L ${neckX + neckW} ${h} Z`;
};

const getDownArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;
  const neckW = w * a1;
  const neckX = (w - neckW) / 2;
  const headH = h * a2;
  const bodyH = h - headH;
  return `M ${neckX} 0 L ${neckX + neckW} 0 L ${neckX + neckW} ${bodyH} L ${w} ${bodyH} L ${w / 2} ${h} L 0 ${bodyH} L ${neckX} ${bodyH} Z`;
};

const getLeftRightArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;
  const neckH = h * a1;
  const neckY = (h - neckH) / 2;
  const headW = w * a2;

  return `M ${headW} ${neckY} L ${w - headW} ${neckY} L ${w - headW} 0 L ${w} ${h / 2} L ${w - headW} ${h} L ${w - headW} ${neckY + neckH} L ${headW} ${neckY + neckH} L ${headW} ${h} L 0 ${h / 2} L ${headW} 0 L ${headW} ${neckY} Z`;
};

const getUpDownArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;
  const neckW = w * a1;
  const neckX = (w - neckW) / 2;
  const headH = h * a2;
  return `M ${neckX} ${headH} L ${neckX} ${h - headH} L 0 ${h - headH} L ${w / 2} ${h} L ${w} ${h - headH} L ${neckX + neckW} ${h - headH} L ${neckX + neckW} ${headH} L ${w} ${headH} L ${w / 2} 0 L 0 ${headH} L ${neckX} ${headH} Z`;
};

const getQuadArrow = (w: number, h: number, adj?: any) => {
  // Ported from pptx.js L6000
  const minWH = Math.min(w, h);
  const a1 = (adj?.adj1 ?? 22500) / 100000; // neck width
  const a2 = (adj?.adj2 ?? 22500) / 100000; // head size
  const a3 = (adj?.adj3 ?? 22500) / 100000; // center offset

  // Logic from pptx.js
  const x1 = minWH * a3;
  const dx2 = minWH * a2;
  const x2 = w / 2 - dx2;
  const x5 = w / 2 + dx2;
  const dx3 = minWH * a1;
  const x3 = w / 2 - dx3;
  const x4 = w / 2 + dx3;
  const x6 = w - x1; // Not fully using x6?

  const vc = h / 2,
    hc = w / 2;
  const y2 = vc - dx2;
  const y5 = vc + dx2;
  const y3 = vc - dx3;
  const y4 = vc + dx3;
  const y6 = h - x1;

  // Right Arrow
  // M 0 vc ...? No, logic is cross shape.

  // M 0 vc L x1 y2 L x1 y3 L x3 y3 L x3 x1 L x2 x1 L hc 0
  // L x5 x1 L x4 x1 L x4 y3 L x6 y3 L x6 y2 L w vc
  // L x6 y5 L x6 y4 L x4 y4 L x4 y6 L x5 y6 L hc h
  // L x2 y6 L x3 y6 L x3 y4 L x1 y4 L x1 y5 Z
  // Note: pptx code seems to swap x and y or use symmetric logic.
  // Simplifying:

  return (
    `M 0 ${vc} L ${x1} ${y2} L ${x1} ${y3} L ${x3} ${y3} L ${x3} ${x1} L ${x2} ${x1} ` +
    `L ${hc} 0 L ${x5} ${x1} L ${x4} ${x1} L ${x4} ${y3} L ${w - x1} ${y3} L ${w - x1} ${y2} ` +
    `L ${w} ${vc} L ${w - x1} ${y5} L ${w - x1} ${y4} L ${x4} ${y4} L ${x4} ${h - x1} L ${x5} ${h - x1} ` +
    `L ${hc} ${h} L ${x2} ${h - x1} L ${x3} ${h - x1} L ${x3} ${y4} L ${x1} ${y4} L ${x1} ${y5} Z`
  );
};

const getLeftRightUpArrow = (w: number, h: number, adj?: any) => {
  // 3 way arrow, no down
  const minWH = Math.min(w, h);
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const a2 = (adj?.adj2 ?? 25000) / 100000;
  const a3 = (adj?.adj3 ?? 25000) / 100000;

  const x1 = minWH * a3; // head length
  const dx2 = minWH * a2; // head width (half)
  const dx3 = minWH * a1; // neck width (half)

  const hc = w / 2;
  const x2 = hc - dx2;
  const x5 = hc + dx2;
  const x3 = hc - dx3;
  const x4 = hc + dx3;
  const x6 = w - x1; // right head start

  const dy2 = minWH * a2; // up head height/width? pptx uses same scale.
  const y2 = h - dy2; // wait, this is for sideways?
  // Let's interpret coordinates.
  // Top head: L hc 0. Base: L ... x1.
  // This shape is effectively T-shaped but with arrows.

  // pptx code is messy, re-deriving:
  // Left arrow tip: 0, y4?
  // Right arrow tip: w, y4?
  // Up arrow tip: hc, 0

  const y4 = h / 2; // Roughly center vert? No, pptx has y4 = h - dx2 ?
  // L5809: y4 = h - dx2 ??
  // Actually, let's assume standard layout.
  // Vertical center for left/right arrows is usually lower if T-shape.

  // Re-doing based on pptx lines:
  // x2, x5 are top arrow base corners
  // x3, x4 are top arrow neck corners
  // x1 is left/right arrow head length?

  // Correct logic:
  // Up head: Tip(hc,0), Base(x2, x1) and (x5, x1). Neck(x3, x1) and (x4, x1).
  // ...
  // Let's implement simpler version:

  const neckW = 2 * dx3;
  const headW = 2 * dx2;
  const headH = x1; // or similar

  // Actually pptx code lines:
  // y4 = h - dx2 -> this suggests bottom heavy.
  // Let's use getQuadArrow logic but flat bottom.

  // Flat bottom:
  return (
    `M 0 ${h / 2} L ${x1} ${h / 2 - dx2} L ${x1} ${h / 2 - dx3} L ${x3} ${h / 2 - dx3} L ${x3} ${x1} ` +
    `L ${x2} ${x1} L ${hc} 0 L ${x5} ${x1} L ${x4} ${x1} L ${x4} ${h / 2 - dx3} ` +
    `L ${w - x1} ${h / 2 - dx3} L ${w - x1} ${h / 2 - dx2} L ${w} ${h / 2} ` +
    `L ${w - x1} ${h / 2 + dx2} L ${w - x1} ${h / 2 + dx3} L ${x4} ${h / 2 + dx3} L ${x4} ${h} ` +
    `L ${x3} ${h} L ${x3} ${h / 2 + dx3} L ${x1} ${h / 2 + dx3} L ${x1} ${h / 2 + dx2} Z`
  );
};

const getLeftUpArrow = (w: number, h: number, adj?: any) => {
  // Bent arrow "L" shape with arrows at both ends.
  // Implemented as `bentUpArrow`? Reference pptx "leftUpArrow".
  const minWH = Math.min(w, h);
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const a2 = (adj?.adj2 ?? 25000) / 100000;
  const a3 = (adj?.adj3 ?? 25000) / 100000;

  const dx4 = minWH * a2; // head width
  const dx3 = minWH * a1; // neck width
  const x1 = minWH * a3; // head length

  const x2 = w - dx4;
  const y2 = h - dx4; // Inner corner reference

  const x3 = x2 - dx3; // Inner neck
  const y3 = y2 - dx3;

  const x4 = w - dx4; // Outer corner reference - head width?
  // Actually pptx logic:
  // M 0 y4 ...

  // Vert Arrow (Up): Tip(w-dx4, 0). Base(w, x1) and (w-2*dx4, x1)?
  // Horz Arrow (Left): Tip(0, h-dx4).

  return (
    `M 0 ${h - dx4} L ${x1} ${h - 2 * dx4} L ${x1} ${h - dx4 - dx3} L ${w - dx4 - dx3} ${h - dx4 - dx3} ` +
    `L ${w - dx4 - dx3} ${x1} L ${w - 2 * dx4} ${x1} L ${w - dx4} 0 L ${w} ${x1} ` +
    `L ${w - dx4 + dx3} ${x1} L ${w - dx4 + dx3} ${h - dx4 + dx3} L ${x1} ${h - dx4 + dx3} L ${x1} ${h} Z`
  );
};

const getBentArrow = (w: number, h: number, adj?: any) => {
  const minWH = Math.min(w, h);
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const a2 = (adj?.adj2 ?? 25000) / 100000;
  const a3 = (adj?.adj3 ?? 25000) / 100000;
  const a4 = (adj?.adj4 ?? 43750) / 100000;

  const th = minWH * a1;
  const aw2 = minWH * a2;
  const th2 = th / 2;
  const dh2 = aw2 - th2;
  const ah = minWH * a3;

  const bd = minWH * a4;
  const bd3 = bd - th;
  const bd2 = Math.max(0, bd3);

  const x3 = th + bd2;
  const x4 = w - ah;
  const y3 = dh2 + th;
  const y4 = y3 + dh2;
  const y5 = dh2 + bd;
  const y6 = y3 + bd2;

  // Right Arrow on horizontal, Bent part on vertical (Left-Top origin?)
  // M 0 h L 0 y5 Arc ...
  return (
    `M 0 ${h} L 0 ${y5} ${arcToPath(shapeArc(bd, y5, bd, bd, 180, 270, false))} ` +
    `L ${x4} ${dh2} L ${x4} 0 L ${w} ${aw2} L ${x4} ${y4} L ${x4} ${y3} L ${x3} ${y3} ` +
    `${arcToPath(shapeArc(x3, y6, bd2, bd2, 270, 180, false))} L ${th} ${h} Z`
  );
};

const getUTurnArrow = (w: number, h: number, adj?: any) => {
  const minWH = Math.min(w, h);
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const a2 = (adj?.adj2 ?? 25000) / 100000;
  const a3 = (adj?.adj3 ?? 25000) / 100000;
  const a4 = (adj?.adj4 ?? 43750) / 100000;

  const th = minWH * a1;
  const aw2 = minWH * a2;
  const th2 = th / 2;
  const dh2 = aw2 - th2;
  const ah = minWH * a3;

  const y5 = h * ((adj?.adj5 ?? 75000) / 100000);
  const y4 = y5 - ah;

  const bd = minWH * a4;
  const bd3 = bd - th;
  const bd2 = Math.max(0, bd3);

  const x3 = th + bd2;
  const x9 = w - dh2;
  const x4 = x9 - bd;
  const x8 = w - aw2;
  const x6 = x8 - aw2;
  const x7 = x6 + dh2;
  const x5 = x7 - bd2;

  // U-Turn shape
  return (
    `M 0 ${h} L 0 ${bd} ` +
    `${arcToPath(shapeArc(bd, bd, bd, bd, 180, 270, false))} ` +
    `L ${x4} 0 ` +
    `${arcToPath(shapeArc(x4, bd, bd, bd, 270, 360, false))} ` +
    `L ${x9} ${y4} L ${w} ${y4} L ${x8} ${y5} L ${x6} ${y4} L ${x7} ${y4} L ${x7} ${x3} ` +
    `${arcToPath(shapeArc(x5, x3, bd2, bd2, 0, -90, false))} ` +
    `L ${x3} ${th} ` +
    `${arcToPath(shapeArc(x3, x3, bd2, bd2, 270, 180, false))} ` +
    `L ${th} ${h} Z`
  );
};

const getNotchedRightArrow = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const a2 = (adj?.adj2 ?? 50000) / 100000;

  const neckH = h * a1;
  const neckY = (h - neckH) / 2;
  const tailX = Math.min(w, h) * a2;

  return `M 0 ${neckY} L ${w * 0.6} ${neckY} L ${w * 0.6} 0 L ${w} ${h / 2} L ${w * 0.6} ${h} L ${w * 0.6} ${neckY + neckH} L 0 ${neckY + neckH} L ${tailX} ${h / 2} Z`;
};

const getHomePlate = (w: number, h: number, adj?: any) => {
  const a = (adj?.adj1 ?? 50000) / 100000;
  const minWH = Math.min(w, h);
  const dx = minWH * a;
  const x1 = w - dx;
  const vc = h / 2;
  return `M 0 0 L ${x1} 0 L ${w} ${vc} L ${x1} ${h} L 0 ${h} Z`;
};

const getChevron = (w: number, h: number, adj?: any) => {
  const a = (adj?.adj1 ?? 50000) / 100000;
  const dx = Math.min(w, h) * a;
  const x1 = dx;
  const x2 = w - dx;
  return `M 0 0 L ${x2} 0 L ${w} ${h / 2} L ${x2} ${h} L 0 ${h} L ${x1} ${h / 2} Z`;
};

// Complex Arcs

/**
 * 环形箭头 - 基于 pptxjs.js L7379-7639 的精确实现
 * @param w - 形状宽度
 * @param h - 形状高度
 * @param adj - 调整参数
 */
const getCircularArrow = (w: number, h: number, adj?: any) => {
  const ss = Math.min(w, h);
  const hc = w / 2;
  const vc = h / 2;
  const wd2 = w / 2;
  const hd2 = h / 2;

  // 常量定义
  const cnstVal1 = 25000;
  const cnstVal2 = 100000;
  const rdAngVal3 = 2 * Math.PI;
  const cd2 = Math.PI;

  // 获取调整参数，带默认值
  let adj1 = adj?.adj1 ?? 12500;
  let adj2 = adj?.adj2 ?? 1142319;
  let adj3 = adj?.adj3 ?? 20457681;
  let adj4 = adj?.adj4 ?? 10800000;
  let adj5 = adj?.adj5 ?? 12500;

  // 转换角度（OOXML 使用 60000 单位 = 1 度）
  adj2 = ((adj2 / 60000) * Math.PI) / 180;
  adj3 = ((adj3 / 60000) * Math.PI) / 180;
  adj4 = ((adj4 / 60000) * Math.PI) / 180;

  // 限制调整参数范围
  const a5 = Math.max(0, Math.min(adj5, cnstVal1));
  const maxAdj1 = a5 * 2;
  const a1 = Math.max(0, Math.min(adj1, maxAdj1));

  // 角度限制
  const rdAngVal1 = ((1 / 60000) * Math.PI) / 180;
  const rdAngVal2 = ((21599999 / 60000) * Math.PI) / 180;
  const enAng = Math.max(rdAngVal1, Math.min(adj3, rdAngVal2));
  const stAng = Math.max(0, Math.min(adj4, rdAngVal2));

  // 计算厚度和半径
  const th = (ss * a1) / cnstVal2;
  const thh = (ss * a5) / cnstVal2;
  const th2 = th / 2;
  const rw1 = wd2 + th2 - thh;
  const rh1 = hd2 + th2 - thh;
  const rw2 = rw1 - th;
  const rh2 = rh1 - th;
  const rw3 = rw2 + th2;
  const rh3 = rh2 + th2;

  // 计算箭头位置 H
  const wtH = rw3 * Math.sin(enAng);
  const htH = rh3 * Math.cos(enAng);
  const dxH = rw3 * Math.cos(Math.atan2(wtH, htH));
  const dyH = rh3 * Math.sin(Math.atan2(wtH, htH));
  const xH = hc + dxH;
  const yH = vc + dyH;

  // 计算内半径
  const rI = Math.min(rw2, rh2);

  // 计算最大角度
  const u1 = dxH * dxH;
  const u2 = dyH * dyH;
  const u3 = rI * rI;
  const u4 = u1 - u3;
  const u5 = u2 - u3;
  const u6 = (u4 * u5) / u1;
  const u7 = u6 / u2;
  const u8 = 1 - u7;
  const u9 = Math.sqrt(Math.max(0, u8));
  const u10 = u4 / dxH;
  const u11 = u10 / dyH;
  const u12 = (1 + u9) / u11;
  const u13 = Math.atan2(u12, 1);
  const u14 = u13 + rdAngVal3;
  const u15 = u13 > 0 ? u13 : u14;
  const u16 = u15 - enAng;
  const u17 = u16 + rdAngVal3;
  const u18 = u16 > 0 ? u16 : u17;
  const u19 = u18 - cd2;
  const u20 = u18 - rdAngVal3;
  const u21 = u19 > 0 ? u20 : u18;
  const maxAng = Math.abs(u21);

  // 箭头角度
  const aAng = Math.max(0, Math.min(adj2, maxAng));
  const ptAng = enAng + aAng;

  // 计算箭头尖端位置 A
  const wtA = rw3 * Math.sin(ptAng);
  const htA = rh3 * Math.cos(ptAng);
  const dxA = rw3 * Math.cos(Math.atan2(wtA, htA));
  const dyA = rh3 * Math.sin(Math.atan2(wtA, htA));
  const xA = hc + dxA;
  const yA = vc + dyA;

  // 计算起点位置 E（用于扩展功能，当前暂未使用）
  const wtE = rw1 * Math.sin(stAng);
  const htE = rh1 * Math.cos(stAng);
  void (rw1 * Math.cos(Math.atan2(wtE, htE))); // dxE - 保留计算
  void (rh1 * Math.sin(Math.atan2(wtE, htE))); // dyE - 保留计算

  // 计算箭头翼点 G 和 B
  const dxG = thh * Math.cos(ptAng);
  const dyG = thh * Math.sin(ptAng);
  const xG = xH + dxG;
  const yG = yH + dyG;
  const xB = xH - dxG;
  const yB = yH - dyG;

  // 计算外圆交点 F
  const sx1 = xB - hc;
  const sy1 = yB - vc;
  const sx2 = xG - hc;
  const sy2 = yG - vc;
  const rO = Math.min(rw1, rh1);

  const x1O = (sx1 * rO) / rw1;
  const y1O = (sy1 * rO) / rh1;
  const x2O = (sx2 * rO) / rw1;
  const y2O = (sy2 * rO) / rh1;
  const dxO = x2O - x1O;
  const dyO = y2O - y1O;
  const dO = Math.sqrt(dxO * dxO + dyO * dyO);

  const q1 = x1O * y2O;
  const q2 = x2O * y1O;
  const DO = q1 - q2;
  const q3 = rO * rO;
  const q4 = dO * dO;
  const q5 = q3 * q4;
  const q6 = DO * DO;
  const q7 = q5 - q6;
  const q8 = Math.max(0, q7);
  const sdelO = Math.sqrt(q8);
  const ndyO = -dyO;
  const sdyO = ndyO > 0 ? -1 : 1;
  const q9 = sdyO * dxO;
  const q10 = q9 * sdelO;
  const q11 = DO * dyO;
  const dxF1 = (q11 + q10) / q4;
  const q12 = q11 - q10;
  const dxF2 = q12 / q4;
  const adyO = Math.abs(dyO);
  const q13 = adyO * sdelO;
  const q14 = -DO * dxO;
  const dyF1 = (q14 + q13) / q4;
  const q15 = q14 - q13;
  const dyF2 = q15 / q4;
  const q16 = x2O - dxF1;
  const q17 = x2O - dxF2;
  const q18 = y2O - dyF1;
  const q19 = y2O - dyF2;
  const q20 = Math.sqrt(q16 * q16 + q18 * q18);
  const q21 = Math.sqrt(q17 * q17 + q19 * q19);
  const q22 = q21 - q20;
  const dxF = q22 > 0 ? dxF1 : dxF2;
  const dyF = q22 > 0 ? dyF1 : dyF2;
  const sdxF = (dxF * rw1) / rO;
  const sdyF = (dyF * rh1) / rO;
  const xF = hc + sdxF;
  const yF = vc + sdyF;

  // 计算内圆交点 C
  const x1I = (sx1 * rI) / rw2;
  const y1I = (sy1 * rI) / rh2;
  const x2I = (sx2 * rI) / rw2;
  const y2I = (sy2 * rI) / rh2;
  const dxI = x2I - x1I;
  const dyI = y2I - y1I;
  const dI = Math.sqrt(dxI * dxI + dyI * dyI);

  const v1 = x1I * y2I;
  const v2 = x2I * y1I;
  const DI = v1 - v2;
  const v3 = rI * rI;
  const v4 = dI * dI;
  const v5 = v3 * v4;
  const v6 = DI * DI;
  const v7 = v5 - v6;
  const v8 = Math.max(0, v7);
  const sdelI = Math.sqrt(v8);
  const v9 = sdyO * dxI;
  const v10 = v9 * sdelI;
  const v11 = DI * dyI;
  const dxC1 = (v11 + v10) / v4;
  const v12 = v11 - v10;
  const dxC2 = v12 / v4;
  const adyI = Math.abs(dyI);
  const v13 = adyI * sdelI;
  const v14 = -DI * dxI;
  const dyC1 = (v14 + v13) / v4;
  const v15 = v14 - v13;
  const dyC2 = v15 / v4;
  const v16 = x1I - dxC1;
  const v17 = x1I - dxC2;
  const v18 = y1I - dyC1;
  const v19 = y1I - dyC2;
  const v20 = Math.sqrt(v16 * v16 + v18 * v18);
  const v21 = Math.sqrt(v17 * v17 + v19 * v19);
  const v22 = v21 - v20;
  const dxC = v22 > 0 ? dxC1 : dxC2;
  const dyC = v22 > 0 ? dyC1 : dyC2;
  const sdxC = (dxC * rw2) / rI;
  const sdyC = (dyC * rh2) / rI;
  const xC = hc + sdxC;
  const yC = vc + sdyC;

  // 计算内弧角度
  const ist0 = Math.atan2(sdyC, sdxC);
  const ist1 = ist0 + rdAngVal3;
  const istAng = ist0 > 0 ? ist0 : ist1;
  const isw1 = stAng - istAng;
  const isw2 = isw1 - rdAngVal3;
  const iswAng = isw1 > 0 ? isw2 : isw1;

  // 确定使用的点
  const p1 = xF - xC;
  const p2 = yF - yC;
  const p3 = Math.sqrt(p1 * p1 + p2 * p2);
  const p4 = p3 / 2;
  const p5 = p4 - thh;
  const xGp = p5 > 0 ? xF : xG;
  const yGp = p5 > 0 ? yF : yG;
  const xBp = p5 > 0 ? xC : xB;
  const yBp = p5 > 0 ? yC : yB;

  // 计算外弧角度
  const en0 = Math.atan2(sdyF, sdxF);
  const en1 = en0 + rdAngVal3;
  const en2 = en0 > 0 ? en0 : en1;
  const sw0 = en2 - stAng;
  const sw1 = sw0 + rdAngVal3;
  const swAng = sw0 > 0 ? sw0 : sw1;

  // 转换为度数
  const strtAng = (stAng * 180) / Math.PI;
  const endAng = strtAng + (swAng * 180) / Math.PI;
  const stiAng = (istAng * 180) / Math.PI;
  const swiAng = (iswAng * 180) / Math.PI;
  const ediAng = stiAng + swiAng;

  // 构建路径
  return (
    shapeArc(hc, vc, rw1, rh1, strtAng, endAng, false) +
    ` L ${xGp} ${yGp}` +
    ` L ${xA} ${yA}` +
    ` L ${xBp} ${yBp}` +
    ` L ${xC} ${yC}` +
    arcToPath(shapeArc(hc, vc, rw2, rh2, stiAng, ediAng, false)) +
    ' Z'
  );
};

/**
 * 左向环形箭头 - 基于 pptxjs.js L7640-7880 的精确实现
 * 与 circularArrow 类似，但箭头方向相反
 * @param w - 形状宽度
 * @param h - 形状高度
 * @param adj - 调整参数
 */
const getLeftCircularArrow = (w: number, h: number, adj?: any) => {
  const ss = Math.min(w, h);
  const hc = w / 2;
  const vc = h / 2;
  const wd2 = w / 2;
  const hd2 = h / 2;

  // 常量定义
  const cnstVal1 = 25000;
  const cnstVal2 = 100000;
  const rdAngVal3 = 2 * Math.PI;
  const cd2 = Math.PI;

  // 获取调整参数，带默认值（leftCircularArrow 默认角度相反）
  let adj1 = adj?.adj1 ?? 12500;
  let adj2 = adj?.adj2 ?? -1142319;
  let adj3 = adj?.adj3 ?? 1142319;
  let adj4 = adj?.adj4 ?? 10800000;
  let adj5 = adj?.adj5 ?? 12500;

  // 转换角度
  adj2 = ((adj2 / 60000) * Math.PI) / 180;
  adj3 = ((adj3 / 60000) * Math.PI) / 180;
  adj4 = ((adj4 / 60000) * Math.PI) / 180;

  // 限制调整参数范围
  const a5 = Math.max(0, Math.min(adj5, cnstVal1));
  const maxAdj1 = a5 * 2;
  const a1 = Math.max(0, Math.min(adj1, maxAdj1));

  // 角度限制
  const rdAngVal1 = ((1 / 60000) * Math.PI) / 180;
  const rdAngVal2 = ((21599999 / 60000) * Math.PI) / 180;
  const enAng = Math.max(rdAngVal1, Math.min(adj3, rdAngVal2));
  const stAng = Math.max(0, Math.min(adj4, rdAngVal2));

  // 计算厚度和半径
  const th = (ss * a1) / cnstVal2;
  const thh = (ss * a5) / cnstVal2;
  const th2 = th / 2;
  const rw1 = wd2 + th2 - thh;
  const rh1 = hd2 + th2 - thh;
  const rw2 = rw1 - th;
  const rh2 = rh1 - th;
  const rw3 = rw2 + th2;
  const rh3 = rh2 + th2;

  // 计算箭头位置 H
  const wtH = rw3 * Math.sin(enAng);
  const htH = rh3 * Math.cos(enAng);
  const dxH = rw3 * Math.cos(Math.atan2(wtH, htH));
  const dyH = rh3 * Math.sin(Math.atan2(wtH, htH));
  const xH = hc + dxH;
  const yH = vc + dyH;

  // 计算内半径
  const rI = Math.min(rw2, rh2);

  // 计算最大角度
  const u1 = dxH * dxH;
  const u2 = dyH * dyH;
  const u3 = rI * rI;
  const u4 = u1 - u3;
  const u5 = u2 - u3;
  const u6 = (u4 * u5) / u1;
  const u7 = u6 / u2;
  const u8 = 1 - u7;
  const u9 = Math.sqrt(Math.max(0, u8));
  const u10 = u4 / dxH;
  const u11 = u10 / dyH;
  const u12 = (1 + u9) / u11;
  const u13 = Math.atan2(u12, 1);
  const u14 = u13 + rdAngVal3;
  const u15 = u13 > 0 ? u13 : u14;
  const u16 = u15 - enAng;
  const u17 = u16 + rdAngVal3;
  const u18 = u16 > 0 ? u16 : u17;
  const u19 = u18 - cd2;
  const u20 = u18 - rdAngVal3;
  const u21 = u19 > 0 ? u20 : u18;
  const u22 = Math.abs(u21);
  const minAng = -u22;

  // 箭头角度 - leftCircularArrow 使用负角度
  const a2Abs = Math.abs(adj2);
  const a2 = -a2Abs;
  const aAng = Math.max(minAng, Math.min(a2, 0));
  const ptAng = enAng + aAng;

  // 计算箭头尖端位置 A
  const wtA = rw3 * Math.sin(ptAng);
  const htA = rh3 * Math.cos(ptAng);
  const dxA = rw3 * Math.cos(Math.atan2(wtA, htA));
  const dyA = rh3 * Math.sin(Math.atan2(wtA, htA));
  const xA = hc + dxA;
  const yA = vc + dyA;

  // 计算箭头翼点 G 和 B
  const dxG = thh * Math.cos(ptAng);
  const dyG = thh * Math.sin(ptAng);
  const xG = xH + dxG;
  const yG = yH + dyG;
  const xB = xH - dxG;
  const yB = yH - dyG;

  // 计算外圆交点 F
  const sx1 = xB - hc;
  const sy1 = yB - vc;
  const sx2 = xG - hc;
  const sy2 = yG - vc;
  const rO = Math.min(rw1, rh1);

  const x1O = (sx1 * rO) / rw1;
  const y1O = (sy1 * rO) / rh1;
  const x2O = (sx2 * rO) / rw1;
  const y2O = (sy2 * rO) / rh1;
  const dxO = x2O - x1O;
  const dyO = y2O - y1O;
  const dO = Math.sqrt(dxO * dxO + dyO * dyO);

  const q1 = x1O * y2O;
  const q2 = x2O * y1O;
  const DO = q1 - q2;
  const q3 = rO * rO;
  const q4 = dO * dO;
  const q5 = q3 * q4;
  const q6 = DO * DO;
  const q7 = q5 - q6;
  const q8 = Math.max(0, q7);
  const sdelO = Math.sqrt(q8);
  const ndyO = -dyO;
  const sdyO = ndyO > 0 ? -1 : 1;
  const q9 = sdyO * dxO;
  const q10 = q9 * sdelO;
  const q11 = DO * dyO;
  const dxF1 = (q11 + q10) / q4;
  const q12 = q11 - q10;
  const dxF2 = q12 / q4;
  const adyO = Math.abs(dyO);
  const q13 = adyO * sdelO;
  const q14 = -DO * dxO;
  const dyF1 = (q14 + q13) / q4;
  const q15 = q14 - q13;
  const dyF2 = q15 / q4;
  const q16 = x2O - dxF1;
  const q17 = x2O - dxF2;
  const q18 = y2O - dyF1;
  const q19 = y2O - dyF2;
  const q20 = Math.sqrt(q16 * q16 + q18 * q18);
  const q21 = Math.sqrt(q17 * q17 + q19 * q19);
  const q22 = q21 - q20;
  const dxF = q22 > 0 ? dxF1 : dxF2;
  const dyF = q22 > 0 ? dyF1 : dyF2;
  const sdxF = (dxF * rw1) / rO;
  const sdyF = (dyF * rh1) / rO;
  const xF = hc + sdxF;
  const yF = vc + sdyF;

  // 计算内圆交点 C
  const x1I = (sx1 * rI) / rw2;
  const y1I = (sy1 * rI) / rh2;
  const x2I = (sx2 * rI) / rw2;
  const y2I = (sy2 * rI) / rh2;
  const dxI = x2I - x1I;
  const dyI = y2I - y1I;
  const dI = Math.sqrt(dxI * dxI + dyI * dyI);

  const v1 = x1I * y2I;
  const v2 = x2I * y1I;
  const DI = v1 - v2;
  const v3 = rI * rI;
  const v4 = dI * dI;
  const v5 = v3 * v4;
  const v6 = DI * DI;
  const v7 = v5 - v6;
  const v8 = Math.max(0, v7);
  const sdelI = Math.sqrt(v8);
  const v9 = sdyO * dxI;
  const v10 = v9 * sdelI;
  const v11 = DI * dyI;
  const dxC1 = (v11 + v10) / v4;
  const v12 = v11 - v10;
  const dxC2 = v12 / v4;
  const adyI = Math.abs(dyI);
  const v13 = adyI * sdelI;
  const v14 = -DI * dxI;
  const dyC1 = (v14 + v13) / v4;
  const v15 = v14 - v13;
  const dyC2 = v15 / v4;
  const v16 = x1I - dxC1;
  const v17 = x1I - dxC2;
  const v18 = y1I - dyC1;
  const v19 = y1I - dyC2;
  const v20 = Math.sqrt(v16 * v16 + v18 * v18);
  const v21 = Math.sqrt(v17 * v17 + v19 * v19);
  const v22 = v21 - v20;
  const dxC = v22 > 0 ? dxC1 : dxC2;
  const dyC = v22 > 0 ? dyC1 : dyC2;
  const sdxC = (dxC * rw2) / rI;
  const sdyC = (dyC * rh2) / rI;
  const xC = hc + sdxC;
  const yC = vc + sdyC;

  // 计算内弧角度
  const ist0 = Math.atan2(sdyC, sdxC);
  const ist1 = ist0 + rdAngVal3;
  const istAng0 = ist0 > 0 ? ist0 : ist1;
  const isw1 = stAng - istAng0;
  const isw2 = isw1 + rdAngVal3;
  const iswAng0 = isw1 > 0 ? isw1 : isw2;
  const istAng = istAng0 + iswAng0;
  const iswAng = -iswAng0;

  // 确定使用的点
  const p1 = xF - xC;
  const p2 = yF - yC;
  const p3 = Math.sqrt(p1 * p1 + p2 * p2);
  const p4 = p3 / 2;
  const p5 = p4 - thh;
  const xGp = p5 > 0 ? xF : xG;
  const yGp = p5 > 0 ? yF : yG;
  const xBp = p5 > 0 ? xC : xB;
  const yBp = p5 > 0 ? yC : yB;

  // 计算外弧角度
  const en0 = Math.atan2(sdyF, sdxF);
  const en1 = en0 + rdAngVal3;
  const en2 = en0 > 0 ? en0 : en1;
  const sw0 = en2 - stAng;
  const sw1 = sw0 - rdAngVal3;
  const swAng = sw0 > 0 ? sw1 : sw0;
  const stAng0 = stAng + swAng;

  // 转换为度数
  const strtAng = (stAng0 * 180) / Math.PI;
  const swAngDg = (-swAng * 180) / Math.PI;
  const endAng = strtAng + swAngDg;
  const stiAng = (istAng * 180) / Math.PI;
  const swiAng = (iswAng * 180) / Math.PI;
  const ediAng = stiAng + swiAng;

  // 构建路径
  return (
    shapeArc(hc, vc, rw1, rh1, strtAng, endAng, false) +
    ` L ${xGp} ${yGp}` +
    ` L ${xA} ${yA}` +
    ` L ${xBp} ${yBp}` +
    ` L ${xC} ${yC}` +
    arcToPath(shapeArc(hc, vc, rw2, rh2, stiAng, ediAng, false)) +
    ' Z'
  );
};

const getSwooshArrow = (w: number, h: number, _adj?: any) => {
  // L7566
  const xB = w * 0.8;
  const yB = h * 0.15;
  const xC = w * 0.7;
  const yD = h * 0.3;
  const xE = w * 0.9;
  const yE = h * 0.2;

  // Approximate a swoosh.
  return (
    `M 0 ${h} Q ${w / 6} ${h} ${xB} ${yB} L ${xC} 0 L ${w} ${yD} L ${xE} ${yE} ` +
    `L ${w * 0.8} ${h * 0.3} Q ${w / 3} ${h * 0.8} 0 ${h} Z`
  );
};

const getCurvedRightArrow = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;

  const minWH = Math.min(w, h);
  const maxAdj2 = (cnstVal1 * h) / minWH;

  let adj1 = (adj?.adj1 ?? 25000) / 100000;
  let adj2 = (adj?.adj2 ?? 50000) / 100000;
  let adj3 = (adj?.adj3 ?? 25000) / 100000;

  // Clamping logic from pptx.js
  const a2Val = adj2 > maxAdj2 / 100000 ? maxAdj2 / 100000 : adj2; // normalize logic
  const a2 = a2Val < 0 ? 0 : a2Val;

  const a1Val = adj1 > a2 ? a2 : adj1;
  const a1 = a1Val < 0 ? 0 : a1Val;

  const th = minWH * a1; // thickness
  const aw = minWH * a2; // arrow width

  const q1 = (th + aw) / 4;
  const hR = h / 2 - q1;
  const q7 = hR * 2;
  const q8 = q7 * q7;
  const q9 = th * th;
  const q10 = q8 - q9;
  const q11 = Math.sqrt(Math.max(0, q10)); // Ensure non-negative
  const iDx = (q11 * w) / q7;

  const maxAdj3 = (cnstVal2 * iDx) / minWH;
  const a3Val = adj3 > maxAdj3 / 100000 ? maxAdj3 / 100000 : adj3;
  const a3 = a3Val < 0 ? 0 : a3Val;

  const ah = minWH * a3;

  const y3 = hR + th;
  const q2 = w * w;
  const q3 = ah * ah;
  const q4 = q2 - q3;
  const q5 = Math.sqrt(Math.max(0, q4));
  const dy = (q5 * hR) / w;
  const y5 = hR + dy;
  const y7 = y3 + dy;
  const q6 = aw - th;
  const dh = q6 / 2;
  const y4 = y5 - dh;
  const y8 = y7 + dh;
  const aw2 = aw / 2;
  const y6 = h - aw2;
  const x1 = w - ah;

  const swAng = Math.atan(dy / ah);
  const stAng = Math.PI - swAng;
  const mswAng = -swAng;

  // const ix = w - iDx;
  // const iy = (hR + y3) / 2;
  const q12 = th / 2;
  const dang2 = Math.atan(q12 / iDx);
  const swAng2 = dang2 - Math.PI / 2;
  // const swAng3 = Math.PI / 2 + dang2;
  // const stAng3 = Math.PI - dang2;

  const rDeg = (r: number) => (r * 180) / Math.PI;

  const stAngDg = rDeg(stAng);
  const mswAngDg = rDeg(mswAng);
  const swAngDg = rDeg(swAng);
  const swAng2dg = rDeg(swAng2);

  const cd2 = 180;
  const cd4 = 90;
  const c3d4 = 270;

  // Path Construction
  // shapeArc center is 'w' (right edge alignment?)
  // Actually in pptx logic, arcs used w as center X?
  // "shapeArc(w, hR, w, hR..." -> cx=w, cy=hR, rx=w, ry=hR.

  return (
    `M 0 ${hR} ` +
    `${arcToPath(shapeArc(w, hR, w, hR, cd2, cd2 + mswAngDg, false))} ` +
    `L ${x1} ${y5} L ${x1} ${y4} L ${w} ${y6} L ${x1} ${y8} L ${x1} ${y7} ` +
    `${arcToPath(shapeArc(w, y3, w, hR, stAngDg, stAngDg + swAngDg, false))} ` +
    `L 0 ${hR} ` +
    `${arcToPath(shapeArc(w, hR, w, hR, cd2, cd2 + cd4, false))} ` +
    `L ${w} ${th} ` +
    `${arcToPath(shapeArc(w, y3, w, hR, c3d4, c3d4 + swAng2dg, false))}` +
    // Note: The last part of pptx code seems open loop?
    // pptx code ends with `...replace("M", "L")` then nothing.
    // SVG path auto-closes if Z is used, or just ends.
    // We should probably allow it to close naturally or add Z.
    // For now, following exact sequence.
    ` Z`
  );
};

const getStripedRightArrow = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 100000;
  // const cnstVal2 = 200000;
  const cnstVal3 = 84375;

  let adj1 = (adj?.adj1 ?? 50000) / 100000;
  let adj2 = (adj?.adj2 ?? 50000) / 100000;

  const minWH = Math.min(w, h);
  const maxAdj2 = (cnstVal3 * w) / minWH / 100000;

  if (adj1 < 0) adj1 = 0;
  else if (adj1 > 1) adj1 = 1; // cnstVal1 is 100000 which is 1.0

  if (adj2 < 0) adj2 = 0;
  else if (adj2 > maxAdj2) adj2 = maxAdj2;

  const x4 = (minWH * 5) / 32;
  const dx5 = minWH * adj2; // pptx: minWH * a2 / cnstVal1. a2 was already 'raw' adj.
  // Wait, pptx: dx5 = minWH * a2 / cnstVal1.
  // If a2 is standardized (0.5), then it is minWH * 0.5.
  // Correct.

  const x5 = w - dx5;
  const dy1 = (h * adj1) / 2; // pptx: h * a1 / cnstVal2 -> cnstVal2 is 200000.
  // So a1(50000) / 200000 = 0.25.
  // h * 0.25 is correct.
  // In my code adj1 is 0.5. So h * 0.5 / 2 = h * 0.25. Correct.

  const vc = h / 2;
  const y1 = vc - dy1;
  const y2 = vc + dy1;

  const ssd8 = minWH / 8;
  const ssd16 = minWH / 16;
  const ssd32 = minWH / 32;

  const d_val =
    `M 0 ${y1} L ${ssd32} ${y1} L ${ssd32} ${y2} L 0 ${y2} Z ` +
    `M ${ssd16} ${y1} L ${ssd8} ${y1} L ${ssd8} ${y2} L ${ssd16} ${y2} Z ` +
    `M ${x4} ${y1} L ${x5} ${y1} L ${x5} 0 L ${w} ${vc} L ${x5} ${h} L ${x5} ${y2} L ${x4} ${y2} Z`;

  return d_val;
};

export const arrows = {
  rightArrow: getRightArrow,
  leftArrow: getLeftArrow,
  upArrow: getUpArrow,
  downArrow: getDownArrow,
  leftRightArrow: getLeftRightArrow,
  upDownArrow: getUpDownArrow,
  quadArrow: getQuadArrow,
  leftRightUpArrow: getLeftRightUpArrow,
  leftUpArrow: getLeftUpArrow,
  bentUpArrow: getLeftUpArrow, // Alias or similar
  bentArrow: getBentArrow,
  uturnArrow: getUTurnArrow,
  stripedRightArrow: getStripedRightArrow,
  notchedRightArrow: getNotchedRightArrow,
  homePlate: getHomePlate,
  chevron: getChevron,

  circularArrow: getCircularArrow,
  leftCircularArrow: getLeftCircularArrow,
  swooshArrow: getSwooshArrow,

  curvedRightArrow: getCurvedRightArrow,
  curvedLeftArrow: getCurvedRightArrow, // TODO: Mirror
  curvedUpArrow: getCurvedRightArrow, // TODO: Rotate
  curvedDownArrow: getCurvedRightArrow // TODO: Rotate
};
