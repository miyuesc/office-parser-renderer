import { getRect } from '../primitives';

const getPlus = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 23520) / 100000;
  const ss = Math.min(w, h);
  const th = ss * a1;
  const dx = th / 2;
  const x1 = w / 2 - dx;
  const x2 = w / 2 + dx;
  const y1 = h / 2 - dx;
  const y2 = h / 2 + dx;

  return `M ${x1} 0 L ${x2} 0 L ${x2} ${y1} L ${w} ${y1} L ${w} ${y2} L ${x2} ${y2} L ${x2} ${h} L ${x1} ${h} L ${x1} ${y2} L 0 ${y2} L 0 ${y1} L ${x1} ${y1} Z`;
};

const getMathMultiply = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 23520) / 100000;
  const ss = Math.min(w, h);
  const th = ss * a1;

  const cx = w / 2,
    cy = h / 2;
  const d = th / Math.sqrt(2);

  return `M ${0} ${d * 2} L ${d * 2} ${0} L ${cx} ${cy - d * 2} L ${w - d * 2} 0 L ${w} ${d * 2} L ${cx + d * 2} ${cy} L ${w} ${h - d * 2} L ${w - d * 2} ${h} L ${cx} ${cy + d * 2} L ${d * 2} ${h} L 0 ${h - d * 2} L ${cx - d * 2} ${cy} Z`;
};

const getMathDivide = (w: number, h: number, adj?: any) => {
  const t = Math.min(w, h) * ((adj?.adj1 ?? 23520) / 100000);
  const gap = Math.min(w, h) * 0.5;
  const yLine = h / 2 - t / 2;

  const r = t * 1.5; // dot radius
  const yTop = h / 2 - gap / 2 - r;
  const yBot = h / 2 + gap / 2 + r;
  const x = w / 2;

  // Line
  let p = `M 0 ${yLine} L ${w} ${yLine} L ${w} ${yLine + t} L 0 ${yLine + t} Z `;
  // Top Dot (Circle)
  p += `M ${x - r} ${yTop} A ${r} ${r} 0 1 1 ${x + r} ${yTop} A ${r} ${r} 0 1 1 ${x - r} ${yTop} Z `;
  // Bottom Dot
  p += `M ${x - r} ${yBot} A ${r} ${r} 0 1 1 ${x + r} ${yBot} A ${r} ${r} 0 1 1 ${x - r} ${yBot} Z`;
  return p;
};

const getMathNotEqual = (w: number, h: number, adj?: any) => {
  // 移植自 pptxjs.js L6975+
  const adj1 = adj?.adj1 ?? 23520; // 厚度
  const adj2 = adj?.adj2 ?? 6600000; // 角度 (60000 = 1度)
  const adj3 = adj?.adj3 ?? 11760; // 间距

  const hc = w / 2,
    vc = h / 2,
    hd2 = h / 2;
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 200000;
  const cnstVal4 = 73490;
  const angVal1 = (70 * Math.PI) / 180;
  const angVal2 = (110 * Math.PI) / 180;

  const a1 = adj1 < 0 ? 0 : adj1 > cnstVal1 ? cnstVal1 : adj1;
  const crAng = ((adj2 / 60000) * Math.PI) / 180;
  const clampedAng = crAng < angVal1 ? angVal1 : crAng > angVal2 ? angVal2 : crAng;

  const a3 = adj3 < 0 ? 0 : adj3 > cnstVal2 - a1 * 2 ? cnstVal2 - a1 * 2 : adj3;

  const dy1 = (h * a1) / cnstVal2;
  const dy2 = (h * a3) / cnstVal3;
  const dx1 = (w * cnstVal4) / cnstVal3;

  const x1 = hc - dx1;
  const x8 = hc + dx1;
  const y2 = vc - dy2;
  const y3 = vc + dy2;
  const y1 = y2 - dy1;
  const y4 = y3 + dy1;

  const cadj2 = clampedAng - Math.PI / 2;
  const xadj2 = hd2 * Math.tan(cadj2);
  const len = Math.sqrt(xadj2 * xadj2 + hd2 * hd2);
  const bhw = (len * dy1) / hd2;
  const bhw2 = bhw / 2;

  const x7 = hc + xadj2 - bhw2;
  const dx67 = (xadj2 * y1) / hd2;
  const x6 = x7 - dx67;
  const dx57 = (xadj2 * y2) / hd2;
  const x5 = x7 - dx57;
  const dx47 = (xadj2 * y3) / hd2;
  const x4 = x7 - dx47;
  const dx37 = (xadj2 * y4) / hd2;
  const x3 = x7 - dx37;

  const rx = cadj2 > 0 ? x7 + (dy1 * hd2) / len : x7 + bhw;
  const lx = cadj2 > 0 ? x7 : x7 + bhw - (dy1 * hd2) / len;
  const ry = cadj2 > 0 ? (dy1 * xadj2) / len : 0;
  const ly = cadj2 > 0 ? 0 : (-dy1 * xadj2) / len;

  const rx6 = x6 + bhw,
    rx5 = x5 + bhw,
    rx4 = x4 + bhw,
    rx3 = x3 + bhw;
  const drx = w - lx,
    dlx = w - rx,
    dry = h - ly,
    dly = h - ry;

  return (
    `M ${x1},${y1} L ${x6},${y1} L ${lx},${ly} L ${rx},${ry} L ${rx6},${y1} L ${x8},${y1} ` +
    `L ${x8},${y2} L ${rx5},${y2} L ${rx4},${y3} L ${x8},${y3} L ${x8},${y4} L ${rx3},${y4} ` +
    `L ${drx},${dry} L ${dlx},${dly} L ${x3},${y4} L ${x1},${y4} L ${x1},${y3} L ${x4},${y3} ` +
    `L ${x5},${y2} L ${x1},${y2} Z`
  );
};

export const math = {
  plus: getPlus,
  mathPlus: getPlus,
  mathMinus: (w: number, h: number, adj: any) => {
    const t = Math.min(w, h) * ((adj?.adj1 ?? 23520) / 100000);
    return `M 0 ${h / 2 - t / 2} L ${w} ${h / 2 - t / 2} L ${w} ${h / 2 + t / 2} L 0 ${h / 2 + t / 2} Z`;
  },
  mathMultiply: getMathMultiply,
  mathEqual: (w: number, h: number, adj: any) => {
    const t = Math.min(w, h) * ((adj?.adj1 ?? 23520) / 100000);
    const gap = Math.min(w, h) * 0.5;
    const y1 = h / 2 - gap / 4 - t / 2;
    const y2 = h / 2 + gap / 4 - t / 2;
    return `M 0 ${y1} L ${w} ${y1} L ${w} ${y1 + t} L 0 ${y1 + t} Z M 0 ${y2} L ${w} ${y2} L ${w} ${y2 + t} L 0 ${y2 + t} Z`;
  },
  mathDivide: getMathDivide,
  mathNotEqual: getMathNotEqual
};
