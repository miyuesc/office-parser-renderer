/**
 * 形状渲染器
 * 负责形状、文本框等元素的渲染
 */

import { generatePresetPath } from '@ai-space/shared';
import type { OfficeShape } from '../types';
import type { StyleResolver, RenderContext } from './StyleResolver';

/** 渲染区域 */
export interface RenderRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 形状渲染器类
 */
export class ShapeRenderer {
  private styleResolver: StyleResolver;

  constructor(styleResolver: StyleResolver) {
    this.styleResolver = styleResolver;
  }

  /**
   * 渲染形状
   * @param shape 形状数据
   * @param container SVG 容器
   * @param rect 渲染区域
   * @param ctx 渲染上下文
   */
  renderShape(shape: OfficeShape, container: SVGElement, rect: RenderRect, ctx: RenderContext): void {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.pointerEvents = 'all';

    let transform = `translate(${rect.x}, ${rect.y})`;
    if (shape.rotation) {
      transform += ` rotate(${shape.rotation}, ${rect.w / 2}, ${rect.h / 2})`;
    }
    g.setAttribute('transform', transform);

    // 滤镜效果
    if (shape.effects?.length) {
      const filterId = this.styleResolver.resolveFilter(shape.effects, ctx);
      if (filterId) g.setAttribute('filter', `url(#${filterId})`);
    }

    // 创建矢量图形
    let vector: SVGElement = this._createVectorElement(shape, rect);

    // 确保填充先于边框绘制
    if (vector) vector.style.paintOrder = 'fill stroke';

    // 应用填充
    let fill = this.styleResolver.resolveFill(shape.fill, ctx, rect);

    // 回退到样式中的填充
    if (fill === 'none' && shape.style && shape.style.fillRef && !shape.fill) {
      if (shape.style.fillRef.idx > 0 && shape.style.fillRef.color) {
        fill = this.styleResolver.resolveColor(shape.style.fillRef.color);
      }
    }

    vector.setAttribute('fill', fill);

    // 应用描边
    this._applyStroke(shape, vector, ctx);

    // 自定义路径的特殊处理
    if (shape.geometry === 'custom') {
      vector.setAttribute('vector-effect', 'non-scaling-stroke');
    }

    if (shape.geometry === 'custom' && shape.path) {
      vector.setAttribute('fill', 'none');
    }

    // 添加到容器
    // @ts-ignore
    if (vector._wrapper) {
      // @ts-ignore
      g.appendChild(vector._wrapper);
    } else {
      g.appendChild(vector);
    }

    // 添加辅助描边路径元素（如 callout 指示线）
    // @ts-ignore
    if (vector._strokePathElement) {
      // @ts-ignore
      this._appendStrokePath(vector._strokePathElement, shape, g);
    }

    // 文本渲染
    if (shape.textBody) {
      this._renderTextBody(shape, g, rect, ctx);
    }

    container.appendChild(g);
  }

  /**
   * 创建矢量图形元素
   */
  private _createVectorElement(shape: OfficeShape, rect: RenderRect): SVGElement {
    let vector: SVGElement;

    if (shape.geometry === 'custom' && shape.path) {
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      vector.setAttribute('d', shape.path);

      // 处理自定义路径的缩放
      if (shape.pathWidth && shape.pathHeight && shape.pathWidth > 0 && shape.pathHeight > 0) {
        const innerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        innerSvg.setAttribute('viewBox', `0 0 ${shape.pathWidth} ${shape.pathHeight}`);
        innerSvg.setAttribute('width', String(rect.w));
        innerSvg.setAttribute('height', String(rect.h));
        innerSvg.setAttribute('preserveAspectRatio', 'none');
        innerSvg.style.overflow = 'visible';
        vector.setAttribute('d', shape.path);
        innerSvg.appendChild(vector);
        // @ts-ignore
        vector._wrapper = innerSvg;
      } else {
        const innerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        innerSvg.setAttribute('viewBox', `0 0 21600 21600`);
        innerSvg.setAttribute('width', String(rect.w));
        innerSvg.setAttribute('height', String(rect.h));
        innerSvg.setAttribute('preserveAspectRatio', 'none');
        innerSvg.style.overflow = 'visible';
        vector.setAttribute('d', shape.path);
        innerSvg.appendChild(vector);
        // @ts-ignore
        vector._wrapper = innerSvg;
      }
    } else if (shape.geometry === 'roundRect') {
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      vector.setAttribute('width', String(rect.w));
      vector.setAttribute('height', String(rect.h));

      const val = shape.adjustValues?.['val'] ?? 16667;
      const minDim = Math.min(rect.w, rect.h);
      const radius = minDim * (val / 100000);

      vector.setAttribute('rx', String(radius));
      vector.setAttribute('ry', String(radius));
    } else if (shape.geometry === 'ellipse') {
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      vector.setAttribute('cx', String(rect.w / 2));
      vector.setAttribute('cy', String(rect.h / 2));
      vector.setAttribute('rx', String(rect.w / 2));
      vector.setAttribute('ry', String(rect.h / 2));
    } else if (shape.geometry) {
      // 尝试使用预设路径生成器
      const presetPath = generatePresetPath(shape.geometry, rect.w, rect.h, shape.adjustValues);
      if (presetPath) {
        vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        vector.setAttribute('d', presetPath.path);
        vector.style.paintOrder = 'fill stroke';

        if (presetPath.noFill) {
          vector.setAttribute('fill', 'none');
        }

        // 处理辅助描边路径
        if (presetPath.strokePath) {
          const strokePathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          strokePathEl.setAttribute('d', presetPath.strokePath);
          strokePathEl.setAttribute('fill', 'none');
          // @ts-ignore
          vector._strokePathElement = strokePathEl;
        }
      } else {
        vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        vector.setAttribute('width', String(rect.w));
        vector.setAttribute('height', String(rect.h));
      }
    } else {
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      vector.setAttribute('width', String(rect.w));
      vector.setAttribute('height', String(rect.h));
    }

    return vector;
  }

  /**
   * 应用描边样式
   */
  private _applyStroke(shape: OfficeShape, vector: SVGElement, ctx: RenderContext): void {
    const stroke = shape.stroke;
    let strokeColor = 'none';
    let strokeWidth = 0;
    let strokeDash = 'solid';

    if (stroke) {
      if (stroke.type === 'noFill') {
        strokeColor = 'none';
      } else {
        strokeColor = stroke.color ? this.styleResolver.resolveColor(stroke.color) : 'none';

        // 渐变描边
        if (stroke.gradient) {
          strokeColor = this.styleResolver.resolveFill({ type: 'gradient', gradient: stroke.gradient }, ctx, null);
        }

        strokeWidth = stroke.width || 0;
        strokeDash = stroke.dashStyle || 'solid';
      }
    } else if (shape.style && shape.style.lnRef) {
      // 回退到样式
      if (shape.style.lnRef.idx > 0 && shape.style.lnRef.color) {
        strokeColor = this.styleResolver.resolveColor(shape.style.lnRef.color);
        strokeWidth = 9525; // 0.75pt
      }
    }

    if (strokeColor !== 'none') {
      vector.setAttribute('stroke', strokeColor);
      const widthPt = strokeWidth > 20 ? strokeWidth / 12700 : strokeWidth;
      vector.setAttribute('stroke-width', String(widthPt || 1));
      vector.setAttribute('stroke-linejoin', 'round');
      vector.setAttribute('stroke-linecap', 'round');
      if (strokeDash !== 'solid') {
        if (strokeDash === 'dash') vector.setAttribute('stroke-dasharray', '4 2');
        if (strokeDash === 'dot') vector.setAttribute('stroke-dasharray', '1 1');
      }
    } else {
      vector.setAttribute('stroke', 'none');
    }
  }

  /**
   * 添加辅助描边路径
   */
  private _appendStrokePath(strokePathEl: SVGPathElement, shape: OfficeShape, g: SVGGElement): void {
    const stroke = shape.stroke;
    let strokeColor = 'none';
    let strokeWidth = 0;

    if (stroke && stroke.type !== 'noFill') {
      strokeColor = stroke.color ? this.styleResolver.resolveColor(stroke.color) : '#000000';
      strokeWidth = stroke.width || 9525;
    } else if (shape.style && shape.style.lnRef) {
      if (shape.style.lnRef.idx > 0 && shape.style.lnRef.color) {
        strokeColor = this.styleResolver.resolveColor(shape.style.lnRef.color);
        strokeWidth = 9525;
      }
    }

    if (strokeColor !== 'none') {
      strokePathEl.setAttribute('stroke', strokeColor);
      const widthPt = strokeWidth > 20 ? strokeWidth / 12700 : strokeWidth;
      strokePathEl.setAttribute('stroke-width', String(widthPt || 1));
      strokePathEl.setAttribute('stroke-linejoin', 'round');
      strokePathEl.setAttribute('stroke-linecap', 'round');
    }
    g.appendChild(strokePathEl);
  }

  /**
   * 渲染文本内容
   */
  private _renderTextBody(shape: OfficeShape, g: SVGGElement, rect: RenderRect, ctx: RenderContext): void {
    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.setAttribute('x', '0');
    fo.setAttribute('y', '0');
    fo.setAttribute('width', String(rect.w));
    fo.setAttribute('height', String(rect.h));
    fo.style.overflow = 'visible';

    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.boxSizing = 'border-box';
    div.style.color = '#ffffff';

    // 垂直对齐
    const va = shape.textBody?.verticalAlignment || 'top';
    if (va === 'top') div.style.justifyContent = 'flex-start';
    else if (va === 'middle' || va === 'ctr') div.style.justifyContent = 'center';
    else if (va === 'bottom' || va === 'b') div.style.justifyContent = 'flex-end';
    else if (va === 'justified' || va === 'distributed') div.style.justifyContent = 'space-between';
    else div.style.justifyContent = 'flex-start';

    // 内边距
    if (shape.textBody?.padding) {
      const pad = shape.textBody.padding;
      div.style.paddingLeft = `${pad.left}pt`;
      div.style.paddingTop = `${pad.top}pt`;
      div.style.paddingRight = `${pad.right}pt`;
      div.style.paddingBottom = `${pad.bottom}pt`;
    }

    // 渲染段落
    shape.textBody?.paragraphs.forEach((p: any) => {
      const pDiv = document.createElement('div');
      if (p.alignment) pDiv.style.textAlign = p.alignment;

      p.runs.forEach((run: any) => {
        const span = document.createElement('span');
        span.textContent = run.text;
        if (run.bold) span.style.fontWeight = 'bold';
        if (run.size) span.style.fontSize = `${run.size}pt`;
        else span.style.fontSize = '11pt';

        if (run.color) {
          span.style.color = this.styleResolver.resolveColor(run.color);
        } else {
          span.style.color = 'inherit';
        }

        if (run.fill && run.fill.type === 'gradient') {
          span.style.backgroundImage = this.styleResolver.resolveFill(run.fill, ctx, rect, true);
          span.style.backgroundClip = 'text';
          // @ts-ignore
          span.style.webkitBackgroundClip = 'text';
          span.style.display = 'inline-block';
          span.style.color = 'transparent';
        }

        // 文本阴影效果
        if (run.effects && run.effects.length > 0) {
          this._applyTextEffects(run.effects, span);
        }

        pDiv.appendChild(span);
      });
      div.appendChild(pDiv);
    });

    fo.appendChild(div);
    g.appendChild(fo);
  }

  /**
   * 应用文本效果
   */
  private _applyTextEffects(effects: any[], span: HTMLSpanElement): void {
    const shadows: string[] = [];
    effects.forEach((eff: any) => {
      if (eff.type === 'outerShadow' || eff.type === 'outerShdw') {
        const blurRad = (eff.blur || eff.blurRad || 0) * 1.33;
        const dist = (eff.dist || 0) * 1.33;
        const dir = eff.dir || 0;
        const dirRad = (dir * Math.PI) / 180;

        const offsetX = Math.round(dist * Math.cos(dirRad));
        const offsetY = Math.round(dist * Math.sin(dirRad));

        const shadowColor = eff.color ? this.styleResolver.resolveColor(eff.color) : 'rgba(0,0,0,0.4)';
        shadows.push(`${offsetX}px ${offsetY}px ${blurRad}px ${shadowColor}`);
      } else if (eff.type === 'glow') {
        const rad = (eff.radius || 0) * 1.33;
        const color = eff.color ? this.styleResolver.resolveColor(eff.color) : 'gold';
        shadows.push(`0px 0px ${rad}px ${color}`);
      }
    });
    if (shadows.length > 0) {
      span.style.textShadow = shadows.join(', ');
    }
  }
}
