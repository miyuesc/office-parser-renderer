import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';

/**
 * 箭头形状
 * 基于 OOXML 规范实现
 */
export const ArrowShapes: Record<string, ShapeGenerator> = {
  /**
   * 右箭头
   */
  [ST_ShapeType.rightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;

    return (
      `M 0 ${cy - neckH / 2} ` +
      `L ${w - headW} ${cy - neckH / 2} ` +
      `L ${w - headW} 0 ` +
      `L ${w} ${cy} ` +
      `L ${w - headW} ${h} ` +
      `L ${w - headW} ${cy + neckH / 2} ` +
      `L 0 ${cy + neckH / 2} Z`
    );
  },

  /**
   * 左箭头
   */
  [ST_ShapeType.leftArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;

    return (
      `M ${w} ${cy - neckH / 2} ` +
      `L ${headW} ${cy - neckH / 2} ` +
      `L ${headW} 0 ` +
      `L 0 ${cy} ` +
      `L ${headW} ${h} ` +
      `L ${headW} ${cy + neckH / 2} ` +
      `L ${w} ${cy + neckH / 2} Z`
    );
  },

  /**
   * 上箭头
   */
  [ST_ShapeType.upArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headH = h * (adj2 / 100000);
    const neckW = w * (adj1 / 100000);
    const cx = w / 2;

    return (
      `M ${cx - neckW / 2} ${h} ` +
      `L ${cx - neckW / 2} ${headH} ` +
      `L 0 ${headH} ` +
      `L ${cx} 0 ` +
      `L ${w} ${headH} ` +
      `L ${cx + neckW / 2} ${headH} ` +
      `L ${cx + neckW / 2} ${h} Z`
    );
  },

  /**
   * 下箭头
   */
  [ST_ShapeType.downArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headH = h * (adj2 / 100000);
    const neckW = w * (adj1 / 100000);
    const cx = w / 2;

    return (
      `M ${cx - neckW / 2} 0 ` +
      `L ${cx - neckW / 2} ${h - headH} ` +
      `L 0 ${h - headH} ` +
      `L ${cx} ${h} ` +
      `L ${w} ${h - headH} ` +
      `L ${cx + neckW / 2} ${h - headH} ` +
      `L ${cx + neckW / 2} 0 Z`
    );
  },

  /**
   * 左右双向箭头
   */
  [ST_ShapeType.leftRightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 25000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;
    const stemTop = cy - neckH / 2;
    const stemBot = cy + neckH / 2;

    // 从左箭头尖端开始顺时针绘制
    return (
      `M 0 ${cy} ` + // 左箭头尖端
      `L ${headW} 0 ` + // 左箭头上翼尖
      `L ${headW} ${stemTop} ` + // 左翼内角
      `L ${w - headW} ${stemTop} ` + // 柄顶边
      `L ${w - headW} 0 ` + // 右翼外角
      `L ${w} ${cy} ` + // 右箭头尖端
      `L ${w - headW} ${h} ` + // 右翼下尖
      `L ${w - headW} ${stemBot} ` + // 右翼内角
      `L ${headW} ${stemBot} ` + // 柄底边
      `L ${headW} ${h} Z` // 左翼下尖,闭合
    );
  },

  /**
   * 上下双向箭头
   */
  [ST_ShapeType.upDownArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 25000;

    const headH = h * (adj2 / 100000);
    const neckW = w * (adj1 / 100000);
    const cx = w / 2;
    const stemL = cx - neckW / 2;
    const stemR = cx + neckW / 2;

    return (
      `M ${cx} 0 ` + // 上箭头尖端
      `L ${w} ${headH} ` + // 上箭头右翼尖
      `L ${stemR} ${headH} ` + // 右翼内角
      `L ${stemR} ${h - headH} ` + // 柄右边
      `L ${w} ${h - headH} ` + // 下箭头右翼外角
      `L ${cx} ${h} ` + // 下箭头尖端
      `L 0 ${h - headH} ` + // 下箭头左翼尖
      `L ${stemL} ${h - headH} ` + // 左翼内角
      `L ${stemL} ${headH} ` + // 柄左边
      `L 0 ${headH} Z` // 上箭头左翼尖,闭合
    );
  },

  /**
   * 弯曲箭头 (L形)
   * OOXML 规范: 从底部开始，向右弯曲后向上指向
   * adj1: 箭头头部宽度比例 (默认 25000)
   * adj2: 箭头茎宽度比例 (默认 25000)
   * adj3: 箭头头部高度比例 (默认 25000)
   * adj4: 弯曲位置比例 (默认 43750)
   */
  [ST_ShapeType.bentArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 箭头宽度
    const adj2 = adj?.['adj2'] ?? 25000; // 茎宽度
    const adj3 = adj?.['adj3'] ?? 25000; // 箭头高度
    const adj4 = adj?.['adj4'] ?? 43750; // 弯曲位置

    const arrowW = w * (adj1 / 100000); // 箭头头部宽度
    const stemW = h * (adj2 / 100000); // 茎宽度
    const arrowH = h * (adj3 / 100000); // 箭头头部高度
    const bendY = h * (adj4 / 100000); // 弯曲 Y 位置

    const cx = w - arrowW / 2; // 箭头中心 X

    // 从左下开始，顺时针绘制
    return (
      `M 0 ${h} ` + // 左下角
      `L 0 ${h - stemW} ` + // 向上到茎顶部
      `L ${cx - stemW / 2} ${h - stemW} ` + // 向右到弯曲处
      `L ${cx - stemW / 2} ${arrowH} ` + // 向上到箭头底部
      `L ${cx - arrowW / 2} ${arrowH} ` + // 向左到箭头左翼
      `L ${w} 0 ` + // 箭头尖端
      `L ${cx + arrowW / 2} ${arrowH} ` + // 箭头右翼
      `L ${cx + stemW / 2} ${arrowH} ` + // 向左到茎右边
      `L ${cx + stemW / 2} ${h} Z` // 向下闭合
    );
  },

  /**
   * 曲线右箭头
   * OOXML 规范: 弧形曲线箭头，从左侧弧形弯曲指向右侧
   * adj1: 箭头头部高度比例
   * adj2: 箭头茎宽度比例
   * adj3: 弧形比例
   */
  [ST_ShapeType.curvedRightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000; // 箭头头部高度
    const adj2 = adj?.['adj2'] ?? 50000; // 箭头茎宽度/箭头宽度
    const adj3 = adj?.['adj3'] ?? 25000; // 弧形曲率

    const arrowH = h * (adj1 / 100000); // 箭头头部半高度
    const arrowW = w * (adj2 / 100000) * 0.5; // 箭头头部宽度
    const stemH = h * 0.15; // 茎半高度
    const cy = h / 2;

    // 外弧半径和内弧半径
    const outerR = h * 0.5;
    const innerR = h * 0.35;

    return (
      `M 0 ${h} ` + // 起点：左下
      `A ${w * 0.8} ${outerR} 0 0 1 ${w - arrowW} ${cy - stemH} ` + // 外弧到箭头茎上方
      `L ${w - arrowW} ${cy - arrowH} ` + // 箭头上翼起点
      `L ${w} ${cy} ` + // 箭头尖端
      `L ${w - arrowW} ${cy + arrowH} ` + // 箭头下翼
      `L ${w - arrowW} ${cy + stemH} ` + // 箭头茎下方
      `A ${w * 0.6} ${innerR} 0 0 0 ${w * 0.15} ${h} Z` // 内弧闭合
    );
  },

  /**
   * 曲线左箭头
   * OOXML 规范: 弧形曲线箭头，从右侧弧形弯曲指向左侧
   */
  [ST_ShapeType.curvedLeftArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;
    const adj3 = adj?.['adj3'] ?? 25000;

    const arrowH = h * (adj1 / 100000);
    const arrowW = w * (adj2 / 100000) * 0.5;
    const stemH = h * 0.15;
    const cy = h / 2;

    const outerR = h * 0.5;
    const innerR = h * 0.35;

    return (
      `M ${w} ${h} ` +
      `A ${w * 0.8} ${outerR} 0 0 0 ${arrowW} ${cy - stemH} ` +
      `L ${arrowW} ${cy - arrowH} ` +
      `L 0 ${cy} ` +
      `L ${arrowW} ${cy + arrowH} ` +
      `L ${arrowW} ${cy + stemH} ` +
      `A ${w * 0.6} ${innerR} 0 0 1 ${w * 0.85} ${h} Z`
    );
  },

  /**
   * 曲线上箭头
   * OOXML 规范: 弧形曲线箭头，从底部弧形弯曲向上指向
   */
  [ST_ShapeType.curvedUpArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;

    // 箭头头部参数
    const arrowHeadW = w * (adj1 / 100000) * 1.5;
    const arrowHeadH = h * 0.15;
    // 茄部宽度
    const stemW = w * (adj2 / 100000) * 0.3;
    const cx = w / 2;

    // 弧形箭头主体：从底部两侧开始，弧形向上的条带
    // 外弧半径
    const outerRx = w * 0.45;
    const outerRy = h * 0.45;
    // 内弧半径
    const innerRx = outerRx - stemW;
    const innerRy = outerRy - stemW;

    return (
      // 从右下角开始
      `M ${w * 0.95} ${h} ` +
      // 外弧 - 从右下到箭头茄右侧
      `A ${outerRx} ${outerRy} 0 0 0 ${cx + stemW / 2} ${arrowHeadH} ` +
      // 箭头右翼
      `L ${cx + arrowHeadW / 2} ${arrowHeadH} ` +
      // 箭头尖端
      `L ${cx} 0 ` +
      // 箭头左翼
      `L ${cx - arrowHeadW / 2} ${arrowHeadH} ` +
      // 箭头茄左侧
      `L ${cx - stemW / 2} ${arrowHeadH} ` +
      // 内弧 - 从箭头茄左侧到左下角
      `A ${innerRx} ${innerRy} 0 0 1 ${w * 0.05} ${h} ` +
      // 底部连接
      `Z`
    );
  },

  /**
   * 曲线下箭头
   * OOXML 规范: 弧形曲线箭头，从顶部弧形弯曲向下指向
   */
  [ST_ShapeType.curvedDownArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 50000;

    // 箭头头部参数
    const arrowHeadW = w * (adj1 / 100000) * 1.5;
    const arrowHeadH = h * 0.15;
    // 茄部宽度
    const stemW = w * (adj2 / 100000) * 0.3;
    const cx = w / 2;
    const arrowY = h - arrowHeadH;

    // 弧形箭头主体
    const outerRx = w * 0.45;
    const outerRy = h * 0.45;
    const innerRx = outerRx - stemW;
    const innerRy = outerRy - stemW;

    return (
      // 从左上角开始
      `M ${w * 0.05} 0 ` +
      // 外弧 - 从左上到箭头茄左侧
      `A ${outerRx} ${outerRy} 0 0 1 ${cx - stemW / 2} ${arrowY} ` +
      // 箭头左翼
      `L ${cx - arrowHeadW / 2} ${arrowY} ` +
      // 箭头尖端
      `L ${cx} ${h} ` +
      // 箭头右翼
      `L ${cx + arrowHeadW / 2} ${arrowY} ` +
      // 箭头茄右侧
      `L ${cx + stemW / 2} ${arrowY} ` +
      // 内弧 - 从箭头茄右侧到右上角
      `A ${innerRx} ${innerRy} 0 0 0 ${w * 0.95} 0 ` +
      // 顶部连接
      `Z`
    );
  },

  /**
   * 弯曲向上箭头
   */
  [ST_ShapeType.bentUpArrow]: (w, h, adj) => {
    const stemW = Math.min(w, h) * 0.2;
    const arrowH = h * 0.25;
    const arrowW = w * 0.35;

    return (
      `M 0 ${h} ` +
      `L 0 ${h - stemW} ` +
      `L ${w - arrowW / 2 - stemW / 2} ${h - stemW} ` +
      `L ${w - arrowW / 2 - stemW / 2} ${arrowH} ` +
      `L ${w - arrowW} ${arrowH} ` +
      `L ${w - arrowW / 2} 0 ` +
      `L ${w} ${arrowH} ` +
      `L ${w - arrowW / 2 + stemW / 2} ${arrowH} ` +
      `L ${w - arrowW / 2 + stemW / 2} ${h} Z`
    );
  },

  /**
   * 左上箭头
   */
  [ST_ShapeType.leftUpArrow]: (w, h, adj) => {
    const stemW = Math.min(w, h) * 0.18;
    const arrowSize = Math.min(w, h) * 0.3;

    return (
      `M ${arrowSize} 0 ` +
      `L ${arrowSize * 2} ${arrowSize} ` +
      `L ${arrowSize + stemW / 2} ${arrowSize} ` +
      `L ${arrowSize + stemW / 2} ${h - arrowSize - stemW / 2} ` +
      `L ${w - arrowSize} ${h - arrowSize - stemW / 2} ` +
      `L ${w - arrowSize} ${h - arrowSize * 2} ` +
      `L ${w} ${h - arrowSize} ` +
      `L ${w - arrowSize} ${h} ` +
      `L ${w - arrowSize} ${h - arrowSize + stemW / 2} ` +
      `L ${arrowSize - stemW / 2} ${h - arrowSize + stemW / 2} ` +
      `L ${arrowSize - stemW / 2} ${arrowSize} ` +
      `L 0 ${arrowSize} Z`
    );
  },

  /**
   * 缺口右箭头
   * OOXML 规范: 右箭头，左侧有向右的凹口
   * adj1: 茎高度比例
   * adj2: 箭头头部宽度比例
   */
  [ST_ShapeType.notchedRightArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 50000;
    const adj2 = adj?.['adj2'] ?? 50000;

    const headW = w * (adj2 / 100000);
    const neckH = h * (adj1 / 100000);
    const cy = h / 2;
    // 缺口深度 = 箭头头部宽度的一部分
    const notchD = headW * 0.5;

    return (
      `M 0 ${cy - neckH / 2} ` + // 左上
      `L ${w - headW} ${cy - neckH / 2} ` + // 茎上边
      `L ${w - headW} 0 ` + // 箭头上翼外角
      `L ${w} ${cy} ` + // 箭头尖端
      `L ${w - headW} ${h} ` + // 箭头下翼外角
      `L ${w - headW} ${cy + neckH / 2} ` + // 茎下边
      `L 0 ${cy + neckH / 2} ` + // 左下
      `L ${notchD} ${cy} Z` // 凹口（向右凹入）
    );
  },

  /**
   * 条纹右箭头
   */
  [ST_ShapeType.stripedRightArrow]: (w, h, adj) => {
    const neckH = h * 0.5;
    const headW = w * 0.3;
    const stripeW = w * 0.035;
    const gapW = w * 0.02;
    const cy = h / 2;

    let stripes = '';
    for (let i = 0; i < 4; i++) {
      const x = i * (stripeW + gapW);
      stripes +=
        `M ${x} ${cy - neckH / 2} ` +
        `L ${x + stripeW} ${cy - neckH / 2} ` +
        `L ${x + stripeW} ${cy + neckH / 2} ` +
        `L ${x} ${cy + neckH / 2} Z `;
    }

    const arrowX = 4 * (stripeW + gapW) + gapW;
    const arrow =
      `M ${arrowX} ${cy - neckH / 2} ` +
      `L ${w - headW} ${cy - neckH / 2} ` +
      `L ${w - headW} 0 ` +
      `L ${w} ${cy} ` +
      `L ${w - headW} ${h} ` +
      `L ${w - headW} ${cy + neckH / 2} ` +
      `L ${arrowX} ${cy + neckH / 2} Z`;

    return stripes + arrow;
  },

  /**
   * 本垒板
   */
  [ST_ShapeType.homePlate]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 50000;
    const pointX = w * (adj1 / 100000);

    return `M 0 0 L ${w - pointX} 0 L ${w} ${h / 2} L ${w - pointX} ${h} L 0 ${h} Z`;
  },

  /**
   * V形
   */
  [ST_ShapeType.chevron]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 50000;
    const pointW = w * (adj1 / 100000);

    return `M 0 0 L ${w - pointW} 0 L ${w} ${h / 2} L ${w - pointW} ${h} L 0 ${h} L ${pointW} ${h / 2} Z`;
  },

  /**
   * 四向箭头
   * OOXML 规范: 四个方向的箭头
   * adj1: 箭头头部宽度比例
   * adj2: 箭头茎宽度比例
   * adj3: 箭头头部长度比例
   */
  [ST_ShapeType.quadArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 22500; // 箭头头部宽度
    const adj2 = adj?.['adj2'] ?? 22500; // 茎宽度
    const adj3 = adj?.['adj3'] ?? 22500; // 箭头头部长度

    const headW = Math.min(w, h) * (adj1 / 100000);
    const armW = Math.min(w, h) * (adj2 / 100000);
    const headL = Math.min(w, h) * (adj3 / 100000);
    const cx = w / 2;
    const cy = h / 2;

    return (
      `M ${cx} 0 ` + // 上箭头尖
      `L ${cx + headW} ${headL} ` + // 上箭头右翼
      `L ${cx + armW / 2} ${headL} ` + // 上箭头茎右
      `L ${cx + armW / 2} ${cy - armW / 2} ` + // 到中心
      `L ${w - headL} ${cy - armW / 2} ` + // 走到右箭头茎
      `L ${w - headL} ${cy - headW} ` + // 右箭头上翼
      `L ${w} ${cy} ` + // 右箭头尖
      `L ${w - headL} ${cy + headW} ` + // 右箭头下翼
      `L ${w - headL} ${cy + armW / 2} ` + // 右箭头茎下
      `L ${cx + armW / 2} ${cy + armW / 2} ` + // 回到中心
      `L ${cx + armW / 2} ${h - headL} ` + // 走到下箭头茎
      `L ${cx + headW} ${h - headL} ` + // 下箭头右翼
      `L ${cx} ${h} ` + // 下箭头尖
      `L ${cx - headW} ${h - headL} ` + // 下箭头左翼
      `L ${cx - armW / 2} ${h - headL} ` + // 下箭头茎左
      `L ${cx - armW / 2} ${cy + armW / 2} ` + // 回到中心
      `L ${headL} ${cy + armW / 2} ` + // 走到左箭头茎
      `L ${headL} ${cy + headW} ` + // 左箭头下翼
      `L 0 ${cy} ` + // 左箭头尖
      `L ${headL} ${cy - headW} ` + // 左箭头上翼
      `L ${headL} ${cy - armW / 2} ` + // 左箭头茎上
      `L ${cx - armW / 2} ${cy - armW / 2} ` + // 回到中心
      `L ${cx - armW / 2} ${headL} ` + // 走到上箭头茎
      `L ${cx - headW} ${headL} Z` // 闭合
    );
  },

  /**
   * 圆形箭头
   * OOXML 规范: 顺时针弧形箭头
   * adj1: 箭头头部角度
   * adj2: 弧线起始角度
   * adj3: 弧线结束角度
   * adj4: 弧线厚度
   * adj5: 箭头头部宽度
   */
  [ST_ShapeType.circularArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 12500; // 箭头头部角度占比
    const adj2 = adj?.['adj2'] ?? 1142319; // 起始角度 (约65度)
    const adj3 = adj?.['adj3'] ?? 20457681; // 结束角度 (约-31度)
    const adj4 = adj?.['adj4'] ?? 11796480; // 弧线厚度
    const adj5 = adj?.['adj5'] ?? 12500; // 箭头头部宽度

    const cx = w / 2;
    const cy = h / 2;
    const r = (Math.min(w, h) / 2) * 0.95;
    const thick = r * 0.28;
    const ir = r - thick;
    const arrowW = thick * 1.5; // 箭头宽度
    const arrowL = r * 0.2; // 箭头长度

    // 简化版本：大约270度的弧
    // 从顶部开始，顺时针画到左侧，然后是箭头
    const startAngle = -Math.PI / 2; // 顶部
    const endAngle = Math.PI; // 左侧

    const outerStartX = cx + r * Math.cos(startAngle);
    const outerStartY = cy + r * Math.sin(startAngle);
    const outerEndX = cx + r * Math.cos(endAngle);
    const outerEndY = cy + r * Math.sin(endAngle);
    const innerEndX = cx + ir * Math.cos(endAngle);
    const innerEndY = cy + ir * Math.sin(endAngle);
    const innerStartX = cx + ir * Math.cos(startAngle);
    const innerStartY = cy + ir * Math.sin(startAngle);

    return (
      `M ${outerStartX} ${outerStartY} ` +
      `A ${r} ${r} 0 1 1 ${outerEndX} ${outerEndY} ` + // 外弧
      `L ${outerEndX - arrowW / 2} ${outerEndY} ` + // 箭头外侧
      `L ${cx - ir + thick / 2} ${outerEndY + arrowL} ` + // 箭头尖端
      `L ${innerEndX} ${innerEndY} ` + // 箭头内侧
      `A ${ir} ${ir} 0 1 0 ${innerStartX} ${innerStartY} Z` // 内弧
    );
  },

  /**
   * 流线型箭头
   * OOXML 规范: 平滑流线型曲线箭头，从左下向右上
   */
  [ST_ShapeType.swooshArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 16667;

    // 箭头尖端位置和大小
    const tailW = w * (adj1 / 100000);
    const arrowH = h * (adj2 / 100000);

    return (
      `M 0 ${h} ` + // 起点：左下
      `C ${w * 0.2} ${h * 0.85} ${w * 0.4} ${h * 0.5} ${w * 0.6} ${h * 0.3} ` + // 曲线上升
      `C ${w * 0.75} ${h * 0.15} ${w * 0.9} ${h * 0.05} ${w} 0 ` + // 到达箭头尖端
      `L ${w - arrowH * 0.8} ${arrowH * 0.6} ` + // 箭头右边缘
      `L ${w - arrowH * 0.3} 0 ` + // 箭头内角
      `C ${w * 0.85} ${h * 0.1} ${w * 0.65} ${h * 0.25} ${w * 0.5} ${h * 0.4} ` + // 内曲线
      `C ${w * 0.3} ${h * 0.6} ${w * 0.15} ${h * 0.8} ${tailW} ${h} Z` // 回到底部
    );
  },

  /**
   * U形转弯箭头
   * OOXML 规范: 从底部左侧向上，180度转弯，向下指向底部右侧
   * adj1: 箭头头部宽度
   * adj2: 茎宽度
   * adj3: 弧形半径
   * adj4: 箭头头部高度
   * adj5: 弧到底部的距离
   */
  [ST_ShapeType.uturnArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 25000;
    const adj3 = adj?.['adj3'] ?? 25000;
    const adj4 = adj?.['adj4'] ?? 43750;
    const adj5 = adj?.['adj5'] ?? 75000;

    const arrowW = w * (adj1 / 100000); // 箭头头部宽度
    const stemW = w * (adj2 / 100000); // 茎宽度
    const arcR = w * (adj3 / 100000); // 外弧半径
    const arcInnerR = arcR - stemW; // 内弧半径
    const arrowH = h * 0.15; // 箭头高度
    const arcCenterY = arcR + h * 0.1; // 弧心 Y 位置

    const leftStemX = stemW; // 左侧茎X位置
    const rightArrowX = w - arrowW / 2; // 箭头中心X位置

    return (
      `M 0 ${h} ` + // 左下角
      `L 0 ${arcCenterY} ` + // 向上到弧底部
      `A ${arcR} ${arcR} 0 0 1 ${arcR * 2} ${arcCenterY} ` + // 外弧（180度）
      `L ${arcR * 2} ${h - arrowH} ` + // 向下到箭头位置
      `L ${arcR * 2 - (arrowW - stemW) / 2} ${h - arrowH} ` + // 箭头左外边
      `L ${arcR * 2 + stemW / 2} ${h} ` + // 箭头尖端
      `L ${arcR * 2 + stemW + (arrowW - stemW) / 2} ${h - arrowH} ` + // 箭头右外边
      `L ${arcR * 2 + stemW} ${h - arrowH} ` + // 右侧茎顶部
      `L ${arcR * 2 + stemW} ${arcCenterY} ` + // 向上到内弧
      `A ${arcInnerR} ${arcInnerR} 0 0 0 ${stemW} ${arcCenterY} ` + // 内弧
      `L ${stemW} ${h} Z` // 闭合
    );
  },

  // Aliases - 箭头标注类
  [ST_ShapeType.leftRightArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.leftRightArrow](w, h),
  [ST_ShapeType.upArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.upArrow](w, h),
  [ST_ShapeType.downArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.downArrow](w, h),
  [ST_ShapeType.leftArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.leftArrow](w, h),
  [ST_ShapeType.rightArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.rightArrow](w, h),
  [ST_ShapeType.upDownArrowCallout]: (w, h) => ArrowShapes[ST_ShapeType.upDownArrow](w, h),

  /**
   * 四向箭头标注
   * 带有中间标注区域的四向箭头
   */
  [ST_ShapeType.quadArrowCallout]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 22500;
    const adj2 = adj?.['adj2'] ?? 22500;
    const adj3 = adj?.['adj3'] ?? 22500;
    const adj4 = adj?.['adj4'] ?? 10000; // 标注区域大小

    const headW = Math.min(w, h) * (adj1 / 100000);
    const armW = Math.min(w, h) * (adj2 / 100000);
    const headL = Math.min(w, h) * (adj3 / 100000);
    const calloutS = Math.min(w, h) * (adj4 / 100000);
    const cx = w / 2;
    const cy = h / 2;

    // 与 quadArrow 类似，但中心有标注区域
    return (
      `M ${cx} 0 ` +
      `L ${cx + headW} ${headL} ` +
      `L ${cx + armW / 2} ${headL} ` +
      `L ${cx + armW / 2} ${cy - calloutS} ` +
      `L ${cx + calloutS} ${cy - calloutS} ` +
      `L ${cx + calloutS} ${cy - armW / 2} ` +
      `L ${w - headL} ${cy - armW / 2} ` +
      `L ${w - headL} ${cy - headW} ` +
      `L ${w} ${cy} ` +
      `L ${w - headL} ${cy + headW} ` +
      `L ${w - headL} ${cy + armW / 2} ` +
      `L ${cx + calloutS} ${cy + armW / 2} ` +
      `L ${cx + calloutS} ${cy + calloutS} ` +
      `L ${cx + armW / 2} ${cy + calloutS} ` +
      `L ${cx + armW / 2} ${h - headL} ` +
      `L ${cx + headW} ${h - headL} ` +
      `L ${cx} ${h} ` +
      `L ${cx - headW} ${h - headL} ` +
      `L ${cx - armW / 2} ${h - headL} ` +
      `L ${cx - armW / 2} ${cy + calloutS} ` +
      `L ${cx - calloutS} ${cy + calloutS} ` +
      `L ${cx - calloutS} ${cy + armW / 2} ` +
      `L ${headL} ${cy + armW / 2} ` +
      `L ${headL} ${cy + headW} ` +
      `L 0 ${cy} ` +
      `L ${headL} ${cy - headW} ` +
      `L ${headL} ${cy - armW / 2} ` +
      `L ${cx - calloutS} ${cy - armW / 2} ` +
      `L ${cx - calloutS} ${cy - calloutS} ` +
      `L ${cx - armW / 2} ${cy - calloutS} ` +
      `L ${cx - armW / 2} ${headL} ` +
      `L ${cx - headW} ${headL} Z`
    );
  },

  /**
   * 左向圆形箭头
   * 逆时针弧形箭头
   */
  [ST_ShapeType.leftCircularArrow]: (w, h, adj) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = (Math.min(w, h) / 2) * 0.95;
    const thick = r * 0.28;
    const ir = r - thick;
    const arrowW = thick * 1.5;
    const arrowL = r * 0.2;

    // 逆时针版本：从顶部开始，逆时针画到右侧
    const startAngle = -Math.PI / 2; // 顶部
    const endAngle = 0; // 右侧

    const outerStartX = cx + r * Math.cos(startAngle);
    const outerStartY = cy + r * Math.sin(startAngle);
    const outerEndX = cx + r * Math.cos(endAngle);
    const outerEndY = cy + r * Math.sin(endAngle);
    const innerEndX = cx + ir * Math.cos(endAngle);
    const innerEndY = cy + ir * Math.sin(endAngle);
    const innerStartX = cx + ir * Math.cos(startAngle);
    const innerStartY = cy + ir * Math.sin(startAngle);

    return (
      `M ${outerStartX} ${outerStartY} ` +
      `A ${r} ${r} 0 1 0 ${outerEndX} ${outerEndY} ` + // 外弧（逆时针）
      `L ${outerEndX} ${outerEndY + arrowW / 2} ` + // 箭头外侧
      `L ${outerEndX + arrowL} ${cy + ir - thick / 2} ` + // 箭头尖端
      `L ${innerEndX} ${innerEndY} ` + // 箭头内侧
      `A ${ir} ${ir} 0 1 1 ${innerStartX} ${innerStartY} Z` // 内弧
    );
  },

  /**
   * 双向圆形箭头
   * 两端都有箭头的圆弧
   */
  [ST_ShapeType.leftRightCircularArrow]: (w, h, adj) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = (Math.min(w, h) / 2) * 0.95;
    const thick = r * 0.22;
    const ir = r - thick;
    const arrowL = r * 0.15;
    const arrowW = thick * 1.3;

    // 两端都有箭头的弧，大约270度
    // 左侧箭头和右侧箭头
    return (
      `M ${cx + r} ${cy - arrowW / 2} ` + // 右侧箭头外
      `L ${cx + r + arrowL} ${cy} ` + // 右侧箭头尖端
      `L ${cx + r} ${cy + arrowW / 2} ` + // 右侧箭头内
      `L ${cx + ir} ${cy} ` + // 内弧右端
      `A ${ir} ${ir} 0 1 1 ${cx - ir} ${cy} ` + // 内弧（顺时针上半部）
      `L ${cx - r} ${cy + arrowW / 2} ` + // 左侧箭头内
      `L ${cx - r - arrowL} ${cy} ` + // 左侧箭头尖端
      `L ${cx - r} ${cy - arrowW / 2} ` + // 左侧箭头外
      `A ${r} ${r} 0 1 1 ${cx + r} ${cy - arrowW / 2} Z` // 外弧
    );
  },

  /**
   * 左右上三向箭头
   * 左、右、上三个方向的箭头
   */
  [ST_ShapeType.leftRightUpArrow]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 25000;
    const adj2 = adj?.['adj2'] ?? 25000;
    const adj3 = adj?.['adj3'] ?? 25000;

    const headW = Math.min(w, h) * (adj1 / 100000);
    const armW = Math.min(w, h) * (adj2 / 100000);
    const headL = Math.min(w, h) * (adj3 / 100000);
    const cx = w / 2;
    const bottomY = h - headL;

    return (
      `M ${cx} 0 ` + // 上箭头尖
      `L ${cx + headW} ${headL} ` + // 上箭头右翼
      `L ${cx + armW / 2} ${headL} ` + // 上箭头茎右
      `L ${cx + armW / 2} ${bottomY - armW / 2} ` + // 向下到交叉点
      `L ${w - headL} ${bottomY - armW / 2} ` + // 向右到右箭头茎
      `L ${w - headL} ${bottomY - headW} ` + // 右箭头上翼
      `L ${w} ${bottomY} ` + // 右箭头尖
      `L ${w - headL} ${bottomY + headW} ` + // 右箭头下翼
      `L ${w - headL} ${bottomY + armW / 2} ` + // 右箭头茎下
      `L ${cx + armW / 2} ${bottomY + armW / 2} ` + // 回到中心
      `L ${cx + armW / 2} ${h} ` + // 下边缘
      `L ${cx - armW / 2} ${h} ` + // 下边缘
      `L ${cx - armW / 2} ${bottomY + armW / 2} ` + // 回到中心
      `L ${headL} ${bottomY + armW / 2} ` + // 向左到左箭头茎
      `L ${headL} ${bottomY + headW} ` + // 左箭头下翼
      `L 0 ${bottomY} ` + // 左箭头尖
      `L ${headL} ${bottomY - headW} ` + // 左箭头上翼
      `L ${headL} ${bottomY - armW / 2} ` + // 左箭头茎上
      `L ${cx - armW / 2} ${bottomY - armW / 2} ` + // 回到中心
      `L ${cx - armW / 2} ${headL} ` + // 向上到上箭头茎
      `L ${cx - headW} ${headL} Z` // 闭合
    );
  }
};
