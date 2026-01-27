/**
 * 形状渲染器
 *
 * 负责形状、文本框等元素的渲染
 * 使用共享 ShapeRenderer 实现核心渲染逻辑
 */

import { ShapeRenderer as SharedShapeRenderer } from '@ai-space/shared';
import type { RenderRect, RenderContext, ShapeRenderOptions } from '@ai-space/shared';
import type { OfficeShape } from '../types';
import type {
  StyleResolver as XlsxStyleResolver,
  RenderContext as XlsxRenderContext,
} from './StyleResolver';

/**
 * 形状渲染器类
 */
export class ShapeRenderer {
  private sharedRenderer: SharedShapeRenderer;

  constructor(styleResolver: XlsxStyleResolver) {
    // StyleResolver extends BaseStyleResolver which implements StyleResolverInterface.
    // So we can pass it directly.
    this.sharedRenderer = new SharedShapeRenderer(styleResolver);
  }

  /**
   * 渲染形状
   *
   * @param shape 形状数据
   * @param container SVG 容器
   * @param rect 渲染区域
   * @param ctx 渲染上下文
   */
  renderShape(
    shape: OfficeShape,
    container: SVGElement,
    rect: RenderRect,
    ctx: XlsxRenderContext,
  ): void {
    // 将 XLSX OfficeShape 转换为共享 ShapeRenderOptions
    const options: ShapeRenderOptions = {
      id: shape.id,
      geometry: shape.geometry,
      path: shape.path,
      pathWidth: shape.pathWidth,
      pathHeight: shape.pathHeight,
      fill: shape.fill,
      stroke: shape.stroke,
      rotation: shape.rotation,
      flipH: shape.flipH,
      flipV: shape.flipV,
      adjustValues: shape.adjustValues,
      effects: shape.effects,
      style: shape.style,
      textBody: shape.textBody
        ? {
            text: shape.textBody.text,
            verticalAlignment: shape.textBody.verticalAlignment,
            padding: shape.textBody.padding,
            paragraphs: shape.textBody.paragraphs?.map(
              (p: {
                alignment?: string;
                runs: Array<{
                  text: string;
                  bold?: boolean;
                  size?: number;
                  color?: string;
                  fill?: { type: string; gradient?: unknown };
                  effects?: unknown[];
                }>;
              }) => ({
                alignment: p.alignment,
                runs: p.runs.map(
                  (r: {
                    text: string;
                    bold?: boolean;
                    size?: number;
                    color?: string;
                    fill?: { type: string; gradient?: unknown };
                    effects?: unknown[];
                  }) => ({
                    text: r.text,
                    bold: r.bold,
                    size: r.size,
                    color: r.color,
                    fill: r.fill, // OfficeFill structure should match
                    effects: r.effects,
                  }),
                ),
              }),
            ),
          }
        : undefined,
    };

    // 转换渲染上下文
    const renderCtx: RenderContext = {
      defs: ctx.defs,
      theme: ctx.theme as Record<string, unknown>,
    };

    // 调用共享渲染器
    this.sharedRenderer.renderShape(options, container, rect, renderCtx);
  }
}

/** 导出 RenderRect 类型供外部使用 */
export type { RenderRect };
