/**
 * 共享形状渲染器
 *
 * 提供形状元素的统一渲染逻辑，可被 docx/xlsx/pptx 包调用
 */

import { generatePresetPath } from '../PresetGeometries';
import type {
  RenderRect,
  RenderContext,
  ShapeRenderOptions,
  StyleResolverInterface,
  ShapeTextBody,
  ShapeTextParagraph,
  ShapeTextRun
} from './types';
import type { OfficeFill, OfficeStroke, OfficeGradient, OfficeEffect } from '../types';

/**
 * 形状渲染器类
 * 负责将形状数据渲染为 SVG 元素
 */
export class ShapeRenderer {
  private styleResolver: StyleResolverInterface;

  constructor(styleResolver: StyleResolverInterface) {
    this.styleResolver = styleResolver;
  }

  /**
   * 渲染形状到 SVG 容器
   *
   * @param options - 形状渲染配置
   * @param container - SVG 容器元素
   * @param rect - 渲染区域
   * @param ctx - 渲染上下文
   */
  renderShape(options: ShapeRenderOptions, container: SVGElement, rect: RenderRect, ctx: RenderContext): void {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.pointerEvents = 'all';

    // 构建变换
    let transform = `translate(${rect.x}, ${rect.y})`;
    if (options.rotation) {
      transform += ` rotate(${options.rotation}, ${rect.w / 2}, ${rect.h / 2})`;
    }
    g.setAttribute('transform', transform);

    // 应用滤镜效果
    if (options.effects?.length && ctx.defs) {
      const filterId = this.styleResolver.resolveFilter(options.effects, ctx);
      if (filterId) {
        g.setAttribute('filter', `url(#${filterId})`);
      }
    }

    // 创建矢量元素
    const vector = this._createVectorElement(options, rect);
    if (vector) {
      vector.style.paintOrder = 'fill stroke';

      // 应用填充
      let fill = this.styleResolver.resolveFill(options.fill, ctx, rect);

      // 回退到样式引用
      if (fill === 'none' && options.style?.fillRef && !options.fill) {
        if (options.style.fillRef.idx > 0 && options.style.fillRef.color) {
          fill = this.styleResolver.resolveColor(options.style.fillRef.color);
        }
      }

      vector.setAttribute('fill', fill);

      // 应用描边
      this._applyStroke(options, vector, ctx);

      // 自定义路径特殊处理
      if (options.geometry === 'custom') {
        vector.setAttribute('vector-effect', 'non-scaling-stroke');
      }

      if (options.geometry === 'custom' && options.path) {
        vector.setAttribute('fill', 'none');
      }

      // 添加到容器
      // @ts-ignore - 内部属性
      if (vector._wrapper) {
        // @ts-ignore
        g.appendChild(vector._wrapper);
      } else {
        g.appendChild(vector);
      }

      // 添加辅助描边路径
      // @ts-ignore
      if (vector._strokePathElement) {
        // @ts-ignore
        this._appendStrokePath(vector._strokePathElement, options, g, ctx);
      }
    }

    // 渲染文本内容
    if (options.textBody) {
      this._renderTextBody(options.textBody, g, rect, ctx);
    }

    container.appendChild(g);
  }

  /**
   * 创建矢量图形元素
   */
  private _createVectorElement(options: ShapeRenderOptions, rect: RenderRect): SVGElement | null {
    let vector: SVGElement;

    if (options.geometry === 'custom' && options.path) {
      // 自定义路径
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      vector.setAttribute('d', options.path);

      // 处理缩放
      const pathW = options.pathWidth || 21600;
      const pathH = options.pathHeight || 21600;

      if (pathW > 0 && pathH > 0) {
        const innerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        innerSvg.setAttribute('viewBox', `0 0 ${pathW} ${pathH}`);
        innerSvg.setAttribute('width', String(rect.w));
        innerSvg.setAttribute('height', String(rect.h));
        innerSvg.setAttribute('preserveAspectRatio', 'none');
        innerSvg.style.overflow = 'visible';
        innerSvg.appendChild(vector);
        // @ts-ignore
        vector._wrapper = innerSvg;
      }
    } else if (options.geometry === 'roundRect') {
      // 圆角矩形
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      vector.setAttribute('width', String(rect.w));
      vector.setAttribute('height', String(rect.h));

      const val = options.adjustValues?.['val'] ?? 16667;
      const minDim = Math.min(rect.w, rect.h);
      const radius = minDim * (val / 100000);

      vector.setAttribute('rx', String(radius));
      vector.setAttribute('ry', String(radius));
    } else if (options.geometry === 'ellipse') {
      // 椭圆
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      vector.setAttribute('cx', String(rect.w / 2));
      vector.setAttribute('cy', String(rect.h / 2));
      vector.setAttribute('rx', String(rect.w / 2));
      vector.setAttribute('ry', String(rect.h / 2));
    } else if (options.geometry) {
      // 预设几何
      const preset = generatePresetPath(options.geometry, rect.w, rect.h, options.adjustValues);
      if (preset) {
        vector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        vector.setAttribute('d', preset.path);
        vector.style.paintOrder = 'fill stroke';

        if (preset.noFill) {
          vector.setAttribute('fill', 'none');
        }

        if (preset.strokePath) {
          const strokePathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          strokePathEl.setAttribute('d', preset.strokePath);
          strokePathEl.setAttribute('fill', 'none');
          // @ts-ignore
          vector._strokePathElement = strokePathEl;
        }
      } else {
        // 默认矩形
        vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        vector.setAttribute('width', String(rect.w));
        vector.setAttribute('height', String(rect.h));
      }
    } else {
      // 无几何类型，默认矩形
      vector = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      vector.setAttribute('width', String(rect.w));
      vector.setAttribute('height', String(rect.h));
    }

    return vector;
  }

  /**
   * 应用描边样式
   */
  private _applyStroke(options: ShapeRenderOptions, vector: SVGElement, ctx: RenderContext): void {
    const stroke = options.stroke;
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
    } else if (options.style?.lnRef) {
      // 回退到样式引用
      if (options.style.lnRef.idx > 0 && options.style.lnRef.color) {
        strokeColor = this.styleResolver.resolveColor(options.style.lnRef.color);
        strokeWidth = 9525; // 0.75pt in EMU
      }
    }

    if (strokeColor !== 'none') {
      vector.setAttribute('stroke', strokeColor);
      // 转换 EMU 到 pt
      const widthPt = strokeWidth > 20 ? strokeWidth / 12700 : strokeWidth;
      vector.setAttribute('stroke-width', String(widthPt || 1));
      vector.setAttribute('stroke-linejoin', 'round');
      vector.setAttribute('stroke-linecap', 'round');

      if (strokeDash !== 'solid') {
        const dashMap: Record<string, string> = {
          dash: '4 2',
          dot: '1 1',
          lgDash: '8 2',
          dashDot: '4 2 1 2',
          lgDashDot: '8 2 1 2'
        };
        if (dashMap[strokeDash]) {
          vector.setAttribute('stroke-dasharray', dashMap[strokeDash]);
        }
      }
    } else {
      vector.setAttribute('stroke', 'none');
    }
  }

  /**
   * 添加辅助描边路径
   */
  private _appendStrokePath(
    strokePathEl: SVGPathElement,
    options: ShapeRenderOptions,
    g: SVGGElement,
    ctx: RenderContext
  ): void {
    const stroke = options.stroke;
    let strokeColor = 'none';
    let strokeWidth = 0;

    if (stroke && stroke.type !== 'noFill') {
      strokeColor = stroke.color ? this.styleResolver.resolveColor(stroke.color) : '#000000';
      strokeWidth = stroke.width || 9525;
    } else if (options.style?.lnRef) {
      if (options.style.lnRef.idx > 0 && options.style.lnRef.color) {
        strokeColor = this.styleResolver.resolveColor(options.style.lnRef.color);
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
  private _renderTextBody(textBody: ShapeTextBody, g: SVGGElement, rect: RenderRect, ctx: RenderContext): void {
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
    const va = textBody.verticalAlignment || 'top';
    const vaMap: Record<string, string> = {
      top: 'flex-start',
      middle: 'center',
      ctr: 'center',
      bottom: 'flex-end',
      b: 'flex-end',
      justified: 'space-between',
      distributed: 'space-between'
    };
    div.style.justifyContent = vaMap[va] || 'flex-start';

    // 内边距
    if (textBody.padding) {
      const pad = textBody.padding;
      div.style.paddingLeft = `${pad.left}pt`;
      div.style.paddingTop = `${pad.top}pt`;
      div.style.paddingRight = `${pad.right}pt`;
      div.style.paddingBottom = `${pad.bottom}pt`;
    }

    // 渲染段落
    if (textBody.paragraphs) {
      textBody.paragraphs.forEach(p => {
        const pDiv = document.createElement('div');
        if (p.alignment) pDiv.style.textAlign = p.alignment;

        p.runs.forEach(run => {
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

          if (run.fill?.type === 'gradient') {
            span.style.backgroundImage = this.styleResolver.resolveFill(run.fill, ctx, rect, true);
            span.style.backgroundClip = 'text';
            // @ts-ignore
            span.style.webkitBackgroundClip = 'text';
            span.style.display = 'inline-block';
            span.style.color = 'transparent';
          }

          // 文本阴影效果
          if (run.effects?.length) {
            this._applyTextEffects(run.effects, span);
          }

          pDiv.appendChild(span);
        });
        div.appendChild(pDiv);
      });
    } else if (textBody.text) {
      // 简单文本
      div.textContent = textBody.text;
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';
      div.style.textAlign = 'center';
    }

    fo.appendChild(div);
    g.appendChild(fo);
  }

  /**
   * 应用文本效果
   */
  private _applyTextEffects(effects: OfficeEffect[], span: HTMLSpanElement): void {
    const shadows: string[] = [];

    effects.forEach(eff => {
      if (eff.type === 'outerShadow' || (eff as unknown as { type: string }).type === 'outerShdw') {
        const blurRad = (eff.blur || 0) * 1.33;
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
