/**
 * 连接符渲染器
 * 负责直线、折线、曲线连接符的渲染
 */

import type { OfficeConnector } from '../types';
import type { StyleResolver, RenderContext } from './StyleResolver';

/** 坐标计算函数类型 */
export type CoordCalculator = {
  getLeft: (col: number, off: number) => number;
  getTop: (row: number, off: number) => number;
};

/**
 * 连接符渲染器类
 */
export class ConnectorRenderer {
  private styleResolver: StyleResolver;

  constructor(styleResolver: StyleResolver) {
    this.styleResolver = styleResolver;
  }

  /**
   * 渲染连接符
   * @param cxn 连接符数据
   * @param container SVG 容器
   * @param coords 坐标计算器
   * @param ctx 渲染上下文
   */
  renderConnector(cxn: OfficeConnector, container: SVGElement, coords: CoordCalculator, ctx: RenderContext): void {
    const x1 = coords.getLeft(cxn.anchor.from.col, cxn.anchor.from.colOff);
    const y1 = coords.getTop(cxn.anchor.from.row, cxn.anchor.from.rowOff);
    let x2 = x1,
      y2 = y1;

    if (cxn.anchor.to) {
      x2 = coords.getLeft(cxn.anchor.to.col, cxn.anchor.to.colOff);
      y2 = coords.getTop(cxn.anchor.to.row, cxn.anchor.to.rowOff);
    } else if (cxn.anchor.ext) {
      x2 = x1 + cxn.anchor.ext.cx / 9525;
      y2 = y1 + cxn.anchor.ext.cy / 9525;
    }

    // 确定路径
    const d = this._generatePath(cxn, x1, y1, x2, y2);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');

    // 颜色处理
    let color = this._resolveStrokeColor(cxn, x1, y1, x2, y2, ctx);

    // 回退到样式
    if (!color && cxn.style?.lnRef?.color) {
      color = this.styleResolver.resolveColor(cxn.style.lnRef.color);
    }
    if (!color) color = '#000000';

    const w = cxn.stroke?.width || 0;
    const widthPt = w > 20 ? w / 12700 : w || 1.5;

    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', String(widthPt));

    // 箭头标记
    this._applyMarkers(cxn, path, ctx, color);

    container.appendChild(path);
  }

  /**
   * 生成连接符路径
   */
  private _generatePath(cxn: OfficeConnector, x1: number, y1: number, x2: number, y2: number): string {
    let d = `M ${x1} ${y1}`;
    const geom = cxn.geometry || cxn.type || 'line';

    if (geom.includes('curved') || geom === 'curvedConnector3') {
      // 二次贝塞尔曲线
      let cpx = x2;
      let cpy = y1;

      if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
        cpx = x1;
        cpy = y2;
      }

      d += ` Q ${cpx} ${cpy} ${x2} ${y2}`;
    } else if (geom.includes('bent') || geom === 'bentConnector2' || geom === 'bentConnector3') {
      // 折线连接符
      const adj1 = cxn.adjustValues?.['adj1'] ?? 50000;
      const ratio = adj1 / 100000;

      if (geom === 'bentConnector2') {
        // L 形（2段）
        if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
          d += ` L ${x2} ${y1} L ${x2} ${y2}`;
        } else {
          d += ` L ${x1} ${y2} L ${x2} ${y2}`;
        }
      } else {
        // 标准 3 段
        if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
          const midY = y1 + (y2 - y1) * ratio;
          d += ` L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
        } else {
          const midX = x1 + (x2 - x1) * ratio;
          d += ` L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        }
      }
    } else {
      // 直线
      d += ` L ${x2} ${y2}`;
    }

    return d;
  }

  /**
   * 解析描边颜色
   */
  private _resolveStrokeColor(
    cxn: OfficeConnector,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    ctx: RenderContext
  ): string {
    if (cxn.stroke?.gradient) {
      // 渐变描边
      const bounds = {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        w: Math.abs(x2 - x1) || 1,
        h: Math.abs(y2 - y1) || 1
      };
      return this.styleResolver.resolveFill({ type: 'gradient', gradient: cxn.stroke.gradient }, ctx, bounds);
    } else {
      return cxn.stroke?.color ? this.styleResolver.resolveColor(cxn.stroke.color) : '';
    }
  }

  /**
   * 应用箭头标记
   */
  private _applyMarkers(cxn: OfficeConnector, path: SVGPathElement, ctx: RenderContext, color: string): void {
    // 起始箭头
    if (cxn.stroke?.headEnd && cxn.stroke.headEnd.type !== 'none') {
      const mStart = this.styleResolver.resolveMarker(cxn.stroke.headEnd, 'start', ctx, color);
      if (mStart) path.setAttribute('marker-start', `url(#${mStart})`);
    } else if (cxn.startArrow && cxn.startArrow !== 'none') {
      const mStart = this.styleResolver.resolveMarker(
        { type: cxn.startArrow, w: 'med', len: 'med' },
        'start',
        ctx,
        color
      );
      if (mStart) path.setAttribute('marker-start', `url(#${mStart})`);
    }

    // 结束箭头
    if (cxn.stroke?.tailEnd && cxn.stroke.tailEnd.type !== 'none') {
      const mEnd = this.styleResolver.resolveMarker(cxn.stroke.tailEnd, 'end', ctx, color);
      if (mEnd) path.setAttribute('marker-end', `url(#${mEnd})`);
    } else if (cxn.endArrow && cxn.endArrow !== 'none') {
      const mEnd = this.styleResolver.resolveMarker({ type: cxn.endArrow, w: 'med', len: 'med' }, 'end', ctx, color);
      if (mEnd) path.setAttribute('marker-end', `url(#${mEnd})`);
    }
  }
}
