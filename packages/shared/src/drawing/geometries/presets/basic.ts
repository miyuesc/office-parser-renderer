import {
  getRect,
  getDiamond,
  getTriangle,
  getRtTriangle,
  getParallelogram,
  getTrapezoid,
  getEllipse,
  getStarPath
} from '../primitives';

const getPolygon = (w: number, h: number, sides: number, adj?: any) => {
  if (sides < 3) return getRect(w, h, adj);
  if (sides === 4) return getDiamond(w, h, adj);

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2;
  let path = '';
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
  }
  path += 'Z';
  return path;
};

const getHexagon = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const dx = w * a1;
  return `M ${dx} 0 L ${w - dx} 0 L ${w} ${h / 2} L ${w - dx} ${h} L ${dx} ${h} L 0 ${h / 2} Z`;
};

export const basic = {
  ellipse: getEllipse,
  triangle: getTriangle,
  rtTriangle: getRtTriangle,
  diamond: getDiamond,
  pentagon: (w: number, h: number, adj: any) => getPolygon(w, h, 5, adj),
  hexagon: getHexagon,
  heptagon: (w: number, h: number, adj: any) => getPolygon(w, h, 7, adj),
  octagon: (w: number, h: number, adj: any) => getPolygon(w, h, 8, adj),
  decagon: (w: number, h: number, adj: any) => getPolygon(w, h, 10, adj),
  dodecagon: (w: number, h: number, adj: any) => getPolygon(w, h, 12, adj),
  parallelogram: getParallelogram,
  trapezoid: getTrapezoid,

  // Stars
  star4: (w: number, h: number, adj: any) => getStarPath(w, h, 4, adj),
  star5: (w: number, h: number, adj: any) => getStarPath(w, h, 5, adj),
  star6: (w: number, h: number, adj: any) => getStarPath(w, h, 6, adj),
  star7: (w: number, h: number, adj: any) => getStarPath(w, h, 7, adj),
  star8: (w: number, h: number, adj: any) => getStarPath(w, h, 8, adj),
  star10: (w: number, h: number, adj: any) => getStarPath(w, h, 10, adj),
  star12: (w: number, h: number, adj: any) => getStarPath(w, h, 12, adj),
  star16: (w: number, h: number, adj: any) => getStarPath(w, h, 16, adj),
  star24: (w: number, h: number, adj: any) => getStarPath(w, h, 24, adj),
  star32: (w: number, h: number, adj: any) => getStarPath(w, h, 32, adj),

  // Other simple
  cube: (w: number, h: number) =>
    `M 0 ${h * 0.25} L ${w * 0.75} ${h * 0.25} L ${w * 0.75} ${h} L 0 ${h} Z M 0 ${h * 0.25} L ${w * 0.25} 0 L ${w} 0 L ${w} ${h * 0.75} L ${w * 0.75} ${h} L ${w * 0.75} ${h * 0.25} M ${w} 0 L ${w * 0.75} ${h * 0.25}`,
  bevel: getRect, // TODO
  donut: (w: number, h: number, adj?: any) => {
    // Circular Double Ring
    const t = (adj?.adj1 ?? 25000) / 100000;
    const rx = w / 2,
      ry = h / 2;
    const irx = rx * t,
      iry = ry * t;
    return `M 0 ${ry} A ${rx} ${ry} 0 1 1 ${w} ${ry} A ${rx} ${ry} 0 1 1 0 ${ry} Z M ${rx - irx} ${ry} A ${irx} ${iry} 0 1 0 ${rx + irx} ${ry} A ${irx} ${iry} 0 1 0 ${rx - irx} ${ry} Z`;
  },
  noSmoking: (w: number, h: number) => {
    // Donut w/ Line
    const t = 20000 / 100000; // adj1 default
    const rx = w / 2,
      ry = h / 2;
    const irx = rx * t,
      iry = ry * t;
    const donut = `M 0 ${ry} A ${rx} ${ry} 0 1 1 ${w} ${ry} A ${rx} ${ry} 0 1 1 0 ${ry} Z M ${rx - irx} ${ry} A ${irx} ${iry} 0 1 0 ${rx + irx} ${ry} A ${irx} ${iry} 0 1 0 ${rx - irx} ${ry} Z`;
    const bar = ` M ${w * 0.15} ${h * 0.5} L ${w * 0.85} ${h * 0.5} L ${w * 0.85} ${h * 0.6} L ${w * 0.15} ${h * 0.6} Z`;
    return donut + bar;
  }
};
