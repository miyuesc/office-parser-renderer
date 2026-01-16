/**
 * 几何辅助工具类
 */
export const GeoUtils = {
  /** 矩形路径 */
  rect: (x: number, y: number, w: number, h: number) =>
    `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`,

  /** 圆角矩形路径片段 */
  roundRectPath: (w: number, h: number, r: number) =>
    `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 1 ${
      w - r
    } ${h} L ${r} ${h} A ${r} ${r} 0 0 1 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,

  /** 圆/椭圆路径 */
  ellipse: (cx: number, cy: number, rx: number, ry: number) =>
    `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`,

  /** 正多边形路径 */
  regularPolygon: (sides: number, w: number, h: number, startAngle: number = -Math.PI / 2) => {
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2;
    const ry = h / 2;
    let d = '';
    for (let i = 0; i < sides; i++) {
      const ang = startAngle + (i * 2 * Math.PI) / sides;
      const x = cx + rx * Math.cos(ang);
      const y = cy + ry * Math.sin(ang);
      d += (i === 0 ? 'M ' : 'L ') + `${x} ${y}`;
    }
    return d + ' Z';
  },

  /**
   * 星形路径 - 使用 OOXML 公式
   * OOXML 星形的 adj1 表示内半径相对于外半径的百分比 (1/100000)
   * adj2 表示旋转偏移 (1/60000 度)
   * @param points 星形角数
   * @param w 宽度
   * @param h 高度
   * @param adj1 内半径比例 (1/100000)，默认根据点数计算
   * @param adj2 旋转偏移 (1/60000 度)
   */
  star: (points: number, w: number, h: number, adj1?: number, adj2?: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2;
    const ry = h / 2;

    // OOXML 默认的内半径比例 (根据点数不同)
    let defaultAdj1: number;
    switch (points) {
      case 4:
        defaultAdj1 = 37500; // Was 12500 (too thin)
        break;
      case 5:
        defaultAdj1 = 37500; // Standard 5-point
        break;
      case 6:
        defaultAdj1 = 37500;
        break;
      case 7:
        defaultAdj1 = 37500;
        break;
      case 8:
        defaultAdj1 = 37500;
        break;
      case 10:
        defaultAdj1 = 37500;
        break;
      case 12:
        defaultAdj1 = 37500;
        break;
      case 16:
        defaultAdj1 = 37500;
        break;
      case 24:
        defaultAdj1 = 37500;
        break;
      case 32:
        defaultAdj1 = 37500;
        break;
      default:
        defaultAdj1 = 37500;
        break;
    }

    const innerRatio = (adj1 ?? defaultAdj1) / 100000;
    // adj2 是 1/60000 度，转换为弧度
    const rotationRad = ((adj2 ?? 0) / 60000) * (Math.PI / 180);

    let d = '';
    for (let i = 0; i < points * 2; i++) {
      // 从顶部开始 (-90°)，每步 180°/points
      const baseAngle = -Math.PI / 2 + rotationRad;
      const ang = baseAngle + (i * Math.PI) / points;
      // 外点 (偶数索引) 使用完整半径，内点 (奇数索引) 使用内半径
      const r = i % 2 === 0 ? 1 : innerRatio;
      const x = cx + rx * r * Math.cos(ang);
      const y = cy + ry * r * Math.sin(ang);
      d += (i === 0 ? 'M ' : 'L ') + `${x} ${y}`;
    }
    return d + ' Z';
  }
};
