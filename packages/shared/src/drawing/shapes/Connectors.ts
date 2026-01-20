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

  /**
   * 曲线连接符2
   * OOXML 规范：简单的二次贝塞尔曲线连接符
   * 基于 superdoc preset-geometry 参考实现优化
   */
  [ST_ShapeType.curvedConnector2]: (w, h): ShapeResult => ({
    path: `M 0 0 C ${w * 0.5} 0 ${w} ${h * 0.5} ${w} ${h}`,
    noFill: true
  }),

  /**
   * 曲线连接符3
   * OOXML 规范：S 形曲线，有一个调节点
   * adj1: 中间拐点的 X 位置
   */
  [ST_ShapeType.curvedConnector3]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const midX = w * (adj1 / 100000);

    // S 形曲线：使用两段三次贝塞尔曲线实现平滑连接
    return {
      path:
        `M 0 0 ` +
        `C ${midX * 0.5} 0 ${midX} ${h * 0.25} ${midX} ${h * 0.5} ` +
        `C ${midX} ${h * 0.75} ${midX + (w - midX) * 0.5} ${h} ${w} ${h}`,
      noFill: true
    };
  },

  /**
   * 曲线连接符4
   * OOXML 规范：S 形曲线连接符，有两个调节点
   * adj1: 第一个拐点的 X 位置
   * adj2: 垂直方向的拐点位置
   */
  [ST_ShapeType.curvedConnector4]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const turn1X = w * (adj1 / 100000);
    const turnY = h * (adj2 / 100000);

    // 三段曲线实现更平滑的 S 形
    return {
      path:
        `M 0 0 ` +
        `C ${turn1X * 0.5} 0 ${turn1X} ${turnY * 0.25} ${turn1X} ${turnY * 0.5} ` +
        `C ${turn1X} ${turnY * 0.75} ${w * 0.625} ${turnY} ${w * 0.75} ${turnY} ` +
        `C ${w * 0.875} ${turnY} ${w} ${h * 0.75} ${w} ${h}`,
      noFill: true
    };
  },

  /**
   * 曲线连接符5
   * OOXML 规范：复杂 S 形曲线，有三个调节点
   * adj1: 第一个控制点 X 位置
   * adj2: 中间拐点 Y 位置
   * adj3: 第三个控制点 X 位置
   */
  [ST_ShapeType.curvedConnector5]: (w, h, adj): ShapeResult => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 75000;

    const cp1x = w * (adj1 / 100000);
    const cp2y = h * (adj2 / 100000);
    const cp3x = w * (adj3 / 100000);

    // 多段曲线实现复杂 S 形
    return {
      path:
        `M 0 0 ` +
        `C ${cp1x} 0 ${cp1x} ${cp2y * 0.5} ${cp1x} ${cp2y * 0.5} ` +
        `C ${cp1x} ${cp2y} ${w * 0.5} ${cp2y} ${w * 0.5} ${cp2y} ` +
        `C ${w * 0.5} ${cp2y} ${cp3x} ${cp2y} ${cp3x} ${h * 0.5 + cp2y * 0.5} ` +
        `C ${cp3x} ${h} ${w} ${h} ${w} ${h}`,
      noFill: true
    };
  }
};
