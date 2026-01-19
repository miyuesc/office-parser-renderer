/**
 * 图片渲染器
 * 负责图片元素的渲染，包括旋转、翻转、圆角裁剪等处理
 */

import type { OfficeImage } from '../types';
import type { StyleResolver, RenderContext } from './StyleResolver';

/** 渲染区域 */
export interface RenderRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 图片渲染器类
 */
export class ImageRenderer {
  private styleResolver: StyleResolver;

  constructor(styleResolver: StyleResolver) {
    this.styleResolver = styleResolver;
  }

  /**
   * 渲染图片
   * @param img 图片数据
   * @param container SVG 容器
   * @param rect 渲染区域
   * @param ctx 渲染上下文
   */
  renderImage(img: OfficeImage, container: SVGElement, rect: RenderRect, ctx: RenderContext): void {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.pointerEvents = 'visiblePainted';

    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;

    // 构建 transform
    const transforms: string[] = [];

    // 翻转
    if (img.flipH || img.flipV) {
      const sx = img.flipH ? -1 : 1;
      const sy = img.flipV ? -1 : 1;
      transforms.push(`translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`);
    }

    // 旋转
    if (img.rotation) {
      transforms.unshift(`rotate(${img.rotation}, ${cx}, ${cy})`);
    }

    if (transforms.length > 0) {
      g.setAttribute('transform', transforms.join(' '));
    }

    // 滤镜效果
    if (img.effects?.length) {
      const filterId = this.styleResolver.resolveFilter(img.effects, ctx);
      if (filterId) g.setAttribute('filter', `url(#${filterId})`);
    }

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', img.src);

    // 检查是否需要交换宽高（旋转 90° 或 270° 时）
    const rot = img.rotation || 0;
    const needSwap = (rot > 45 && rot < 135) || (rot > 225 && rot < 315);
    const renderW = needSwap ? rect.h : rect.w;
    const renderH = needSwap ? rect.w : rect.h;
    const renderX = needSwap ? rect.x + (rect.w - renderW) / 2 : rect.x;
    const renderY = needSwap ? rect.y + (rect.h - renderH) / 2 : rect.y;

    image.setAttribute('x', String(renderX));
    image.setAttribute('y', String(renderY));
    image.setAttribute('width', String(renderW));
    image.setAttribute('height', String(renderH));
    image.setAttribute('preserveAspectRatio', 'none');

    // 圆角裁剪
    if (img.geometry === 'roundRect') {
      const clipId = `clip-${++ctx.counter}`;
      const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.setAttribute('id', clipId);

      const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      clipRect.setAttribute('x', String(renderX));
      clipRect.setAttribute('y', String(renderY));
      clipRect.setAttribute('width', String(renderW));
      clipRect.setAttribute('height', String(renderH));

      const val = img.adjustValues?.['adj'] ?? img.adjustValues?.['adj1'] ?? img.adjustValues?.['val'] ?? 16667;
      const radius = Math.min(renderW, renderH) * (val / 100000);

      clipRect.setAttribute('rx', String(radius));
      clipRect.setAttribute('ry', String(radius));
      clip.appendChild(clipRect);
      ctx.defs.appendChild(clip);
      image.setAttribute('clip-path', `url(#${clipId})`);
    }

    g.appendChild(image);

    // 边框
    if (img.stroke) {
      this._renderBorder(img, g, renderX, renderY, renderW, renderH, ctx);
    }

    container.appendChild(g);
  }

  /**
   * 渲染图片边框
   */
  private _renderBorder(
    img: OfficeImage,
    g: SVGGElement,
    renderX: number,
    renderY: number,
    renderW: number,
    renderH: number,
    ctx: RenderContext
  ): void {
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const strokeWidth = img.stroke?.width ? (img.stroke.width / 12700) * 1.33 : 1;

    border.setAttribute('x', String(renderX - strokeWidth / 2));
    border.setAttribute('y', String(renderY - strokeWidth / 2));
    border.setAttribute('width', String(renderW + strokeWidth));
    border.setAttribute('height', String(renderH + strokeWidth));
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', this.styleResolver.resolveColor(img.stroke!.color));
    border.setAttribute('stroke-width', String(strokeWidth));

    // 圆角
    if (img.geometry === 'roundRect') {
      const val = img.adjustValues?.['adj'] ?? img.adjustValues?.['adj1'] ?? img.adjustValues?.['val'] ?? 16667;
      const radius = Math.min(renderW, renderH) * (val / 100000);
      border.setAttribute('rx', String(radius));
      border.setAttribute('ry', String(radius));
    }

    // 虚线样式
    if (img.stroke?.dashStyle && img.stroke.dashStyle !== 'solid') {
      if (img.stroke.dashStyle === 'dash') border.setAttribute('stroke-dasharray', '4 2');
      if (img.stroke.dashStyle === 'dot') border.setAttribute('stroke-dasharray', '1 1');
    }

    // 线条连接/端点
    if (img.stroke?.join) border.setAttribute('stroke-linejoin', img.stroke.join);
    if (img.stroke?.cap) border.setAttribute('stroke-linecap', img.stroke.cap);

    // 复合线条
    if (img.stroke?.compound && img.stroke.compound !== 'sng') {
      this._applyCompoundStroke(img.stroke, border, strokeWidth, ctx);
    }

    g.appendChild(border);
  }

  /**
   * 应用复合线条样式
   */
  private _applyCompoundStroke(
    stroke: OfficeImage['stroke'],
    border: SVGRectElement,
    strokeWidth: number,
    ctx: RenderContext
  ): void {
    const maskId = `mask-cmpd-${++ctx.counter}`;
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);

    // 白色基底（可见部分）
    const base = border.cloneNode() as Element;
    base.setAttribute('stroke', 'white');
    base.setAttribute('stroke-width', String(strokeWidth));
    mask.appendChild(base);

    // 黑色切除（间隙）
    const gap = border.cloneNode() as Element;
    gap.setAttribute('stroke', 'black');

    let gapWidth = strokeWidth / 3;
    if (stroke?.compound === 'thickThin') {
      gapWidth = strokeWidth / 3;
    }

    gap.setAttribute('stroke-width', String(gapWidth));
    mask.appendChild(gap);
    ctx.defs.appendChild(mask);

    border.setAttribute('mask', `url(#${maskId})`);
  }
}
