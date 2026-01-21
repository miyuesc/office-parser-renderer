/**
 * 共享图片渲染器
 *
 * 提供图片元素的统一渲染逻辑，可被 docx/xlsx/pptx 包调用
 */

import type { RenderRect, RenderContext, ImageRenderOptions, StyleResolverInterface } from './types';

/**
 * 图片渲染器类
 * 负责将图片数据渲染为 HTML 元素
 */
export class ImageRenderer {
  /**
   * 渲染图片为 HTML 元素
   *
   * @param options - 图片渲染配置
   * @param rect - 渲染区域
   * @param ctx - 渲染上下文
   * @returns HTMLElement（img 包裹在容器中）
   */
  static render(options: ImageRenderOptions, rect: RenderRect, ctx: RenderContext): HTMLElement {
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
   * 渲染图片为 SVG foreignObject（用于 SVG 容器内）
   *
   * @param options - 图片渲染配置
   * @param rect - 渲染区域
   * @param ctx - 渲染上下文
   * @returns SVGForeignObjectElement
   */
  static renderToSVG(options: ImageRenderOptions, rect: RenderRect, ctx: RenderContext): SVGForeignObjectElement {
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
