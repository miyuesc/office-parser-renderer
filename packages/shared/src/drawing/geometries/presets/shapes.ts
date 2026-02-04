import { shapeArc, arcToPath, getRect } from '../primitives';

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
  // Double rect
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
    ` L 0 ${y1}`
  );
};

const getSmileyFace = (w: number, h: number, adj?: any) => {
  // Ported from pptx.js logic approx
  // Eyes, Mouth, Head
  const wd2 = w / 2,
    hd2 = h / 2;
  // Eyes (simplified)
  const eyeR = w * 0.05;
  const eyeY = h * 0.35;
  const leftEye = `M ${w * 0.3} ${eyeY} A ${eyeR} ${eyeR} 0 1 1 ${w * 0.3 + 0.1} ${eyeY} Z`;
  const rightEye = `M ${w * 0.7} ${eyeY} A ${eyeR} ${eyeR} 0 1 1 ${w * 0.7 + 0.1} ${eyeY} Z`;

  // Mouth (Smile) - quadratic, adjusts?
  const smileAdj = (adj?.adj1 ?? 4653) / 100000; // relative to something
  // If adj > 0 -> smile, < 0 -> frown
  const mouthY = h * 0.7;
  const mouthW = w * 0.4;
  const mouthH = h * 0.2 * (smileAdj > 0 ? 1 : -1);

  const mouth = `M ${wd2 - mouthW / 2} ${mouthY} Q ${wd2} ${mouthY + mouthH * 2} ${wd2 + mouthW / 2} ${mouthY}`;

  // Head outline (Circle)
  const head = `M ${wd2} 0 A ${wd2} ${hd2} 0 1 1 ${wd2} ${h} A ${wd2} ${hd2} 0 1 1 ${wd2} 0 Z`;

  return head + ' ' + leftEye + ' ' + rightEye + ' ' + mouth;
};

const getHeart = (w: number, h: number) => {
  return `M ${w / 2} ${h * 0.3} C ${w / 2} 0 ${0} ${0} ${0} ${h * 0.3} C ${0} ${h * 0.6} ${w / 2} ${h * 0.9} ${w / 2} ${h} C ${w / 2} ${h * 0.9} ${w} ${h * 0.6} ${w} ${h * 0.3} C ${w} 0 ${w / 2} 0 ${w / 2} ${h * 0.3} Z`;
};

const getLightningBolt = (w: number, h: number) => {
  return `M ${w * 0.6} 0 L ${w * 0.4} ${h * 0.6} L ${w * 0.6} ${h * 0.6} L ${w * 0.3} ${h} L ${w * 0.5} ${h * 0.4} L ${w * 0.3} ${h * 0.4} Z`;
};

const getMoon = (w: number, h: number, adj?: any) => {
  const a = (adj?.adj1 ?? 50000) / 100000;
  // Outer arc 180, inner arc is variable
  const cx = w / 2,
    cy = h / 2;
  return `M ${w / 2} 0 A ${w / 2} ${h / 2} 0 1 1 ${w / 2} ${h} A ${Math.abs(w / 2 - w * a)} ${h / 2} 0 1 0 ${w / 2} 0 Z`;
};

const getSun = (w: number, h: number) => {
  // Circle + Rays
  const r = Math.min(w, h) / 3;
  let s = `M ${w / 2 - r} ${h / 2} A ${r} ${r} 0 1 1 ${w / 2 + r} ${h / 2} A ${r} ${r} 0 1 1 ${w / 2 - r} ${h / 2} Z`;
  // Rays - simple standard 8 rays?
  // TODO: Rays
  return s;
};

const getArc = (w: number, h: number, adj?: any) => {
  // Just a stroke?
  const start = (adj?.adj1 ?? 0) / 60000;
  const sweep = (adj?.adj2 ?? 90) / 60000;
  // ...
  return shapeArc(w / 2, h / 2, w / 2, h / 2, start, start + sweep, false);
};

export const shapes = {
  blockArc: getBlockArc,
  halfFrame: getHalfFrame,
  frame: getFrame,
  corner: getHalfFrame, // Approx
  foldedCorner: getRect, // TODO
  can: getCan,
  cube: (w: number, h: number) =>
    `M 0 ${h * 0.25} L ${w * 0.75} ${h * 0.25} L ${w * 0.75} ${h} L 0 ${h} Z M 0 ${h * 0.25} L ${w * 0.25} 0 L ${w} 0 L ${w} ${h * 0.75} L ${w * 0.75} ${h} L ${w * 0.75} ${h * 0.25} M ${w} 0 L ${w * 0.75} ${h * 0.25}`,
  smileyFace: getSmileyFace,
  heart: getHeart,
  lightningBolt: getLightningBolt,
  moon: getMoon,
  sun: getSun,
  arc: getArc,

  // Ribbons/Scrolls
  ribbon: getRect,
  ribbon2: getRect,
  ellipseRibbon: getRect,
  ellipseRibbon2: getRect,
  verticalScroll: getRect,
  horizontalScroll: getRect,
  wave: (w: number, h: number) =>
    `M 0 ${h * 0.2} Q ${w * 0.25} 0 ${w * 0.5} ${h * 0.2} T ${w} ${h * 0.2} L ${w} ${h * 0.8} Q ${w * 0.75} ${h} ${w * 0.5} ${h * 0.8} T 0 ${h * 0.8} Z`,
  doubleWave: getRect,

  // Braces
  bracePair: getRect,
  bracketPair: getRect,
  leftBrace: (w: number, h: number) => `M ${w} 0 Q 0 0 0 ${h / 2} Q 0 ${h} ${w} ${h}`,
  rightBrace: (w: number, h: number) => `M 0 0 Q ${w} 0 ${w} ${h / 2} Q ${w} ${h} 0 ${h}`,
  leftBracket: (w: number, h: number) => `M ${w} 0 L 0 0 L 0 ${h} L ${w} ${h}`,
  rightBracket: (w: number, h: number) => `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h}`,

  // Others
  plaque: getRect,
  funnel: getRect,
  gear6: getSun, // TODO
  gear9: getSun, // TODO
  teardrop: (w: number, h: number) => `M ${w / 2} 0 Q 0 ${h / 2} ${w / 2} ${h} A ${w / 2} ${h * 0.4} 0 0 0 ${w / 2} 0` // Approx
};
