import { getRect, getDiamond, getParallelogram, getTriangle } from '../primitives';

// TODO: Import specific shapes for Document, etc.
// For now, mapping to closest basic shape.

export const flowchart = {
  flowChartProcess: getRect,
  flowChartAlternateProcess: getRect, // Should be rounded?
  flowChartDecision: getDiamond,
  flowChartInputOutput: getParallelogram,
  flowChartPredefinedProcess: (w: number, h: number) =>
    `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${w * 0.2} 0 L ${w * 0.2} ${h} M ${w * 0.8} 0 L ${w * 0.8} ${h}`,
  flowChartInternalStorage: getRect,
  flowChartDocument: (w: number, h: number) => `M 0 0 L ${w} 0 L ${w} ${h * 0.8} Q ${w * 0.5} ${h} 0 ${h * 0.8} Z`, // Approximation
  flowChartMultidocument: getRect,
  flowChartTerminator: (w: number, h: number) =>
    `M ${h / 2} 0 L ${w - h / 2} 0 A ${h / 2} ${h / 2} 0 0 1 ${w - h / 2} ${h} L ${h / 2} ${h} A ${h / 2} ${h / 2} 0 0 1 ${h / 2} 0 Z`, // Stadium shape
  flowChartPreparation: (w: number, h: number) =>
    `M 0 ${h / 2} L ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.2} ${h} Z`, // Hexagon-like
  flowChartManualInput: (w: number, h: number) => `M 0 ${h * 0.2} L ${w} 0 L ${w} ${h} L 0 ${h} Z`, // Sloped top
  flowChartManualOperation: (w: number, h: number) => `M 0 0 L ${w} 0 L ${w * 0.8} ${h} L ${w * 0.2} ${h} Z`, // Trapezoid
  flowChartConnector: (w: number, h: number) =>
    `M ${w / 2} 0 A ${w / 2} ${h / 2} 0 1 1 ${w / 2} ${h} A ${w / 2} ${h / 2} 0 1 1 ${w / 2} 0 Z`, // Circle
  flowChartOffpageConnector: (w: number, h: number) =>
    `M 0 0 L ${w} 0 L ${w} ${h * 0.8} L ${w / 2} ${h} L 0 ${h * 0.8} Z`, // Home plate pointing down
  flowChartCard: getRect,
  flowChartPunchedCard: (w: number, h: number) => `M ${w * 0.2} 0 L ${w} 0 L ${w} ${h} L 0 ${h} L 0 ${h * 0.2} Z`,
  flowChartPunchedTape: getRect, // Wave top/bottom
  flowChartSummingJunction: (w: number, h: number) =>
    `M ${w / 2} 0 A ${w / 2} ${h / 2} 0 1 1 ${w / 2} ${h} A ${w / 2} ${h / 2} 0 1 1 ${w / 2} 0 Z M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`, // X in Circle
  flowChartOr: (w: number, h: number) => `M 0 0 L 0 ${h} L ${w / 2} ${h} L ${w} ${h / 2} L ${w / 2} 0 Z`, // Approx
  flowChartCollate: (w: number, h: number) => `M 0 0 L ${w} 0 L 0 ${h} L ${w} ${h} Z`, // Hourglass-ish?
  flowChartSort: (w: number, h: number) =>
    `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z M 0 ${h / 2} L ${w} ${h / 2}`,
  flowChartExtract: getTriangle,
  flowChartMerge: getTriangle, // Inverted?
  flowChartStoredData: getRect,
  flowChartDelay: (w: number, h: number) => `M 0 0 L ${w * 0.8} 0 A ${h / 2} ${h / 2} 0 0 1 ${w * 0.8} ${h} L 0 ${h} Z`, // D shape
  flowChartSequentialAccessStorage: getRect, // Tape?
  flowChartMagneticDisk: (w: number, h: number) =>
    `M ${w} ${h * 0.2} A ${w * 0.5} ${h * 0.2} 0 0 1 0 ${h * 0.2} L 0 ${h * 0.8} A ${w * 0.5} ${h * 0.2} 0 0 0 ${w} ${h * 0.8} Z M 0 ${h * 0.2} A ${w * 0.5} ${h * 0.2} 0 0 1 ${w} ${h * 0.2}`, // Cylinder
  flowChartMagneticDrum: getRect,
  flowChartDisplay: (w: number, h: number) =>
    `M ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.2} ${h} L 0 ${h / 2} Z` // Bullet shape? No Display is usually bullet-like
};
