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
  // Equal sign
  const t = Math.min(w, h) * ((adj?.adj1 ?? 23520) / 100000);
  const gap = Math.min(w, h) * 0.5;
  const y1 = h / 2 - gap / 4 - t / 2;
  const y2 = h / 2 + gap / 4 - t / 2;
  let p = `M 0 ${y1} L ${w} ${y1} L ${w} ${y1 + t} L 0 ${y1 + t} Z M 0 ${y2} L ${w} ${y2} L ${w} ${y2 + t} L 0 ${y2 + t} Z `;

  // Slash
  // Approximate slash
  const slashW = t * 0.8;
  // Slanted line from bottom-left to top-right
  const sx = w * 0.2;
  const ex = w * 0.8;
  p += `M ${sx} ${h} L ${sx + slashW} ${h} L ${ex + slashW} 0 L ${ex} 0 Z`;
  return p;
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
