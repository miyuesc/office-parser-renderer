/**
 * 图表渲染器
 *
 * 负责柱状图、饼图、折线图等图表的渲染
 * 使用共享 ChartRenderer 实现核心渲染逻辑
 */

import { ChartRenderer as SharedChartRenderer } from '@ai-space/shared';
import type { RenderRect, RenderContext, StyleResolverInterface, ChartRenderOptions, ColorDef } from '@ai-space/shared';
import type { OfficeChart } from '../types';
import type { StyleResolver as XlsxStyleResolver, RenderContext as XlsxRenderContext } from './StyleResolver';

/**
 * XLSX 样式解析器适配器
 * 将 XLSX StyleResolver 包装为共享接口
 */
class XlsxStyleResolverAdapter implements StyleResolverInterface {
  private xlsxResolver: XlsxStyleResolver;

  constructor(xlsxResolver: XlsxStyleResolver) {
    this.xlsxResolver = xlsxResolver;
  }

  resolveColor(color: ColorDef): string {
    return this.xlsxResolver.resolveColor(color as string);
  }

  resolveFill(
    fill: { type?: string; color?: string; gradient?: unknown; opacity?: number } | undefined,
    ctx: RenderContext,
    rect: RenderRect | null,
    asCSS?: boolean
  ): string {
    const xlsxFill = fill as Parameters<typeof this.xlsxResolver.resolveFill>[0];
    const xlsxRect = rect ? { x: rect.x, y: rect.y, w: rect.w, h: rect.h } : null;
    return this.xlsxResolver.resolveFill(xlsxFill, ctx as unknown as XlsxRenderContext, xlsxRect, asCSS);
  }

  resolveFilter(
    effects: Array<{ type: string; blur?: number; dist?: number; dir?: number; color?: string; radius?: number }>,
    ctx: RenderContext
  ): string | null {
    return this.xlsxResolver.resolveFilter(
      effects as unknown as Parameters<typeof this.xlsxResolver.resolveFilter>[0],
      ctx as unknown as XlsxRenderContext
    );
  }
}

/**
 * 图表渲染器类
 */
export class ChartRenderer {
  private sharedRenderer: SharedChartRenderer;
  private adapter: XlsxStyleResolverAdapter;

  constructor(styleResolver: XlsxStyleResolver) {
    this.adapter = new XlsxStyleResolverAdapter(styleResolver);
    this.sharedRenderer = new SharedChartRenderer(this.adapter);
  }

  /**
   * 渲染图表
   *
   * @param chart 图表数据
   * @param container SVG 容器
   * @param rect 渲染区域
   * @param ctx 渲染上下文
   */
  renderChart(chart: OfficeChart, container: SVGElement, rect: RenderRect, ctx: XlsxRenderContext): void {
    // 将 XLSX OfficeChart 转换为共享 ChartRenderOptions
    const options: ChartRenderOptions = {
      id: chart.id,
      type: chart.type,
      title: chart.title,
      series: chart.series.map(s => ({
        index: s.index,
        name: s.name,
        categories: s.categories,
        values: s.values,
        fillColor: s.fillColor
      })),
      barDirection: chart.barDirection,
      grouping: chart.grouping
    };

    // 转换渲染上下文
    const renderCtx: RenderContext = {
      defs: ctx.defs,
      theme: ctx.theme as Record<string, unknown>
    };

    // 调用共享渲染器
    this.sharedRenderer.renderChart(options, container, rect, renderCtx);
  }
}

/** 导出 RenderRect 类型供外部使用 */
export type { RenderRect };
