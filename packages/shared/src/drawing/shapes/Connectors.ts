import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator, ShapeResult } from './types';

/**
 * 连接符形状
 * 所有连接符均为 noFill，只渲染描边
 */
export const Connectors: Record<string, ShapeGenerator> = {
  [ST_ShapeType.straightConnector1]: (w, h): ShapeResult => ({
    path: `M 0 0 L ${w} ${h}`,
    noFill: true
  }),

  [ST_ShapeType.bentConnector2]: (w, h): ShapeResult => ({
    path: `M 0 0 L ${w} 0 L ${w} ${h}`,
    noFill: true
  }),

  [ST_ShapeType.bentConnector3]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const midX = w * (adj1 / 100000);
    return {
      path: `M 0 0 L ${midX} 0 L ${midX} ${h} L ${w} ${h}`,
      noFill: true
    };
  },

  [ST_ShapeType.bentConnector4]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const midX = w * (adj1 / 100000);
    const midY = h * (adj2 / 100000);
    return {
      path: `M 0 0 L ${midX} 0 L ${midX} ${midY} L ${w} ${midY} L ${w} ${h}`,
      noFill: true
    };
  },

  [ST_ShapeType.bentConnector5]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const midX = w * (adj1 / 100000);
    return {
      path: `M 0 0 L ${midX} 0 L ${midX} ${h / 2} L ${w - midX} ${h / 2} L ${w - midX} ${h} L ${w} ${h}`,
      noFill: true
    };
  },

  [ST_ShapeType.curvedConnector2]: (w, h): ShapeResult => ({
    path: `M 0 0 Q ${w} 0 ${w} ${h}`,
    noFill: true
  }),

  [ST_ShapeType.curvedConnector3]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const midX = w * (adj1 / 100000);
    return {
      path: `M 0 0 C ${midX} 0 ${midX} ${h} ${w} ${h}`,
      noFill: true
    };
  },

  /**
   * 曲线连接符4
   * OOXML 规范: S 形曲线连接符，有两个调节点
   * adj1: 第一个拐点的 X 位置
   * adj2: 垂直方向的拐点位置
   */
  [ST_ShapeType.curvedConnector4]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    // adj1 控制水平方向第一个拐点位置
    // adj2 控制垂直方向拐点位置
    const turn1X = w * (adj1 / 100000);
    const turnY = h * (adj2 / 100000);

    // S 形曲线：从 (0, 0) 经过两个拐点到 (w, h)
    // 使用三次贝塞尔曲线
    return {
      path:
        `M 0 0 ` +
        // 第一段：从起点到中间拐点
        `C ${turn1X} 0 ${turn1X} ${turnY} ${w / 2} ${turnY} ` +
        // 第二段：从中间拐点到终点
        `C ${w - turn1X + w / 2} ${turnY} ${w} ${h} ${w} ${h}`,
      noFill: true
    };
  },

  [ST_ShapeType.curvedConnector5]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 75000;
    const cp1x = w * (adj1 / 100000);
    const cp2y = h * (adj2 / 100000);
    const cp3x = w * (adj3 / 100000);
    return {
      path: `M 0 0 C ${cp1x} 0 ${cp1x} ${cp2y} ${w / 2} ${cp2y} S ${cp3x} ${h} ${w} ${h}`,
      noFill: true
    };
  }
};
