import { ST_ShapeType } from '@ai-space/definitions/autogen/dml-shapeGeometry';
import { ShapeGenerator } from './types';
import { GeoUtils } from './GeoUtils';

export const SpecialShapes: Record<string, ShapeGenerator> = {
  [ST_ShapeType.frame]: (w, h, adj) => {
    const val = adj?.['val'] ?? 12500;
    const thick = Math.min(w, h) * (val / 100000);
    const outer = `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    const inner = `M ${thick} ${thick} L ${thick} ${h - thick} L ${w - thick} ${h - thick} L ${w - thick} ${thick} Z`;
    return outer + ' ' + inner;
  },
  [ST_ShapeType.halfFrame]: (w, h, adj) => {
    const thick = Math.min(w, h) * 0.15;
    // Top and Left sides only
    return `M 0 0 L ${w} 0 L ${w} ${thick} L ${thick} ${thick} L ${thick} ${h} L 0 ${h} Z`;
  },
  [ST_ShapeType.corner]: (w, h) => {
    const thick = Math.min(w, h) * 0.15;
    return `M 0 0 L ${w} 0 L ${w} ${thick} L ${thick} ${thick} L ${thick} ${h} L 0 ${h} Z`; // Same as halfFrame?
    // Corner shape.
  },
  [ST_ShapeType.foldedCorner]: (w, h) => {
    const fold = Math.min(w, h) * 0.2;
    return `M 0 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h} L 0 ${h} Z M ${w - fold} 0 L ${
      w - fold
    } ${fold} L ${w} ${fold}`;
  },

  [ST_ShapeType.teardrop]: (w, h, adj) => {
    const r = Math.min(w, h) / 2;
    const cx = w / 2;
    const cy = h - r;
    return `M ${cx} 0 L ${w} ${cy} A ${r} ${r} 0 1 1 0 ${cy} Z`;
  },

  [ST_ShapeType.heart]: (w, h) => {
    const cx = w / 2;
    return (
      `M ${cx} ${h * 0.25} C ${w * 0.1} ${-h * 0.1} ${-w * 0.2} ${h * 0.4} ${cx} ${h} ` +
      `C ${w * 1.2} ${h * 0.4} ${w * 0.9} ${-h * 0.1} ${cx} ${h * 0.25} Z`
    );
  },
  [ST_ShapeType.lightningBolt]: (w, h) => {
    return `M ${w * 0.4} 0 L ${w * 0.8} 0 L ${w * 0.5} ${h * 0.6} L ${w * 0.7} ${h * 0.6} L ${w * 0.2} ${h} L ${
      w * 0.4
    } ${h * 0.4} L ${w * 0.2} ${h * 0.4} Z`;
  },

  [ST_ShapeType.sun]: (w, h, adj) => {
    const innerRatio = 0.7;
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.min(w, h) / 2;
    const coreR = rx * innerRatio;
    let d = GeoUtils.ellipse(cx, cy, coreR, coreR);
    const numRays = 8;
    for (let i = 0; i < numRays; i++) {
      const ang = (i * Math.PI * 2) / numRays;
      const tx = cx + rx * Math.cos(ang);
      const ty = cy + rx * Math.sin(ang);
      const dang = (Math.PI / numRays) * 0.3;
      const b1x = cx + coreR * Math.cos(ang - dang);
      const b1y = cy + coreR * Math.sin(ang - dang);
      const b2x = cx + coreR * Math.cos(ang + dang);
      const b2y = cy + coreR * Math.sin(ang + dang);
      d += ` M ${tx} ${ty} L ${b1x} ${b1y} L ${b2x} ${b2y} Z`;
    }
    return d;
  },

  [ST_ShapeType.moon]: (w, h, adj) => {
    return `M ${w * 0.5} 0 A ${w * 0.5} ${h * 0.5} 0 1 0 ${w * 0.5} ${h} A ${w * 0.35} ${h * 0.5} 0 1 1 ${w * 0.5} 0 Z`;
  },

  /**
   * 云形
   * OOXML 规范: 多个重叠的圆弧形成蓬松的云彩效果
   */
  [ST_ShapeType.cloud]: (w, h) => {
    // 使用多个圆弧创建更精细的云形
    // 云形由多个相连的弧线组成
    return (
      // 底部左侧弧
      `M ${w * 0.15} ${h * 0.75} ` +
      `C ${w * 0.02} ${h * 0.7} ${w * 0.02} ${h * 0.45} ${w * 0.15} ${h * 0.4} ` +
      // 左上弧
      `C ${w * 0.1} ${h * 0.2} ${w * 0.25} ${h * 0.1} ${w * 0.4} ${h * 0.15} ` +
      // 顶部弧
      `C ${w * 0.45} ${h * 0.02} ${w * 0.6} ${h * 0.02} ${w * 0.7} ${h * 0.12} ` +
      // 右上弧
      `C ${w * 0.85} ${h * 0.08} ${w * 0.98} ${h * 0.25} ${w * 0.92} ${h * 0.42} ` +
      // 右侧弧
      `C ${w} ${h * 0.55} ${w * 0.95} ${h * 0.72} ${w * 0.82} ${h * 0.78} ` +
      // 底部右侧弧
      `C ${w * 0.78} ${h * 0.92} ${w * 0.58} ${h * 0.95} ${w * 0.45} ${h * 0.88} ` +
      // 底部中间弧
      `C ${w * 0.35} ${h * 0.98} ${w * 0.2} ${h * 0.92} ${w * 0.15} ${h * 0.75} Z`
    );
  },

  [ST_ShapeType.plaque]: (w, h, adj) => {
    const r = Math.min(w, h) * 0.16;
    return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 0 ${w} ${r} L ${w} ${h - r} A ${r} ${r} 0 0 0 ${
      w - r
    } ${h} L ${r} ${h} A ${r} ${r} 0 0 0 0 ${h - r} L 0 ${r} A ${r} ${r} 0 0 0 ${r} 0 Z`;
  },

  [ST_ShapeType.donut]: (w, h, adj) => {
    const innerRatio = 0.75;
    const rx = w / 2;
    const ry = h / 2;
    const irx = rx * innerRatio;
    const iry = ry * innerRatio;
    const cx = w / 2,
      cy = h / 2;
    return (
      `M ${cx} ${0} A ${rx} ${ry} 0 1 1 ${cx} ${h} A ${rx} ${ry} 0 1 1 ${cx} ${0} Z ` +
      `M ${cx} ${cy - iry} A ${irx} ${iry} 0 1 0 ${cx} ${cy + iry} A ${irx} ${iry} 0 1 0 ${cx} ${cy - iry} Z`
    );
  },

  [ST_ShapeType.noSmoking]: (w, h, adj) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    const thick = r * 0.15;
    const ir = r - thick;

    // 外圈
    const outer = `M ${cx} 0 A ${r} ${r} 0 1 1 ${cx} ${h} A ${r} ${r} 0 1 1 ${cx} 0 Z`;
    // 内圈（挖空）
    const inner = `M ${cx} ${thick} A ${ir} ${ir} 0 1 0 ${cx} ${h - thick} A ${ir} ${ir} 0 1 0 ${cx} ${thick} Z`;
    // 对角线禁止符
    const barW = thick * 1.2;
    const ang = Math.PI / 4;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const bar =
      `M ${cx - ir * dx} ${cy - ir * dy} ` +
      `L ${cx - ir * dx + barW * dy} ${cy - ir * dy - barW * dx} ` +
      `L ${cx + ir * dx + barW * dy} ${cy + ir * dy - barW * dx} ` +
      `L ${cx + ir * dx} ${cy + ir * dy} Z`;

    return outer + ' ' + inner + ' ' + bar;
  },

  [ST_ShapeType.blockArc]: (w, h, adj) => {
    const adj1 = adj?.['adj1'] ?? 180; // 起始角度
    const adj2 = adj?.['adj2'] ?? 0; // 结束角度
    const adj3 = adj?.['adj3'] ?? 25000; // 厚度

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    const thick = r * (adj3 / 100000);
    const ir = r - thick;

    // 默认：上半圆弧
    return (
      `M ${cx - r} ${cy} ` +
      `A ${r} ${r} 0 0 1 ${cx + r} ${cy} ` +
      `L ${cx + ir} ${cy} ` +
      `A ${ir} ${ir} 0 0 0 ${cx - ir} ${cy} Z`
    );
  },

  [ST_ShapeType.smileyFace]: (w, h) => {
    const cx = w / 2,
      cy = h / 2;
    const rx = w / 2,
      ry = h / 2;
    // Face
    const face = GeoUtils.ellipse(cx, cy, rx, ry);
    // Eyes
    const eyeR = rx * 0.1;
    const le = GeoUtils.ellipse(cx - rx * 0.4, cy - ry * 0.2, eyeR, eyeR);
    const re = GeoUtils.ellipse(cx + rx * 0.4, cy - ry * 0.2, eyeR, eyeR);
    // Smile (Arc)
    const smile = `M ${cx - rx * 0.5} ${cy + ry * 0.3} Q ${cx} ${h * 0.8} ${cx + rx * 0.5} ${cy + ry * 0.3}`;
    // Note: smile is a stroke, face is fill.
    // Usually Smiley is 1 path?
    // If filled, eyes and smile are holes.
    return (
      `M ${cx} 0 A ${rx} ${ry} 0 1 1 ${cx} ${h} A ${rx} ${ry} 0 1 1 ${cx} 0 Z ` +
      `M ${cx - rx * 0.4} ${cy - ry * 0.2 - eyeR} A ${eyeR} ${eyeR} 0 1 0 ${cx - rx * 0.4} ${
        cy - ry * 0.2 + eyeR
      } A ${eyeR} ${eyeR} 0 1 0 ${cx - rx * 0.4} ${cy - ry * 0.2 - eyeR} Z ` +
      `M ${cx + rx * 0.4} ${cy - ry * 0.2 - eyeR} A ${eyeR} ${eyeR} 0 1 0 ${cx + rx * 0.4} ${
        cy - ry * 0.2 + eyeR
      } A ${eyeR} ${eyeR} 0 1 0 ${cx + rx * 0.4} ${cy - ry * 0.2 - eyeR} Z ` +
      `M ${cx - rx * 0.5} ${cy + ry * 0.3} Q ${cx} ${h * 0.8} ${cx + rx * 0.5} ${cy + ry * 0.3} L ${cx + rx * 0.5} ${
        cy + ry * 0.4
      } Q ${cx} ${h * 0.9} ${cx - rx * 0.5} ${cy + ry * 0.4} Z`
    );
  },

  [ST_ShapeType.gear6]: (w, h) => GeoUtils.regularPolygon(6, w, h), // Simplified
  [ST_ShapeType.gear9]: (w, h) => GeoUtils.regularPolygon(9, w, h),

  [ST_ShapeType.funnel]: (w, h, adj) => {
    const adj1 = adj?.['adj'] ?? 33333; // 漏斗颈部宽度比例
    const neckW = w * (adj1 / 100000);
    const neckH = h * 0.3; // 颈部高度占比
    const cx = w / 2;
    const neckL = cx - neckW / 2;
    const neckR = cx + neckW / 2;

    // 漏斗：宽顶 + 曲线过渡 + 窄颈
    return (
      `M 0 0 L ${w} 0 ` +
      `Q ${w} ${h * 0.3} ${neckR} ${h - neckH} ` + // 右侧曲线
      `L ${neckR} ${h} ` +
      `L ${neckL} ${h} ` +
      `L ${neckL} ${h - neckH} ` +
      `Q 0 ${h * 0.3} 0 0 Z`
    );
  }
};
