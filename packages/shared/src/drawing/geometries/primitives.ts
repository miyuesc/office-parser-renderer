export const shapeArc = (
  cX: number,
  cY: number,
  rX: number,
  rY: number,
  stAng: number,
  endAng: number,
  isClose: boolean
) => {
  const rad1 = (stAng * Math.PI) / 180;
  const x1 = cX + rX * Math.cos(rad1);
  const y1 = cY + rY * Math.sin(rad1);

  const rad2 = (endAng * Math.PI) / 180;
  const x2 = cX + rX * Math.cos(rad2);
  const y2 = cY + rY * Math.sin(rad2);

  const diff = endAng - stAng;
  const largeArc = Math.abs(diff) > 180 ? 1 : 0;
  const sweep = diff > 0 ? 1 : 0;

  let p = `M ${x1} ${y1} A ${rX} ${rY} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  if (isClose) p += ' Z';
  return p;
};

export const arcToPath = (d: string) => d.replace(/^M/, 'L');

export const getRect = (w: number, h: number, _adj?: any) => `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
export const getEllipse = (w: number, h: number) =>
  `M 0 ${h / 2} A ${w / 2} ${h / 2} 0 1 1 ${w} ${h / 2} A ${w / 2} ${h / 2} 0 1 1 0 ${h / 2} Z`;
export const getDiamond = (w: number, h: number, _adj?: any) =>
  `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;
export const getTriangle = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 50000) / 100000;
  const x = w * a1;
  return `M ${x} 0 L ${w} ${h} L 0 ${h} Z`;
};
export const getRtTriangle = (w: number, h: number, _adj?: any) => `M 0 0 L ${w} ${h} L 0 ${h} Z`;
export const getParallelogram = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const dx = w * a1;
  return `M ${dx} 0 L ${w} 0 L ${w - dx} ${h} L 0 ${h} Z`;
};
export const getTrapezoid = (w: number, h: number, adj?: any) => {
  const a1 = (adj?.adj1 ?? 25000) / 100000;
  const dx = w * a1;
  return `M ${dx} 0 L ${w - dx} 0 L ${w} ${h} L 0 ${h} Z`;
};

export const getStarPath = (w: number, h: number, points: number, adj?: any) => {
  const cx = w / 2;
  const cy = h / 2;
  const outerRadius = Math.min(w, h) / 2;
  const a1 = (adj?.adj1 ?? 37500) / 100000;
  const innerRadius = outerRadius * a1;

  let path = '';
  const totalVertices = points * 2;
  for (let i = 0; i < totalVertices; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    path += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `;
  }
  path += 'Z';
  return path;
};
