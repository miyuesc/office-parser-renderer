/**
 * 基础形状
 *
 * 基于 OOXML 规范实现，包含椭圆、三角形、多边形、弧形等基础几何图形
 */
import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator, ShapeResult } from './types';
import { GeoUtils } from './GeoUtils';

export const BasicShapes: Record<string, ShapeGenerator> = {
  [ST_ShapeType.ellipse]: (w, h) => GeoUtils.ellipse(w / 2, h / 2, w / 2, h / 2),
  [ST_ShapeType.triangle]: (w, h) => `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`,
  [ST_ShapeType.rtTriangle]: (w, h) => `M 0 0 L ${w} ${h} L 0 ${h} Z`,
  [ST_ShapeType.parallelogram]: (w, h, adj) => {
    const val = adj?.['adj'] ?? 25000;
    const dx = w * (val / 100000);
    return `M ${dx} 0 L ${w} 0 L ${w - dx} ${h} L 0 ${h} Z`;
  },
  [ST_ShapeType.trapezoid]: (w, h, adj) => {
    const val = adj?.['adj'] ?? 25000;
    const dx = w * (val / 100000);
    return `M ${dx} 0 L ${w - dx} 0 L ${w} ${h} L 0 ${h} Z`;
  },
  [ST_ShapeType.nonIsoscelesTrapezoid]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // Top Left

    // Standard: Top edge starts at adj1, length?
    // Actually usually: L1 at top, L2 at bottom. Vertices.
    // Let's assume Top-Left indented, Top-Right indented?
    // `nonIsoscelesTrapezoid` implies asymmetrical.
    const dx1 = w * (adj1 / 100000);
    const dx2 = w * 0.2; // default
    return `M ${dx1} 0 L ${w - dx2} 0 L ${w} ${h} L 0 ${h} Z`;
  },
  [ST_ShapeType.diamond]: (w, h) => `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`,
  [ST_ShapeType.pentagon]: (w, h) => GeoUtils.regularPolygon(5, w, h),
  [ST_ShapeType.hexagon]: (w, h) => GeoUtils.regularPolygon(6, w, h, 0),
  [ST_ShapeType.heptagon]: (w, h) => GeoUtils.regularPolygon(7, w, h),
  [ST_ShapeType.octagon]: (w, h) => GeoUtils.regularPolygon(8, w, h, Math.PI / 8),
  [ST_ShapeType.decagon]: (w, h) => GeoUtils.regularPolygon(10, w, h, Math.PI / 10),
  [ST_ShapeType.dodecagon]: (w, h) => GeoUtils.regularPolygon(12, w, h, Math.PI / 12),

  // New Basic Shapes
  /**
   * 弧形
   * OOXML 规范: 开放的椭圆弧线（仅描边，无填充）
   * adj1: 起始角度 (60000分之一度，默认0)
   * adj2: 扫掠角度 (60000分之一度，默认5400000 = 90度)
   */
  [ST_ShapeType.arc]: (w, h, adj): ShapeResult => {
    // 角度单位：60000分之一度
    const stAngRaw = adj?.['adj1'] ?? 0;
    const swAngRaw = adj?.['adj2'] ?? 5400000; // 默认90度

    // 转换为弧度
    const stAng = (stAngRaw / 60000) * (Math.PI / 180);
    const swAng = (swAngRaw / 60000) * (Math.PI / 180);
    const endAng = stAng + swAng;

    const rx = w / 2;
    const ry = h / 2;
    const cx = rx;
    const cy = ry;

    // 计算起点和终点
    const x1 = cx + rx * Math.cos(stAng);
    const y1 = cy + ry * Math.sin(stAng);
    const x2 = cx + rx * Math.cos(endAng);
    const y2 = cy + ry * Math.sin(endAng);

    // 判断是否大于180度
    const largeArc = Math.abs(swAng) > Math.PI ? 1 : 0;
    // 判断顺时针还是逆时针
    const sweep = swAng > 0 ? 1 : 0;

    const path = `M ${x1} ${y1} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
    return { path, noFill: true };
  },

  /**
   * 弦形
   * OOXML 规范: 闭合的椭圆弧（弧线两端用直线连接）
   * adj1: 起始角度
   * adj2: 扫掠角度
   */
  [ST_ShapeType.chord]: (w, h, adj) => {
    const stAngRaw = adj?.['adj1'] ?? 0;
    const swAngRaw = adj?.['adj2'] ?? 10800000; // 默认180度

    const stAng = (stAngRaw / 60000) * (Math.PI / 180);
    const swAng = (swAngRaw / 60000) * (Math.PI / 180);
    const endAng = stAng + swAng;

    const rx = w / 2;
    const ry = h / 2;
    const cx = rx;
    const cy = ry;

    const x1 = cx + rx * Math.cos(stAng);
    const y1 = cy + ry * Math.sin(stAng);
    const x2 = cx + rx * Math.cos(endAng);
    const y2 = cy + ry * Math.sin(endAng);

    const largeArc = Math.abs(swAng) > Math.PI ? 1 : 0;
    const sweep = swAng > 0 ? 1 : 0;

    // 弧线 + 直线闭合
    return `M ${x1} ${y1} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`;
  },

  /**
   * 饼形（扇形）
   * OOXML 规范: 从中心点开始的扇形
   * adj1: 起始角度
   * adj2: 扫掠角度
   */
  [ST_ShapeType.pie]: (w, h, adj) => {
    const stAngRaw = adj?.['adj1'] ?? 0;
    const swAngRaw = adj?.['adj2'] ?? 5400000; // 默认90度

    const stAng = (stAngRaw / 60000) * (Math.PI / 180);
    const swAng = (swAngRaw / 60000) * (Math.PI / 180);
    const endAng = stAng + swAng;

    const rx = w / 2;
    const ry = h / 2;
    const cx = rx;
    const cy = ry;

    const x1 = cx + rx * Math.cos(stAng);
    const y1 = cy + ry * Math.sin(stAng);
    const x2 = cx + rx * Math.cos(endAng);
    const y2 = cy + ry * Math.sin(endAng);

    const largeArc = Math.abs(swAng) > Math.PI ? 1 : 0;
    const sweep = swAng > 0 ? 1 : 0;

    // 从中心到弧起点，画弧，回到中心
    return `M ${cx} ${cy} L ${x1} ${y1} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${x2} ${y2} Z`;
  },

  /**
   * 饼形楔形
   * OOXML 规范: 四分之一圆的扇形，右下象限
   */
  [ST_ShapeType.pieWedge]: (w, h) => {
    // 四分之一圆，从右侧边缘到底部边缘
    return `M ${w} ${h} L ${w} 0 A ${w} ${h} 0 0 1 0 ${h} Z`;
  },
  /**
   * 圆柱体
   * OOXML 规范: 3D 圆柱体效果
   * adj: 顶部椭圆高度比例（默认 25000 = 25%）
   */
  [ST_ShapeType.can]: (w, h, adj) => {
    const adjVal = adj?.['adj'] ?? 25000;
    // 顶部椭圆的垂直半径
    const ry = h * (adjVal / 100000);
    const rx = w / 2;
    const cx = w / 2;

    // 使用 GeoUtils.ellipse 绘制完整的顶部椭圆
    // 然后绘制侧面矩形区域（不闭合）和底部半椭圆
    return (
      // 顶部完整椭圆 - 使用两个半弧
      `M ${cx - rx} ${ry} A ${rx} ${ry} 0 1 0 ${cx + rx} ${ry} A ${rx} ${ry} 0 1 0 ${cx - rx} ${ry} Z ` +
      // 侧面 + 底部半椭圆作为一个填充区域
      `M 0 ${ry} L 0 ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry} L ${w} ${ry} Z`
    );
  },

  /**
   * 立方体
   * OOXML 规范: 3D 立方体效果
   * adj: 深度比例
   */
  [ST_ShapeType.cube]: (w, h, adj) => {
    const adjVal = adj?.['adj'] ?? 25000;
    const d = Math.min(w, h) * (adjVal / 100000);
    // 正面矩形 + 顶面 + 右侧面
    return (
      // 正面
      `M 0 ${d} L ${w - d} ${d} L ${w - d} ${h} L 0 ${h} Z ` +
      // 顶面
      `M 0 ${d} L ${d} 0 L ${w} 0 L ${w - d} ${d} Z ` +
      // 右侧面
      `M ${w - d} ${d} L ${w} 0 L ${w} ${h - d} L ${w - d} ${h} Z`
    );
  },

  [ST_ShapeType.bevel]: (w, h, _adj) => {
    const d = Math.min(w, h) * 0.15;
    // Beveled Rect
    return (
      `M ${d} ${d} L ${w - d} ${d} L ${w - d} ${h - d} L ${d} ${h - d} Z ` + // Inner
      `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z ` + // Outer
      `M 0 0 L ${d} ${d} M ${w} 0 L ${w - d} ${d} M ${w} ${h} L ${w - d} ${h - d} M 0 ${h} L ${d} ${h - d}`
    );
  }
};
