/**
 * 共享图片渲染器
 *
 * 提供图片元素的统一渲染逻辑，可被 docx/xlsx/pptx 包调用
 */

import type {
  RenderRect,
  RenderContext,
  ImageRenderOptions,
  StyleResolverInterface,
} from '../../types/rendering';
import type { OfficeImage } from '../types';

/**
 * 图片渲染器类
 * 负责将图片数据渲染为 HTML 元素
 */
export class ImageRenderer {
  constructor(private styleResolver?: StyleResolverInterface) {}

  /**
   * 渲染图片为 HTML 元素
   *
   * @param options - 图片渲染配置
   * @param rect - 渲染区域
   * @param ctx - 渲染上下文
   * @returns HTMLElement（img 包裹在容器中）
   */
  render(options: ImageRenderOptions, rect: RenderRect, ctx: RenderContext): HTMLElement {
    // 兼容静态调用 (如果 styleResolver 未定义且 needed? HTML render currently doesn't need styleResolver except maybe for advanced borders?)
    return ImageRenderer.renderStatic(options, rect, ctx);
  }

  /**
   * 静态渲染方法 (向后兼容)
   */
  static render(options: ImageRenderOptions, rect: RenderRect, ctx: RenderContext): HTMLElement {
    return this.renderStatic(options, rect, ctx);
  }

  private static renderStatic(
    options: ImageRenderOptions,
    rect: RenderRect,
    ctx: RenderContext,
  ): HTMLElement {
    const container = document.createElement('span');
    container.className = 'office-image';
    container.style.display = 'inline-block';
    container.style.position = 'relative';
    container.style.width = `${rect.w}px`;
    container.style.height = `${rect.h}px`;

    const img = document.createElement('img');
    img.className = 'office-image-content';

    // 获取图片源
    let src = options.src;
    if (!src && ctx.images && options.embedId) {
      src = ctx.images[options.embedId];
    }

    if (src) {
      img.src = src;
    } else {
      // 占位图
      img.src = this.createPlaceholder(rect.w, rect.h);
      img.alt = '图片加载失败';
    }

    // 设置尺寸
    img.style.width = `${rect.w}px`;
    img.style.height = `${rect.h}px`;
    img.style.objectFit = 'contain';

    // 构建变换
    const transforms: string[] = [];
    if (options.flipH) transforms.push('scaleX(-1)');
    if (options.flipV) transforms.push('scaleY(-1)');
    if (options.rotation) transforms.push(`rotate(${options.rotation}deg)`);

    if (transforms.length > 0) {
      img.style.transform = transforms.join(' ');
    }

    // 裁剪
    if (options.crop) {
      const { left, top, right, bottom } = options.crop;
      const clipPath = `inset(${top * 100}% ${right * 100}% ${bottom * 100}% ${left * 100}%)`;
      img.style.clipPath = clipPath;
    }

    container.appendChild(img);
    return container;
  }

  /**
   * 渲染图片为您 SVG 元素 (高级渲染)
   *
   * @param img - OfficeImage 对象 (或包含必要属性的 ImageRenderOptions)
   * @param container - SVG 容器
   * @param rect - 渲染区域
   * @param ctx - 渲染上下文
   */
  renderToSVG(
    img: OfficeImage | ImageRenderOptions,
    container: SVGElement,
    rect: RenderRect,
    ctx: RenderContext,
  ): void {
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

    // 滤镜效果 (仅当提供了 styleResolver 且 img 有 effects 时)
    if (this.styleResolver && (img as OfficeImage).effects?.length) {
      const filterId = this.styleResolver.resolveFilter((img as OfficeImage).effects!, ctx);
      if (filterId) g.setAttribute('filter', `url(#${filterId})`);
    }

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', img.src || ''); // ImageRenderOptions has optional src

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
    const model = img as OfficeImage; // Cast to access extra props
    if (model.geometry === 'roundRect' && ctx.defs && ctx.defsIdCounter !== undefined) {
      const clipId = `clip-${++ctx.defsIdCounter}`;
      const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.setAttribute('id', clipId);

      const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      clipRect.setAttribute('x', String(renderX));
      clipRect.setAttribute('y', String(renderY));
      clipRect.setAttribute('width', String(renderW));
      clipRect.setAttribute('height', String(renderH));

      const val =
        model.adjustValues?.['adj'] ??
        model.adjustValues?.['adj1'] ??
        model.adjustValues?.['val'] ??
        16667;
      const radius = Math.min(renderW, renderH) * (val / 100000);

      clipRect.setAttribute('rx', String(radius));
      clipRect.setAttribute('ry', String(radius));
      clip.appendChild(clipRect);
      ctx.defs.appendChild(clip);
      image.setAttribute('clip-path', `url(#${clipId})`);
    }

    g.appendChild(image);

    // 边框
    if (model.stroke && this.styleResolver) {
      this._renderBorder(model, g, renderX, renderY, renderW, renderH, ctx);
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
    ctx: RenderContext,
  ): void {
    if (!this.styleResolver) return;

    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const strokeWidth = img.stroke?.width ? (img.stroke.width / 12700) * 1.33 : 1;

    border.setAttribute('x', String(renderX - strokeWidth / 2));
    border.setAttribute('y', String(renderY - strokeWidth / 2));
    border.setAttribute('width', String(renderW + strokeWidth));
    border.setAttribute('height', String(renderH + strokeWidth));
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', this.styleResolver.resolveColor(img.stroke!.color || '#000000'));
    border.setAttribute('stroke-width', String(strokeWidth));

    // 圆角
    if (img.geometry === 'roundRect') {
      const val =
        img.adjustValues?.['adj'] ??
        img.adjustValues?.['adj1'] ??
        img.adjustValues?.['val'] ??
        16667;
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
    ctx: RenderContext,
  ): void {
    if (!ctx.defs || ctx.defsIdCounter === undefined) return;

    const maskId = `mask-cmpd-${++ctx.defsIdCounter}`;
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

  /**
   * 渲染图片为 SVG foreignObject（用于 SVG 容器内）
   *
   * @param options - 图片渲染配置
   * @param rect - 渲染区域
   * @param ctx - 渲染上下文
   * @returns SVGForeignObjectElement
   */
  static renderToSVG(
    options: ImageRenderOptions,
    rect: RenderRect,
    ctx: RenderContext,
  ): SVGForeignObjectElement {
    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.setAttribute('x', String(rect.x));
    fo.setAttribute('y', String(rect.y));
    fo.setAttribute('width', String(rect.w));
    fo.setAttribute('height', String(rect.h));

    const element = this.render(options, { x: 0, y: 0, w: rect.w, h: rect.h }, ctx);
    fo.appendChild(element);

    return fo;
  }

  /**
   * 创建占位图 SVG
   *
   * @param width - 宽度
   * @param height - 高度
   * @returns 占位图 data URL
   */
  private static createPlaceholder(width: number, height: number): string {
    return (
      `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect fill="%23ddd" width="${width}" height="${height}"/>` +
      `<text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">图片</text></svg>`
    );
  }
}
