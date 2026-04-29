import { shapeArc, arcToPath } from '../primitives';

const getBlockArc = (w: number, h: number, adj?: any) => {
  const startAng = (adj?.adj2 ?? 0) / 60000;
  const sweepAng = (adj?.adj3 ?? 10800000) / 60000;
  const thickness = (adj?.adj1 ?? 25000) / 100000;

  const cx = w / 2,
    cy = h / 2;
  const r = Math.min(w, h) / 2;
  const ir = r * (1 - thickness);

  const endAng = startAng + sweepAng;

  return (
    shapeArc(cx, cy, r, r, startAng, endAng, false) +
    ' L ' +
    (cx + ir * Math.cos((endAng * Math.PI) / 180)) +
    ' ' +
    (cy + ir * Math.sin((endAng * Math.PI) / 180)) +
    arcToPath(shapeArc(cx, cy, ir, ir, endAng, startAng, false)) +
    ' Z'
  );
};

const getHalfFrame = (w: number, h: number, adj?: any) => {
  const th = Math.min(w, h) * ((adj?.adj1 ?? 16667) / 100000);
  const x1 = th;
  const y1 = th;
  const x2 = w - th;
  const y2 = h - th;
  return `M 0 0 L ${w} 0 L ${x2} ${y1} L ${x1} ${y1} L ${x1} ${y2} L 0 ${h} Z`;
};

const getFrame = (w: number, h: number, adj?: any) => {
  const th = Math.min(w, h) * ((adj?.adj1 ?? 12500) / 100000);
  return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${th} ${th} L ${w - th} ${th} L ${w - th} ${h - th} L ${th} ${h - th} Z`;
};

const getCan = (w: number, h: number, adj?: any) => {
  const a = (adj?.adj1 ?? 25000) / 100000;
  const ss = Math.min(w, h);
  const y1 = ss * a;
  const cx = w / 2;
  return (
    shapeArc(cx, y1, w / 2, y1, 0, 180, false) +
    arcToPath(shapeArc(cx, y1, w / 2, y1, 180, 360, false)) +
    ` L ${w} ${h - y1} ` +
    arcToPath(shapeArc(cx, h - y1, w / 2, y1, 0, 180, false)) +
    ` L 0 ${y1} Z`
  );
};

const getSmileyFace = (w: number, h: number, adj?: any) => {
  const cnstVal1 = 50000;
  const cnstVal2 = 100000;
  const cnstVal3 = 4653;
  const adj1 = adj?.adj1 ?? 4653; // 默认深浅
  const a = adj1 < -cnstVal3 ? -cnstVal3 : adj1 > cnstVal3 ? cnstVal3 : adj1;

  const wd2 = w / 2,
    hd2 = h / 2;
  const x1 = (w * 4969) / 21699;
  const x2 = (w * 6215) / 21600;
  const x3 = (w * 13135) / 21600;
  const x4 = (w * 16640) / 21600;
  const y1 = (h * 7570) / 21600;
  const y3 = (h * 16515) / 21600;
  const dy2 = (h * a) / cnstVal2;
  const y2 = y3 - dy2;
  const dy3 = (h * a) / cnstVal1;
  const y5 = y3 + dy2 + dy3;

  const wR = (w * 1125) / 21600;
  const hR = (h * 1125) / 21600;
  const cX1 = x2 + wR; // wR * Math.cos(PI) correction
  const cX2 = x3 + wR;

  // Eyes + Mouth + Head
  const eyes = shapeArc(cX1, y1, wR, hR, 180, 540, false) + ' ' + shapeArc(cX2, y1, wR, hR, 180, 540, false);
  const mouth = ` M ${x1} ${y2} Q ${wd2} ${y5} ${x4} ${y2} Q ${wd2} ${y5} ${x1} ${y2}`;
  const head = ` M 0 ${hd2} ` + arcToPath(shapeArc(wd2, hd2, wd2, hd2, 180, 540, false)) + ' Z';

  return eyes + mouth + head;
};

const getArc = (w: number, h: number, adj?: any) => {
  const st = (adj?.adj1 ?? 16200000) / 60000;
  const sw = (adj?.adj2 ?? 0) / 60000;
  return shapeArc(w / 2, h / 2, w / 2, h / 2, st, st + sw, false);
};

const getChord = (w: number, h: number, adj?: any) => {
  const st = (adj?.adj1 ?? 2700000) / 60000;
  const sw = (adj?.adj2 ?? 16200000) / 60000;
  return shapeArc(w / 2, h / 2, w / 2, h / 2, st, st + sw, true);
};

const getPie = (w: number, h: number, adj?: any) => {
  const st = (adj?.adj1 ?? 0) / 60000;
  const sw = (adj?.adj2 ?? 16200000) / 60000;
  const cx = w / 2,
    cy = h / 2;
  const r = Math.min(w, h) / 2;
  const rad1 = (st * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad1);
  const y1 = cy + r * Math.sin(rad1);
  return `M ${cx} ${cy} L ${x1} ${y1} ` + arcToPath(shapeArc(cx, cy, r, r, st, st + sw, false)) + ' Z';
};

const getMoon = (w: number, h: number, adj?: any) => {
  const a = (adj?.adj1 ?? 50000) / 100000;
  const cx = w / 2;
  const rX = w / 2,
    rY = h / 2;
  const innerRX = Math.abs(rX - w * a);
  return `M ${cx} 0 A ${rX} ${rY} 0 1 1 ${cx} ${h} A ${innerRX} ${rY} 0 1 0 ${cx} 0 Z`;
};

const getWave = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 12500) / 100000;
  const a2 = (adj?.adj2 ?? 0) / 50000;
  const y1 = h * a1;
  const dy = (y1 * 10) / 3;
  const y2 = h - y1;
  const dx = w * a2;

  const xL = -dx,
    xR = w - dx;
  const midX = (xL + xR) / 2;

  return `M ${xL} ${y1} C ${midX / 2} ${y1 - dy} ${midX / 2} ${y1 + dy} ${midX} ${y1} C ${xR - midX / 2} ${y1 - dy} ${xR - midX / 2} ${y1 + dy} ${xR} ${y1} L ${w + dx} ${y2} C ${w} ${y2 + dy} ${w / 2} ${y2 - dy} 0 ${y2} Z`;
};

const getDoubleWave = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 6250) / 100000;
  const y1 = h * a1;
  const dy = (y1 * 10) / 3;
  const y4 = h - y1;
  // Two wave segments
  return `M 0 ${y1} C ${w / 4} ${y1 - dy} ${w / 4} ${y1 + dy} ${w / 2} ${y1} C ${(3 * w) / 4} ${y1 - dy} ${(3 * w) / 4} ${y1 + dy} ${w} ${y1} L ${w} ${y4} C ${(3 * w) / 4} ${y4 + dy} ${(3 * w) / 4} ${y4 - dy} ${w / 2} ${y4} C ${w / 4} ${y4 + dy} ${w / 4} ${y4 - dy} 0 ${y4} Z`;
};

const getFoldedCorner = (w: number, h: number, adj?: any) => {
  const a = (adj?.adj1 ?? 16667) / 100000;
  const ss = Math.min(w, h);
  const dy = ss * a;
  const fold = dy / 5;
  const x1 = w - dy,
    x2 = x1 + fold;
  const y2 = h - dy,
    y1 = y2 + fold;

  return `M ${x1} ${h} L ${x2} ${y1} L ${w} ${y2} L ${x1} ${h} L 0 ${h} L 0 0 L ${w} 0 L ${w} ${y2} Z`;
};

export const shapes = {
  blockArc: getBlockArc,
  halfFrame: getHalfFrame,
  frame: getFrame,
  corner: getHalfFrame,
  foldedCorner: getFoldedCorner,
  can: getCan,
  cube: (w: number, h: number) =>
    `M 0 ${h * 0.25} L ${w * 0.75} ${h * 0.25} L ${w * 0.75} ${h} L 0 ${h} Z M 0 ${h * 0.25} L ${w * 0.25} 0 L ${w} 0 L ${w} ${h * 0.75} L ${w * 0.75} ${h} L ${w * 0.75} ${h * 0.25} M ${w} 0 L ${w * 0.75} ${h * 0.25}`,
  smileyFace: getSmileyFace,
  heart: (w: number, h: number) =>
    `M ${w / 2} ${h * 0.3} C ${w / 2} 0 ${0} ${0} ${0} ${h * 0.3} C ${0} ${h * 0.6} ${w / 2} ${h * 0.9} ${w / 2} ${h} C ${w / 2} ${h * 0.9} ${w} ${h * 0.6} ${w} ${h * 0.3} C ${w} 0 ${w / 2} 0 ${w / 2} ${h * 0.3} Z`,
  lightningBolt: (w: number, h: number) =>
    `M ${w * 0.6} 0 L ${w * 0.4} ${h * 0.6} L ${w * 0.6} ${h * 0.6} L ${w * 0.3} ${h} L ${w * 0.5} ${h * 0.4} L ${w * 0.3} ${h * 0.4} Z`,
  moon: getMoon,
  sun: (w: number, h: number) => {
    const r = Math.min(w, h) / 3;
    const cx = w / 2,
      cy = h / 2;
    let s = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    // Add Rays
    for (let i = 0; i < 8; i++) {
      const ang = (i * 45 * Math.PI) / 180;
      const x1 = cx + Math.cos(ang) * r;
      const y1 = cy + Math.sin(ang) * r;
      const x2 = cx + Math.cos(ang) * (r * 1.4);
      const y2 = cy + Math.sin(ang) * (r * 1.4);
      s += ` M ${x1} ${y1} L ${x2} ${y2}`;
    }
    return s;
  },
  arc: getArc,
  chord: getChord,
  pie: getPie,
  pieWedge: getPie,

  // Ribbons/Scrolls
  ribbon: getDoubleWave,
  ribbon2: getDoubleWave,
  ellipseRibbon: getDoubleWave,
  ellipseRibbon2: getDoubleWave,
  verticalScroll: (w: number, h: number) =>
    `M 0 ${h * 0.1} A ${w / 2} ${h * 0.1} 0 0 1 ${w} ${h * 0.1} L ${w} ${h * 0.9} A ${w / 2} ${h * 0.1} 0 0 0 0 ${h * 0.9} Z`,
  horizontalScroll: (w: number, h: number) =>
    `M ${w * 0.1} 0 A ${w * 0.1} ${h / 2} 0 0 1 ${w * 0.1} ${h} L ${w * 0.9} ${h} A ${w * 0.1} ${h / 2} 0 0 0 ${w * 0.9} 0 Z`,
  wave: getWave,
  doubleWave: getDoubleWave,

  // Braces/Brackets
  bracePair: (w: number, h: number) =>
    `M ${w * 0.2} 0 Q 0 0 0 ${h / 2} Q 0 ${h} ${w * 0.2} ${h} M ${w * 0.8} 0 Q ${w} 0 ${w} ${h / 2} Q ${w} ${h} ${w * 0.8} ${h}`,
  bracketPair: (w: number, h: number) =>
    `M ${w * 0.2} 0 L 0 0 L 0 ${h} L ${w * 0.2} ${h} M ${w * 0.8} 0 L ${w} 0 L ${w} ${h} L ${w * 0.8} ${h}`,
  leftBrace: (w: number, h: number) => `M ${w} 0 Q 0 0 0 ${h / 2} Q 0 ${h} ${w} ${h}`,
  rightBrace: (w: number, h: number) => `M 0 0 Q ${w} 0 ${w} ${h / 2} Q ${w} ${h} 0 ${h}`,
  leftBracket: (w: number, h: number) => `M ${w} 0 L 0 0 L 0 ${h} L ${w} ${h}`,
  rightBracket: (w: number, h: number) => `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h}`,

  teardrop: (w: number, h: number) => `M ${w / 2} 0 Q 0 ${h / 2} ${w / 2} ${h} A ${w / 2} ${h / 2} 0 1 0 ${w / 2} 0 Z`
};
