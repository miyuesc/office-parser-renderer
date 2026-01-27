/**
 * 图表渲染器
 *
 * 负责柱状图、饼图、折线图等图表的渲染
 * 使用共享 ChartRenderer 实现核心渲染逻辑
 */

import { ChartRenderer as SharedChartRenderer } from '@ai-space/shared';
import type { RenderRect, RenderContext, ChartRenderOptions } from '@ai-space/shared';
import type { OfficeChart } from '../types';
import type {
  StyleResolver as XlsxStyleResolver,
  RenderContext as XlsxRenderContext,
} from './StyleResolver';

/**
 * 图表渲染器类
 */
export class ChartRenderer {
  private sharedRenderer: SharedChartRenderer;

  constructor(styleResolver: XlsxStyleResolver) {
    // Pass styleResolver directly as it inherits from BaseStyleResolver (which impls StyleResolverInterface)
    this.sharedRenderer = new SharedChartRenderer(styleResolver);
  }

  /**
   * 渲染图表
   *
   * @param chart 图表数据
   * @param container SVG 容器
   * @param rect 渲染区域
   * @param ctx 渲染上下文
   */
  renderChart(
    chart: OfficeChart,
    container: SVGElement,
    rect: RenderRect,
    ctx: XlsxRenderContext,
  ): void {
    // 将 XLSX OfficeChart 转换为共享 ChartRenderOptions
    const options: ChartRenderOptions = {
      id: chart.id,
      type: chart.type,
      title: chart.title,
      series: chart.series.map((s) => ({
        index: s.index,
        name: s.name,
        categories: s.categories,
        values: s.values,
        fillColor: s.fillColor,
      })),
      barDirection: chart.barDirection,
      grouping: chart.grouping,
    };

    // 转换渲染上下文
    const renderCtx: RenderContext = {
      defs: ctx.defs,
      theme: ctx.theme as Record<string, unknown>,
    };

    // 调用共享渲染器
    this.sharedRenderer.renderChart(options, container, rect, renderCtx);
  }
}

/** 导出 RenderRect 类型供外部使用 */
export type { RenderRect };
