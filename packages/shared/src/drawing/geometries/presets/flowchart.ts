import { getRect, getDiamond, getParallelogram, getTriangle, getRoundRect, shapeArc, arcToPath } from '../primitives';

export const flowchart = {
  flowChartProcess: getRect,
  flowChartAlternateProcess: (w: number, h: number, adj?: any) => getRoundRect(w, h, { val: adj?.adj1 ?? 16667 }), // 标准 1/6 圆角
  flowChartDecision: getDiamond,
  flowChartInputOutput: getParallelogram,
  flowChartPredefinedProcess: (w: number, h: number) =>
    `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${w * 0.2} 0 L ${w * 0.2} ${h} M ${w * 0.8} 0 L ${w * 0.8} ${h}`,
  flowChartInternalStorage: (w: number, h: number) =>
    `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M 0 ${h * 0.2} L ${w} ${h * 0.2} M ${w * 0.2} 0 L ${w * 0.2} ${h}`,
  flowChartDocument: (w: number, h: number) => {
    const dy = h * 0.1;
    return `M 0 0 L ${w} 0 L ${w} ${h - dy} C ${w * 0.75} ${h - dy * 2} ${w * 0.25} ${h + dy} 0 ${h - dy} Z`;
  },
  flowChartMultidocument: (w: number, h: number) => {
    // 移植 pptxjs L1214
    const x1 = (w * 1532) / 21600;
    const x2 = (w * 20000) / 21600;
    const x3 = (w * 9298) / 21600;
    const x4 = (w * 19298) / 21600;
    const x5 = (w * 18595) / 21600;
    const x6 = (w * 2972) / 21600;
    const x7 = (w * 20800) / 21600;
    const y1 = (h * 18022) / 21600;
    const y2 = (h * 3675) / 21600;
    const y3 = (h * 23542) / 21600;
    const y4 = (h * 1815) / 21600;
    const y5 = (h * 16252) / 21600;
    const y6 = (h * 16352) / 21600;
    const y7 = (h * 14392) / 21600;
    const y8 = (h * 20782) / 21600;
    const y9 = (h * 14467) / 21600;

    const d1 = `M 0 ${y2} L ${x5} ${y2} L ${x5} ${y1} C ${x3} ${y1} ${x3} ${y3} 0 ${y8} Z`;
    const d2 = `M ${x1} ${y2} L ${x1} ${y4} L ${x2} ${y4} L ${x2} ${y5} C ${x4} ${y5} ${x5} ${y6} ${x5} ${y6}`;
    const d3 = `M ${x6} ${y4} L ${x6} 0 L ${w} 0 L ${w} ${y7} C ${x7} ${y7} ${x2} ${y9} ${x2} ${y9}`;
    return d1 + ' ' + d2 + ' ' + d3;
  },
  flowChartTerminator: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  },
  flowChartPreparation: (w: number, h: number, adj?: any) => {
    const a1 = (adj?.adj1 ?? 25000) / 100000;
    const dx = w * a1;
    return `M ${dx} 0 L ${w - dx} 0 L ${w} ${h / 2} L ${w - dx} ${h} L ${dx} ${h} L 0 ${h / 2} Z`;
  },
  flowChartManualInput: (w: number, h: number) => `M 0 ${h * 0.2} L ${w} 0 L ${w} ${h} L 0 ${h} Z`,
  flowChartManualOperation: (w: number, h: number, adj?: any) => {
    const a1 = (adj?.adj1 ?? 18518) / 100000; // 默认 0.18518 (来自 pptxjs 换算)
    const dx = w * a1;
    return `M 0 0 L ${w} 0 L ${w - dx} ${h} L ${dx} ${h} Z`;
  },
  flowChartConnector: (w: number, h: number) =>
    `M 0 ${h / 2} A ${w / 2} ${h / 2} 0 1 0 ${w} ${h / 2} A ${w / 2} ${h / 2} 0 1 0 0 ${h / 2} Z`,
  flowChartOffpageConnector: (w: number, h: number) =>
    `M 0 0 L ${w} 0 L ${w} ${h * 0.8} L ${w / 2} ${h} L 0 ${h * 0.8} Z`,
  flowChartCard: (w: number, h: number, adj?: any) => {
    // PunchedCard 的翻转
    const a1 = (adj?.adj1 ?? 16667) / 100000;
    const dx = Math.min(w, h) * a1;
    return `M 0 ${dx} L ${dx} 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  },
  flowChartPunchedCard: (w: number, h: number, adj?: any) => {
    const a1 = (adj?.adj1 ?? 16667) / 100000;
    const dx = Math.min(w, h) * a1;
    return `M ${w - dx} 0 L ${w} ${dx} L ${w} ${h} L 0 ${h} L 0 0 Z`;
  },
  flowChartPunchedTape: (w: number, h: number) => {
    // 移植 pptxjs L1820
    const x1 = w * 0.25;
    const y1 = h * 0.1;
    const y2 = h * 0.9;
    const d =
      `M 0 ${y1} ` +
      arcToPath(shapeArc(x1, y1, x1, y1, 180, 0, false)) +
      arcToPath(shapeArc(w * 0.75, y1, x1, y1, 180, 360, false)) +
      ` L ${w} ${y2} ` +
      arcToPath(shapeArc(w * 0.75, y2, x1, y1, 0, 180, false).replace('M', 'L')) +
      arcToPath(shapeArc(x1, y2, x1, y1, 0, 180, false)) +
      ' Z';
    return d;
  },
  flowChartSummingJunction: (w: number, h: number) =>
    `M 0 ${h / 2} A ${w / 2} ${h / 2} 0 1 0 ${w} ${h / 2} A ${w / 2} ${h / 2} 0 1 0 0 ${h / 2} Z M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`,
  flowChartOr: (w: number, h: number) =>
    // 修正坐标来自 pptxjs L1894
    `M 0 0 C ${w * 0.5} 0 ${w} ${h * 0.25} ${w} ${h / 2} C ${w} ${h * 0.75} ${w * 0.5} ${h} 0 ${h} L 0 0 Z`,
  flowChartCollate: (w: number, h: number) => `M 0 0 L ${w} 0 L 0 ${h} L ${w} ${h} Z`,
  flowChartSort: (w: number, h: number) =>
    `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z M 0 ${h / 2} L ${w} ${h / 2}`,
  flowChartExtract: (w: number, h: number) => getTriangle(w, h, { adj1: 50000 }),
  flowChartMerge: (w: number, h: number) => `M 0 0 L ${w} 0 L ${w / 2} ${h} Z`, // 倒三角
  flowChartStoredData: (w: number, h: number) => {
    // 单侧半圆的存储
    const r = w * 0.15;
    return `M ${r} 0 L ${w} 0 A ${r} ${h / 2} 0 0 0 ${w} ${h} L ${r} ${h} A ${r} ${h / 2} 0 0 1 ${r} 0 Z`;
  },
  flowChartDelay: (w: number, h: number) =>
    `M 0 0 L ${w * 0.7} 0 A ${w * 0.3} ${h / 2} 0 0 1 ${w * 0.7} ${h} L 0 ${h} Z`,
  flowChartSequentialAccessStorage: (w: number, h: number) => {
    // 磁带：圆圈 + 直线
    const r = Math.min(w, h) / 2;
    return (
      `M ${r} ${h} ` +
      arcToPath(shapeArc(r, r, r, r, 90, 180, false)) +
      arcToPath(shapeArc(r, r, r, r, 180, 270, false)) +
      arcToPath(shapeArc(r, r, r, r, 270, 360, false)) +
      ` L ${w} ${h} Z`
    );
  },
  flowChartMagneticDisk: (w: number, h: number) => {
    const rx = w / 2;
    const ry = h * 0.15;
    const dTop = `M 0 ${ry} A ${rx} ${ry} 0 1 1 ${w} ${ry} A ${rx} ${ry} 0 1 1 0 ${ry}`;
    const dBody = `M 0 ${ry} L 0 ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry} L ${w} ${ry}`;
    return dTop + ' ' + dBody;
  },
  flowChartMagneticDrum: (w: number, h: number) => {
    // 旋转 90 度的 MagneticDisk
    const rx = w * 0.15;
    const ry = h / 2;
    const dLeft = `M ${rx} 0 A ${rx} ${ry} 0 1 0 ${rx} ${h} A ${rx} ${ry} 0 1 0 ${rx} 0`;
    const dBody = `M ${rx} 0 L ${w - rx} 0 A ${rx} ${ry} 0 0 1 ${w - rx} ${h} L ${rx} ${h}`;
    return dLeft + ' ' + dBody;
  },
  flowChartDisplay: (w: number, h: number) => {
    const dx = w * 0.15;
    return `M ${dx} 0 L ${w - dx} 0 C ${w} ${h / 2} ${w} ${h / 2} ${w - dx} ${h} L ${dx} ${h} L 0 ${h / 2} Z`;
  }
};
