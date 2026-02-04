import { getRect } from '../primitives';

const getRoundRect = (w: number, h: number, adj?: any) => {
  let r = Math.min(w, h) * 0.16667;
  if (adj?.val) r = Math.min(w, h) * (adj.val / 100000);
  return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
};

const getSnip1Rect = (w: number, h: number, adj?: any) => {
  const s = Math.min(w, h) * ((adj?.val ?? 16667) / 100000);
  return `M 0 0 L ${w - s} 0 L ${w} ${s} L ${w} ${h} L 0 ${h} Z`;
};

export const rects = {
  rect: getRect,
  roundRect: getRoundRect,
  round1Rect: getRoundRect,
  round2SameRect: getRoundRect,
  round2DiagRect: getRoundRect,
  snip1Rect: getSnip1Rect,
  snip2SameRect: getSnip1Rect,
  snip2DiagRect: getSnip1Rect,
  snipRoundRect: getRoundRect
};
